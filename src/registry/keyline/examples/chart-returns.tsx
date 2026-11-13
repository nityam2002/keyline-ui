"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartFigure,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";

const CASES = [
  { client: "Lackawanna Co.", kept: 412, returned: 8 },
  { client: "Blue Cross", kept: 365, returned: 41 },
  { client: "Harper Collins", kept: 298, returned: 12 },
  { client: "Business Park", kept: 241, returned: 4 },
];

// returns are the figure that needs someone, so they take the alert colour
const config = {
  kept: { label: "Kept", unit: "cases" },
  returned: { label: "Returned", unit: "cases", color: "var(--kl-data-alert)" },
} satisfies ChartConfig;

export function ReturnsByClient() {
  return (
    <ChartFigure
      title="Cases delivered this quarter"
      description="Returns in the alert colour; Blue Cross sent back the watermarked batch"
      data={CASES}
      config={config}
      labelKey="client"
      labelHeader="Client"
    >
      {/* data-kl-stack splits the stacked segments with a gap */}
      <ChartContainer config={config} className="aspect-auto h-[220px]" data-kl-stack="">
        <BarChart data={CASES} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickLine={false} />
          <YAxis type="category" dataKey="client" tickLine={false} axisLine={false} width={104} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="kept" stackId="cases" fill="var(--color-kept)" />
          <Bar dataKey="returned" stackId="cases" fill="var(--color-returned)" />
        </BarChart>
      </ChartContainer>
    </ChartFigure>
  );
}
