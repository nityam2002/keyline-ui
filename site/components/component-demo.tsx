"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/keyline/ui/tabs"
import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented"

const MARKS = Array.from({ length: 21 }, (_, i) => i * 100)

/** The container's measured width, marked on the ruler as a band from zero. */
function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [w, setW] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}

/**
 * Preview and Code of one example module: the preview renders it on the stage, the code panel shows its source.
 * `widths`: offer Standard / Narrow, with the ruler marking the container. Only for examples whose point is
 * how they answer a narrower container (overflow); the rest get a plain stage.
 */
export function ComponentDemo({ label, preview, code, widths = false }: { label: string; preview: React.ReactNode; code: React.ReactNode; widths?: boolean }) {
  const [tab, setTab] = React.useState<string>("preview")
  const [width, setWidth] = React.useState("standard")
  const box = React.useRef<HTMLDivElement>(null)
  const w = useWidth(box)
  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(String(v))}
      className="mt-7 block border-3 border-kl-line bg-kl-cell *:m-0 [p+&]:mt-4"
      data-testid="demo"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kl-seam px-3 py-2.5">
        <TabsList aria-label={label}>
          <TabsTab value="preview">Preview</TabsTab>
          <TabsTab value="code">Code</TabsTab>
        </TabsList>
        {widths && tab === "preview" ? (
          <Segmented size="compact" value={width} onValueChange={setWidth} aria-label="Preview width">
            <SegmentedItem value="standard">Standard</SegmentedItem>
            <SegmentedItem value="narrow">Narrow</SegmentedItem>
          </Segmented>
        ) : null}
      </div>
      <TabsPanel value="preview" keepMounted className="s-demo-stage relative flex items-stretch overflow-hidden bg-kl-paper p-6 data-[hidden]:hidden
          data-[ruled]:[--s-origin:40px] data-[ruled]:pt-10 data-[ruled]:pe-6 data-[ruled]:pb-7 data-[ruled]:ps-(--s-origin)
          max-[721px]:p-3.5 max-[721px]:data-[ruled]:[--s-origin:30px] max-[721px]:data-[ruled]:pt-9 max-[721px]:data-[ruled]:pe-3.5 max-[721px]:data-[ruled]:pb-6" data-ruled={widths ? "" : undefined}>
        {widths ? (
          <>
            <div className="s-ruler-x" aria-hidden="true">
              {MARKS.map((m) => (
                <span key={m} style={{ left: m }}>
                  {m}
                </span>
              ))}
              <i className="s-ruler-band" style={{ width: w }} />
            </div>
            <div className="s-ruler-y" aria-hidden="true" />
          </>
        ) : null}
        {/* the container the example is given: the full stage at Standard, 220px at Narrow. A definite width,
            so the toolbar grows back when the room returns. */}
        <div className="relative min-h-[140px] w-full max-w-full bg-kl-cell p-7 data-[width=narrow]:w-[220px] data-[width=narrow]:px-3 max-[721px]:px-3 max-[721px]:py-5" data-width={widths ? width : "standard"} data-testid="preview-box" ref={box}>
          <span className="s-box-crops" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          {preview}
        </div>
      </TabsPanel>
      <TabsPanel value="code" keepMounted className="s-demo-code bg-kl-cell data-[hidden]:hidden">
        {code}
      </TabsPanel>
    </Tabs>
  )
}
