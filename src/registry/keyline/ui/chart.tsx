"use client";

import * as React from "react"
import * as Recharts from "recharts"

import { cn } from "@/lib/utils"
import { Segmented, SegmentedItem } from "./segmented"
import { domDir } from "../lib/keyline-scope"

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
    label?: React.ReactNode
    /** Any CSS colour; Keyline's roles are "var(--kl-data-1)" … Defaults by order: data-1, data-2, data-3. */
    color?: string
    /** Unit printed after values in the tooltip and table, in the Code voice. */
    unit?: string
  }
>

const ROLE = ["var(--kl-data-1)", "var(--kl-data-2)", "var(--kl-data-3)"]

const ChartContext = React.createContext<{ config: ChartConfig; format: (v: number) => string; announce: (text: string) => void } | null>(null)

function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error("useChart must be used within a <ChartContainer />")
  return ctx
}

const SERIES = new Set<unknown>([Recharts.Bar, Recharts.Line, Recharts.Area, Recharts.Pie, Recharts.Scatter, Recharts.Radar, Recharts.RadialBar])

/** Walks the composed chart and sets what the reader's settings ask for, unless the author set it. */
function adapt(node: React.ReactNode, o: { still: boolean; rtl: boolean }): React.ReactNode {
  return React.Children.map(node, (el) => {
    if (!React.isValidElement(el)) return el
    const p = el.props as Record<string, unknown> & { children?: React.ReactNode }
    const extra: Record<string, unknown> = {}
    if (o.still && SERIES.has(el.type) && p.isAnimationActive === undefined) extra.isAnimationActive = false
    // an Operate chart updates, it does not perform: data changes and the first draw take the unfold time, not
    // recharts' 1.5s (switching Table → Chart replayed a 1.5s line draw every time)
    else if (SERIES.has(el.type) && p.animationDuration === undefined) extra.animationDuration = 220
    if (o.rtl && el.type === Recharts.XAxis && p.reversed === undefined) extra.reversed = true
    if (o.rtl && el.type === Recharts.YAxis && p.orientation === undefined) extra.orientation = "right"
    const kids = p.children !== undefined && typeof p.children !== "function" ? adapt(p.children, o) : undefined
    return Object.keys(extra).length || kids !== undefined ? React.cloneElement(el, extra, ...(kids !== undefined ? [kids] : [])) : el
  })
}

type ChartContainerProps = Omit<React.ComponentProps<"div">, "children"> & {
  config: ChartConfig
  /** A recharts chart (BarChart, LineChart, AreaChart …). */
  children: React.ReactElement
  /** Formats values in the tooltip and table. Default: the locale's grouping, at most two decimals. */
  format?: (v: number) => string
  locale?: string
}

/**
 * The plot area. Sized by CSS (default aspect 16/9; set a height or aspect-ratio with className or style).
 * Name it: `aria-label`, or `aria-labelledby` pointing at a visible title (ChartFigure does this).
 */
function ChartContainer({ config, children, className, style, format, locale, "aria-label": label, "aria-labelledby": labelledBy, ...props }: ChartContainerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const live = React.useRef<HTMLSpanElement>(null)
  const hint = React.useId()
  // the tooltip is drawn for pointer and keyboard alike; it is read out only while focus is on the plot,
  // so arrowing through the points announces each category's figures
  const announce = React.useCallback((text: string) => {
    if (live.current && ref.current?.contains(document.activeElement) && live.current.textContent !== text) live.current.textContent = text
  }, [])
  // first guess from the page, so a reduced-motion or RTL page does not draw (and start animating) twice
  const [env, setEnv] = React.useState(() =>
    typeof document === "undefined"
      ? { still: false, rtl: false }
      : { still: window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.klMotion === "reduce", rtl: document.documentElement.dir === "rtl" },
  )
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!el.closest('[data-kl-motion="reduce"]')
      const rtl = domDir(el) === "rtl"
      setEnv((e) => (e.still === still && e.rtl === rtl ? e : { still, rtl }))
    }
    read()
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    mq.addEventListener("change", read)
    // the motion and direction settings are attributes on an ancestor; follow them if they change
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-kl-motion", "dir"] })
    return () => {
      mq.removeEventListener("change", read)
      mo.disconnect()
    }
  }, [])
  const keys = Object.keys(config)
  const vars = Object.fromEntries(keys.map((k, i) => [`--color-${k}`, config[k].color ?? ROLE[Math.min(i, ROLE.length - 1)]]))
  const fmt = React.useMemo(() => format ?? ((v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v)), [format, locale])
  const plot = React.Children.toArray(adapt(children, env))[0] as React.ReactElement<Record<string, string | undefined>>
  return (
    <ChartContext.Provider value={{ config, format: fmt, announce }}>
      <div ref={ref} data-slot="chart" className={cn("kl-chart", className)} style={{ ...vars, ...style } as React.CSSProperties} {...props}>
        <Recharts.ResponsiveContainer initialDimension={{ width: 320, height: 180 }}>
          {/* the plot is the library's one tab stop (role application); it carries the chart's name */}
          {React.cloneElement(plot, {
            "aria-label": plot.props["aria-label"] ?? label,
            "aria-labelledby": plot.props["aria-labelledby"] ?? labelledBy,
            "aria-describedby": plot.props["aria-describedby"] ?? hint,
          })}
        </Recharts.ResponsiveContainer>
        <span className="kl-sr" id={hint}>
          Arrow keys step through the points.
        </span>
        <span className="kl-sr" role="status" ref={live} />
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = Recharts.Tooltip

type TooltipItem = { dataKey?: string | number | ((o: unknown) => unknown); name?: string | number; value?: unknown; color?: string; payload?: Record<string, unknown> }

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
  active?: boolean
  payload?: readonly TooltipItem[]
  label?: React.ReactNode
  hideLabel?: boolean
  labelFormatter?: (label: React.ReactNode, payload: readonly TooltipItem[]) => React.ReactNode
  /** For one-series-per-row data (pie): the row field that names the item. */
  nameKey?: string
  className?: string
}) {
  const { config, format, announce } = useChart()
  const said = active && payload?.length ? [label, ...payload.map((it) => `${config[String(it.dataKey)]?.label ?? it.name ?? ""} ${typeof it.value === "number" ? format(it.value) : String(it.value ?? "–")} ${config[String(it.dataKey)]?.unit ?? ""}`.trim())].filter((x) => x != null && x !== "").join(", ") : ""
  React.useEffect(() => {
    if (said) announce(said)
  }, [said, announce])
  if (!active || !payload?.length) return null
  const head = hideLabel ? null : labelFormatter ? labelFormatter(label, payload) : label
  return (
    <div className={cn("kl-chart-tip", className)}>
      {head != null && head !== "" ? <div className="kl-chart-tip-h">{head}</div> : null}
      {payload.map((it, i) => {
        const key = String(nameKey ? it.payload?.[nameKey] : it.dataKey ?? it.name ?? i)
        const c = config[key]
        const v = typeof it.value === "number" ? format(it.value) : String(it.value ?? "–")
        return (
          <div className="kl-chart-tip-r" key={key + i}>
            <span className="kl-chart-key" style={{ background: c?.color ?? `var(--color-${key}, ${it.color})` }} aria-hidden />
            <span className="kl-chart-tip-n">{c?.label ?? it.name ?? key}</span>
            <span className="kl-chart-tip-v">
              {v}
              {c?.unit ? <span className="kl-chart-unit"> {c.unit}</span> : null}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const ChartLegend = Recharts.Legend

/** Square keys with the series names, in config order. Recharts passes `payload`; without it, the config is the legend. */
function ChartLegendContent({ payload, className }: { payload?: readonly { dataKey?: unknown; value?: unknown }[]; className?: string }) {
  const { config } = useChart()
  // config order, so a stacked chart's legend reads in the author's order whatever order recharts draws
  const shown = new Set(payload?.map((p) => String(p.dataKey ?? p.value)))
  const keys = payload?.length ? [...Object.keys(config).filter((k) => shown.has(k)), ...[...shown].filter((k) => !(k in config))] : Object.keys(config)
  return (
    <ul className={cn("kl-chart-legend", className)}>
      {keys.map((k) => (
        <li key={k}>
          <span className="kl-chart-key" style={{ background: `var(--color-${k})` }} aria-hidden />
          {config[k]?.label ?? k}
        </li>
      ))}
    </ul>
  )
}

type ChartTableProps = {
  data: readonly Record<string, unknown>[]
  config: ChartConfig
  /** The row field that names each category (the x axis). */
  labelKey: string
  /** Header of the category column. */
  labelHeader?: React.ReactNode
  caption?: React.ReactNode
  format?: (v: number) => string
  locale?: string
  className?: string
}

/** The same rows as a table: a category column, then one column per series, figures right-aligned. */
function ChartTable({ data, config, labelKey, labelHeader, caption, format, locale, className }: ChartTableProps) {
  const fmt = format ?? ((v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v))
  const keys = Object.keys(config)
  return (
    <div className={cn("kl-chart-table", className)}>
      <table className="kl-table">
        {caption ? <caption className="kl-sr">{caption}</caption> : null}
        <thead>
          <tr>
            <th className="kl-th" scope="col">{labelHeader ?? labelKey}</th>
            {keys.map((k) => (
              <th className="kl-th kl-chart-num" scope="col" key={k}>
                <span className="kl-chart-key" style={{ background: config[k].color ?? ROLE[Math.min(keys.indexOf(k), ROLE.length - 1)] }} aria-hidden />
                {config[k].label ?? k}
                {config[k].unit ? <span className="kl-code"> {config[k].unit}</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <th className="kl-td kl-chart-rowh" scope="row">{String(row[labelKey] ?? "")}</th>
              {keys.map((k) => (
                <td className="kl-td kl-chart-num" key={k}>
                  {typeof row[k] === "number" ? fmt(row[k] as number) : String(row[k] ?? "–")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type ChartFigureProps = Omit<React.ComponentProps<"figure">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** The rows behind the chart, for the Table view. */
  data: readonly Record<string, unknown>[]
  config: ChartConfig
  labelKey: string
  labelHeader?: React.ReactNode
  format?: (v: number) => string
  locale?: string
  /** Starting view. */
  defaultView?: "chart" | "table"
  /** The plot (a ChartContainer); it is named by the title. */
  children: React.ReactElement<ChartContainerProps>
}

/**
 * A titled chart with a Chart / Table switch. The table carries the same rows, so every value is
 * readable without the plot (screen readers, forced colours, print, copying figures).
 */
function ChartFigure({ title, description, data, config, labelKey, labelHeader, format, locale, defaultView = "chart", children, className, ...props }: ChartFigureProps) {
  const [view, setView] = React.useState(defaultView)
  const id = React.useId()
  return (
    <figure data-slot="chart-figure" className={cn("kl-chart-fig", className)} aria-labelledby={`${id}t`} {...props}>
      <figcaption className="kl-chart-cap">
        <span className="kl-chart-cap-t">
          <span className="kl-chart-title" id={`${id}t`}>
            {title}
          </span>
          {description ? <span className="kl-chart-desc">{description}</span> : null}
        </span>
        <Segmented size="compact" value={view} onValueChange={(v) => setView(v as "chart" | "table")} aria-label="View">
          <SegmentedItem value="chart">Chart</SegmentedItem>
          <SegmentedItem value="table">Table</SegmentedItem>
        </Segmented>
      </figcaption>
      {view === "chart" ? (
        React.cloneElement(children, { "aria-labelledby": children.props["aria-labelledby"] ?? `${id}t` } as Partial<ChartContainerProps>)
      ) : (
        <ChartTable data={data} config={config} labelKey={labelKey} labelHeader={labelHeader} caption={title} format={format} locale={locale} />
      )}
    </figure>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartTable, ChartFigure, useChart }
