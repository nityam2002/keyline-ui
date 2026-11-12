// Checks the built registry (site/public/r/*.json) as a consumer's `shadcn add` receives it, independently of the
// build: it reads only the built JSON, shares no code with scripts/registry/build.ts, and keeps its own allow-list,
// so a bug in the build's dependency derivation cannot hide itself.
//
//   pnpm registry:verify
//
// For every item: each npm package its files import is in `dependencies`; each file another Keyline file imports
// (relative path, resolved at the install target) is shipped by the item itself or one of its `registryDependencies`;
// `@/lib/utils` means `utils`; and every `@keyline-ui/<name>` it names is a built item.
import { readFileSync, readdirSync } from "node:fs";
import { posix } from "node:path";

const DIR = new URL("../../site/public/r/", import.meta.url).pathname;
// The consumer's app provides these; an item never lists them.
const PROVIDED = new Set(["react", "react-dom"]);
const NS = "@keyline-ui/";

type File = { path: string; content?: string; target?: string };
type Item = { name: string; dependencies?: string[]; registryDependencies?: string[]; files?: File[] };

const items = new Map<string, Item>();
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== "registry.json"))
  items.set(f.slice(0, -5), JSON.parse(readFileSync(DIR + f, "utf8")) as Item);

const shipped = new Map<string, string>(); // install target without extension -> item name
for (const [name, it] of items)
  for (const f of it.files ?? []) if (f.target) shipped.set(f.target.replace(/\.(tsx?|css)$/, ""), name);

const pkgName = (spec: string) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
const unversioned = (dep: string) => dep.replace(/(.)@[^@/]+$/, "$1");

const errors: string[] = [];
for (const [name, it] of items) {
  const deps = new Set((it.dependencies ?? []).map(unversioned));
  const reg = new Set(it.registryDependencies ?? []);
  for (const r of reg)
    if (r.startsWith(NS) && !items.has(r.slice(NS.length))) errors.push(`${name}: ${r} is not a built item`);
  const reach = new Set([name, ...[...reg].filter((r) => r.startsWith(NS)).map((r) => r.slice(NS.length))]);
  for (const f of it.files ?? []) {
    if (f.content === undefined || !f.target) {
      errors.push(`${name}: ${f.path} has no content or target`);
      continue;
    }
    const specs = [...f.content.matchAll(/(?:^|\n)\s*(?:import|export)\s(?:[^"';]*?\sfrom\s)?["']([^"']+)["']/g)].map(
      (m) => m[1] ?? "",
    );
    for (const s of specs) {
      if (s === "@/lib/utils") {
        if (!reg.has("utils")) errors.push(`${name}: ${f.path} imports @/lib/utils but utils is not a dependency`);
      } else if (s.startsWith(".")) {
        const target = posix.normalize(posix.join(posix.dirname(f.target), s));
        const owner = shipped.get(target);
        if (!owner) errors.push(`${name}: ${f.path} imports ${s}, which no item installs at ${target}`);
        else if (!reach.has(owner)) errors.push(`${name}: ${f.path} imports ${s} from ${owner}, not a dependency`);
      } else if (s.startsWith("@/")) {
        errors.push(`${name}: ${f.path} imports ${s}, which a consumer's project does not have`);
      } else {
        const p = pkgName(s) ?? s;
        if (!PROVIDED.has(p) && !deps.has(p)) errors.push(`${name}: ${f.path} imports ${p}, not in dependencies`);
      }
    }
  }
}

if (errors.length) {
  for (const e of errors) console.error(`registry:verify: ${e}`);
  process.exitCode = 1;
} else console.log(`registry:verify: ${items.size} items, every import is declared and every dependency is built`);
