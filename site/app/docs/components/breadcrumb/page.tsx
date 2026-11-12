import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { BreadcrumbDrive } from "@site/components/nav-previews";

const ITEM = "breadcrumb";

export const metadata = componentMetadata(
  "Breadcrumb",
  "A React breadcrumb as cells in one frame. Past four levels, or when narrow, earlier levels fold into a menu; the parent and current page always show.",
  "breadcrumb",
);

const IMPORT = `import { Breadcrumb } from "@/components/keyline/ui/breadcrumb"`;

const USAGE = `<Breadcrumb
  items={[
    { label: "Clients", href: "/clients" },
    { label: "Lackawanna County", href: "/clients/lackawanna" },
    { label: "Q4 orders" },
  ]}
/>`;

const PROPS: Prop[] = [
  {
    name: "items",
    type: "{ label, href?, render? }[]",
    default: "\u2014",
    description: (
      <>
        Ancestors first, the current page last. <code>render</code> swaps the link for a router link or a button.
      </>
    ),
  },
  {
    name: "maxItems",
    type: "number",
    default: "4",
    description: "Above this many, the levels before the parent fold into the menu.",
  },
  {
    name: "moreLabel",
    type: "string",
    default: '"Earlier levels"',
    description: "The name of the &ldquo;\u2026&rdquo; button.",
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> sits in the top row of a panel or page header.
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

export default function BreadcrumbPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Breadcrumb" toc={TOC}>
      <h1>Breadcrumb</h1>
      <p className="s-doc-lede">
        Where this page sits, as cells in one frame. Ancestors are links and the current page is the cobalt cell. Past
        four levels, or under 480px of its own width, the earlier levels fold into a &ldquo;…&rdquo; menu; the parent
        and the page always show.
      </p>

      <ComponentDemo
        label="Breadcrumb example"
        preview={<BreadcrumbDrive />}
        code={code("breadcrumb-drive.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Breadcrumb props" props={PROPS} />
      <p className="s-small">
        The folded levels open in a Keyline Menu, so the arrow keys move through them. The chevrons mirror in
        right-to-left text.
      </p>
      <p className="s-small">
        Each element carries a <code>data-slot</code> to select it by: <code>breadcrumb</code> (the nav, which takes{" "}
        <code>className</code> and the nav&apos;s props), <code>breadcrumb-list</code>, <code>breadcrumb-item</code>,{" "}
        <code>breadcrumb-link</code>, <code>breadcrumb-page</code> (the current page), <code>breadcrumb-separator</code>{" "}
        and <code>breadcrumb-more</code> (the folded levels&apos; cell). The nav carries <code>data-kl-folded</code>{" "}
        while the levels fold by count.
      </p>
    </DocPage>
  );
}
