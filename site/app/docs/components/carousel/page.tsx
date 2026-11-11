import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { CarouselPosters } from "@site/components/layout-previews"

const ITEM = "carousel"

export const metadata = componentMetadata("Carousel", "A React carousel on Embla: slides on shared seams in one frame, with arrows, position cells, drag and swipe, and slides announced as “3 of 5”.", "carousel")

const IMPORT = `import { Carousel, CarouselBar, CarouselContent, CarouselItem, CarouselNext, CarouselPosition, CarouselPrevious } from "@/components/keyline/ui/carousel"`

const USAGE = `<Carousel aria-label="Employee of the month">
  <CarouselContent>
    <CarouselItem basis="min(100%, 280px)">…</CarouselItem>
  </CarouselContent>
  <CarouselBar>
    <CarouselPrevious />
    <CarouselPosition />
    <CarouselNext />
  </CarouselBar>
</Carousel>`

const PROPS: Prop[] = [
  { name: "aria-label", type: "string", default: "\u2014", description: <>On <code>Carousel</code>: required. It names the region.</> },
  { name: "opts \u00b7 plugins", type: "Embla options \u00b7 plugins", default: "\u2014", description: "Passed to Embla, for looping, alignment or autoplay." },
  { name: "orientation", type: "\"horizontal\" | \"vertical\"", default: "\"horizontal\"", description: <>On <code>Carousel</code>.</> },
  { name: "setApi", type: "(api) => void", default: "\u2014", description: "Embla&apos;s API, to drive it from outside." },
  { name: "basis", type: "string", default: "100%", description: <>On <code>CarouselItem</code>: how much of the width a slide takes. <code>&quot;50%&quot;</code> shows two.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function CarouselPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Carousel" toc={TOC}>
      <h1>Carousel</h1>
      <p className="s-doc-lede">
        Slides side by side on 1px seams in one frame, with a control row at its foot. Drag or swipe, use the arrows, or jump with the position cells. Each slide is named &ldquo;3 of 5&rdquo;. At either end the arrows stay focusable and say why they do nothing.
      </p>

      <ComponentDemo label="Carousel example" preview={<CarouselPosters />} code={code("carousel-posters.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Carousel props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://www.embla-carousel.com/">Embla Carousel</a>. It follows the page&apos;s direction: in right-to-left text the first slide sits on the right.
      </p>
    </DocPage>
  )
}
