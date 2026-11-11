import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { ChartSales, ChartTarget, ChartReturns } from "@site/components/data-previews"

const ITEM = "chart"

export const metadata = componentMetadata("Chart", "React charts on Recharts in Keyline's construction: hairline grid, square marks, series colours by role, and a Table view of the same rows so no reading depends on colour.", "chart")

const IMPORT = `import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartFigure, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/keyline/ui/chart"`

const USAGE = `const config = {
  q4: { label: "Q4", unit: "reams" },
  q3: { label: "Q3", unit: "reams" },
} satisfies ChartConfig

<ChartFigure title="Paper sold by rep" data={sales} config={config} labelKey="rep" labelHeader="Rep">
  <ChartContainer config={config}>
    <BarChart data={sales}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="rep" tickLine={false} />
      <YAxis tickLine={false} axisLine={false} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="q4" fill="var(--color-q4)" />
      <Bar dataKey="q3" fill="var(--color-q3)" />
    </BarChart>
  </ChartContainer>
</ChartFigure>`

const PROPS: Prop[] = [
  { name: "config", type: "ChartConfig", default: "\u2014", description: <>One entry per series: <code>label</code>, <code>unit</code> and <code>color</code>. Colours default by order to <code>--kl-data-1</code>, <code>-2</code>, <code>-3</code>; marks use <code>var(--color-&lt;key&gt;)</code>.</> },
  { name: "title", type: "ReactNode", default: "\u2014", description: <>On <code>ChartFigure</code>: names the chart and its plot.</> },
  { name: "description", type: "ReactNode", default: "\u2014", description: <>On <code>ChartFigure</code>: a line under the title.</> },
  { name: "data \u00b7 labelKey \u00b7 labelHeader", type: "rows \u00b7 string \u00b7 ReactNode", default: "\u2014", description: <>On <code>ChartFigure</code>: the rows behind the chart, which field names each category, and that column&apos;s header in the Table view.</> },
  { name: "defaultView", type: "\"chart\" | \"table\"", default: "\"chart\"", description: <>On <code>ChartFigure</code>: the starting view.</> },
  { name: "format", type: "(v: number) => string", default: "grouped, 2 decimals", description: "Formats figures in the tooltip and the table." },
  { name: "aria-label", type: "string", default: "\u2014", description: <>On <code>ChartContainer</code> used alone, without a figure to name it.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "line-and-target", label: "A line against a target" }, { id: "alert-colour", label: "The alert colour" }, { id: "props", label: "Props" }] },
]

export default function ChartPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Chart" toc={TOC}>
      <h1>Chart</h1>
      <p className="s-doc-lede">
        Charts are Recharts; Keyline adds the construction: a hairline grid, code-voice ticks, square marks and an inverse tooltip. Series take colours by role, focal first, then comparison. ChartFigure adds a Table view of the same rows, so no reading depends on colour or on seeing the plot.
      </p>

      <ComponentDemo label="Chart example" preview={<ChartSales />} code={code("chart-sales.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="line-and-target">A line against a target</h3>
      <p>
        A <code>ReferenceLine</code> marks the target. Tab to the plot and use the arrow keys to step through the weeks; each one is read out.
      </p>
      <ComponentDemo label="A line against a target example" preview={<ChartTarget />} code={code("chart-target.tsx", "a line against a target example code")} />

      <h3 id="alert-colour">The alert colour</h3>
      <p>
        Give the series that needs someone <code>color: &quot;var(--kl-data-alert)&quot;</code> and leave the rest to their roles. Stacked bars take <code>data-kl-stack</code> on the container, which splits the segments with a gap instead of a drawn border.
      </p>
      <ComponentDemo label="The alert colour example" preview={<ChartReturns />} code={code("chart-returns.tsx", "the alert colour example code")} />


      <h2 id="props">Props</h2>
      <PropsReference label="Chart props" props={PROPS} />
      <p className="s-small">
        Size the plot with CSS: it is 16:9 by default, or set a height and <code>aspect-auto</code>. Under reduced motion, series don&apos;t animate. <code>ChartTable</code> and <code>ChartLegendContent</code> are exported too. Install <a href="https://recharts.org">Recharts</a> 3 with it; the registry item does.
      </p>
    </DocPage>
  )
}
