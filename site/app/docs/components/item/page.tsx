import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { ItemSettings } from "@site/components/layout-previews";

const ITEM = "item";

export const metadata = componentMetadata(
  "Item",
  "React list rows on shared keylines for settings, members, files and integrations: a media cell, content, a value and controls. Rows can be links or buttons.",
  "item",
);

const IMPORT = `import { Item, ItemActions, ItemContent, ItemList, ItemMedia, ItemMeta } from "@/components/keyline/ui/item"`;

const USAGE = `<ItemList aria-label="Email me about">
  <Item>
    <ItemMedia>ORD</ItemMedia>
    <ItemContent title="New orders" description="…" />
    <ItemActions><Switch aria-label="New orders" /></ItemActions>
  </Item>
</ItemList>`;

const PROPS: Prop[] = [
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        On <code>ItemList</code>: <code>cell</code> is the body of an enclosing frame.
      </>
    ),
  },
  {
    name: "render",
    type: "ReactElement",
    default: "\u2014",
    description: (
      <>
        On <code>Item</code>: <code>&lt;a href&gt;</code> or <code>&lt;button&gt;</code> makes the row interactive.
      </>
    ),
  },
  {
    name: "current",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>Item</code>: the row that is open; its media cell floods.
      </>
    ),
  },
  {
    name: "ItemMedia",
    type: "span",
    default: "\u2014",
    description: "A 16px icon, an initial or a code of up to four characters.",
  },
  {
    name: "title \u00b7 description",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>ItemContent</code>.
      </>
    ),
  },
  {
    name: "ItemMeta \u00b7 ItemActions",
    type: "span",
    default: "\u2014",
    description: "A trailing value in the code voice, and the row&apos;s controls.",
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

export default function ItemPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Item" toc={TOC}>
      <h1>Item</h1>
      <p className="s-doc-lede">
        A list of rows on shared keylines: a square media cell, the content, a value and the row&apos;s controls. Pass{" "}
        <code>render</code> to make the whole row a link or a button, and <code>current</code> to mark the one that is
        open.
      </p>

      <ComponentDemo label="Item example" preview={<ItemSettings />} code={code("item-settings.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Item props" props={PROPS} />
      <p className="s-small">The Inspector, Resizable and Scroll area examples use clickable Item rows.</p>
    </DocPage>
  );
}
