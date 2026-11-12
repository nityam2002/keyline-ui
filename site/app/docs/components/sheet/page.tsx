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

const IMPORT = `import { Sheet, SheetBody, SheetClose, SheetPopup, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/keyline/ui/sheet"`;

const USAGE = `<Sheet>
  <SheetTrigger render={<Button size="compact" />}>Details</SheetTrigger>
  <SheetPopup side="end" size={420}>
    <SheetHeader>
      <SheetTitle>DM-4107</SheetTitle>
      <SheetDescription>Lackawanna County</SheetDescription>
    </SheetHeader>
    <SheetBody>…</SheetBody>
    <SheetFooter>…</SheetFooter>
  </SheetPopup>
</Sheet>`;

const PROPS: Prop[] = [
  {
    name: "side",
    type: '"end" | "start" | "bottom"',
    default: '"end"',
    description: (
      <>
        On <code>SheetPopup</code>. <code>end</code> is the right edge in left-to-right text and mirrors in
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
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>SheetPopup</code>: where the sheet&apos;s portal renders, and props for the portal. It keeps the theme,
        density, motion and direction of the place it is written either way.
      </>
    ),
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
        Parts: <code>Sheet</code> (also <code>SheetRoot</code>) and <code>SheetPopup</code> (Base UI&apos;s Portal,
        Backdrop and Popup in one part, <code>data-slot=&quot;sheet-popup&quot;</code> with <code>data-side</code>). The
        trigger, close, header, body, footer, title and description are Dialog&apos;s own parts under Sheet names, and
        carry Dialog&apos;s <code>data-slot</code>s. Every part takes <code>render</code>, and a <code>className</code>{" "}
        or <code>style</code> that may be a function of its state. Built on{" "}
        <a href="https://base-ui.com/react/components/dialog">Base UI Dialog</a>. For something to swipe away on a
        phone, use Drawer.
      </p>
    </DocPage>
  );
}
