import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { KbdShortcuts } from "@site/components/data-previews";

const ITEM = "kbd";

export const metadata = componentMetadata(
  "Kbd",
  "A React keyboard key (kbd) in the code voice. Keys pressed together share one frame; keys pressed in turn are separate, with the joining word read aloud.",
  "kbd",
);

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

export default function KbdPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Kbd" toc={TOC}>
      <h1>Kbd</h1>
      <p className="s-doc-lede">
        A key in the code voice: a small cell with a 2px floor for the key&apos;s lip. Keys pressed together share seams
        in one frame; the joining word is read aloud, not drawn. Keys pressed in turn are separate keys with the word
        between them.
      </p>

      <ComponentDemo label="Kbd example" preview={<KbdShortcuts />} code={code("kbd-shortcuts.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Kbd props" props={PROPS} />
      <p className="s-small">
        Both render <code>kbd</code>, nested for a combination as HTML specifies. Menu, Command and Tooltip use it for
        their shortcuts.
      </p>
    </DocPage>
  );
}
