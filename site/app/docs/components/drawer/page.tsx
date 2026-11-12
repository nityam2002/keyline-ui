import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { DrawerDelivery } from "@site/components/overlay-previews";

const ITEM = "drawer";

export const metadata = componentMetadata(
  "Drawer",
  "A React drawer for touch, on Base UI: a panel that slides from an edge, follows your finger, and leaves on a flick or past halfway. Escape always works.",
  "drawer",
);

const IMPORT = `import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/keyline/ui/drawer"`;

const USAGE = `<Drawer>
  <DrawerTrigger render={<Button />}>Darryl's route</DrawerTrigger>
  <DrawerContent size="min(70vh, 480px)">
    <DrawerHeader>
      <DrawerTitle>Darryl's route today</DrawerTitle>
    </DrawerHeader>
    <DrawerBody>…</DrawerBody>
    <DrawerFooter>
      <DrawerClose render={<Button layout="cell" />}>Close</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
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
        On <code>DrawerContent</code>: height from the bottom, width from a side. Pixels or any CSS length.
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

export default function DrawerPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Drawer" toc={TOC}>
      <h1>Drawer</h1>
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

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Drawer props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/drawer">Base UI Drawer</a>. For a panel on a wide screen
        that doesn&apos;t need the swipe, use Sheet.
      </p>
    </DocPage>
  );
}
