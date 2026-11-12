import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { HoverCardClient } from "@site/components/overlay-previews";

const ITEM = "hover-card";

export const metadata = componentMetadata(
  "Hover card",
  "A React hover card on Base UI that previews a link's target on hover or keyboard focus, and stays while the pointer crosses to it. The link still navigates.",
  "hover-card",
);

const IMPORT = `import { HoverCard, HoverCardBody, HoverCardPopup, HoverCardFacts, HoverCardHeader, HoverCardTrigger } from "@/components/keyline/ui/hover-card"`;

const USAGE = `<HoverCard>
  <HoverCardTrigger href="/clients/c-0112">Lackawanna County</HoverCardTrigger>
  <HoverCardPopup>
    <HoverCardHeader media={<Avatar layout="cell" decorative name="…" />} title="Lackawanna County" code="C-0112" />
    <HoverCardFacts facts={[["Rep", "Dwight Schrute"], ["Since", "2003"]]} />
  </HoverCardPopup>
</HoverCard>`;

const PROPS: Prop[] = [
  {
    name: "href",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>HoverCardTrigger</code>: where the link goes. The card never replaces it.
      </>
    ),
  },
  {
    name: "delay \u00b7 closeDelay",
    type: "number",
    default: "600 \u00b7 300",
    description: (
      <>
        On <code>HoverCardTrigger</code>: milliseconds before it opens and closes.
      </>
    ),
  },
  {
    name: "side \u00b7 align",
    type: "Base UI side \u00b7 align",
    default: '"bottom" \u00b7 "start"',
    description: (
      <>
        On <code>HoverCardPopup</code>.
      </>
    ),
  },
  {
    name: "HoverCardHeader",
    type: "{ media?, title, description?, code? }",
    default: "\u2014",
    description: "A row of cells: a square media cell, the title, and a code cell such as an ID.",
  },
  {
    name: "HoverCardFacts",
    type: "{ facts: [term, value][] }",
    default: "\u2014",
    description: "Facts two to a row on shared seams; an odd last fact spans the row.",
  },
  {
    name: "HoverCardBody",
    type: "div",
    default: "\u2014",
    description: "Free content in its own row, such as a Status.",
  },
  {
    name: "sideOffset \u00b7 alignOffset \u00b7 collisionPadding",
    type: "number",
    default: "8 \u00b7 0 \u00b7 12",
    description: (
      <>
        On <code>HoverCardPopup</code>: the positioner&apos;s props, lifted onto the popup.
      </>
    ),
  },
  {
    name: "anchor",
    type: "Element | ref",
    default: "the trigger",
    description: "On HoverCardPopup: place it by another element.",
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>HoverCardPopup</code>: where the card&apos;s portal renders, and props for the portal. It keeps the
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

export default function HoverCardPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Hover card" toc={TOC}>
      <h1>Hover card</h1>
      <p className="s-doc-lede">
        A preview of what a link points to, so a reader can check without leaving the sentence. It opens after a pause
        on hover or on keyboard focus, and stays while the pointer crosses to it. The link still goes somewhere: the
        card only previews it.
      </p>

      <ComponentDemo
        label="Hover card example"
        preview={<HoverCardClient />}
        code={code("hover-card-client.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Hover card props" props={PROPS} />
      <p className="s-small">
        Touch screens have no hover, so the card never holds anything the linked page doesn&apos;t. Parts, named as Base
        UI names them: <code>HoverCard</code> (also <code>HoverCardRoot</code>), <code>HoverCardTrigger</code>,{" "}
        <code>HoverCardPopup</code> (Base UI&apos;s Portal, Positioner and Popup in one part), with Keyline&apos;s{" "}
        <code>HoverCardHeader</code>, <code>HoverCardFacts</code> and <code>HoverCardBody</code>;{" "}
        <code>createHoverCardHandle</code> is exported too. Every part takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state. They carry{" "}
        <code>data-slot</code> <code>hover-card-trigger</code> (with Base UI&apos;s <code>data-popup-open</code>),{" "}
        <code>hover-card-popup</code> (with <code>data-side</code>), <code>hover-card-header</code>,{" "}
        <code>hover-card-media</code>, <code>hover-card-title</code>, <code>hover-card-description</code>,{" "}
        <code>hover-card-code</code>, <code>hover-card-facts</code>, <code>hover-card-fact</code> and{" "}
        <code>hover-card-body</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/preview-card">Base UI Preview Card</a>.
      </p>
    </DocPage>
  );
}
