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

const IMPORT = `import { Popover, PopoverBody, PopoverClose, PopoverPopup, PopoverFooter, PopoverHeader, PopoverTrigger } from "@/components/keyline/ui/popover"`;

const USAGE = `<Popover>
  <PopoverTrigger render={<Button size="compact" />}>Delivery note</PopoverTrigger>
  <PopoverPopup>
    <PopoverHeader title="Delivery note" description="…" />
    <PopoverBody>…</PopoverBody>
    <PopoverFooter>
      <PopoverClose render={<Button layout="cell" />}>Cancel</PopoverClose>
    </PopoverFooter>
  </PopoverPopup>
</Popover>`;

const PROPS: Prop[] = [
  {
    name: "side \u00b7 align",
    type: "Base UI side \u00b7 align",
    default: '"bottom" \u00b7 "start"',
    description: (
      <>
        On <code>PopoverPopup</code>: where it docks. It flips when there&apos;s no room.
      </>
    ),
  },
  {
    name: "attachWeight",
    type: "1 | 2 | 3",
    default: "2",
    description: "The trigger's edge weight, so the shared edge matches: 1 for a cell, 2 for a control.",
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
  {
    name: "sideOffset \u00b7 alignOffset \u00b7 collisionPadding",
    type: "number",
    default: "-attachWeight (8 detached) \u00b7 0 \u00b7 12",
    description: (
      <>
        On <code>PopoverPopup</code>: the positioner&apos;s props, lifted onto the popup.
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>PopoverPopup</code>: where the popover&apos;s portal renders, and props for the portal. It keeps the
        theme, density, motion and direction of the place it is written either way.
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
        Parts, named as Base UI names them: <code>Popover</code> (also <code>PopoverRoot</code>),{" "}
        <code>PopoverTrigger</code>, <code>PopoverPopup</code> (Base UI&apos;s Portal, Positioner and Popup in one
        part), <code>PopoverTitle</code>, <code>PopoverDescription</code> and <code>PopoverClose</code>, with
        Keyline&apos;s <code>PopoverHeader</code>, <code>PopoverBody</code> and <code>PopoverFooter</code>. Every part
        takes <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its
        state. Each carries a <code>data-slot</code>: <code>popover-trigger</code>, <code>popover-popup</code> (with{" "}
        <code>data-detached</code> and Base UI&apos;s <code>data-side</code> and <code>data-align</code>),{" "}
        <code>popover-header</code>, <code>popover-title</code>, <code>popover-description</code>,{" "}
        <code>popover-body</code>, <code>popover-footer</code> and <code>popover-close</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/popover">Base UI Popover</a>; its other props pass through.
      </p>
    </DocPage>
  );
}
