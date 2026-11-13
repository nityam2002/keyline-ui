import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { BLOCKS, CATALOG, GUIDES, WRITTEN } from "./catalog";
import { installCommand, registryAddCommand, SITE_ORIGIN } from "./registry";
import { exampleSource, siteFile } from "./source";
import { apiPage } from "./api";
import changelog from "./changelog.json";
import {
  attributeMeaning,
  cssVariableMeaning,
  kebab,
  otherParts,
  pageRows,
  PARTS_API_LEDE,
  propRows,
  type Row,
} from "./component-page";
import * as catalog from "./catalog";
import * as tokens from "../../src/registry/keyline/theme/tokens";

/** Modules a page may read values from (the rest of its imports are components, which render nothing here). */
const MODULES: Record<string, Record<string, unknown>> = {
  "@site/lib/catalog": catalog,
  "@/components/keyline/theme/tokens": tokens,
};

/*
 * Every docs page as Markdown, for language-model tools: the `.md` twins (served for `Accept: text/markdown` and at
 * `<page>.md`), /llms-full.txt and the search index all come from here.
 *
 * A twin is not written by hand: it is read from the page's own source (site/app/<href>/page.tsx) with the TypeScript
 * compiler, so it says what the page says. Headings, paragraphs, lists, links and inline code become Markdown; a
 * CodeBlock's or InstallCommand's code becomes a fence with the same text; an example's preview is replaced by its
 * source (what the Code tab shows); a props or reference table becomes a Markdown table. Live previews and anything
 * else interactive are left out. A page the converter cannot read fails the build rather than ship a partial twin.
 */

/** Opens every twin and llms-full.txt: what an agent must know before it writes Keyline code. */
export const PREAMBLE = [
  "> Keyline UI is a shadcn registry of React components on Base UI. It requires a shadcn project (components.json",
  "> and the cn() helper), Tailwind CSS v4 and React 19. Install items with the shadcn CLI as `@keyline-ui/<name>`,",
  "> after mapping the namespace once:",
  ">",
  `> \`${registryAddCommand()}\``,
  ">",
  "> Use the item and part names on this page; they are current, whatever older references say. Do not convert",
  "> Keyline to Tailwind v3 or to Radix: it depends on both.",
].join("\n");

const url = (path: string) => `${SITE_ORIGIN ?? ""}${path}`;

export type DocPageInfo = { name: string; href: string; group: string; item?: string };

/** Every written docs page, with its group and the registry item it documents (none for a guide). */
export const DOC_PAGES: DocPageInfo[] = [
  ...GUIDES.map((g) => ({ name: g.name, href: g.href, group: "Get started" })),
  ...[...CATALOG, BLOCKS].flatMap((g) =>
    g.items.filter((e) => e.href).map((e) => ({ name: e.name, href: e.href!, group: g.group, item: e.item })),
  ),
];
if (DOC_PAGES.length !== WRITTEN.length) throw new Error("Keyline site: DOC_PAGES and WRITTEN disagree");

const GENERATED = /^\/docs\/components\/([a-z0-9-]+)$/;

/** The hand-written source behind a docs URL: the page itself, or for a page the generated component route renders
 *  (app/docs/components/[name]), its content file (site/content/components/<name>.tsx). */
export function pageSourceFile(href: string): string {
  const name = GENERATED.exec(href)?.[1];
  const own = path.join(/*turbopackIgnore: true*/ siteFile("app"), href, "page.tsx");
  if (!name || fs.existsSync(/*turbopackIgnore: true*/ own)) return siteFile(`app${href}/page.tsx`);
  return siteFile(`content/components/${name}.tsx`);
}

/**
 * A generated component page as Markdown, section by section as app/docs/components/[name]/page.tsx renders it:
 * the content file's prose (lede, install note, usage, examples, reference), the item's API data
 * (site/generated/api/<name>.json: when to use it, props merged with the prose's descriptions, parts, data
 * attributes, CSS variables), the install command and the example sources. The rules that turn API data into rows
 * are lib/component-page.ts, shared with the page.
 */
function componentBody(name: string, file: string): string[] {
  const api = apiPage(name);
  const { scope, sf } = scan(file);
  let content: ts.ObjectLiteralExpression | undefined;
  const find = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText() === "content" && node.initializer) {
      const init = node.initializer;
      if (ts.isObjectLiteralExpression(init)) content = init;
    }
    ts.forEachChild(node, find);
  };
  find(sf);
  const fields = content?.properties;
  if (!fields) throw new Unreadable(`${file}: no \`export const content\` object`);
  const field = (key: string) =>
    fields.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && propName(p.name) === key)?.initializer;
  const conv = new Converter(scope);
  const prose = (key: string): string[] => {
    const e = field(key);
    if (!e) return [];
    const inner = ts.isParenthesizedExpression(e) ? e.expression : e;
    if (ts.isJsxElement(inner) || ts.isJsxFragment(inner) || ts.isJsxSelfClosingElement(inner))
      return conv.blocks([inner as unknown as ts.JsxChild]);
    const v = evaluate(inner, scope);
    return v == null ? [] : [conv.inlineValue(v)];
  };
  const titleExpr = field("title");
  const title = titleExpr ? String(evaluate(titleExpr, scope)) : api.title;
  const propsExpr = field("props");
  const written = (propsExpr ? evaluate(propsExpr, scope) : []) as Row<unknown>[];
  const code = (s: string) => "`" + s + "`";
  const codes = (vs: string[]) => (vs.length ? vs.map(code).join(", ") : "—");
  const propTable = (rows: Row<unknown>[]) =>
    conv.table(
      ["Prop", "Type", "Default", "Description"],
      rows.map((r) => [
        code(r.name),
        code(r.type),
        r.default === "—" ? "—" : code(r.default),
        conv.inlineValue(r.description),
      ]),
    );
  const others = otherParts(api);
  return [
    `# ${title}`,
    ...prose("lede"),
    ...(api.whenToUse ? ["## When to use {#when-to-use}", api.whenToUse] : []),
    "## Installation {#installation}",
    fence(installCommand(name), "bash"),
    ...prose("install"),
    "## Usage {#usage}",
    ...prose("usage"),
    ...prose("examples"),
    "## Props {#props}",
    propTable(pageRows(api, written)),
    ...(others.length
      ? [
          "### Parts API {#parts-api}",
          PARTS_API_LEDE,
          ...others.flatMap((p) => [
            `#### ${code(p.name)} {#api-${kebab(p.name)}}`,
            ...(p.description ? [p.description] : []),
            propTable(propRows(p, [])),
          ]),
        ]
      : []),
    ...(api.attributes.length
      ? [
          "### Data attributes {#data-attributes}",
          conv.table(
            ["Attribute", "Values", "Meaning"],
            api.attributes.map((a) => {
              const m = attributeMeaning(a.name, api);
              return [code(a.name), codes(a.values), "mirrors" in m ? `Mirrors the ${code(m.mirrors)} prop.` : m.text];
            }),
          ),
        ]
      : []),
    ...(api.cssVariables.length
      ? [
          "### CSS variables {#css-variables}",
          conv.table(
            ["Variable", "Values it sets", "Where"],
            api.cssVariables.map((v) => [code(v.name), codes(v.values), cssVariableMeaning(v.name, name)]),
          ),
        ]
      : []),
    ...prose("reference"),
  ].filter(Boolean);
}

/* ------------------------------------------------------------------ evaluation of the page's constants */

type Scope = Map<string, ts.Expression>;
/** Per page: the names it imports from MODULES. */
const IMPORTED = new WeakMap<Scope, Map<string, { module: Record<string, unknown>; name: string }>>();
const METHODS = new Set(["split", "join", "slice", "trim", "replace", "replaceAll", "toUpperCase", "toLowerCase"]);
class Unreadable extends Error {}

function propName(n: ts.PropertyName): string {
  if (ts.isIdentifier(n) || ts.isStringLiteral(n)) return n.text;
  throw new Unreadable(`property name ${n.getText()}`);
}

/** The value of an expression made of literals, the page's own constants and the site's command helpers. */
function evaluate(e: ts.Expression, scope: Scope): unknown {
  if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e))
    return evaluate(e.expression, scope);
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
  if (ts.isNumericLiteral(e)) return Number(e.text);
  if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isTemplateExpression(e))
    return e.head.text + e.templateSpans.map((s) => String(evaluate(s.expression, scope)) + s.literal.text).join("");
  if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken)
    return String(evaluate(e.left, scope)) + String(evaluate(e.right, scope));
  if (ts.isArrayLiteralExpression(e)) return e.elements.map((x) => evaluate(x, scope));
  if (ts.isObjectLiteralExpression(e)) {
    const o: Record<string, unknown> = {};
    for (const p of e.properties) {
      if (ts.isPropertyAssignment(p)) o[propName(p.name)] = jsxOr(p.initializer, scope);
      else if (ts.isShorthandPropertyAssignment(p)) o[p.name.text] = evaluate(p.name, scope);
      else throw new Unreadable(p.getText());
    }
    return o;
  }
  if (ts.isIdentifier(e)) {
    const imported = IMPORTED.get(scope)?.get(e.text);
    if (imported) return imported.module[imported.name];
    const init = scope.get(e.text);
    if (!init) throw new Unreadable(`identifier ${e.text}`);
    return evaluate(init, scope);
  }
  if (ts.isCallExpression(e)) {
    const callee = e.expression.getText();
    if (callee === "Object.keys") return Object.keys(evaluate(e.arguments[0]!, scope) as object);
    if (callee === "Object.entries") return Object.entries(evaluate(e.arguments[0]!, scope) as object);
    // list.map((x) => …): each element with x bound to it; a JSX body is rendered later, inline
    const fn = e.arguments[0];
    if (
      ts.isPropertyAccessExpression(e.expression) &&
      e.expression.name.text === "map" &&
      fn &&
      ts.isArrowFunction(fn)
    ) {
      const param = fn.parameters[0]?.name;
      const list = evaluate(e.expression.expression, scope) as unknown[];
      const lit = (v: unknown) => ts.factory.createStringLiteral(String(v));
      return list.map((v) => {
        const child: Scope = new Map(scope);
        IMPORTED.set(child, IMPORTED.get(scope) ?? new Map());
        if (param && ts.isIdentifier(param)) child.set(param.text, lit(v));
        else if (param && ts.isArrayBindingPattern(param))
          param.elements.forEach((el, i) => {
            if (ts.isBindingElement(el) && ts.isIdentifier(el.name)) child.set(el.name.text, lit((v as unknown[])[i]));
          });
        else throw new Unreadable(fn.getText().slice(0, 80));
        const body = ts.isParenthesizedExpression(fn.body) ? fn.body.expression : fn.body;
        if (ts.isJsxElement(body) || ts.isJsxSelfClosingElement(body) || ts.isJsxFragment(body))
          return { jsx: body, scope: child };
        if (ts.isBlock(body)) throw new Unreadable(fn.getText().slice(0, 80));
        return evaluate(body, child);
      });
    }
    const args = e.arguments.map((a) => evaluate(a, scope)) as string[];
    if (callee === "installCommand") return installCommand(...args);
    if (callee === "registryAddCommand") return registryAddCommand();
    if (args.length && /\.tsx?$/.test(args[0] ?? "")) return { example: args[0] }; // code("file.tsx", label)
    // a string or array method on a constant: ADD.split("=")[1], ROWS.join("\n")
    if (ts.isPropertyAccessExpression(e.expression) && METHODS.has(e.expression.name.text)) {
      const target = evaluate(e.expression.expression, scope) as Record<string, (...a: unknown[]) => unknown>;
      const method = target[e.expression.name.text];
      if (typeof method === "function") return method.apply(target, args);
    }
  }
  if (e.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPropertyAccessExpression(e)) return (evaluate(e.expression, scope) as Record<string, unknown>)[e.name.text];
  if (ts.isElementAccessExpression(e))
    return (evaluate(e.expression, scope) as Record<string, unknown>)[String(evaluate(e.argumentExpression, scope))];
  throw new Unreadable(e.getText().slice(0, 80));
}

/** A value that may be JSX (a table cell, a description): JSX is kept as a node to render inline later. */
function jsxOr(e: ts.Expression, scope: Scope): unknown {
  const inner = ts.isParenthesizedExpression(e) ? e.expression : e;
  if (ts.isJsxElement(inner) || ts.isJsxFragment(inner) || ts.isJsxSelfClosingElement(inner)) return { jsx: inner };
  return evaluate(e, scope);
}

/* ------------------------------------------------------------------ JSX to Markdown */

const ENTITIES: Record<string, string> = {
  apos: "'",
  quot: '"',
  amp: "&",
  lt: "<",
  gt: ">",
  nbsp: " ",
  rarr: "→",
  larr: "←",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  times: "×",
};
const decode = (s: string) =>
  s.replace(/&(#\d+|[a-z]+);/g, (m, n: string) =>
    n.startsWith("#") ? String.fromCodePoint(Number(n.slice(1))) : (ENTITIES[n] ?? m),
  );

/** React's whitespace rule for JSX text: lines are trimmed and joined with one space; blank lines vanish. */
function jsxText(raw: string): string {
  if (!/\S/.test(raw)) return /\n/.test(raw) ? "" : raw;
  const lines = raw.split(/\r?\n/);
  const kept = lines
    .map((l, i) => {
      let t = l.replace(/\t/g, " ");
      if (i > 0) t = t.trimStart();
      if (i < lines.length - 1) t = t.trimEnd();
      return t;
    })
    .filter((l) => l !== "");
  return decode(kept.join(" "));
}

type El = ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment;
const tagOf = (n: El) =>
  ts.isJsxFragment(n) ? "" : (ts.isJsxElement(n) ? n.openingElement.tagName : n.tagName).getText();
const childrenOf = (n: El): readonly ts.JsxChild[] => (ts.isJsxSelfClosingElement(n) ? [] : n.children);
function attr(n: El, name: string): ts.Expression | undefined {
  if (ts.isJsxFragment(n)) return undefined;
  const attrs = ts.isJsxElement(n) ? n.openingElement.attributes : n.attributes;
  for (const a of attrs.properties) {
    if (!ts.isJsxAttribute(a) || a.name.getText() !== name || !a.initializer) continue;
    if (ts.isStringLiteral(a.initializer)) return a.initializer;
    if (ts.isJsxExpression(a.initializer)) return a.initializer.expression;
  }
  return undefined;
}

const INLINE = new Set(["code", "a", "Link", "b", "strong", "em", "i", "span", "bdi", "time", "kbd", "br", "Kbd"]);
const fence = (code: string, lang = "") => {
  const ticks = code.includes("```") ? "````" : "```";
  return `${ticks}${lang}\n${code.replace(/\n$/, "")}\n${ticks}`;
};
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();

class Converter {
  private scope: Scope;
  constructor(scope: Scope) {
    this.scope = scope;
  }

  inline(nodes: readonly ts.JsxChild[] | ts.NodeArray<ts.JsxChild>): string {
    return nodes
      .map((c) => this.inlineNode(c))
      .join("")
      .replace(/[ ]{2,}/g, " ");
  }

  inlineValue(v: unknown): string {
    if (v == null || v === false) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object" && "jsx" in v) {
      const { jsx, scope } = v as { jsx: ts.JsxChild | ts.Expression; scope?: Scope };
      return scope ? new Converter(scope).inlineNode(jsx) : this.inlineNode(jsx);
    }
    if (Array.isArray(v)) return v.map((x) => this.inlineValue(x)).join("");
    throw new Unreadable(`inline value ${JSON.stringify(v)}`);
  }

  inlineNode(c: ts.JsxChild | ts.Expression): string {
    if (ts.isJsxText(c)) return jsxText(c.text);
    if (ts.isJsxExpression(c)) return c.expression ? this.inlineValue(jsxOr(c.expression, this.scope)) : "";
    if (ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c) || ts.isJsxFragment(c)) {
      const tag = tagOf(c);
      const inner = this.inline(childrenOf(c));
      if (tag === "code" || tag === "kbd" || tag === "Kbd") return inner ? "`" + inner + "`" : "";
      if (tag === "b" || tag === "strong") return inner ? `**${inner.trim()}**` : "";
      if (tag === "em" || tag === "i") return inner ? `*${inner.trim()}*` : "";
      if (tag === "br") return "\n";
      if (tag === "a" || tag === "Link") {
        const href = attr(c, "href");
        const to = href ? String(evaluate(href, this.scope)) : "";
        return to ? `[${inner.trim()}](${to.startsWith("/") ? url(to) : to})` : inner;
      }
      return inner;
    }
    return this.inlineValue(jsxOr(c as ts.Expression, this.scope));
  }

  /** Block-level Markdown for a list of JSX children, as paragraphs separated by blank lines. */
  blocks(nodes: readonly ts.JsxChild[]): string[] {
    const out: string[] = [];
    let run: ts.JsxChild[] = []; // inline content between blocks (a bare text run)
    const flush = () => {
      const t = this.inline(run).trim();
      if (t) out.push(t);
      run = [];
    };
    for (const c of nodes) {
      if (ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c) || ts.isJsxFragment(c)) {
        const tag = tagOf(c);
        if (INLINE.has(tag)) run.push(c);
        else {
          flush();
          out.push(...this.block(c));
        }
      } else if (ts.isJsxExpression(c) && c.expression) {
        const e = ts.isParenthesizedExpression(c.expression) ? c.expression.expression : c.expression;
        if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e) || ts.isJsxFragment(e)) {
          flush();
          out.push(...this.block(e));
        } else run.push(c);
      } else run.push(c);
    }
    flush();
    return out;
  }

  private code(e: ts.Expression | undefined, lang: string): string[] {
    if (!e) return [];
    const inner = ts.isParenthesizedExpression(e) ? e.expression : e;
    if (ts.isJsxElement(inner) || ts.isJsxSelfClosingElement(inner)) return this.block(inner);
    const v = evaluate(inner, this.scope);
    if (typeof v === "object" && v && "example" in v)
      return [fence(exampleSource((v as { example: string }).example), "tsx")];
    return [fence(String(v), lang)];
  }

  table(head: string[], rows: string[][]): string {
    return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`]
      .concat(rows.map((r) => `| ${r.map(cell).join(" | ")} |`))
      .join("\n");
  }

  block(n: El): string[] {
    const tag = tagOf(n);
    const kids = childrenOf(n);
    const h = /^h([1-6])$/.exec(tag);
    if (h) {
      const id = attr(n, "id");
      const text = this.inline(kids).trim();
      return [`${"#".repeat(Number(h[1]))} ${text}${id ? ` {#${String(evaluate(id, this.scope))}}` : ""}`];
    }
    switch (tag) {
      case "p":
        return [this.inline(kids).trim()].filter(Boolean);
      case "ul":
      case "ol":
        return [
          kids
            .filter((k): k is ts.JsxElement => ts.isJsxElement(k) && tagOf(k) === "li")
            .map((li, i) => `${tag === "ol" ? `${i + 1}.` : "-"} ${this.blocks(li.children).join("\n  ")}`)
            .join("\n"),
        ];
      case "CodeBlock":
        return this.code(
          attr(n, "code"),
          String(evaluate(attr(n, "lang") ?? ts.factory.createStringLiteral(""), this.scope)),
        );
      case "ExampleCode":
        return [fence(exampleSource(String(evaluate(attr(n, "file")!, this.scope))), "tsx")];
      case "InstallCommand":
        return [fence(installCommand(String(evaluate(attr(n, "item")!, this.scope))), "bash")];
      case "ComponentDemo":
        return this.code(attr(n, "code"), "tsx");
      case "PropsReference": {
        const props = evaluate(attr(n, "props")!, this.scope) as Record<string, unknown>[];
        return [
          this.table(
            ["Prop", "Type", "Default", "Description"],
            props.map((p) => [
              "`" + String(p["name"]) + "`",
              "`" + String(p["type"]) + "`",
              String(p["default"]) === "—" ? "—" : "`" + String(p["default"]) + "`",
              this.inlineValue(p["description"]),
            ]),
          ),
        ];
      }
      case "ReferenceTable": {
        const head = evaluate(attr(n, "head")!, this.scope) as string[];
        const rows = evaluate(attr(n, "rows")!, this.scope) as Record<string, unknown>[];
        return [
          this.table(
            head,
            rows.map((r) => [
              this.inlineValue(r["name"]),
              this.inlineValue(r["value"]),
              this.inlineValue(r["description"]),
            ]),
          ),
        ];
      }
      case "":
      case "DocPage":
      case "div":
      case "section":
      case "figure":
        return this.blocks(kids);
      case "table": // a plain table: one Markdown row per <tr>
        return [];
      default:
        // a live preview or another interactive component: its source is shown by the ComponentDemo around it
        return [];
    }
  }
}

/** The JSX a page's default export returns, and the constants it can read. */
/** A source file's constants and the values it imports from MODULES. */
function scan(file: string): { scope: Scope; sf: ts.SourceFile } {
  const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const scope: Scope = new Map();
  const imports = new Map<string, { module: Record<string, unknown>; name: string }>();
  IMPORTED.set(scope, imports);
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer)
      scope.set(node.name.text, node.initializer);
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const module = MODULES[node.moduleSpecifier.text];
      const named = node.importClause?.namedBindings;
      if (module && named && ts.isNamedImports(named))
        for (const el of named.elements) imports.set(el.name.text, { module, name: (el.propertyName ?? el.name).text });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { scope, sf };
}

function readPage(file: string): { jsx: El; scope: Scope; sf: ts.SourceFile } {
  const { scope, sf } = scan(file);
  let jsx: El | undefined;
  for (const st of sf.statements) {
    const isDefault =
      ts.isFunctionDeclaration(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    if (!isDefault || !st.body) continue;
    const find = (node: ts.Node): void => {
      if (jsx) return;
      if (ts.isReturnStatement(node) && node.expression) {
        const e = ts.isParenthesizedExpression(node.expression) ? node.expression.expression : node.expression;
        if (ts.isJsxElement(e) || ts.isJsxFragment(e) || ts.isJsxSelfClosingElement(e)) jsx = e;
      }
      ts.forEachChild(node, find);
    };
    find(st.body);
  }
  if (!jsx) throw new Error(`Keyline site: ${file} has no default export returning JSX`);
  return { jsx, scope, sf };
}

/** The page's own text as Markdown, without the preamble: what /llms-full.txt and the search index read. */
export function pageBody(href: string): string {
  const file = pageSourceFile(href);
  try {
    const generated = GENERATED.exec(href)?.[1];
    if (generated && !file.endsWith("page.tsx")) return componentBody(generated, file).join("\n\n");
    if (href === "/docs/changelog") return changelogBody(file).join("\n\n");
    const { jsx, scope } = readPage(file);
    return new Converter(scope).blocks([jsx as unknown as ts.JsxChild]).join("\n\n");
  } catch (e) {
    if (e instanceof Unreadable) throw new Error(`Keyline site: cannot read ${file} as Markdown: ${e.message}`);
    throw e;
  }
}

/** A page's `.md` twin: the preamble, the page, and where its canonical HTML and registry item live. */
export function pageMarkdown(href: string): string {
  const page = DOC_PAGES.find((p) => p.href === href);
  if (!page) throw new Error(`Keyline site: no docs page at ${href}`);
  const links = [`Canonical page: ${url(href)}`, `All docs as Markdown: ${url("/llms-full.txt")}`];
  if (page.item) links.unshift(`Registry item: ${url(`/r/${page.item}.json`)}`);
  return `${PREAMBLE}\n\n${pageBody(href)}\n\n---\n\n${links.map((l) => `- ${l}`).join("\n")}\n`;
}

/** Headings of a Markdown text in order, without anchors: what the twin tests compare with the page. */
export function markdownHeadings(md: string): string[] {
  const out: string[] = [];
  let inFence = false;
  for (const line of md.split("\n")) {
    if (/^(```|````)/.test(line)) inFence = !inFence;
    else if (!inFence) {
      const m = /^#{1,6} (.*?)(?: \{#[^}]+\})?$/.exec(line);
      if (m) out.push(m[1]!);
    }
  }
  return out;
}

/** Every heading one level deeper (`#` to `##`), outside code fences: a page's text inside /llms-full.txt. */
export function shiftHeadings(md: string): string {
  let inFence = false;
  return md
    .split("\n")
    .map((line) => {
      if (/^(```|````)/.test(line)) inFence = !inFence;
      return !inFence && /^#{1,5} /.test(line) ? `#${line}` : line;
    })
    .join("\n");
}

type Migration = { diff: string; readd: string; modified: string; prompt: string };
type ChangeEntry = { item: string; version: string; note: string; breaking: boolean; migration?: Migration };

/**
 * The changelog page (app/docs/changelog) renders lib/changelog.json, which `pnpm changelog` generates: its written
 * lede is read from the page source, and each release is written from the same data, as the page lays it out.
 */
function changelogBody(file: string): string[] {
  const { jsx, scope } = readPage(file);
  const conv = new Converter(scope);
  const written = childrenOf(jsx).filter((c): c is ts.JsxElement => ts.isJsxElement(c));
  const pageOf = new Map(
    CATALOG.flatMap((g) => g.items.flatMap((e) => (e.href ? [[e.item, url(e.href)] as const] : []))),
  );
  const longDate = (date: string) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  const releases = (changelog as { releases: { date: string; entries: ChangeEntry[] }[] }).releases;
  return [
    ...conv.blocks(written),
    ...releases.flatMap(({ date, entries }) => [
      `## ${longDate(date)} {#d-${date}}`,
      conv.table(
        ["Item", "Version", "Change"],
        entries.map((e) => [
          pageOf.has(e.item) ? `[${e.item}](${pageOf.get(e.item)})` : "`" + e.item + "`",
          "`" + e.version + "`",
          e.breaking ? `**Breaking:** ${e.note} [Migration](#${e.item}-${e.version})` : e.note,
        ]),
      ),
      ...entries.flatMap((e) =>
        e.migration
          ? [
              `### ${e.item} ${e.version}: migration {#${e.item}-${e.version}}`,
              e.note,
              fence(e.migration.diff, "text"),
              "Re-add it:",
              fence(e.migration.readd, "bash"),
              "If you keep a locally modified copy:",
              fence(e.migration.modified, "text"),
              "Agent prompt:",
              fence(e.migration.prompt, "text"),
            ]
          : [],
      ),
    ]),
  ];
}
