"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartFigure, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/keyline/ui/chart"

const SALES = [
  { rep: "Dwight", q4: 5_120, q3: 4_760 },
  { rep: "Jim", q4: 4_380, q3: 4_510 },
  { rep: "Phyllis", q4: 3_640, q3: 3_200 },
  { rep: "Stanley", q4: 3_410, q3: 3_390 },
]

// the first series takes the focal colour, the second the comparison colour
const config = {
  q4: { label: "Q4", unit: "reams" },
  q3: { label: "Q3", unit: "reams" },
} satisfies ChartConfig

export function SalesByRep() {
  return (
    <ChartFigure title="Paper sold by rep" description="Scranton, Q4 against Q3" data={SALES} config={config} labelKey="rep" labelHeader="Rep">
      <ChartContainer config={config} className="aspect-auto h-[260px]">
        <BarChart data={SALES} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barGap={2} barCategoryGap="24%">
          <CartesianGrid vertical={false} />
          <XAxis dataKey="rep" tickLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="q4" fill="var(--color-q4)" />
          <Bar dataKey="q3" fill="var(--color-q3)" />
        </BarChart>
      </ChartContainer>
    </ChartFigure>
  )
}
