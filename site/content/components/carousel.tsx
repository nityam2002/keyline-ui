import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { CarouselPosters } from "@site/components/layout-previews";

const IMPORT = `import { Carousel, CarouselBar, CarouselContent, CarouselItem, CarouselNext, CarouselPosition, CarouselPrevious } from "@/components/keyline/ui/carousel"`;

const USAGE = `<Carousel aria-label="Employee of the month">
  <CarouselContent>
    <CarouselItem basis="min(100%, 280px)">…</CarouselItem>
  </CarouselContent>
  <CarouselBar>
    <CarouselPrevious />
    <CarouselPosition />
    <CarouselNext />
  </CarouselBar>
</Carousel>`;

const PROPS: Prop[] = [
  {
    name: "aria-label",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>Carousel</code>: required. It names the region.
      </>
    ),
  },
  {
    name: "opts \u00b7 plugins",
    type: "Embla options \u00b7 plugins",
    default: "\u2014",
    description: "Passed to Embla, for looping, alignment or autoplay.",
  },
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description: (
      <>
        On <code>Carousel</code>.
      </>
    ),
  },
  {
    name: "setApi",
    type: "(api) => void",
    default: "\u2014",
    description: "Embla's API, to drive it from outside.",
  },
  {
    name: "basis",
    type: "string",
    default: "100%",
    description: (
      <>
        On <code>CarouselItem</code>: how much of the width a slide takes. <code>&quot;50%&quot;</code> shows two.
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
  {
    label: "Reference",
    items: [
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React carousel on Embla: slides on shared seams in one frame, with arrows, position cells, drag and swipe, and slides announced as “3 of 5”.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        Slides side by side on 1px seams in one frame, with a control row at its foot. Drag or swipe, use the arrows, or
        jump with the position cells. Each slide is named &ldquo;3 of 5&rdquo;. At either end the arrows stay focusable
        and say why they do nothing.
      </p>

      <ComponentDemo
        label="Carousel example"
        preview={<CarouselPosters />}
        code={code("carousel-posters.tsx", "example code")}
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
        Built on <a href="https://www.embla-carousel.com/">Embla Carousel</a>. It follows the page&apos;s direction: in
        right-to-left text the first slide sits on the right.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>Carousel</code> is the region; <code>CarouselContent</code> is the viewport that clips the slides, and its{" "}
        <code>trackClassName</code> styles the track that moves inside it. <code>CarouselItem</code> is a slide,{" "}
        <code>CarouselBar</code> the control row, and <code>CarouselPosition</code> the count with its ticks. These are
        parts Keyline renders: each takes <code>render</code>, and a <code>className</code> or <code>style</code> that
        may be a function. <code>CarouselPrevious</code> and <code>CarouselNext</code> are Buttons and take
        Button&apos;s props.
      </p>
      <p className="s-small">
        Every element carries a <code>data-slot</code> for styling from outside: <code>carousel</code>,{" "}
        <code>carousel-content</code>, <code>carousel-track</code>, <code>carousel-item</code>,{" "}
        <code>carousel-bar</code>, <code>carousel-position</code> (with <code>carousel-count</code>,{" "}
        <code>carousel-ticks</code> and <code>carousel-tick</code>) and <code>carousel-chevron</code>; Previous and Next
        are <code>button</code>. The root mirrors <code>orientation</code> as <code>data-orientation</code>; a slide in
        view has <code>data-in-view</code>, and the current tick <code>aria-current</code>.
      </p>
    </>
  ),
};
