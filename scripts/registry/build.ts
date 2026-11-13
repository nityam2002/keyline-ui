// Builds the registry: site/public/r/{name}.json, what the shadcn CLI fetches, from the per-item metadata
// (src/registry/keyline/**/<name>.meta.ts) and the source. The documentation site serves that folder at /r/{name}.json,
// so deploying the site publishes the registry. Beside the items it writes r/versions.json (scripts/registry/versions.ts).
//
//   pnpm registry:build
//
// buildRegistry() is pure: it reads the metas and the source and returns the index (registry.json) and every item's
// JSON in memory (tests/registry/rebuild.test.ts compares that with the committed files). Run as a script, it writes
// registry.json, runs `shadcn build` into site/public/r and fails if shadcn's output differs from the in-memory one.
//
// Items name each other as @keyline-ui/<name>, never by URL, so the same files work wherever they are served.
// Each item's CSS file is converted into the registry `css` object (and, for the theme, `cssVars`), so `shadcn add`
// writes exactly the rules that item needs into the consumer's CSS: nothing undeclared.
import postcss, { type ChildNode, type Container } from "postcss";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
  mkdirSync,
  globSync,
  readdirSync,
  mkdtempSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { posix } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { registryItemSchema } from "shadcn/schema";

import type { KeylineItem } from "../../src/registry/item.ts";
import { currentItems, publishedVersions, VERSIONS } from "./versions.ts";

export const ROOT = new URL("../..", import.meta.url).pathname;
export const OUTPUT = "site/public/r";
export const INDEX = "registry.json";
const NS = "@keyline-ui";

export class RegistryError extends Error {}
const fail = (msg: string): never => {
  throw new RegistryError(msg);
};
const read = (file: string) => readFileSync(ROOT + file, "utf8");

/* ---------------------------------------------------------------- CSS -> registry css / cssVars */
type CssObject = { [key: string]: string | CssObject };
type CssVars = { light: Record<string, string>; dark: Record<string, string>; theme: Record<string, string> };

const atKey = (n: { name: string; params: string }) => `@${n.name}${n.params ? " " + n.params : ""}`;

function toObject(container: Container): CssObject {
  const out: CssObject = {};
  const put = (key: string, val: string | CssObject) => {
    const cur = out[key];
    if (cur && typeof cur === "object" && typeof val === "object") Object.assign(cur, val);
    else out[key] = val;
  };
  container.each((node: ChildNode) => {
    if (node.type === "decl") put(node.prop, node.value + (node.important ? " !important" : ""));
    else if (node.type === "rule") put(node.selector.replace(/\s+/g, " "), toObject(node));
    else if (node.type === "atrule") put(atKey(node), node.nodes ? toObject(node) : {});
  });
  return out;
}

// Two top-level blocks with the same key (a file with two `@layer components { }` blocks) must merge, not replace:
// a shallow assign once dropped every rule of the first block from field and table.
function merge(into: CssObject, from: CssObject): CssObject {
  for (const [k, v] of Object.entries(from)) {
    const cur = into[k];
    if (typeof v === "object" && cur && typeof cur === "object") merge(cur, v);
    else into[k] = v;
  }
  return into;
}

const isRoot = (selector: string) =>
  selector
    .split(",")
    .map((x) => x.trim())
    .includes(":root");

function convert(file: string, theme: boolean): { css: CssObject; cssVars?: CssVars } {
  const ast = postcss.parse(read(file));
  // in the order shadcn build writes them
  const cssVars: CssVars = { theme: {}, light: {}, dark: {} };
  const css: CssObject = {};
  let mirrorLight = false;
  const vars = (node: Container, into: Record<string, string>) =>
    node.each((d) => {
      if (d.type === "decl") into[d.prop.slice(2)] = d.value;
    });
  ast.each((node) => {
    if (theme && node.type === "rule" && isRoot(node.selector)) {
      vars(node, cssVars.light);
      if (node.selector.split(",").some((x) => x.trim() === ".light")) mirrorLight = true;
    } else if (theme && node.type === "rule" && node.selector === ".dark") vars(node, cssVars.dark);
    else if (theme && node.type === "atrule" && node.name === "theme") vars(node, cssVars.theme);
    else if (node.type !== "comment") merge(css, toObject(postcss.root().append(node.clone())));
  });
  // every rule of the source file must reach the item (keys are at-rule params and selectors, nested)
  ast.walkRules((rule) => {
    const path: string[] = [];
    for (let n: Container | undefined = rule; n && n.type !== "root"; n = n.parent as Container | undefined)
      path.unshift(n.type === "rule" ? (n as postcss.Rule).selector.replace(/\s+/g, " ") : atKey(n as postcss.AtRule));
    const [top] = path;
    if (theme && path.length === 1 && top !== undefined && (isRoot(top) || top === ".dark")) return;
    if (theme && top === "@theme") return;
    let o: string | CssObject | undefined = css;
    for (const k of path) o = typeof o === "object" ? o[k] : undefined;
    if (!o) fail(`${file}: rule ${path.join(" > ")} did not reach the registry item`);
  });
  // The CLI writes cssVars.light to :root only. A rule written for `:root, .light` (keyline-shadcn's mapping) also
  // needs `.light`, so a light subtree (or a portal scoped to one) can sit inside a dark page; it goes to css.
  if (mirrorLight) css[".light"] = Object.fromEntries(Object.entries(cssVars.light).map(([k, v]) => [`--${k}`, v]));
  const hasVars = Object.values(cssVars).some((v) => Object.keys(v).length);
  return theme && hasVars ? { cssVars, css } : { css };
}

/* ---------------------------------------------------------------- metas */
type Meta = KeylineItem & { metaFile: string };

export async function loadMetas(): Promise<Meta[]> {
  const files = globSync("src/registry/keyline/**/*.meta.ts", { cwd: ROOT }).sort();
  const metas: Meta[] = [];
  for (const f of files) {
    const mod = (await import(pathToFileURL(ROOT + f).href)) as { default: KeylineItem };
    metas.push({ ...mod.default, metaFile: f });
  }
  const seen = new Set<string>();
  for (const m of metas) {
    if (seen.has(m.name)) fail(`two items are named ${m.name}`);
    // site/public/r also serves the index and the versions; an item cannot take their file names
    if (`${m.name}.json` === INDEX || `${m.name}.json` === VERSIONS)
      fail(`${m.metaFile}: ${m.name} is a reserved name`);
    seen.add(m.name);
  }
  // code-point order, so the index does not depend on the file system
  return metas.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/* ---------------------------------------------------------------- dependencies come from the source */
function importsOf(file: string, metas: Meta[]) {
  const src = read(file);
  const specs = [
    ...src.matchAll(/^\s*(?:import|export)\s[^"']*?from\s+["']([^"']+)["']/gm),
    ...src.matchAll(/^\s*import\s+["']([^"']+)["']/gm),
  ].map((m) => m[1] ?? "");
  const pkgs = new Set<string>();
  const reg = new Set<string>();
  for (const s of specs) {
    if (s === "react" || s === "react-dom" || s.startsWith("react/")) continue;
    if (s === "@/lib/utils") reg.add("utils");
    else if (s.startsWith(".")) {
      // Inside the registry, imports are relative: files keep the same layout in the consumer
      // (src/registry/keyline/<x> -> components/keyline/<x>), so the same path resolves in both places.
      const target = posix.normalize(posix.join(posix.dirname(file), s));
      if (!target.startsWith("src/registry/keyline/")) fail(`${file} imports ${s}, which leaves the registry`);
      const owner = metas.find((it) => it.files?.some((f) => f.path.replace(/\.(tsx?|css)$/, "") === target));
      if (!owner) return fail(`${file} imports ${s} (${target}), which no registry item ships`);
      reg.add(`${NS}/${owner.name}`);
    } else if (s.startsWith("@/"))
      fail(`${file} imports ${s}: inside the registry use relative paths (and @/lib/utils only)`);
    else pkgs.add(s.startsWith("@") ? s.split("/").slice(0, 2).join("/") : (s.split("/")[0] ?? s));
  }
  return { pkgs, reg };
}

// ---------- client boundaries ----------
// A file that calls hooks, creates context, sets event handlers, or renders Base UI or another client-only library,
// is a client module in a React Server Components app (Next.js App Router). Without the directive, a server page
// that imports it fails at render. Bundlers without React Server Components (Vite) ignore the directive.
//
// It is written "use client"; WITH the semicolon. shadcn 4.23's transform for "rsc": false projects tests the
// directive with a /g regex (stateful lastIndex), so it strips it from every other file depending on order; a re-add
// then sees files as changed, asks to overwrite, and a non-interactive add stops there. The regex is anchored at the
// end, so the statement "use client"; never matches: the directive is kept, every time.
const CLIENT_ONLY =
  /\buse[A-Z]\w*\(|\bcreateContext\b|\son[A-Z][A-Za-z]*=\{|from\s+["'](@base-ui\/react[^"']*|recharts|embla-carousel-react|react-day-picker|react-resizable-panels|cmdk|@shadcn\/react[^"']*)["']/;
function checkClientBoundary(file: string) {
  const src = read(file);
  const directive = src.match(/^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*(["']use client["'];?)/)?.[1];
  // a type-only import emits no code, so it never makes a module a client module
  const code = src.replace(/^import\s+type\s[^;]*;/gm, "");
  if (CLIENT_ONLY.test(code) && !directive)
    fail(`${file} uses hooks, handlers or a client-only library: start it with "use client";`);
  if (directive && !directive.endsWith(";"))
    fail(`${file}: write the directive as "use client"; with the semicolon (see the comment above)`);
}

// ---------- CSS-level dependencies ----------
// A component's markup can use classes another item styles. Imports cannot reveal that, so: every kl-* class an
// item's source uses that neither its own CSS nor the theme styles must come from an item it depends on. If none of
// its (transitive) dependencies styles it, the item whose CSS styles it becomes a dependency: the one named by the
// class's prefix (kl-<item>-*) when several mention it, the only one otherwise; still ambiguous fails the build.
// Classes no CSS styles are hooks.
function cssDependencies(metas: Meta[], derived: Map<string, Set<string>>) {
  const classesIn = (txt: string) => new Set([...txt.matchAll(/\.(kl-[a-z0-9-]+)/g)].map((m) => m[1] ?? ""));
  const styled = new Map(metas.flatMap((it) => (it.cssFile ? [[it.name, classesIn(read(it.cssFile))] as const] : [])));
  const themeClasses = new Set(metas.filter((it) => it.theme).flatMap((it) => [...(styled.get(it.name) ?? [])]));
  const depsOf = (name: string, seen = new Set<string>()) => {
    for (const d of derived.get(name) ?? []) {
      const n = d.replace(`${NS}/`, "");
      if (!seen.has(n)) {
        seen.add(n);
        depsOf(n, seen);
      }
    }
    return seen;
  };
  for (const it of metas) {
    if (it.theme || it.type === "registry:block") continue;
    const own = styled.get(it.name) ?? new Set<string>();
    const used = new Set(
      (it.files ?? []).flatMap((f) => [...read(f.path).matchAll(/["'`\s(](kl-[a-z0-9-]+)/g)].map((m) => m[1] ?? "")),
    );
    const ownersOf = (c: string) => [...styled].filter(([n, set]) => n !== it.name && set.has(c)).map(([n]) => n);
    // classes with one owner first: they often settle the ambiguous ones
    const pending = [...used]
      .filter((c) => !own.has(c) && !themeClasses.has(c))
      .sort((a, b) => ownersOf(a).length - ownersOf(b).length || a.localeCompare(b));
    for (const c of pending) {
      const owners = ownersOf(c);
      if (!owners.length) continue;
      const deps = depsOf(it.name);
      if (owners.some((o) => deps.has(o))) continue;
      const named = owners.filter((o) => c === `kl-${o}` || c.startsWith(`kl-${o}-`));
      const pick = named.length === 1 ? named[0] : owners.length === 1 ? owners[0] : undefined;
      if (!pick) return fail(`${it.name} uses .${c}, styled by ${owners.join(", ")}: declare which one it depends on`);
      derived.get(it.name)?.add(`${NS}/${pick}`);
    }
  }
}

/** What the build derives for each item: npm packages and registry items, plus the meta's `requires`. */
export function deriveDependencies(metas: Meta[]) {
  const names = new Set(metas.map((m) => m.name));
  const pkgs = new Map<string, Set<string>>();
  const reg = new Map<string, Set<string>>();
  for (const it of metas) {
    const p = new Set(it.requires?.dependencies ?? []);
    const r = new Set(it.requires?.registryDependencies ?? []);
    // a component or block draws with the theme's tokens and construction CSS: a dependency imports cannot reveal
    if ((it.type === "registry:ui" || it.type === "registry:block") && it.files?.length) r.add(`${NS}/keyline`);
    for (const f of it.files ?? []) {
      if (!existsSync(ROOT + f.path)) fail(`${it.name}: missing file ${f.path}`);
      if (/\.tsx?$/.test(f.path)) checkClientBoundary(f.path);
      const found = importsOf(f.path, metas);
      found.pkgs.forEach((x) => p.add(x));
      found.reg.forEach((x) => x !== `${NS}/${it.name}` && r.add(x));
    }
    for (const d of r)
      if (d !== "utils" && !names.has(d.replace(`${NS}/`, ""))) fail(`${it.name}: unknown registry dependency ${d}`);
    pkgs.set(it.name, p);
    reg.set(it.name, r);
  }
  cssDependencies(metas, reg);
  return { pkgs, reg };
}

function sameSet(name: string, field: string, declared: string[], derived: Set<string>) {
  const missing = [...derived].filter((d) => !declared.includes(d));
  const extra = declared.filter((d) => !derived.has(d));
  if (new Set(declared).size !== declared.length) fail(`${name}: ${field} lists an entry twice`);
  if (missing.length || extra.length)
    fail(
      `${name}: declared ${field} differ from the source.` +
        (missing.length ? ` Add ${missing.join(", ")} (found in the source).` : "") +
        (extra.length
          ? ` Remove ${extra.join(", ")}, or list it under requires with the reason if the source cannot show it.`
          : ""),
    );
}

/* ---------------------------------------------------------------- the build */
// shadcn build writes each item's keys in its schema's order, the `type` discriminator last
const ITEM_KEYS = [
  "$schema",
  "extends",
  "name",
  "title",
  "author",
  "description",
  "dependencies",
  "devDependencies",
  "registryDependencies",
  "files",
  "tailwind",
  "cssVars",
  "css",
  "envVars",
  "meta",
  "docs",
  "categories",
  "type",
] as const;
const ordered = (item: Record<string, unknown>) => {
  const unknown = Object.keys(item).filter((k) => !(ITEM_KEYS as readonly string[]).includes(k));
  if (unknown.length) fail(`${String(item["name"])}: the build does not know the key(s) ${unknown.join(", ")}`);
  return Object.fromEntries(ITEM_KEYS.filter((k) => item[k] !== undefined).map((k) => [k, item[k]]));
};

/** `items` is what shadcn build writes (each item and the index); `versions` is r/versions.json beside them. */
export type Built = { index: string; items: Map<string, string>; versions: string };

export async function buildRegistry(): Promise<Built> {
  const metas = await loadMetas();
  const pkg = JSON.parse(read("package.json")) as { homepage?: string; dependencies?: Record<string, string> };
  const pkgDeps = pkg.dependencies ?? {};
  const { pkgs, reg } = deriveDependencies(metas);
  // a package the repo pins exactly (no ^ or ~) is pinned for consumers too, so they get the version tested here
  const pinned = (p: string) => (/^\d+\.\d+\.\d+$/.test(pkgDeps[p] ?? "") ? `${p}@${pkgDeps[p]}` : p);

  const indexItems = metas.map(
    // the release fields are published in r/versions.json, not in the item
    ({ metaFile, cssFile, theme, requires: _r, version: _v, updated: _u, changelog: _c, deprecated, ...item }) => {
      sameSet(item.name, "dependencies", item.dependencies ?? [], pkgs.get(item.name) ?? new Set());
      sameSet(item.name, "registryDependencies", item.registryDependencies ?? [], reg.get(item.name) ?? new Set());
      if (cssFile && !existsSync(ROOT + cssFile)) fail(`${item.name} (${metaFile}): missing css ${cssFile}`);
      // a tombstone says so wherever the CLI or a reader shows its description
      if (deprecated !== undefined && !item.description?.startsWith(`Deprecated: use @keyline-ui/${deprecated}.`))
        fail(
          `${item.name} (${metaFile}): a tombstone's description starts "Deprecated: use @keyline-ui/${deprecated}."`,
        );
      return {
        ...item,
        dependencies: (item.dependencies ?? []).toSorted().map(pinned),
        registryDependencies: item.registryDependencies ?? [],
        // Keyline installs into its own folder, so it never collides with shadcn's components/ui/*
        files: (item.files ?? []).map((f) => ({
          ...f,
          target: f.target ?? f.path.replace(/^src\/registry\/keyline\//, "components/keyline/"),
        })),
        ...(cssFile ? convert(cssFile, theme === true) : {}),
      };
    },
  );
  registryItemSchema.array().parse(indexItems);

  const index = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "keyline",
    // The public site's address once it exists (package.json "homepage"); "/" means "the site serving this file".
    homepage: pkg.homepage ?? "/",
    items: indexItems,
  };
  const items = new Map<string, string>();
  for (const it of indexItems) {
    const files = it.files.map(({ path, type, target }) => ({ path, content: read(path), type, target }));
    const out = ordered({ $schema: "https://ui.shadcn.com/schema/registry-item.json", ...it, files });
    items.set(`${it.name}.json`, JSON.stringify(out, null, 2));
  }
  const indexText = JSON.stringify(index, null, 2) + "\n";
  // shadcn build copies the index as it is
  items.set("registry.json", indexText);
  return { index: indexText, items, versions: publishedVersions(currentItems(metas, items)) };
}

/* ---------------------------------------------------------------- as a script */
async function main() {
  const built = await buildRegistry();
  writeFileSync(ROOT + INDEX, built.index);
  // shadcn writes into a fresh folder, so a removed item leaves no file behind and nothing is half-written
  const tmp = mkdtempSync(posix.join(tmpdir(), "keyline-registry-"));
  try {
    execFileSync(ROOT + "node_modules/.bin/shadcn", ["build", INDEX, "--output", tmp], { cwd: ROOT, stdio: "pipe" });
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer };
    process.stderr.write(String(err.stdout ?? "") + String(err.stderr ?? ""));
    fail("shadcn build failed");
  }
  const written = readdirSync(tmp).toSorted();
  const expected = [...built.items.keys()].toSorted();
  if (written.join() !== expected.join())
    fail(`shadcn build wrote ${written.join(", ")}; the in-memory build has ${expected.join(", ")}`);
  for (const f of written)
    if (readFileSync(posix.join(tmp, f), "utf8") !== built.items.get(f))
      fail(`${f}: shadcn build's output differs from buildRegistry()'s; update ITEM_KEYS or the emitter`);
  rmSync(ROOT + OUTPUT, { recursive: true, force: true });
  mkdirSync(ROOT + OUTPUT, { recursive: true });
  for (const f of written) writeFileSync(posix.join(ROOT, OUTPUT, f), built.items.get(f) ?? "", { flag: "w" });
  writeFileSync(posix.join(ROOT, OUTPUT, VERSIONS), built.versions);
  rmSync(tmp, { recursive: true, force: true });
  console.log(`${OUTPUT}: ${built.items.size - 1} items, dependencies checked against the source, namespace ${NS}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href)
  main().catch((e: unknown) => {
    console.error(e instanceof RegistryError ? `registry: ${e.message}` : e);
    process.exitCode = 1;
  });
