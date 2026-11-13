import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { KbdShortcuts } from "@site/components/data-previews";

const IMPORT = `import { Kbd, KbdGroup } from "@/components/keyline/ui/kbd"`;

const USAGE = `<KbdGroup>
  <Kbd>Ctrl</Kbd>
  <Kbd>S</Kbd>
</KbdGroup>
<Kbd>G</Kbd> then <Kbd>I</Kbd>`;

const PROPS: Prop[] = [
  { name: "children", type: "ReactNode", default: "\u2014", description: "The key as printed on it." },
  {
    name: "label",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>Kbd</code>: words for a symbol key, so <code>⌘</code> is read as Command.
      </>
    ),
  },
  {
    name: "separator",
    type: "string",
    default: '"+"',
    description: (
      <>
        On <code>KbdGroup</code>: read between keys. <code>then</code> for a sequence.
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
  seo: "A React keyboard key (kbd) in the code voice. Keys pressed together share one frame; keys pressed in turn are separate, with the joining word read aloud.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A key in the code voice: a small cell with a 2px floor for the key&apos;s lip. Keys pressed together share seams
        in one frame; the joining word is read aloud, not drawn. Keys pressed in turn are separate keys with the word
        between them.
      </p>

      <ComponentDemo label="Kbd example" preview={<KbdShortcuts />} code={code("kbd-shortcuts.tsx", "example code")} />
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
        Parts: <code>Kbd</code> and <code>KbdGroup</code>. Both render <code>kbd</code>, nested for a combination as
        HTML specifies; they carry <code>data-slot=&quot;kbd&quot;</code> and{" "}
        <code>data-slot=&quot;kbd-group&quot;</code>. Every part takes <code>render</code>, and a <code>className</code>{" "}
        or <code>style</code> that may be a function of its state. Menu, Command and Tooltip use it for their shortcuts.
      </p>
    </>
  ),
};
