import * as React from "react"
import * as ui from "../demo-ui"
import { Toolbar,ToolbarButton,ToolbarGroup } from "@/registry/keyline/ui/toolbar"
import { GLYPH } from "./glyphs"
import { Sizes } from "./toolbar-group-overflow"
import { G } from "./toolbar-group-overflow"

/* ------------------------------------------------------------------ *
 * 2. Vertical overflow: a palette in a column of limited height
 * ------------------------------------------------------------------ */
export function VerticalOverflowSpecimen() {
  const [h, setH] = React.useState("400px")
  const [log, setLog] = React.useState("—")
  return (
    <div className={ui.stack} data-testid="specimen-vertical">
      <div className={ui.group}>
        <h3 className={ui.cap}>A tool palette: what doesn't fit the column's height moves into More at its foot</h3>
        <Sizes label="Column height" value={h} onValueChange={setH} options={["400px", "160px", "110px"]} />
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ height: parseInt(h), display: "flex", flexDirection: "column" }} data-testid="vp-box">
            <Toolbar aria-label="Tools" orientation="vertical" overflow="menu" data-testid="vp-tb">
              <ToolbarGroup aria-label="Pick">
                <ToolbarButton icon aria-label="Select" onClick={() => setLog("Select")}><G d={GLYPH.pointer} /></ToolbarButton>
                <ToolbarButton icon aria-label="Pan" onClick={() => setLog("Pan")}><G d={GLYPH.pan} /></ToolbarButton>
              </ToolbarGroup>
              <ToolbarButton icon aria-label="Measure" onClick={() => setLog("Measure")}><G d={GLYPH.measure} /></ToolbarButton>
              <ToolbarButton icon aria-label="Zoom in" onClick={() => setLog("Zoom in")}><G d={GLYPH.plus} /></ToolbarButton>
              <ToolbarButton icon aria-label="Zoom out" onClick={() => setLog("Zoom out")}><G d={GLYPH.minus} /></ToolbarButton>
              <ToolbarButton icon aria-label="Find" onClick={() => setLog("Find")}><G d={GLYPH.search} /></ToolbarButton>
            </Toolbar>
          </div>
          <div dir="rtl" style={{ height: 160, display: "flex", flexDirection: "column" }} data-testid="vp-rtl">
            <Toolbar aria-label="أدوات" orientation="vertical" overflow="menu">
              <ToolbarButton icon aria-label="تحديد"><G d={GLYPH.pointer} /></ToolbarButton>
              <ToolbarButton icon aria-label="قياس"><G d={GLYPH.measure} /></ToolbarButton>
              <ToolbarButton icon aria-label="تكبير"><G d={GLYPH.plus} /></ToolbarButton>
              <ToolbarButton icon aria-label="تصغير"><G d={GLYPH.minus} /></ToolbarButton>
              <ToolbarButton icon aria-label="بحث"><G d={GLYPH.search} /></ToolbarButton>
            </Toolbar>
          </div>
        </div>
        <p className={ui.note} data-testid="vp-log">Last: {log}</p>
      </div>
    </div>
  )
}
