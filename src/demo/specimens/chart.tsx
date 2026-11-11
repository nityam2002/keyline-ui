import * as ui from "../demo-ui";
import {
Bar,
BarChart,
CartesianGrid,
Line,
LineChart,
ReferenceLine,
XAxis,
YAxis,
} from "recharts";
import {
ChartContainer,
ChartFigure,
ChartLegend,
ChartLegendContent,
ChartTooltip,
ChartTooltipContent,
type ChartConfig,
} from "@/registry/keyline/ui/chart";
import { Panel,PanelBody,PanelHeader } from "@/registry/keyline/ui/panel";

/* ------------------------------------------------------------------ *
 * 1. Chart (recharts)
 * ------------------------------------------------------------------ */
const THROUGHPUT = [
  { day: "Mon", now: 182, prev: 160 },
  { day: "Tue", now: 205, prev: 171 },
  { day: "Wed", now: 197, prev: 188 },
  { day: "Thu", now: 231, prev: 192 },
  { day: "Fri", now: 248, prev: 214 },
  { day: "Sat", now: 96, prev: 102 },
];
const throughputConfig = {
  now: { label: "This week", unit: "pallets" },
  prev: { label: "Last week", unit: "pallets" },
} satisfies ChartConfig;
const DWELL = [
  { week: "W36", dwell: 41 },
  { week: "W37", dwell: 38 },
  { week: "W38", dwell: 44 },
  { week: "W39", dwell: 52 },
  { week: "W40", dwell: 47 },
  { week: "W41", dwell: 39 },
  { week: "W42", dwell: 36 },
  { week: "W43", dwell: 33 },
  { week: "W44", dwell: 35 },
  { week: "W45", dwell: 31 },
];
const dwellConfig = {
  dwell: { label: "Median dwell", unit: "min" },
} satisfies ChartConfig;
const STATUS = [
  { lane: "North", onTime: 412, late: 31 },
  { lane: "East", onTime: 365, late: 58 },
  { lane: "South", onTime: 298, late: 12 },
  { lane: "West", onTime: 341, late: 24 },
];
const statusConfig = {
  onTime: { label: "On time", color: "var(--kl-data-1)" },
  late: { label: "Late", color: "var(--kl-data-alert)" },
} satisfies ChartConfig;
function Throughput({ testid }: { testid?: string }) {
  return (
    <ChartFigure
      data-testid={testid}
      title="Pallets unloaded per day"
      description="Dock 4, this week against last week"
      data={THROUGHPUT}
      config={throughputConfig}
      labelKey="day"
      labelHeader="Day"
    >
      <ChartContainer config={throughputConfig} className={ui.chart}>
        <BarChart
          data={THROUGHPUT}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barGap={2}
          barCategoryGap="24%"
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" tickLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="now" fill="var(--color-now)" />
          <Bar dataKey="prev" fill="var(--color-prev)" />
        </BarChart>
      </ChartContainer>
    </ChartFigure>
  );
}
export function ChartSpecimen() {
  return (
    <div className={ui.stack} data-testid="specimen-chart">
      <Panel>
        <PanelHeader title="Dock 4" code="WEEK 45" />
        <PanelBody>
          <Throughput testid="ch-bars" />
        </PanelBody>
      </Panel>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4 min-w-0">
        <Panel>
          <PanelBody>
            <ChartFigure
              data-testid="ch-line"
              title="Median dwell time"
              description="Minutes from gate-in to unloaded; target 40"
              data={DWELL}
              config={dwellConfig}
              labelKey="week"
              labelHeader="Week"
            >
              <ChartContainer config={dwellConfig} className={ui.chart}>
                <LineChart
                  data={DWELL}
                  margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="week" tickLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    domain={[0, 60]}
                  />
                  <ReferenceLine
                    y={40}
                    label={{ value: "Target 40", position: "insideTopRight" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="dwell"
                    type="linear"
                    stroke="var(--color-dwell)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-dwell)" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </ChartFigure>
          </PanelBody>
        </Panel>
        <Panel>
          <PanelBody>
            <ChartFigure
              data-testid="ch-stack"
              title="Deliveries by lane"
              description="Late in the attention colour"
              data={STATUS}
              config={statusConfig}
              labelKey="lane"
              labelHeader="Lane"
            >
              <ChartContainer
                config={statusConfig}
                className={ui.chart}
                data-kl-stack=""
              >
                <BarChart
                  data={STATUS}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="lane"
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="onTime"
                    stackId="a"
                    fill="var(--color-onTime)"
                  />
                  <Bar dataKey="late" stackId="a" fill="var(--color-late)" />
                </BarChart>
              </ChartContainer>
            </ChartFigure>
          </PanelBody>
        </Panel>
      </div>
      <div className={ui.group} dir="rtl" data-testid="ch-rtl">
        <h3 className={ui.cap}>
          RTL: the days run from the inline start, the value axis sits at the
          start edge
        </h3>
        <ChartContainer
          config={throughputConfig}
          className={ui.chart}
          aria-label="المنصات يوميًا"
        >
          <BarChart
            data={THROUGHPUT}
            margin={{ top: 8, right: 0, bottom: 0, left: 8 }}
            barGap={2}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="now" fill="var(--color-now)" />
            <Bar dataKey="prev" fill="var(--color-prev)" />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
