import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { ItemSettings } from "@site/components/layout-previews";

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
    description: "A trailing value in the code voice, and the row\u2019s controls.",
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
  seo: "React list rows on shared keylines for settings, members, files and integrations: a media cell, content, a value and controls. Rows can be links or buttons.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A list of rows on shared keylines: a square media cell, the content, a value and the row&apos;s controls. Pass{" "}
        <code>render</code> to make the whole row a link or a button, and <code>current</code> to mark the one that is
        open.
      </p>

      <ComponentDemo label="Item example" preview={<ItemSettings />} code={code("item-settings.tsx", "example code")} />
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
        Parts: <code>ItemList</code> (a <code>div</code> with the list role), <code>Item</code> (a <code>div</code>, a
        list item inside a list; with <code>render</code> it is that element, wrapped in a list item), and{" "}
        <code>ItemMedia</code>, <code>ItemContent</code>, <code>ItemMeta</code> and <code>ItemActions</code> (each a{" "}
        <code>span</code>). Base UI has no list part. They carry <code>data-slot</code>: <code>item-list</code> (with{" "}
        <code>data-kl-layout</code>), <code>item</code> (with <code>data-current</code> and{" "}
        <code>data-interactive</code>), <code>item-media</code>, <code>item-content</code> (holding{" "}
        <code>item-title</code> and <code>item-description</code>), <code>item-meta</code>, <code>item-actions</code>,
        and <code>item-row</code> for the list item around an interactive row. Every part takes <code>render</code>, and
        a <code>className</code> or <code>style</code> that may be a function of its state. At 420px of list width and
        under, the meta moves under the title.
      </p>
      <p className="s-small">The Inspector, Resizable and Scroll area examples use clickable Item rows.</p>
    </>
  ),
};
