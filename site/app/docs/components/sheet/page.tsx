import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { SheetOrder } from "@site/components/overlay-previews";

const ITEM = "sheet";

export const metadata = componentMetadata(
  "Sheet",
  "A React side sheet: a dialog docked to an edge, for the detail of one item beside the list it came from. Full width on a phone. On Base UI.",
  "sheet",
);

const IMPORT = `import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/keyline/ui/sheet"`;

const USAGE = `<Sheet>
  <SheetTrigger render={<Button size="compact" />}>Details</SheetTrigger>
  <SheetContent side="end" size={420}>
    <SheetHeader>
      <SheetTitle>DM-4107</SheetTitle>
      <SheetDescription>Lackawanna County</SheetDescription>
    </SheetHeader>
    <SheetBody>…</SheetBody>
    <SheetFooter>…</SheetFooter>
  </SheetContent>
</Sheet>`;

const PROPS: Prop[] = [
  {
    name: "side",
    type: '"end" | "start" | "bottom"',
    default: '"end"',
    description: (
      <>
        On <code>SheetContent</code>. <code>end</code> is the right edge in left-to-right text and mirrors in
        right-to-left.
      </>
    ),
  },
  {
    name: "size",
    type: "number | string",
    default: "\u2014",
    description: "Width from a side, height from the bottom.",
  },
  {
    name: "container",
    type: "HTMLElement | ref",
    default: "document.body",
    description: "Where the sheet is portalled.",
  },
  {
    name: "open \u00b7 onOpenChange",
    type: "boolean",
    default: "\u2014",
    description: (
      <>
        On <code>Sheet</code>: control it.
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

export default function SheetPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Sheet" toc={TOC}>
      <h1>Sheet</h1>
      <p className="s-doc-lede">
        A dialog docked to an edge: the detail of one thing, opened from the list it sits in. It has the dialog&apos;s
        parts, a header, a scrolling body and a footer of cells, at full height. On a phone it takes the whole width.
      </p>

      <ComponentDemo label="Sheet example" preview={<SheetOrder />} code={code("sheet-order.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Sheet props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/dialog">Base UI Dialog</a>. For something to swipe away
        on a phone, use Drawer.
      </p>
    </DocPage>
  );
}
