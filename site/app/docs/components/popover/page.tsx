import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { PopoverNote } from "@site/components/overlay-previews";

const ITEM = "popover";

export const metadata = componentMetadata(
  "Popover",
  "A React popover docked to the control that opened it, sharing its edge, for a quick edit or a few settings. The page stays live around it. On Base UI.",
  "popover",
);

const IMPORT = `import { Popover, PopoverBody, PopoverClose, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger } from "@/components/keyline/ui/popover"`;

const USAGE = `<Popover>
  <PopoverTrigger render={<Button size="compact" />}>Delivery note</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader title="Delivery note" description="…" />
    <PopoverBody>…</PopoverBody>
    <PopoverFooter>
      <PopoverClose render={<Button layout="cell" />}>Cancel</PopoverClose>
    </PopoverFooter>
  </PopoverContent>
</Popover>`;

const PROPS: Prop[] = [
  {
    name: "side \u00b7 align",
    type: "Base UI side \u00b7 align",
    default: '"bottom" \u00b7 "start"',
    description: (
      <>
        On <code>PopoverContent</code>: where it docks. It flips when there&apos;s no room.
      </>
    ),
  },
  {
    name: "attachWeight",
    type: "1 | 2 | 3",
    default: "2",
    description: "The trigger&apos;s edge weight, so the shared edge matches: 1 for a cell, 2 for a control.",
  },
  {
    name: "detached",
    type: "boolean",
    default: "false",
    description: "Sits one gutter away in its own frame, for content not about the trigger.",
  },
  { name: "anchor", type: "Element | ref", default: "the trigger", description: "Docks to another element." },
  {
    name: "PopoverHeader",
    type: "{ title, description?, close?, closeLabel? }",
    default: "\u2014",
    description: "A header row with a close cell.",
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

export default function PopoverPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Popover" toc={TOC}>
      <h1>Popover</h1>
      <p className="s-doc-lede">
        A small panel about the control that opened it. It docks to the trigger and shares its edge, so the two read as
        one shape. It holds a quick edit or a few settings; the page around it stays live, and a click outside or Escape
        puts it away.
      </p>

      <ComponentDemo
        label="Popover example"
        preview={<PopoverNote />}
        code={code("popover-note.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Popover props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/popover">Base UI Popover</a>; its other props pass
        through.
      </p>
    </DocPage>
  );
}
