// Builds the registry: site/public/r/{name}.json, what the shadcn CLI fetches, from src/registry/manifest.mjs and the
// source. The documentation site serves that folder at /r/{name}.json, so deploying the site publishes the registry.
//
//   pnpm registry:build
//
// Step one writes the registry index (.artifacts/registry/registry.json); step two is `shadcn build`, which inlines
// each item's files into site/public/r. The output is committed; CI fails when it is out of date.
// Items name each other as @keyline-ui/<name>, never by URL, so the same files work wherever they are served.
// Each item's CSS file is converted into the registry `css` object (and, for the theme, `cssVars`),
// so `shadcn add` writes exactly the rules that item needs into the consumer's CSS: nothing undeclared.
import postcss from "postcss";
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { posix } from "node:path";
import { items } from "../src/registry/manifest.mjs";

const root = new URL("..", import.meta.url).pathname;

function toObject(container) {
  const out = {};
  const put = (key, val) => {
    if (out[key] && typeof out[key] === "object" && typeof val === "object") Object.assign(out[key], val);
    else out[key] = val;
  };
  container.each((node) => {
    if (node.type === "decl") put(node.prop, node.value + (node.important ? " !important" : ""));
    else if (node.type === "rule") put(node.selector.replace(/\s+/g, " "), toObject(node));
    else if (node.type === "atrule") {
      const key = `@${node.name}${node.params ? " " + node.params : ""}`;
      put(key, node.nodes ? toObject(node) : {});
    }
  });
  return out;
}

// Two top-level blocks with the same key (a file with two `@layer components { }` blocks) must merge,
// not replace: a shallow assign once dropped every rule of the first block from field and table.
function merge(into, from) {
  for (const [k, v] of Object.entries(from)) {
    if (v && typeof v === "object" && into[k] && typeof into[k] === "object") merge(into[k], v);
    else into[k] = v;
  }
  return into;
}

function convert(file, { theme = false } = {}) {
  const ast = postcss.parse(readFileSync(root + file, "utf8"));
  const cssVars = { light: {}, dark: {}, theme: {} };
  const css = {};
  ast.each((node) => {
    if (
      theme &&
      node.type === "rule" &&
      node.selector
        .split(",")
        .map((x) => x.trim())
        .includes(":root")
    )
      node.each((d) => {
        if (d.type === "decl") cssVars.light[d.prop.slice(2)] = d.value;
      });
    else if (theme && node.type === "rule" && node.selector === ".dark")
      node.each((d) => {
        if (d.type === "decl") cssVars.dark[d.prop.slice(2)] = d.value;
      });
    else if (theme && node.type === "atrule" && node.name === "theme")
      node.each((d) => {
        if (d.type === "decl") cssVars.theme[d.prop.slice(2)] = d.value;
      });
    else if (node.type === "comment") return;
    else merge(css, toObject(postcss.root().append(node.clone())));
  });
  // every rule of the source file must reach the item (keys are at-rule params and selectors, nested)
  ast.walkRules((rule) => {
    const path = [];
    for (let n = rule; n && n.type !== "root"; n = n.parent)
      path.unshift(n.type === "rule" ? n.selector.replace(/\s+/g, " ") : `@${n.name}${n.params ? " " + n.params : ""}`);
    if (
      theme &&
      path.length === 1 &&
      (path[0]
        .split(",")
        .map((x) => x.trim())
        .includes(":root") ||
        path[0] === ".dark")
    )
      return;
    if (theme && path[0] === "@theme") return;
    let o = css;
    for (const k of path) o = o?.[k];
    if (!o) fail(`${file}: rule ${path.join(" > ")} did not reach the registry item`);
  });
  // `.light` mirrors :root so a light subtree (or a portal scoped to one) can sit inside a dark page
  if (theme && Object.keys(cssVars.light).length)
    css[".light"] = Object.fromEntries(Object.entries(cssVars.light).map(([k, v]) => [`--${k}`, v]));
  const hasVars = Object.values(cssVars).some((v) => Object.keys(v).length);
  return theme && hasVars ? { cssVars, css } : { css };
}

// ---------- dependencies come from the source, not from hand-written lists ----------
const NS = "@keyline-ui";
const fail = (msg) => {
  console.error(`registry: ${msg}`);
  process.exitCode = 1;
  throw new Error(msg);
};
function importsOf(file) {
  const src = readFileSync(root + file, "utf8");
  const specs = [
    ...src.matchAll(/^\s*(?:import|export)\s[^"']*?from\s+["']([^"']+)["']/gm),
    ...src.matchAll(/^\s*import\s+["']([^"']+)["']/gm),
  ].map((m) => m[1]);
  const pkgs = new Set();
  const reg = new Set();
  for (const s of specs) {
    if (s === "react" || s === "react-dom" || s.startsWith("react/")) continue;
    if (s === "@/lib/utils") reg.add("utils");
    else if (s.startsWith(".")) {
      // Inside the registry, imports are relative: files keep the same layout in the consumer
      // (src/registry/keyline/<x> -> components/keyline/<x>), so the same path resolves in both places.
      const target = posix.normalize(posix.join(posix.dirname(file), s));
      if (!target.startsWith("src/registry/keyline/")) fail(`${file} imports ${s}, which leaves the registry`);
      const owner = items.find((it) => it.files.some((f) => f.path.replace(/\.(tsx?|css)$/, "") === target));
      if (!owner) fail(`${file} imports ${s} (${target}), which no registry item ships`);
      reg.add(owner.name);
    } else if (s.startsWith("@/"))
      fail(`${file} imports ${s}: inside the registry use relative paths (and @/lib/utils only)`);
    else pkgs.add(s.startsWith("@") ? s.split("/").slice(0, 2).join("/") : s.split("/")[0]);
  }
  return { pkgs, reg };
}

const PKG = JSON.parse(readFileSync(root + "package.json", "utf8"));
const PKG_DEPS = PKG.dependencies ?? {};
const OUTPUT = "site/public/r";

// ---------- client boundaries ----------
// A file that calls hooks, creates context, sets event handlers, or renders Base UI or another client-only library, is a client module in a
// React Server Components app (Next.js App Router). Without the directive, a server page that imports it fails at
// render. Bundlers without React Server Components (Vite) ignore the directive.
//
// It is written "use client"; WITH the semicolon. shadcn 4.23's transform for "rsc": false projects tests the
// directive with a /g regex (stateful lastIndex), so it strips it from every other file depending on order; a
// re-add then sees files as changed, asks to overwrite, and a non-interactive add stops there. The regex is
// anchored at the end, so the statement "use client"; never matches: the directive is kept, every time.
const CLIENT_ONLY =
  /\buse[A-Z]\w*\(|\bcreateContext\b|\son[A-Z][A-Za-z]*=\{|from\s+["'](@base-ui\/react[^"']*|recharts|embla-carousel-react|react-day-picker|react-resizable-panels|cmdk|@shadcn\/react[^"']*)["']/;
function checkClientBoundary(file) {
  const src = readFileSync(root + file, "utf8");
  const directive = src.match(/^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*(["']use client["'];?)/)?.[1];
  if (CLIENT_ONLY.test(src) && !directive)
    fail(`${file} uses hooks, handlers or a client-only library: start it with "use client";`);
  if (directive && !directive.endsWith(";"))
    fail(`${file}: write the directive as "use client"; with the semicolon (see the comment above)`);
}
const names = new Set(items.map((it) => it.name));
const built = items.map(({ css, theme, ...item }) => {
  for (const f of item.files) if (!existsSync(root + f.path)) fail(`${item.name}: missing file ${f.path}`);
  if (css && !existsSync(root + css)) fail(`${item.name}: missing css ${css}`);
  const pkgs = new Set(item.dependencies || []);
  const reg = new Set((item.registryDependencies || []).map((d) => (d.startsWith("kl:") ? d.slice(3) : d)));
  for (const f of item.files) {
    if (/\.tsx?$/.test(f.path)) checkClientBoundary(f.path);
    const found = importsOf(f.path);
    found.pkgs.forEach((p) => pkgs.add(p));
    found.reg.forEach((r) => r !== item.name && reg.add(r));
  }
  for (const r of reg) if (r !== "utils" && !names.has(r)) fail(`${item.name}: unknown registry dependency ${r}`);
  // Keyline installs into its own folder, so it never collides with shadcn's components/ui/*
  item.files = item.files.map((f) => ({
    ...f,
    target: f.target ?? f.path.replace(/^src\/registry\/keyline\//, "components/keyline/"),
  }));
  const extra = css ? convert(css, { theme }) : {};
  const registryDependencies = [...reg].map((d) => (d === "utils" ? d : `${NS}/${d}`));
  // a package the repo pins exactly (no ^ or ~) is pinned for consumers too, so they get the version tested here
  const pinned = (p) => (/^\d+\.\d+\.\d+$/.test(PKG_DEPS[p] ?? "") ? `${p}@${PKG_DEPS[p]}` : p);
  return { ...item, dependencies: [...pkgs].sort().map(pinned), registryDependencies, ...extra };
});

// ---------- CSS-level dependencies ----------
// A component's markup can use classes another item styles (NumberField is a .kl-field frame; RadioGroup
// rows are .kl-choice-* rows). Imports cannot reveal that, so: every kl-* class an item's source uses that
// neither its own CSS nor the theme styles must come from an item it depends on. If none of its
// (transitive) dependencies styles it, the item whose CSS styles it becomes a dependency: the one named by
// the class's prefix (kl-field-label -> field) when several mention it, the only one otherwise; still
// ambiguous fails the build. Classes no CSS styles are hooks and are ignored.
{
  const classesIn = (txt) => new Set([...txt.matchAll(/\.(kl-[a-z0-9-]+)/g)].map((m) => m[1]));
  const styled = new Map(
    items.filter((it) => it.css).map((it) => [it.name, classesIn(readFileSync(root + it.css, "utf8"))]),
  );
  const themeClasses = new Set(items.filter((it) => it.theme).flatMap((it) => [...(styled.get(it.name) ?? [])]));
  const byName = new Map(built.map((b) => [b.name, b]));
  const depsOf = (name, seen = new Set()) => {
    for (const d of byName.get(name)?.registryDependencies ?? []) {
      const n = d.replace(`${NS}/`, "");
      if (!seen.has(n)) {
        seen.add(n);
        depsOf(n, seen);
      }
    }
    return seen;
  };
  for (const it of items) {
    if (it.theme || it.type === "registry:block") continue;
    const own = styled.get(it.name) ?? new Set();
    const used = new Set(
      it.files.flatMap((f) =>
        [...readFileSync(root + f.path, "utf8").matchAll(/["'`\s(](kl-[a-z0-9-]+)/g)].map((m) => m[1]),
      ),
    );
    const ownersOf = (c) => [...styled].filter(([n, set]) => n !== it.name && set.has(c)).map(([n]) => n);
    // classes with one owner first: they often settle the ambiguous ones (switch's .kl-choice-row -> checkbox)
    const pending = [...used]
      .filter((c) => !own.has(c) && !themeClasses.has(c))
      .sort((a, b) => ownersOf(a).length - ownersOf(b).length || a.localeCompare(b));
    for (const c of pending) {
      const owners = ownersOf(c);
      if (!owners.length) continue;
      const deps = depsOf(it.name);
      if (owners.some((o) => deps.has(o))) continue;
      const named = owners.filter((o) => c === `kl-${o}` || c.startsWith(`kl-${o}-`));
      const pick = named.length === 1 ? named[0] : owners.length === 1 ? owners[0] : null;
      if (!pick) fail(`${it.name} uses .${c}, styled by ${owners.join(", ")}: declare which one it depends on`);
      byName.get(it.name).registryDependencies.push(`${NS}/${pick}`);
      console.log(`registry: ${it.name} -> ${pick} (CSS: .${c})`);
    }
  }
}

const out = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "keyline",
  // The public site's address once it exists (package.json "homepage"); "/" means "the site serving this file".
  homepage: PKG.homepage ?? "/",
  items: built,
};
const index = root + ".artifacts/registry/registry.json";
mkdirSync(root + ".artifacts/registry", { recursive: true });
writeFileSync(index, JSON.stringify(out, null, 2) + "\n");
// rebuilt from scratch, so a removed item leaves no file behind
rmSync(root + OUTPUT, { recursive: true, force: true });
try {
  execFileSync(root + "node_modules/.bin/shadcn", ["build", index, "--output", OUTPUT], { cwd: root, stdio: "pipe" });
} catch (e) {
  process.stderr.write(String(e.stdout) + String(e.stderr));
  fail("shadcn build failed");
}
console.log(`${OUTPUT}: ${out.items.length} items, dependencies derived from imports, namespace ${NS}`);
