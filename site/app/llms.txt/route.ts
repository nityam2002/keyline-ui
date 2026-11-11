import manifest from "../../public/r/registry.json"
import { BLOCKS, CATALOG, GUIDES } from "@site/lib/catalog"
import { installCommand, registryAddCommand, SITE_ORIGIN } from "@site/lib/registry"
import { SITE_DESCRIPTION, SITE_NAME } from "@site/lib/seo"

/**
 * /llms.txt (the llmstxt.org proposal): a Markdown index of the docs and the registry for language-model tools and
 * the people using them. It is not a crawler directive and promises nothing about indexing, training or citation;
 * robots.txt and the noindex headers decide those (next.config.ts keeps this file out of search results).
 *
 * Everything is derived: the pages from the catalogue (the same list as the docs index and the sitemap), each
 * component's line from its registry item, the commands from lib/registry. A new page or item appears here
 * without editing this file. Links are absolute when the site knows its origin (lib/registry.ts), else root-relative.
 */
export const dynamic = "force-static"

type Item = { name: string; type: string; description?: string }
const items: Item[] = manifest.items

const url = (path: string) => `${SITE_ORIGIN ?? ""}${path}`
const describe = (name: string) => items.find((i) => i.name === name)?.description ?? ""
const line = (name: string, href: string, note: string) => `- [${name}](${url(href)})${note ? `: ${note}` : ""}`

function body() {
  const paged = new Set([...CATALOG.flatMap((g) => g.items), ...BLOCKS.items].map((e) => e.item))
  // installed as dependencies of the components, or added on purpose (the style, the whole-app theme): no page of their own
  const unpaged = items.filter((i) => !paged.has(i.name))

  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Keyline is a shadcn registry, not an npm runtime package. The shadcn CLI copies each item's source into the project " +
      "(`components/keyline/ui`, `lib` and `blocks`, under `src/` when the project uses it) together with the Keyline items, " +
      "CSS and npm packages it needs. The copied code belongs to the project: read and change it freely; nothing updates " +
      "until the item is added again with `--overwrite`, and nothing is fetched from this site at runtime.",
    "",
    "Requirements: React 19, TypeScript, Tailwind CSS 4 and a shadcn project (a `components.json` and the `cn()` helper; " +
      "`npx shadcn@latest init` sets both up).",
    "",
    "Install: in the folder that holds `components.json`, map the `@keyline-ui` namespace once, then add items by name. " +
      "Map it first: `@keyline-ui` is not in shadcn's public registry directory, so an unmapped `add @keyline-ui/<name>` " +
      'fails with `Unknown registry "@keyline-ui"`.',
    "",
    "```bash",
    registryAddCommand(),
    installCommand("button"),
    "```",
    "",
    'Import installed components from `@/components/keyline/ui/<name>`, e.g. `import { Button } from "@/components/keyline/ui/button"`. ' +
      "Every component page below shows its install command, live examples with their source, and a props reference. " +
      `Each registry item is also JSON at \`${url("/r/<name>.json")}\`.`,
    "",
    "## Guides",
    "",
    ...GUIDES.map((g) => line(g.name, g.href, g.description)),
    "",
    ...CATALOG.flatMap((g) => [
      `## Components: ${g.group}`,
      "",
      ...g.items.filter((e) => e.href).map((e) => line(e.name, e.href!, `\`@keyline-ui/${e.item}\`. ${describe(e.item)}`)),
      "",
    ]),
    `## ${BLOCKS.group}`,
    "",
    ...BLOCKS.items.filter((e) => e.href).map((e) => line(e.name, e.href!, `\`@keyline-ui/${e.item}\`. ${e.description ?? describe(e.item)}`)),
    "",
    "## Optional",
    "",
    line("Registry index", "/r/registry.json", `every item Keyline ships (${items.length}), with its type, files and dependencies`),
    ...unpaged.map((i) => line(`@keyline-ui/${i.name}`, `/r/${i.name}.json`, `${i.type}. ${i.description ?? ""}`.trim())),
    "",
  ].join("\n")
}

export function GET() {
  return new Response(body(), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
