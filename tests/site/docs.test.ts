// The docs site's agent and search surfaces, from the same page data: every page's Markdown twin, the component
// pages' JSON-LD, the sitemap dates and the full-text index. Node only; the served routes and content negotiation
// are checked against a running site by scripts/site-check.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DOC_PAGES, PREAMBLE, markdownHeadings, pageMarkdown, pageSourceFile } from "../../site/lib/docs-markdown.ts";
import { gitDate, metaFile, metaUpdated, pageModified } from "../../site/lib/dates.ts";
import { buildSearchIndex } from "../../site/lib/search-index.ts";
import { search } from "../../site/lib/search.ts";
import { sourceCodeJsonLd, stringifyJsonLd } from "../../site/lib/seo.ts";
import { exampleSource } from "../../site/lib/source.ts";
import { installCommand } from "../../site/lib/registry.ts";
import changelog from "../../site/lib/changelog.json" with { type: "json" };

// the entities the pages use (grep -o '&[a-z]*;' site/app/docs)
const ENT: Record<string, string> = {
  apos: "'",
  quot: '"',
  amp: "&",
  lt: "<",
  gt: ">",
  ldquo: "“",
  rdquo: "”",
  rsquo: "’",
};
const flat = (s: string) =>
  s
    .replace(/\{"\s*"\}/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&([a-z]+);/g, (m, n: string) => ENT[n] ?? m)
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** The page's headings read straight from its source (what its default export renders, not code samples above
 *  it), independently of the converter. */
function sourceHeadings(src: string): string[] {
  // a page renders its default export; a component content file (site/content/components) its `content` object
  const from = src.includes("export default function") ? "export default function" : "export const content";
  return [...src.slice(src.indexOf(from)).matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => flat(m[2]!));
}

/** Whether `want` appears in `have` in order (other items may come between). */
const inOrder = (have: string[], want: string[]) => {
  let i = 0;
  for (const h of have) if (h === want[i]) i++;
  return i === want.length;
};

/** The sections the generated component route adds around a content file's prose (app/docs/components/[name]). */
const GENERATED_SECTIONS = ["Installation", "Usage", "Props"];

test("every docs page has a Markdown twin that opens with the preamble and says what the page says", () => {
  assert.ok(DOC_PAGES.length > 60, `docs pages: ${DOC_PAGES.length}`);
  for (const p of DOC_PAGES) {
    const src = fs.readFileSync(pageSourceFile(p.href), "utf8");
    const md = pageMarkdown(p.href);
    assert.ok(md.startsWith(PREAMBLE), `${p.href}: twin opens with the preamble`);
    const headings = markdownHeadings(md).map(flat);
    if (pageSourceFile(p.href).endsWith("page.tsx") && p.href !== "/docs/changelog")
      assert.deepEqual(headings, sourceHeadings(src), `${p.href}: same headings, same order`);
    else if (p.href !== "/docs/changelog") {
      // a generated page: its title, the generated sections, and the content file's own headings, in order (the
      // served HTML is compared heading for heading by scripts/site-check.mjs)
      assert.ok(inOrder(headings, GENERATED_SECTIONS), `${p.href}: generated sections ${JSON.stringify(headings)}`);
      assert.ok(inOrder(headings, sourceHeadings(src)), `${p.href}: the content file's headings, in order`);
    } else
      assert.ok(
        inOrder(
          headings,
          sourceHeadings(src).filter((h) => !h.includes("{")),
        ),
        "changelog: its written headings",
      );
    for (const [, item] of src.matchAll(/<InstallCommand item="([^"]+)"/g))
      assert.ok(md.includes(installCommand(item!)), `${p.href}: install command for ${item}`);
    // the prose is text, not HTML: no entity is left undecoded
    const prose = md.replace(/(```+)[\s\S]*?\1/g, "");
    assert.ok(!/&[a-z]+;/.test(prose), `${p.href}: undecoded entity ${/&[a-z]+;/.exec(prose)?.[0]}`);
    // every code block whose text is a plain constant is in the twin, character for character
    for (const [, name] of src.matchAll(/<CodeBlock code=\{([A-Z_]+)\}/g)) {
      const value = new RegExp(`const ${name} = (?:\`([^\`$]*)\`|"([^"]*)");`).exec(src);
      if (value) assert.ok(md.includes(value[1] ?? value[2]!), `${p.href}: code block ${name}`);
    }
    // every example the page shows is inlined as its real source
    for (const [, file] of src.matchAll(/["']([a-z0-9-]+\.tsx)["']/g))
      assert.ok(md.includes(exampleSource(file!).trim()), `${p.href}: source of ${file}`);
    // every paragraph's opening words are in the twin (the changelog's migration paragraphs show only for a
    // breaking entry, so that page is checked against its data and the served HTML instead)
    if (p.href !== "/docs/changelog")
      for (const [, para] of src.matchAll(/<p(?: className="[^"]*")?>\s*([A-Z][^<{]{24,}?)[<{\n]/g))
        assert.ok(flat(md).includes(flat(para!).slice(0, 24)), `${p.href}: paragraph "${flat(para!).slice(0, 24)}"`);
  }
});

test("component pages carry valid SoftwareSourceCode JSON-LD pointing at their registry item", () => {
  const components = DOC_PAGES.filter((p) => p.item);
  assert.ok(components.length > 50);
  for (const p of components) {
    const data = JSON.parse(
      stringifyJsonLd(sourceCodeJsonLd({ name: p.name, item: p.item!, href: p.href, description: "d" })),
    ) as Record<string, unknown>;
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "SoftwareSourceCode");
    for (const k of ["name", "description", "url", "codeRepository", "programmingLanguage"])
      assert.ok(data[k], `${p.href}: ${k}`);
    assert.match(String(data["url"]), new RegExp(`${p.href}$`));
    const json = String(data["codeRepository"]).match(/\/r\/([a-z0-9-]+)\.json$/)?.[1];
    assert.equal(json, p.item, `${p.href}: codeRepository names the item`);
    assert.ok(fs.existsSync(path.join("site/public/r", `${json}.json`)), `${p.href}: r/${json}.json is built`);
  }
  // the text can never close its script element
  const hostile = stringifyJsonLd(sourceCodeJsonLd({ name: "x", item: "x", href: "/x", description: "</script><b>" }));
  assert.ok(!hostile.includes("<"), "JSON-LD escapes <");
  assert.equal((JSON.parse(hostile) as { description: string }).description, "</script><b>");
});

test("sitemap dates: a meta's `updated`, else git's last change", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kl-dates-"));
  const f = path.join(dir, "x.meta.ts");
  fs.writeFileSync(f, `export default { name: "x", version: "1.2.0", updated: "2026-10-01", changelog: [] };`);
  assert.equal(metaUpdated(f), "2026-10-01");
  fs.writeFileSync(f, `export default { name: "x" };`);
  assert.equal(metaUpdated(f), undefined);
  fs.rmSync(dir, { recursive: true });

  for (const p of DOC_PAGES) {
    const meta = p.item ? metaFile(p.item) : undefined;
    const release = p.href === "/docs/changelog" ? changelog.releases[0]?.date : undefined;
    const expected = release ?? (meta && (metaUpdated(meta) ?? gitDate(meta))) ?? gitDate(pageSourceFile(p.href));
    assert.ok(expected, `${p.href}: has a date`);
    assert.equal(pageModified(p)?.toISOString(), new Date(expected!).toISOString(), `${p.href}: lastModified`);
  }
  const button = metaFile("button");
  assert.ok(button, "button has a meta");
  assert.equal(
    pageModified({ href: "/docs/components/button", item: "button" })?.toISOString(),
    new Date(metaUpdated(button!) ?? gitDate(button!)!).toISOString(),
  );
});

test("search finds a term from the body text of a page, at its section", () => {
  const index = buildSearchIndex();
  assert.ok(index.length > DOC_PAGES.length, "one record per section");
  // "oklch" is in no page name, heading or keyword list: only in the theming guide's token table
  const hits = search(index, "oklch");
  assert.ok(hits.length > 0, "oklch: found");
  assert.equal(hits[0]!.href, "/docs/theming#tokens");
  // every word must match; names outrank text
  assert.equal(search(index, "oklch zzqx").length, 0);
  assert.equal(search(index, "combobox")[0]!.page, "Combobox");
});
