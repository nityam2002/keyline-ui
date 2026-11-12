import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { NavSidebar } from "@site/components/nav-previews";

const ITEM = "nav";

export const metadata = componentMetadata(
  "Nav",
  "React app navigation for a sidebar or a row: links or buttons, nested lists, and a band that stretches to the current section. Folds to icons in a rail.",
  "nav",
);

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
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function NavPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Nav" toc={TOC}>
      <h1>Nav</h1>
      <p className="s-doc-lede">
        An app&apos;s sections. The current one sits under a cobalt band that stretches to it, across groups too. Items
        are links with <code>href</code> or buttons; nested items open a list under their parent. In{" "}
        <Link href="/docs/components/app-shell">AppShell</Link>&apos;s rail only the icons show, and the label appears
        beside each on hover and focus.
      </p>

      <ComponentDemo label="Nav example" preview={<NavSidebar />} code={code("nav-sidebar.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Nav props" props={PROPS} />
      <p className="s-small">This site&apos;s component list and page contents are Keyline Nav.</p>
    </DocPage>
  );
}
