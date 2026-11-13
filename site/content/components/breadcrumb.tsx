import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { BreadcrumbDrive } from "@site/components/nav-previews";

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
    description: "The name of the “…” button.",
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

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React breadcrumb as cells in one frame. Past four levels, or when narrow, earlier levels fold into a menu; the parent and current page always show.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
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
    </>
  ),
};
