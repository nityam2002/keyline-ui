"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import * as Recharts from "recharts";

import { cn } from "@/lib/utils";
import { Segmented, SegmentedItem } from "./segmented";
import { Table, TableBody, TableCell, TableHead, TableHeader } from "./table";
import { domDir } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* Charts are recharts (as in shadcn and neobrutalism.dev): scales, shapes, keyboard (the accessibility
   layer: Tab to the plot, arrows step through the points) and tooltips are the library's. Keyline adds:
   - series colours by role from the data tokens (`--kl-data-1` focal, `-2` comparison, `-3` the rest,
     `-mark`, `-alert`), written as `--color-<key>` so marks use `var(--color-<key>)` as in shadcn;
   - the construction: recessive solid hairline grid, Code-voice ticks, square marks (no radius: a chart
     never takes the cut), an inverse tooltip with tabular figures, square legend keys;
   - a Table view of the same rows (ChartFigure), so no reading depends on colour or on seeing the plot;
   - RTL (the category axis runs from the inline start, the value axis sits at the start edge) and reduced
     motion (prefers-reduced-motion or data-kl-motion="reduce" turns every series animation off). */

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    /** Any CSS colour; Keyline's roles are "var(--kl-data-1)" … Defaults by order: data-1, data-2, data-3. */
    color?: string;
    /** Unit printed after values in the tooltip and table, in the Code voice. */
    unit?: string;
  }
>;

const ROLE = ["var(--kl-data-1)", "var(--kl-data-2)", "var(--kl-data-3)"];

/** A data value as text: anything but a number is shown, and announced, by its string form. */
function shown(v: unknown, empty: string): string {
  // oxlint-disable-next-line typescript/no-base-to-string -- see above; a data value has no better text
  return String(v ?? empty);
}

/** The text a screen reader hears for a label: a string or number as is; an element has no text to read. */
function spoken(n: React.ReactNode): string {
  return typeof n === "string" || typeof n === "number" ? String(n) : "";
}

const ChartContext = React.createContext<{
  config: ChartConfig;
  format: (v: number) => string;
  announce: (text: string) => void;
} | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within a <ChartContainer />");
  return ctx;
}

const SERIES = new Set<unknown>([
  Recharts.Bar,
  Recharts.Line,
  Recharts.Area,
  Recharts.Pie,
  Recharts.Scatter,
  Recharts.Radar,
  Recharts.RadialBar,
]);

/** Walks the composed chart and sets what the reader's settings ask for, unless the author set it. */
function adapt(node: React.ReactNode, o: { still: boolean; rtl: boolean }): React.ReactNode {
  return React.Children.map(node, (el) => {
    if (!React.isValidElement(el)) return el;
    const p = el.props as Record<string, unknown> & { children?: React.ReactNode };
    const extra: Record<string, unknown> = {};
    if (o.still && SERIES.has(el.type) && p["isAnimationActive"] === undefined) extra["isAnimationActive"] = false;
    // an Operate chart updates, it does not perform: data changes and the first draw take the unfold time, not
    // recharts' 1.5s (switching Table → Chart replayed a 1.5s line draw every time)
    else if (SERIES.has(el.type) && p["animationDuration"] === undefined) extra["animationDuration"] = 220;
    if (o.rtl && el.type === Recharts.XAxis && p["reversed"] === undefined) extra["reversed"] = true;
    if (o.rtl && el.type === Recharts.YAxis && p["orientation"] === undefined) extra["orientation"] = "right";
    const kids = p.children !== undefined && typeof p.children !== "function" ? adapt(p.children, o) : undefined;
    return Object.keys(extra).length || kids !== undefined
      ? React.cloneElement(el, extra, ...(kids !== undefined ? [kids] : []))
      : el;
  });
}

/* ------------------------------------------------------------------ *
 * CLASSES
 * recharts draws the plot's SVG; Keyline sets the chrome around the marks through the library's own class names,
 * from the container. kl-type keeps each root the outermost Keyline element (it carries Keyline's type and ink).
 * ------------------------------------------------------------------ */

const plot = cn(
  "kl-type relative aspect-video w-full min-w-0 text-[11px]",
  "[&_.recharts-surface]:[outline:0] [&_.recharts-wrapper]:[outline:0]",
  // recharts lays out in physical coordinates and mirrors through the axes (ChartContainer reverses them in RTL); an
  // inherited rtl direction would also flip every SVG text-anchor, pushing labels into the marks
  "[&_.recharts-surface]:[direction:ltr]",
  // the accessibility layer makes the plot one tab stop; its ring is the system's focus ring
  "[&_.recharts-wrapper:has(.recharts-surface:focus-visible)]:[outline:var(--kl-ring)_solid_var(--kl-focus)]",
  "[&_.recharts-wrapper:has(.recharts-surface:focus-visible)]:outline-offset-(--kl-ring-out)",
  "[&_.recharts-wrapper:focus-visible]:[outline:var(--kl-ring)_solid_var(--kl-focus)]",
  "[&_.recharts-wrapper:focus-visible]:outline-offset-(--kl-ring-out)",
  // ticks are the Code voice in supporting ink; never the series colour
  "[&_:is(.recharts-cartesian-axis-tick-value,.recharts-polar-angle-axis-tick-value,.recharts-label)]:fill-kl-ink-3",
  "[&_:is(.recharts-cartesian-axis-tick-value,.recharts-polar-angle-axis-tick-value,.recharts-label)]:font-(family-name:--kl-font-mono)",
  "[&_:is(.recharts-cartesian-axis-tick-value,.recharts-polar-angle-axis-tick-value,.recharts-label)]:text-[11px]",
  "[&_:is(.recharts-cartesian-axis-tick-value,.recharts-polar-angle-axis-tick-value,.recharts-label)]:font-medium",
  "[&_:is(.recharts-cartesian-axis-tick-value,.recharts-polar-angle-axis-tick-value,.recharts-label)]:tabular-nums",
  // recessive structure: solid hairlines, one shade off the surface; the baseline is the one ink rule
  "[&_:is(.recharts-cartesian-grid_line,.recharts-polar-grid_:is(line,polygon,circle))]:stroke-kl-line-soft",
  "[&_:is(.recharts-cartesian-grid_line,.recharts-polar-grid_:is(line,polygon,circle))]:[stroke-dasharray:none]",
  "[&_.recharts-cartesian-axis-line]:stroke-kl-line [&_.recharts-cartesian-axis-tick-line]:stroke-kl-line-soft",
  "[&_.recharts-reference-line_line]:stroke-kl-ink-2",
  // hover: the category band is a tint (bars); the crosshair a hairline in supporting ink (lines, areas)
  "[&_.recharts-tooltip-cursor:is(.recharts-rectangle,path[fill]:not([fill=none]))]:fill-kl-tint",
  "[&_.recharts-tooltip-cursor:is(.recharts-curve,line)]:stroke-kl-ink-3",
  "[&_.recharts-tooltip-cursor:is(.recharts-curve,line)]:stroke-1",
  // markers sit on a 2px surface ring, so they read over a crossing line
  "[&_:is(.recharts-active-dot_circle,.recharts-dot)]:stroke-kl-cell [&_:is(.recharts-active-dot_circle,.recharts-dot)]:stroke-2",
  // adjacent fills (slices; stacked segments when the container has data-kl-stack) are split by a 2px surface gap
  "[&_.recharts-sector]:stroke-kl-cell [&_.recharts-sector]:stroke-2 [&_.recharts-sector:focus-visible]:[outline:0]",
  "data-kl-stack:[&_.recharts-bar-rectangle_path]:stroke-kl-cell data-kl-stack:[&_.recharts-bar-rectangle_path]:stroke-2",
  "[&_.recharts-default-legend]:hidden [&_.recharts-tooltip-wrapper]:z-2",
);

/* legend and keys: squares (a chart never takes the cut, and keys match the square marks) */
const key_ = cn(
  "inline-block size-2.5 flex-none",
  "forced-colors:outline-1 forced-colors:outline-[CanvasText] forced-colors:[forced-color-adjust:none] forced-colors:outline-solid",
);

/* tooltip: the inverse surface (as Tooltip), figures tabular and end-aligned */
const tip = cn(
  "grid max-w-[260px] min-w-[140px] grid-cols-[auto_1fr_auto] gap-x-2 gap-y-[3px] px-2.5 pt-[7px] pb-2",
  "bg-kl-inverse font-(family-name:--kl-font) text-[13px]/[1.3] text-kl-on-inverse tabular-nums",
  "forced-colors:border forced-colors:border-[CanvasText]",
);
const tipHead = cn(
  "col-span-full mb-0.5 border-b-(length:--kl-k1) border-b-[color-mix(in_oklab,var(--kl-on-inverse)_35%,transparent)] pb-1",
  "font-(family-name:--kl-font-mono) text-[11px]/[1.2] font-medium not-italic normal-nums",
);
const unit = "font-(family-name:--kl-font-mono) text-[11px]/none font-medium normal-nums not-italic opacity-85";

/* figure: a title row with the Chart / Table switch; the view below */
const figure = "kl-type m-0 grid min-w-0 gap-3";

const table = cn(
  "kl-type overflow-x-auto border-(length:--kl-k1) border-kl-line",
  "[&_tbody_tr:last-child>*]:border-b-0",
);

type ChartContainerState = Record<string, never>;
const PART_STATE: ChartContainerState = {};

type ChartContainerProps = Omit<PartProps<"div", ChartContainerState>, "children"> & {
  config: ChartConfig;
  /** A recharts chart (BarChart, LineChart, AreaChart …). */
  children: React.ReactElement;
  /** Formats values in the tooltip and table. Default: the locale's grouping, at most two decimals. */
  format?: (v: number) => string;
  locale?: string;
};

/**
 * The plot area. Sized by CSS (default aspect 16/9; set a height or aspect-ratio with className or style).
 * Name it: `aria-label`, or `aria-labelledby` pointing at a visible title (ChartFigure does this).
 */
function ChartContainer({
  config,
  children,
  render,
  className,
  style,
  format,
  locale,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  ...props
}: ChartContainerProps): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null);
  const live = React.useRef<HTMLSpanElement>(null);
  const hint = React.useId();
  // the tooltip is drawn for pointer and keyboard alike; it is read out only while focus is on the plot,
  // so arrowing through the points announces each category's figures
  const announce = React.useCallback((text: string) => {
    if (live.current && ref.current?.contains(document.activeElement) && live.current.textContent !== text)
      live.current.textContent = text;
  }, []);
  // first guess from the page, so a reduced-motion or RTL page does not draw (and start animating) twice
  const [env, setEnv] = React.useState(() =>
    typeof document === "undefined"
      ? { still: false, rtl: false }
      : {
          still:
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            document.documentElement.dataset["klMotion"] === "reduce",
          rtl: document.documentElement.dir === "rtl",
        },
  );
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const still =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!el.closest('[data-kl-motion="reduce"]');
      const rtl = domDir(el) === "rtl";
      setEnv((e) => (e.still === still && e.rtl === rtl ? e : { still, rtl }));
    };
    read();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", read);
    // the motion and direction settings are attributes on an ancestor; follow them if they change
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-kl-motion", "dir"],
    });
    return () => {
      mq.removeEventListener("change", read);
      mo.disconnect();
    };
  }, []);
  const vars = Object.fromEntries(
    Object.entries(config).map(([k, c], i) => [`--color-${k}`, c.color ?? ROLE[Math.min(i, ROLE.length - 1)]]),
  );
  const fmt = React.useMemo(
    () => format ?? ((v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v)),
    [format, locale],
  );
  const chart = React.Children.toArray(adapt(children, env))[0] as React.ReactElement<
    Record<string, string | undefined>
  >;
  const own = {
    "data-slot": "chart",
    className: resolveClassName(plot, className)(PART_STATE),
    style: resolveStyle(vars as React.CSSProperties, style)(PART_STATE),
    children: (
      <>
        <Recharts.ResponsiveContainer initialDimension={{ width: 320, height: 180 }}>
          {/* the plot is the library's one tab stop (role application); it carries the chart's name */}
          {React.cloneElement(chart, {
            "aria-label": chart.props["aria-label"] ?? label,
            "aria-labelledby": chart.props["aria-labelledby"] ?? labelledBy,
            "aria-describedby": chart.props["aria-describedby"] ?? hint,
          })}
        </Recharts.ResponsiveContainer>
        <span className="kl-sr" id={hint}>
          Arrow keys step through the points.
        </span>
        <span className="kl-sr" role="status" ref={live} />
      </>
    ),
  };
  const el = useRender({ defaultTagName: "div", render, ref, state: PART_STATE, props: mergeProps<"div">(props, own) });
  return <ChartContext.Provider value={{ config, format: fmt, announce }}>{el}</ChartContext.Provider>;
}

const ChartTooltip = Recharts.Tooltip;

type TooltipItem = {
  dataKey?: string | number | ((o: unknown) => unknown);
  name?: string | number;
  value?: unknown;
  color?: string;
  payload?: Record<string, unknown>;
};

/** The tooltip body: the category in the Code voice, then one row per series (key, name, figure). */
function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel,
  labelFormatter,
  nameKey,
  className,
}: {
  active?: boolean;
  payload?: readonly TooltipItem[];
  label?: React.ReactNode;
  hideLabel?: boolean;
  labelFormatter?: (label: React.ReactNode, payload: readonly TooltipItem[]) => React.ReactNode;
  /** For one-series-per-row data (pie): the row field that names the item. */
  nameKey?: string;
  className?: string;
}) {
  const { config, format, announce } = useChart();
  const said =
    active && payload?.length
      ? [
          spoken(label),
          ...payload.map((it) =>
            `${spoken(config[String(it.dataKey)]?.label ?? it.name)} ${typeof it.value === "number" ? format(it.value) : shown(it.value, "–")} ${config[String(it.dataKey)]?.unit ?? ""}`.trim(),
          ),
        ]
          .filter((x) => x !== "")
          .join(", ")
      : "";
  React.useEffect(() => {
    if (said) announce(said);
  }, [said, announce]);
  if (!active || !payload?.length) return null;
  const head = hideLabel ? null : labelFormatter ? labelFormatter(label, payload) : label;
  return (
    <div data-slot="chart-tooltip" className={cn(tip, className)}>
      {head != null && head !== "" ? (
        <div data-slot="chart-tooltip-label" className={tipHead}>
          {head}
        </div>
      ) : null}
      {payload.map((it, i) => {
        const key = String(nameKey ? it.payload?.[nameKey] : (it.dataKey ?? it.name ?? i));
        const c = config[key];
        const v = typeof it.value === "number" ? format(it.value) : shown(it.value, "–");
        return (
          <div data-slot="chart-tooltip-item" className="contents" key={key + i}>
            <span
              data-slot="chart-key"
              className={cn(key_, "self-center shadow-[0_0_0_1px_var(--kl-on-inverse)]")}
              style={{ background: c?.color ?? `var(--color-${key}, ${it.color})` }}
              aria-hidden
            />
            <span data-slot="chart-tooltip-name" className="min-w-0 truncate">
              {c?.label ?? it.name ?? key}
            </span>
            <span data-slot="chart-tooltip-value" className="text-end font-(--kl-weight-strong) whitespace-nowrap">
              {v}
              {c?.unit ? <span className={unit}> {c.unit}</span> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const ChartLegend = Recharts.Legend;

/** Square keys with the series names, in config order. Recharts passes `payload`; without it, the config is the legend. */
function ChartLegendContent({
  payload,
  className,
}: {
  payload?: readonly { dataKey?: unknown; value?: unknown }[];
  className?: string;
}) {
  const { config } = useChart();
  // config order, so a stacked chart's legend reads in the author's order whatever order recharts draws
  const shown = new Set(payload?.map((p) => String(p.dataKey ?? p.value)));
  const keys = payload?.length
    ? [...Object.keys(config).filter((k) => shown.has(k)), ...[...shown].filter((k) => !(k in config))]
    : Object.keys(config);
  return (
    <ul
      data-slot="chart-legend"
      className={cn(
        "m-0 flex list-none flex-wrap justify-center gap-x-4 gap-y-1 p-0 pt-2 text-[13px] text-kl-ink-2",
        className,
      )}
    >
      {keys.map((k) => (
        <li key={k} data-slot="chart-legend-item" className="inline-flex items-center gap-1.5">
          <span data-slot="chart-key" className={key_} style={{ background: `var(--color-${k})` }} aria-hidden />
          {config[k]?.label ?? k}
        </li>
      ))}
    </ul>
  );
}

type ChartTableProps = PartProps<"div", ChartContainerState> & {
  data: readonly Record<string, unknown>[];
  config: ChartConfig;
  /** The row field that names each category (the x axis). */
  labelKey: string;
  /** Header of the category column. */
  labelHeader?: React.ReactNode;
  caption?: React.ReactNode;
  format?: (v: number) => string;
  locale?: string;
};

/** The same rows as a table: a category column, then one column per series, figures right-aligned. */
function ChartTable({
  data,
  config,
  labelKey,
  labelHeader,
  caption,
  format,
  locale,
  render,
  className,
  style,
  ...props
}: ChartTableProps): React.ReactElement {
  const fmt = format ?? ((v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v));
  const keys = Object.keys(config);
  const body = (
    <Table className="text-[13px]">
      {caption ? <caption className="kl-sr">{caption}</caption> : null}
      <TableHeader>
        <tr>
          <TableHead scope="col">{labelHeader ?? labelKey}</TableHead>
          {Object.entries(config).map(([k, c]) => (
            <TableHead align="end" scope="col" key={k}>
              <span
                data-slot="chart-key"
                className={cn(key_, "me-1.5 align-[-1px]")}
                style={{ background: c.color ?? ROLE[Math.min(keys.indexOf(k), ROLE.length - 1)] }}
                aria-hidden
              />
              {c.label ?? k}
              {c.unit ? <span className="kl-code"> {c.unit}</span> : null}
            </TableHead>
          ))}
        </tr>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <tr key={i}>
            <TableCell render={<th scope="row" />} className="text-start font-normal">
              {shown(row[labelKey], "")}
            </TableCell>
            {keys.map((k) => (
              <TableCell align="end" key={k}>
                {typeof row[k] === "number" ? fmt(row[k] as number) : shown(row[k], "–")}
              </TableCell>
            ))}
          </tr>
        ))}
      </TableBody>
    </Table>
  );
  const own = {
    "data-slot": "chart-table",
    className: resolveClassName(table, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: body,
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

type ChartFigureProps = Omit<PartProps<"figure", ChartContainerState>, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The rows behind the chart, for the Table view. */
  data: readonly Record<string, unknown>[];
  config: ChartConfig;
  labelKey: string;
  labelHeader?: React.ReactNode;
  format?: (v: number) => string;
  locale?: string;
  /** Starting view. */
  defaultView?: "chart" | "table";
  /** The plot (a ChartContainer); it is named by the title. */
  children: React.ReactElement<ChartContainerProps>;
};

/**
 * A titled chart with a Chart / Table switch. The table carries the same rows, so every value is
 * readable without the plot (screen readers, forced colours, print, copying figures).
 */
function ChartFigure({
  title,
  description,
  data,
  config,
  labelKey,
  labelHeader,
  format,
  locale,
  defaultView = "chart",
  children,
  render,
  className,
  style,
  ...props
}: ChartFigureProps): React.ReactElement {
  const [view, setView] = React.useState(defaultView);
  const id = React.useId();
  const body = (
    <>
      <figcaption data-slot="chart-figure-caption" className="flex flex-wrap items-start gap-3">
        <span className="grid min-w-0 flex-[1_1_200px] gap-0.5">
          <span data-slot="chart-figure-title" className="text-[15px]/[1.25] font-(--kl-weight-strong)" id={`${id}t`}>
            {title}
          </span>
          {description ? (
            <span data-slot="chart-figure-description" className="text-[13px] text-kl-ink-2">
              {description}
            </span>
          ) : null}
        </span>
        <Segmented size="compact" value={view} onValueChange={(v) => setView(v as "chart" | "table")} aria-label="View">
          <SegmentedItem value="chart">Chart</SegmentedItem>
          <SegmentedItem value="table">Table</SegmentedItem>
        </Segmented>
      </figcaption>
      {view === "chart" ? (
        React.cloneElement(children, {
          "aria-labelledby": children.props["aria-labelledby"] ?? `${id}t`,
        } as Partial<ChartContainerProps>)
      ) : (
        <ChartTable
          data={data}
          config={config}
          labelKey={labelKey}
          labelHeader={labelHeader}
          caption={title}
          format={format}
          locale={locale}
        />
      )}
    </>
  );
  const own = {
    "data-slot": "chart-figure",
    className: resolveClassName(figure, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: body,
  };
  // the title names the figure unless the consumer names it
  return useRender({
    defaultTagName: "figure",
    render,
    state: PART_STATE,
    props: mergeProps<"figure">({ "aria-labelledby": `${id}t` }, props, own),
  });
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartTable,
  ChartFigure,
  useChart,
};
