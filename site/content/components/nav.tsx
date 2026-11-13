import type { ComponentContent } from "@site/content/types";
import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { NavSidebar } from "@site/components/nav-previews";

const IMPORT = `import { Nav, type NavGroup } from "@/components/keyline/ui/nav"`;

const USAGE = `<Nav
  label="Scranton branch"
  value={view}
  onValueChange={setView}
  groups={[{ label: "Sales", items: [{ value: "orders", label: "Orders", count: 11 }] }]}
/>`;

const PROPS: Prop[] = [
  {
    name: "items \u00b7 groups",
    type: "NavItem[] \u00b7 NavGroup[]",
    default: "\u2014",
    description: "A flat list, or labelled sections divided by a heavy seam.",
  },
  { name: "value", type: "string", default: "\u2014", description: "The current item." },
  {
    name: "onValueChange",
    type: "(value: string) => void",
    default: "\u2014",
    description: "For button items. Link items navigate.",
  },
  { name: "label", type: "string", default: "\u2014", description: "Names the navigation landmark." },
  {
    name: "header \u00b7 footer",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        At the top and bottom of the column. <code>NavIdentity</code> is a mark, title and meta line.
      </>
    ),
  },
  {
    name: "orientation",
    type: '"vertical" | "horizontal" | "responsive"',
    default: '"vertical"',
    description: (
      <>
        <code>responsive</code> is a column under 300px of its own width, a row above.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> sits inside another frame, such as AppShell&apos;s sidebar.
      </>
    ),
  },
  {
    name: "NavItem",
    type: "{ value, label, href?, icon?, count?, items?, disabled?, action? }",
    default: "\u2014",
    description: (
      <>
        <code>items</code> nests links; <code>action</code> is a cell for the row&apos;s own commands, usually a{" "}
        <code>NavAction</code> opening a Menu.
      </>
    ),
  },
];

const TOC: TocGroup[] = [
  {
    label: "Setup",
    items: [
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "React app navigation for a sidebar or a row: links or buttons, nested lists, and a band that stretches to the current section. Folds to icons in a rail.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        An app&apos;s sections. The current one sits under a cobalt band that stretches to it, across groups too. Items
        are links with <code>href</code> or buttons; nested items open a list under their parent. In{" "}
        <Link href="/docs/components/app-shell">AppShell</Link>&apos;s rail only the icons show, and the label appears
        beside each on hover and focus.
      </p>

      <ComponentDemo label="Nav example" preview={<NavSidebar />} code={code("nav-sidebar.tsx", "example code")} />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: null,
  reference: (
    <>
      <p className="s-small">This site&apos;s component list and page contents are Keyline Nav.</p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>Nav</code> draws its list from <code>items</code> or <code>groups</code>, because its band, nested lists
        and rail are planned over the whole list. <code>NavIdentity</code> (a header or footer identity) and{" "}
        <code>NavAction</code> (a row&apos;s ⋯ cell, rendered by a <code>MenuTrigger</code>) are parts Keyline renders:
        each takes <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function.
      </p>
      <p className="s-small">
        Every element carries a <code>data-slot</code> for styling from outside: <code>nav</code>,{" "}
        <code>nav-header</code>, <code>nav-list</code>, <code>nav-group</code>, <code>nav-group-label</code>,{" "}
        <code>nav-group-list</code>, <code>nav-item</code> (with <code>nav-item-icon</code>, <code>nav-item-label</code>
        , <code>nav-item-count</code> and <code>nav-item-caret</code>), <code>nav-row</code> and{" "}
        <code>nav-item-action</code> for a row with an action, <code>nav-fold</code> and <code>nav-sub</code> for a
        nested list, <code>nav-footer</code>, <code>nav-identity</code> and <code>nav-action</code>. The root mirrors
        its state as <code>data-orientation</code>, <code>data-kl-layout</code>, <code>data-kl-icons</code> and{" "}
        <code>data-kl-rail</code>; the current item has <code>aria-current=&quot;page&quot;</code>, and the item the
        band covers <code>data-kl-covered</code>.
      </p>
    </>
  ),
};
