import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { DrawerDelivery } from "@site/components/overlay-previews";

const IMPORT = `import { Drawer, DrawerBody, DrawerClose, DrawerPopup, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/keyline/ui/drawer"`;

const USAGE = `<Drawer>
  <DrawerTrigger render={<Button />}>Darryl's route</DrawerTrigger>
  <DrawerPopup size="min(70vh, 480px)">
    <DrawerHeader>
      <DrawerTitle>Darryl's route today</DrawerTitle>
    </DrawerHeader>
    <DrawerBody>…</DrawerBody>
    <DrawerFooter>
      <DrawerClose render={<Button layout="cell" />}>Close</DrawerClose>
    </DrawerFooter>
  </DrawerPopup>
</Drawer>`;

const PROPS: Prop[] = [
  {
    name: "side",
    type: '"bottom" | "end" | "start"',
    default: '"bottom"',
    description: (
      <>
        On <code>Drawer</code>: the edge it comes from. <code>end</code> mirrors in right-to-left text.
      </>
    ),
  },
  {
    name: "size",
    type: "number | string",
    default: "\u2014",
    description: (
      <>
        On <code>DrawerPopup</code>: height from the bottom, width from a side. Pixels or any CSS length.
      </>
    ),
  },
  {
    name: "hideGrip",
    type: "boolean",
    default: "false",
    description: "Hides the grip cell. The swipe still works anywhere on the drawer.",
  },
  {
    name: "open \u00b7 onOpenChange",
    type: "boolean",
    default: "\u2014",
    description: (
      <>
        On <code>Drawer</code>: control it.
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>DrawerPopup</code>: where the drawer&apos;s portal renders, and props for the portal. It keeps the
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

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React drawer for touch, on Base UI: a panel that slides from an edge, follows your finger, and leaves on a flick or past halfway. Escape always works.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A panel that slides in from an edge, made for touch. Drag it and it follows your finger; let go past halfway, or
        flick, and it leaves. A swipe that starts in a scrolled body scrolls first. Escape and Close always work, and
        the grip is only a hint.
      </p>

      <ComponentDemo
        label="Drawer example"
        preview={<DrawerDelivery />}
        code={code("drawer-delivery.tsx", "example code")}
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
        Parts, named as Base UI names them: <code>Drawer</code> (also <code>DrawerRoot</code>; a logical{" "}
        <code>side</code> in place of Base UI&apos;s <code>swipeDirection</code>), <code>DrawerTrigger</code>,{" "}
        <code>DrawerPopup</code> (Base UI&apos;s Portal, Backdrop, Viewport and Popup in one part),{" "}
        <code>DrawerBody</code> (Base UI&apos;s Content), <code>DrawerTitle</code>, <code>DrawerDescription</code> and{" "}
        <code>DrawerClose</code>; <code>DrawerHeader</code> and <code>DrawerFooter</code> are Dialog&apos;s. Every part
        takes <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its
        state. They carry <code>data-slot</code> <code>drawer-trigger</code>, <code>drawer-backdrop</code>,{" "}
        <code>drawer-viewport</code>, <code>drawer-popup</code> (with <code>data-side</code> and Base UI&apos;s{" "}
        <code>data-swipe-direction</code> and <code>data-swiping</code>), <code>drawer-grip</code>,{" "}
        <code>drawer-body</code>, <code>drawer-title</code>, <code>drawer-description</code> and{" "}
        <code>drawer-close</code>. Built on <a href="https://base-ui.com/react/components/drawer">Base UI Drawer</a>.
        For a panel on a wide screen that doesn&apos;t need the swipe, use Sheet.
      </p>
    </>
  ),
};
