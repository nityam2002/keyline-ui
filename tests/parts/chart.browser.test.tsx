// Chart's parts: ChartContainer, ChartFigure and ChartTable are Keyline's (conformance); ChartTooltipContent and
// ChartLegendContent are recharts content, which recharts clones with its own props, so they forward className and
// carry a data-slot but take no render. axe over the chart and the table view, the plot as one tab stop whose arrow
// keys announce each point, and the Chart / Table switch by keyboard.
import {
  ChartContainer,
  ChartFigure,
  ChartLegend,
  ChartLegendContent,
  ChartTable,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/keyline/ui/chart";
import { Bar, BarChart, XAxis } from "recharts";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const config = {
  now: { label: "This week", unit: "PLT" },
  prev: { label: "Last week", unit: "PLT" },
} satisfies ChartConfig;
const DATA = [
  { day: "Mon", now: 120, prev: 98 },
  { day: "Tue", now: 134, prev: 121 },
  { day: "Wed", now: 101, prev: 117 },
];

const plot = (
  <BarChart data={DATA}>
    <XAxis dataKey="day" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="now" fill="var(--color-now)" />
    <Bar dataKey="prev" fill="var(--color-prev)" />
  </BarChart>
);

describeConformance("chart", {
  ChartContainer: {
    element: (
      <ChartContainer config={config} aria-label="Pallets by day">
        {plot}
      </ChartContainer>
    ),
    refInstanceof: HTMLDivElement,
    slot: "chart",
  },
  ChartFigure: {
    element: (
      <ChartFigure title="Pallets by day" data={DATA} config={config} labelKey="day">
        <ChartContainer config={config}>{plot}</ChartContainer>
      </ChartFigure>
    ),
    refInstanceof: HTMLElement,
    slot: "chart-figure",
  },
  ChartTable: {
    element: <ChartTable data={DATA} config={config} labelKey="day" caption="Pallets by day" />,
    refInstanceof: HTMLDivElement,
    slot: "chart-table",
  },
});

function Figure() {
  return (
    <main style={{ width: 480 }}>
      <ChartFigure
        title="Pallets by day"
        description="This week against last"
        data={DATA}
        config={config}
        labelKey="day"
        labelHeader="Day"
      >
        <ChartContainer config={config}>{plot}</ChartContainer>
      </ChartFigure>
      <input aria-label="After" />
    </main>
  );
}

const active = () => document.activeElement as HTMLElement | null;

describe("chart: recharts content parts", () => {
  it("ChartTooltipContent and ChartLegendContent forward className and carry their data-slot", async () => {
    await render(
      <main>
        {/* the content parts read the chart's config from the container's context */}
        <ChartContainer config={config} aria-label="Content parts" data-testid="parts">
          <BarChart data={DATA}>
            <ChartLegend
              content={<ChartLegendContent className="from-legend" />}
              wrapperStyle={{ position: "static" }}
            />
            <Bar dataKey="now" />
          </BarChart>
        </ChartContainer>
      </main>,
    );
    await expect.poll(() => document.querySelector(".from-legend")?.getAttribute("data-slot")).toBe("chart-legend");
    const items = [...document.querySelectorAll('.from-legend [data-slot="chart-legend-item"]')];
    expect(items.map((i) => i.textContent)).toEqual(["This week"]);
  });

  it("the tooltip names the category and each series with its figure and unit", async () => {
    await render(<Figure />);
    await expect.poll(() => document.querySelector('[role="application"]')).toBeTruthy();
    document.querySelector<HTMLElement>('[role="application"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.querySelector('[data-slot="chart-tooltip"]')).toBeTruthy();
    const tip = document.querySelector<HTMLElement>('[data-slot="chart-tooltip"]')!;
    // the accessibility layer's first step lands on the second category
    await expect.poll(() => tip.querySelector('[data-slot="chart-tooltip-label"]')?.textContent).toBe("Tue");
    expect([...tip.querySelectorAll('[data-slot="chart-tooltip-value"]')].map((v) => v.textContent)).toEqual([
      "134 PLT",
      "121 PLT",
    ]);
  });
});

describe("chart: a11y", () => {
  it("has no axe violations, as a chart and as a table", async () => {
    await render(<Figure />);
    await expect.poll(() => document.querySelector('[role="application"]')).toBeTruthy();
    await expectNoAxeViolations();
    document.querySelector<HTMLElement>('[role="radio"][aria-checked="false"]')!.click();
    await expect.poll(() => document.querySelector('[data-slot="chart-table"]')).toBeTruthy();
    await expectNoAxeViolations();
  });

  it("the figure and the plot are named by the title", async () => {
    await render(<Figure />);
    await expect.poll(() => document.querySelector('[role="application"]')).toBeTruthy();
    const title = document.querySelector('[data-slot="chart-figure-title"]')!;
    expect(document.querySelector('[data-slot="chart-figure"]')!.getAttribute("aria-labelledby")).toBe(title.id);
    expect(document.querySelector('[role="application"]')!.getAttribute("aria-labelledby")).toBe(title.id);
  });
});

describe("chart: keyboard", () => {
  it("the plot is one tab stop; arrow keys announce each point's figures", async () => {
    await render(<Figure />);
    await expect.poll(() => document.querySelector('[role="application"]')).toBeTruthy();
    const view = document.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')!;
    view.focus();
    await userEvent.keyboard("{Tab}");
    expect(active()?.getAttribute("role")).toBe("application");
    await userEvent.keyboard("{ArrowRight}");
    const status = document.querySelector('[data-slot="chart"] [role="status"]')!;
    await expect.poll(() => status.textContent).toBe("Tue, This week 134 PLT, Last week 121 PLT");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => status.textContent).toBe("Wed, This week 101 PLT, Last week 117 PLT");
    await userEvent.keyboard("{Tab}");
    expect(active()?.getAttribute("aria-label")).toBe("After");
  });

  it("the Chart / Table switch changes the view by arrow key", async () => {
    await render(<Figure />);
    document.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.querySelector('[data-slot="chart-table"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="chart"]')).toBeNull();
    const cells = [...document.querySelectorAll('[data-slot="chart-table"] tbody tr:first-child > *')];
    expect(cells.map((c) => c.textContent)).toEqual(["Mon", "120", "98"]);
  });
});

describe("chart: data and the table", () => {
  it("ChartTable writes the same rows, the unit in each header", async () => {
    await render(
      <main>
        <ChartTable data={DATA} config={config} labelKey="day" labelHeader="Day" caption="Pallets by day" />
      </main>,
    );
    const heads = [...document.querySelectorAll('[data-slot="chart-table"] thead th')].map((h) => h.textContent);
    expect(heads).toEqual(["Day", "This week PLT", "Last week PLT"]);
    await expectNoAxeViolations();
  });
});
