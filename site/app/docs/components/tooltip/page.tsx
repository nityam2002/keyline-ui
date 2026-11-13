import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { TooltipIcons } from "@site/components/overlay-previews";

const ITEM = "tooltip";

export const metadata = componentMetadata(
  "Tooltip",
  "A React tooltip: an ink label that names an icon button, with its keyboard shortcut in a cell. On Base UI.",
  "tooltip",
);

const IMPORT = `import { Tooltip } from "@/components/keyline/ui/tooltip"`;

const USAGE = `<Tooltip content="Print" shortcut="⌘P">
  <Button size="icon" aria-label="Print">…</Button>
</Tooltip>`;

const PROPS: Prop[] = [
  {
    name: "children",
    type: "ReactElement",
    default: "\u2014",
    description: "The trigger: a focusable element that takes a ref, such as a Button.",
  },
  { name: "content", type: "ReactNode", default: "\u2014", description: "The label. Keep it to a few words." },
  {
    name: "shortcut",
    type: "ReactNode",
    default: "\u2014",
    description: "A keyboard shortcut, shown in its own cell.",
  },
  {
    name: "side",
    type: '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
    default: '"top"',
    description: "Where it sits. It flips when there's no room.",
  },
  {
    name: "delay",
    type: "number",
    default: "500",
    description: "Milliseconds of hover before it opens. Focus opens it at once.",
  },
  {
    name: "TooltipPopup",
    type: "{ shortcut?, side?, align?, sideOffset?, alignOffset?, collisionPadding?, anchor? }",
    default: 'side "top" \u00b7 sideOffset 4',
    description:
      "The label as a part, for composing with TooltipRoot and TooltipTrigger. The positioner’s props are lifted onto it.",
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>TooltipPopup</code>: where the tooltip&apos;s portal renders, and props for the portal. It keeps the
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

export default function TooltipPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Tooltip" toc={TOC}>
      <h1>Tooltip</h1>
      <p className="s-doc-lede">
        An ink label that names what a control does, with its shortcut in a cell of its own. It docks to the focus ring,
        not the box, so keyboard and pointer see the same thing. It opens on hover and focus and never holds the only
        copy of something a reader needs.
      </p>

      <ComponentDemo
        label="Tooltip example"
        preview={<TooltipIcons />}
        code={code("tooltip-icons.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Tooltip props" props={PROPS} />
      <p className="s-small">
        An icon button still needs its own <code>aria-label</code>; the tooltip is for sighted readers. Wrap a group in{" "}
        <code>TooltipProvider</code> so moving between buttons skips the delay. <code>Tooltip</code> is built from parts
        named as Base UI names them: <code>TooltipProvider</code>, <code>TooltipRoot</code>, <code>TooltipTrigger</code>{" "}
        and <code>TooltipPopup</code> (Base UI&apos;s Portal, Positioner and Popup in one part). Every part takes{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state.
        They carry <code>data-slot</code> <code>tooltip-trigger</code> and <code>tooltip-popup</code> (with Base
        UI&apos;s <code>data-side</code> and <code>data-instant</code>); inside the popup, <code>tooltip-label</code>{" "}
        and <code>tooltip-shortcut</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/tooltip">Base UI Tooltip</a>.
      </p>
    </DocPage>
  );
}
