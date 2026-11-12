import * as React from "react"
import * as ui from "../demo-ui"
import { Menu,MenuItem } from "@/registry/keyline/ui/menu"
import { Segmented,SegmentedItem } from "@/registry/keyline/ui/segmented"
import { Panel,PanelBody } from "@/registry/keyline/ui/panel"
import {
Toolbar,ToolbarButton,ToolbarToggle,ToolbarToggleGroup,ToolbarGroup,ToolbarSeparator,ToolbarLink,
ToolbarInput,ToolbarMenuTrigger,ToolbarMenuContent,
} from "@/registry/keyline/ui/toolbar"
import { GLYPH } from "./glyphs"

const G = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" strokeLinejoin="miter" aria-hidden>
    <path d={d} />
  </svg>
)
/* ------------------------------------------------------------------ *
 * 1. Toolbar overflow: items that don't fit move into "More"
 * ------------------------------------------------------------------ */
const WIDTHS = [
  { value: "fit", label: "Fits", px: null },
  { value: "560", label: "560px", px: 560 },
  { value: "380", label: "380px", px: 380 },
  { value: "220", label: "220px", px: 220 },
]
export function ToolbarOverflowSpecimen() {
  const [width, setWidth] = React.useState("fit")
  const [log, setLog] = React.useState("—")
  const [wrap, setWrap] = React.useState<boolean | null>(null)
  const [view, setView] = React.useState("list")
  const [sig, setSig] = React.useState<"idle" | "pending" | "done" | "failed">("idle")
  const [fail, setFail] = React.useState(false)
  const publish = () => {
    setSig("pending")
    setLog("Publish")
    setTimeout(() => {
      setSig(fail ? "failed" : "done")
      if (!fail) setTimeout(() => setSig((s) => (s === "done" ? "idle" : s)), 900)
    }, 700)
  }
  const px = WIDTHS.find((w) => w.value === width)!.px
  return (
    <div className={ui.stack} data-testid="specimen-overflow">
      <div className={ui.group}>
        <h3 className={ui.cap}>overflow="menu": the row keeps what fits; the rest moves into More, with its state</h3>
        <Segmented size="compact" value={width} onValueChange={setWidth} aria-label="Toolbar width">
          {WIDTHS.map((w) => (
            <SegmentedItem key={w.value} value={w.value}>
              {w.label}
            </SegmentedItem>
          ))}
        </Segmented>
        <div style={{ width: px ?? "auto", maxWidth: "100%", minWidth: 0, marginTop: 12 }} data-testid="ov-box">
          <Toolbar aria-label="Document" overflow="menu" data-testid="ov-tb">
            <ToolbarGroup aria-label="History">
              <ToolbarButton icon aria-label="Undo" onClick={() => setLog("Undo")}><G d={GLYPH.undo} /></ToolbarButton>
              <ToolbarButton icon aria-label="Redo" disabled><G d={GLYPH.redo} /></ToolbarButton>
            </ToolbarGroup>
            <ToolbarToggle defaultPressed onPressedChange={(p) => setWrap(p)}>Wrap</ToolbarToggle>
            <ToolbarToggleGroup aria-label="Layout" multiple={false} defaultValue={["list"]} onValueChange={([first]) => first !== undefined && setView(first)}>
              <ToolbarToggle value="list">List</ToolbarToggle>
              <ToolbarToggle value="board">Board</ToolbarToggle>
              <ToolbarToggle value="map">Map</ToolbarToggle>
            </ToolbarToggleGroup>
            <Menu>
              <ToolbarMenuTrigger>Insert</ToolbarMenuTrigger>
              <ToolbarMenuContent>
                <MenuItem code="1" onClick={() => setLog("Insert table")}>Table</MenuItem>
                <MenuItem code="2" onClick={() => setLog("Insert checklist")}>Checklist</MenuItem>
              </ToolbarMenuContent>
            </Menu>
            <ToolbarSeparator />
            <ToolbarButton affix={<kbd>⌘D</kbd>} onClick={() => setLog("Duplicate")}>Duplicate</ToolbarButton>
            <ToolbarLink href="#toolbar-overflow">Help</ToolbarLink>
            <ToolbarButton primary signal={sig} onClick={publish}>Publish</ToolbarButton>
          </Toolbar>
        </div>
        <p className={ui.note} data-testid="ov-log">
          Last command: {log} · wrap {wrap == null ? "on (default)" : wrap ? "on" : "off"} · layout {view} · publish {sig}
        </p>
        <label className={ui.note} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} /> The next publish fails
        </label>
      </div>

      <div className={ui.split}>
        <div className={ui.group} style={{ flex: "1 1 340px", minWidth: 0 }}>
          <h3 className={ui.cap}>A panel's top cell, label trigger: the search keeps its room, commands move</h3>
          <Panel style={{ maxWidth: 520 }} data-testid="ov-panel">
            <Toolbar layout="cell" aria-label="Records" overflow="menu" overflowLabel="Actions" overflowTrigger="label">
              <ToolbarInput label="Search records" placeholder="Search records" glyph={<G d={GLYPH.search} />} />
              <ToolbarButton>Export</ToolbarButton>
              <ToolbarButton>Archive</ToolbarButton>
              <ToolbarButton>Share</ToolbarButton>
            </Toolbar>
            <PanelBody>
              <p className={ui.note}>At this width the input shrinks to its minimum first; then the commands move into Actions.</p>
            </PanelBody>
          </Panel>
        </div>
        <div className={ui.group} style={{ flex: "1 1 300px", minWidth: 0 }}>
          <h3 className={ui.cap}>Signals on toolbar items (Button's)</h3>
          <Toolbar aria-label="Signals" data-testid="ov-signals">
            <ToolbarButton signal="pending">Saving</ToolbarButton>
            <ToolbarButton signal="done">Saved</ToolbarButton>
            <ToolbarButton signal="failed">Retry</ToolbarButton>
            <ToolbarButton primary signal="pending">Publish</ToolbarButton>
          </Toolbar>
        </div>
      </div>
    </div>
  )
}
