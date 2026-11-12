import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { ScrollAreaLog } from "@site/components/layout-previews";

const ITEM = "scroll-area";

export const metadata = componentMetadata(
  "Scroll area",
  "A React scroll area that keeps native scrolling (wheel, touch, keyboard, find-in-page) and draws its scrollbar as a cell on the frame's edge. On Base UI.",
  "scroll-area",
);

const IMPORT = `import { ScrollArea } from "@/components/keyline/ui/scroll-area"`;

const USAGE = `<ScrollArea label="Today's activity" className="h-[260px]">
  …
</ScrollArea>`;

const PROPS: Prop[] = [
  {
    name: "label",
    type: "string",
    default: "\u2014",
    description: "Names the region. It takes focus when it overflows, so keyboard users can scroll it.",
  },
  {
    name: "scrollbars",
    type: '"vertical" | "horizontal" | "both"',
    default: '"vertical"',
    description: "Which bars to draw. An axis without one still scrolls.",
  },
  {
    name: "scrollbarVisibility",
    type: '"system" | "scroll" | "always"',
    default: '"system"',
    description: "When the thumb shows.",
  },
  {
    name: "track",
    type: '"cell" | "rail"',
    default: '"cell"',
    description: (
      <>
        <code>cell</code> inside a frame; <code>rail</code>, a 1px line, on the page background.
      </>
    ),
  },
  {
    name: "viewportClassName \u00b7 contentClassName",
    type: "string",
    default: "\u2014",
    description: "For the scrolling viewport and the content inside it.",
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

export default function ScrollAreaPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Scroll area" toc={TOC}>
      <h1>Scroll area</h1>
      <p className="s-doc-lede">
        Native scrolling, so wheel, touch, keyboard and find-in-page all work, with a bar drawn as a cell on the
        frame&apos;s edge. Where the system&apos;s scrollbars overlay content, the thumb shows while you scroll and then
        fades; where they take space, it always shows.
      </p>

      <ComponentDemo
        label="Scroll area example"
        preview={<ScrollAreaLog />}
        code={code("scroll-area-log.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Scroll area props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/scroll-area">Base UI Scroll Area</a>. This site&apos;s
        sidebar and code blocks scroll in it.
      </p>
    </DocPage>
  );
}
