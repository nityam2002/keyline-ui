"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartFigure,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/keyline/ui/chart";

const WEEKS = [
  { week: "W40", reams: 1_620 },
  { week: "W41", reams: 1_680 },
  { week: "W42", reams: 1_540 },
  { week: "W43", reams: 1_880 },
  { week: "W44", reams: 1_760 },
  { week: "W45", reams: 1_810 },
];

const config = { reams: { label: "Reams sold", unit: "reams" } } satisfies ChartConfig;

export function WeeklyTarget() {
  return (
    <ChartFigure
      title="Reams sold each week"
      description="Corporate's target is 1,700"
      data={WEEKS}
      config={config}
      labelKey="week"
      labelHeader="Week"
    >
      <ChartContainer config={config} className="aspect-auto h-[240px]">
        <LineChart data={WEEKS} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="week" tickLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={44} domain={[1_200, 2_000]} />
          <ReferenceLine y={1_700} label={{ value: "Target 1,700", position: "insideBottomLeft" }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="reams"
            type="linear"
            stroke="var(--color-reams)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--color-reams)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartFigure>
  );
}
