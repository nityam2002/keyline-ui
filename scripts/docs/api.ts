// The docs site's page data for every component, read from the item's metadata, its types and its source:
// site/generated/api/<name>.json, which the generated page (site/app/docs/components/[name]/page.tsx) renders.
//
//   pnpm docs:api            write the files
//   pnpm docs:api --check    fail when a committed file no longer matches the source (tests/docs/api.test.ts too)
//
// - Props: each exported part (a PascalCase function) and the props its own source file declares, with their type as
//   TypeScript prints it, the default from the part's destructuring, and the JSDoc. Props a part inherits from Base UI
//   or the DOM are not listed; the page links the Base UI part instead.
// - Attributes: the `data-*` attributes the source writes (JSX attributes, object keys, and dataAttrs({ ... }) keys),
//   with the literal values it writes (every data-slot name, for instance).
// - CSS variables: the custom properties the source sets (Tailwind's [--name:value], style keys, setProperty).
// - Examples: the registry:block examples whose category is the item.
import ts from "typescript";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { loadMetas, ROOT } from "../registry/build.ts";

export const API_DIR = "site/generated/api";

export type ApiProp = { name: string; type: string; default: string; required: boolean; description: string };
export type ApiPart = { name: string; description: string; props: ApiProp[] };
export type ApiAttribute = { name: string; values: string[] };
export type ApiCssVariable = { name: string; values: string[] };
export type ApiExample = { name: string; title: string; file: string };
export type ApiPage = {
  name: string;
  title: string;
  description: string;
  whenToUse: string;
  parts: ApiPart[];
  attributes: ApiAttribute[];
  cssVariables: ApiCssVariable[];
  examples: ApiExample[];
};

const uniqSorted = (xs: Iterable<string>) => [...new Set(xs)].toSorted();
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();
// A doc comment's prose without its drawings: lines drawn in box characters are a diagram for the source reader,
// and flattened into a paragraph they are one unbreakable run that widens the page.
const prose = (s: string) =>
  oneLine(
    s
      .split("\n")
      .filter((l) => !/[\u2500-\u257f]/.test(l))
      .join("\n"),
  );
// ReactNode loses its alias once null and undefined are stripped; print it by its name again
const REACT_NODE =
  "string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode>";

function program(files: string[]) {
  const cfg = ts.readConfigFile(ROOT + "tsconfig.app.json", (p) => ts.sys.readFile(p));
  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, ROOT);
  return ts.createProgram(
    files.map((f) => ROOT + f),
    { ...parsed.options, noEmit: true, composite: false, incremental: false },
  );
}

/** The part's own defaults, from `function Part({ size = "default", ... })`. */
function defaultsOf(fn: ts.SignatureDeclaration | undefined): Map<string, string> {
  const out = new Map<string, string>();
  const p = fn?.parameters[0];
  if (p && ts.isObjectBindingPattern(p.name))
    for (const el of p.name.elements) {
      const key = el.propertyName ?? el.name;
      if (el.initializer && ts.isIdentifier(key)) out.set(key.text, oneLine(el.initializer.getText()));
    }
  return out;
}

function partsOf(checker: ts.TypeChecker, sf: ts.SourceFile): ApiPart[] {
  const mod = checker.getSymbolAtLocation(sf);
  if (!mod) return [];
  const parts: ApiPart[] = [];
  for (const exp of checker.getExportsOfModule(mod)) {
    if (!/^[A-Z]/.test(exp.name)) continue;
    const sym = exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
    const decl = sym.valueDeclaration;
    if (!decl || decl.getSourceFile() !== sf) continue;
    const fn = ts.isFunctionDeclaration(decl)
      ? decl
      : ts.isVariableDeclaration(decl) &&
          decl.initializer &&
          (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
        ? decl.initializer
        : undefined;
    if (!fn) continue;
    const sig = checker.getSignaturesOfType(checker.getTypeOfSymbolAtLocation(sym, decl), ts.SignatureKind.Call)[0];
    const param = sig?.getParameters()[0];
    if (!sig || !param) {
      parts.push({
        name: exp.name,
        description: prose(ts.displayPartsToString(sym.getDocumentationComment(checker))),
        props: [],
      });
      continue;
    }
    const propsType = checker.getTypeOfSymbolAtLocation(param, decl);
    const defaults = defaultsOf(fn);
    const props: ApiProp[] = [];
    for (const p of checker.getPropertiesOfType(propsType)) {
      const own = p.getDeclarations()?.some((d) => d.getSourceFile() === sf);
      if (!own) continue;
      const d = p.getDeclarations()?.find((x) => x.getSourceFile() === sf);
      const t = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(p, d ?? decl));
      // a library alias stays named (ReactNode); one this file declares (type Signal = "idle" | ...) is spelled out
      const local = t.aliasSymbol?.getDeclarations()?.some((x) => x.getSourceFile() === sf);
      const type = checker.typeToString(
        t,
        undefined,
        ts.TypeFormatFlags.NoTruncation |
          ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType |
          (local ? ts.TypeFormatFlags.InTypeAlias : 0),
      );
      props.push({
        name: p.name,
        type: type
          .replace(/'/g, '"')
          .replaceAll(REACT_NODE, "ReactNode")
          // React's default element type parameter is noise in a table
          .replaceAll(", string | JSXElementConstructor<any>>", ">")
          .replaceAll("ReactElement<unknown>", "ReactElement"),
        default: defaults.get(p.name) ?? "",
        required: !(p.flags & ts.SymbolFlags.Optional),
        description: prose(ts.displayPartsToString(p.getDocumentationComment(checker))),
      });
    }
    parts.push({
      name: exp.name,
      description: prose(ts.displayPartsToString(sym.getDocumentationComment(checker))),
      props: props.toSorted((a, b) => (a.name < b.name ? -1 : 1)),
    });
  }
  return parts.toSorted((a, b) => (a.name < b.name ? -1 : 1));
}

function attributesOf(src: string): ApiAttribute[] {
  const found = new Map<string, Set<string>>();
  const add = (name: string, value?: string) => {
    const set = found.get(name) ?? new Set<string>();
    if (value !== undefined) set.add(value);
    found.set(name, set);
  };
  // JSX: data-slot="x", data-kl-layout={layout}, data-kl-rail={"painted"}
  for (const m of src.matchAll(/\s(data-[a-z][a-z0-9-]*)=(?:"([^"]*)"|\{\s*"([^"]*)"\s*\}|\{)/g))
    add(m[1]!, m[2] ?? m[3]);
  // objects: { "data-slot": "slider-frame" }
  for (const m of src.matchAll(/["'](data-[a-z][a-z0-9-]*)["']\s*:\s*(?:"([^"]*)")?/g)) add(m[1]!, m[2]);
  // dataAttrs({ variant, size: x })
  for (const m of src.matchAll(/dataAttrs\(\{([^}]*)\}\)/g))
    for (const k of m[1]!.matchAll(/(?:^|,)\s*([a-zA-Z-]+|"[a-z-]+")\s*(?=[:,]|$)/g))
      add(`data-${k[1]!.replace(/"/g, "")}`);
  return [...found]
    .map(([name, values]) => ({ name, values: uniqSorted(values) }))
    .toSorted((a, b) => (a.name < b.name ? -1 : 1));
}

function cssVariablesOf(src: string): ApiCssVariable[] {
  const found = new Map<string, Set<string>>();
  const add = (name: string, value: string) => {
    const set = found.get(name) ?? new Set<string>();
    set.add(value.replace(/_/g, " "));
    found.set(name, set);
  };
  for (const m of src.matchAll(/\[(--[a-z][a-z0-9-]*):([^\]\s]+)\]/g)) add(m[1]!, m[2]!);
  for (const m of src.matchAll(/["'](--[a-z][a-z0-9-]*)["']\s*:\s*([^,}\n]+)/g)) add(m[1]!, oneLine(m[2]!));
  for (const m of src.matchAll(/setProperty\(\s*["'](--[a-z][a-z0-9-]*)["']\s*,\s*([^)\n]+)\)/g))
    add(m[1]!, oneLine(m[2]!));
  return [...found]
    .map(([name, values]) => ({ name, values: uniqSorted(values) }))
    .toSorted((a, b) => (a.name < b.name ? -1 : 1));
}

/** Every component's page data, by file name (<name>.json), as the committed files should hold it. */
export async function generateApi(): Promise<Map<string, string>> {
  const metas = await loadMetas();
  const ui = metas.filter(
    (m) => m.type === "registry:ui" && m.files?.some((f) => f.path.startsWith("src/registry/keyline/ui/")),
  );
  const examples = metas.filter(
    (m) => m.type === "registry:block" && m.files?.[0]?.path.startsWith("src/registry/keyline/examples/"),
  );
  const tsFiles = ui.flatMap((m) => (m.files ?? []).map((f) => f.path).filter((p) => /\.tsx?$/.test(p)));
  const prog = program(tsFiles);
  const checker = prog.getTypeChecker();
  const out = new Map<string, string>();
  for (const m of ui) {
    const files = (m.files ?? []).map((f) => f.path).filter((p) => /\.tsx?$/.test(p));
    const src = files.map((f) => readFileSync(ROOT + f, "utf8")).join("\n");
    const parts = files.flatMap((f) => {
      const sf = prog.getSourceFile(ROOT + f);
      if (!sf) throw new Error(`docs:api: ${f} is not in the program`);
      return partsOf(checker, sf);
    });
    const page: ApiPage = {
      name: m.name,
      title: m.title ?? m.name,
      description: m.description ?? "",
      whenToUse: (m as { whenToUse?: string }).whenToUse ?? "",
      parts,
      attributes: attributesOf(src),
      cssVariables: cssVariablesOf(src),
      examples: examples
        .filter((e) => e.categories?.includes(m.name))
        .map((e) => ({ name: e.name, title: e.title ?? e.name, file: e.files![0]!.path.split("/").at(-1)! })),
    };
    out.set(`${m.name}.json`, JSON.stringify(page, null, 2) + "\n");
  }
  return out;
}

/** The committed files that differ from a fresh generation (missing, stale, or no longer generated). */
export function drift(generated: Map<string, string>): string[] {
  const dir = ROOT + API_DIR;
  const committed = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
  const bad: string[] = [];
  for (const [f, txt] of generated) {
    const p = `${dir}/${f}`;
    if (!existsSync(p)) bad.push(`${f} is missing`);
    else if (readFileSync(p, "utf8") !== txt) bad.push(`${f} no longer matches the source`);
  }
  for (const f of committed) if (!generated.has(f)) bad.push(`${f} has no item`);
  return bad;
}

async function main() {
  const generated = await generateApi();
  if (process.argv.includes("--check")) {
    const bad = drift(generated);
    if (bad.length) {
      console.error(`docs:api: ${API_DIR} drifted from the source (run pnpm docs:api):\n  ${bad.join("\n  ")}`);
      process.exitCode = 1;
    } else console.log(`docs:api: ${generated.size} pages match the source`);
    return;
  }
  rmSync(ROOT + API_DIR, { recursive: true, force: true });
  mkdirSync(ROOT + API_DIR, { recursive: true });
  for (const [f, txt] of generated) writeFileSync(`${ROOT}${API_DIR}/${f}`, txt);
  console.log(`docs:api: wrote ${generated.size} pages to ${API_DIR}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href)
  main().catch((e: unknown) => {
    console.error(e);
    process.exitCode = 1;
  });
