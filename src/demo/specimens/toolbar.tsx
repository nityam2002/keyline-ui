import * as React from "react"
import * as ui from "../demo-ui"
import { Panel,PanelBody } from "@/registry/keyline/ui/panel"
import { Menu,MenuItem,MenuCheckboxItem,MenuRadioGroup,MenuRadioItem,MenuSeparator,MenuGroup,MenuGroupLabel } from "@/registry/keyline/ui/menu"
import { Tooltip } from "@/registry/keyline/ui/tooltip"
import { Segmented,SegmentedItem } from "@/registry/keyline/ui/segmented"
import {
Toolbar,ToolbarButton,ToolbarToggle,ToolbarToggleGroup,ToolbarGroup,ToolbarSeparator,ToolbarSpacer,ToolbarLink,
ToolbarInput,ToolbarMenuTrigger,ToolbarMenuContent,
} from "@/registry/keyline/ui/toolbar"
import { GLYPH } from "./glyphs"

/* 16px glyphs: 1.75 stroke, square caps, miter joins */
const G = ({ d, label }: { d: string; label?: string }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" strokeLinejoin="miter" aria-hidden={label ? undefined : true} aria-label={label}>
    <path d={d} />
  </svg>
)
const Search = () => <G d={GLYPH.search} />
/* ------------------------------------------------------------------ *
 * 1. Toolbar
 * ------------------------------------------------------------------ */
export function ToolbarSpecimen() {
  const [style, setStyle] = React.useState<string[]>(["bold"])
  const [align, setAlign] = React.useState<string[]>(["start"])
  const [comments, setComments] = React.useState(true)
  const [log, setLog] = React.useState("—")
  const [tool, setTool] = React.useState<string[]>(["pointer"])
  const [zoom, setZoom] = React.useState(100)
  const [width, setWidth] = React.useState("wide")
  const [cols, setCols] = React.useState({ eta: true, carrier: true, weight: false })
  const [density, setDensity] = React.useState("comfortable")
  return (
    <div className={ui.stack} data-testid="specimen-toolbar">
      <div className={ui.group}>
        <h3 className={ui.cap}>Editor: groups, toggles, an exclusive choice, a menu, a spacer and the primary action</h3>
        <Toolbar aria-label="Formatting" data-testid="tb-editor">
          <ToolbarGroup aria-label="History">
            <Tooltip content="Undo" shortcut="⌘Z">
              <ToolbarButton icon aria-label="Undo" onClick={() => setLog("Undo")}><G d={GLYPH.undo} /></ToolbarButton>
            </Tooltip>
            <ToolbarButton icon aria-label="Redo" disabled><G d={GLYPH.redo} /></ToolbarButton>
          </ToolbarGroup>
          <ToolbarToggleGroup aria-label="Text style" value={style} onValueChange={setStyle}>
            <ToolbarToggle icon value="bold" aria-label="Bold"><G d={GLYPH.bold} /></ToolbarToggle>
            <ToolbarToggle icon value="italic" aria-label="Italic"><G d={GLYPH.italic} /></ToolbarToggle>
            <ToolbarToggle icon value="under" aria-label="Underline"><G d={GLYPH.under} /></ToolbarToggle>
          </ToolbarToggleGroup>
          <ToolbarToggleGroup aria-label="Alignment" multiple={false} value={align} onValueChange={(v) => v.length && setAlign(v)}>
            <ToolbarToggle icon value="start" aria-label="Align start"><G d={GLYPH.start} /></ToolbarToggle>
            <ToolbarToggle icon value="centre" aria-label="Align centre"><G d={GLYPH.centre} /></ToolbarToggle>
            <ToolbarToggle icon value="end" aria-label="Align end"><G d={GLYPH.end} /></ToolbarToggle>
          </ToolbarToggleGroup>
          <Menu>
            <ToolbarMenuTrigger>Insert</ToolbarMenuTrigger>
            <ToolbarMenuContent>
              <MenuItem code="1" onClick={() => setLog("Insert table")}>Table</MenuItem>
              <MenuItem code="2" onClick={() => setLog("Insert checklist")}>Checklist</MenuItem>
              <MenuItem code="3" description="From the dock schedule" onClick={() => setLog("Insert slot")}>Dock slot</MenuItem>
            </ToolbarMenuContent>
          </Menu>
          <ToolbarSpacer />
          <ToolbarToggle pressed={comments} onPressedChange={setComments} affix={<span className="kl-code">3</span>}>Comments</ToolbarToggle>
          <ToolbarButton primary onClick={() => setLog("Publish")}>Publish</ToolbarButton>
        </Toolbar>
        <p className={ui.note} data-testid="tb-log">Last command: {log} · style {style.join(", ") || "none"} · align {align[0]} · comments {comments ? "on" : "off"}</p>
      </div>

      <div className={ui.group}>
        <h3 className={ui.cap}>As the top cell of a panel: search, a menu of checkbox items, a separator, a link</h3>
        <Panel data-testid="tb-panel" style={{ maxWidth: 760 }}>
          <Toolbar layout="cell" aria-label="Records">
            <ToolbarInput label="Search records" placeholder="Search records" glyph={<Search />} />
            <Menu>
              <ToolbarMenuTrigger>Columns</ToolbarMenuTrigger>
              <ToolbarMenuContent>
                <MenuGroup>
                  <MenuGroupLabel>Shown</MenuGroupLabel>
                  <MenuCheckboxItem checked={cols.eta} onCheckedChange={(c) => setCols({ ...cols, eta: c })}>ETA</MenuCheckboxItem>
                  <MenuCheckboxItem checked={cols.carrier} onCheckedChange={(c) => setCols({ ...cols, carrier: c })}>Carrier</MenuCheckboxItem>
                  <MenuCheckboxItem checked={cols.weight} onCheckedChange={(c) => setCols({ ...cols, weight: c })}>Weight</MenuCheckboxItem>
                </MenuGroup>
                <MenuSeparator />
                <MenuRadioGroup value={density} onValueChange={setDensity}>
                  <MenuGroupLabel>Rows</MenuGroupLabel>
                  <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
                  <MenuRadioItem value="compact">Compact</MenuRadioItem>
                </MenuRadioGroup>
              </ToolbarMenuContent>
            </Menu>
            <ToolbarSeparator />
            <ToolbarButton>Export</ToolbarButton>
            <ToolbarLink href="#toolbar">Help</ToolbarLink>
          </Toolbar>
          <PanelBody>
            <p className={ui.note}>Columns: {Object.entries(cols).filter(([, v]) => v).map(([k]) => k).join(", ")} · rows {density}</p>
          </PanelBody>
        </Panel>
      </div>

      <div className={ui.split}>
        <div className={ui.group}>
          <h3 className={ui.cap}>Vertical palette: exclusive tool, then zoom</h3>
          <div style={{ display: "flex", gap: "var(--kl-gutter)", alignItems: "start" }}>
            <Toolbar orientation="vertical" aria-label="Tools" data-testid="tb-vertical">
              <ToolbarToggleGroup aria-label="Tool" multiple={false} value={tool} onValueChange={(v) => v.length && setTool(v)}>
                <ToolbarToggle icon value="pointer" aria-label="Select"><G d={GLYPH.pointer} /></ToolbarToggle>
                <ToolbarToggle icon value="pan" aria-label="Pan"><G d={GLYPH.pan} /></ToolbarToggle>
                <ToolbarToggle icon value="measure" aria-label="Measure"><G d={GLYPH.measure} /></ToolbarToggle>
              </ToolbarToggleGroup>
              <ToolbarButton icon aria-label="Zoom in" disabled={zoom >= 200} onClick={() => setZoom((z) => z + 25)}><G d={GLYPH.plus} /></ToolbarButton>
              <ToolbarButton icon aria-label="Zoom out" disabled={zoom <= 50} onClick={() => setZoom((z) => z - 25)}><G d={GLYPH.minus} /></ToolbarButton>
            </Toolbar>
            <p className={ui.note}>Tool: {tool[0]} · zoom <span className="kl-code">{zoom}%</span></p>
          </div>
        </div>
        <div className={ui.group} style={{ flex: "1 1 340px", minWidth: 0 }}>
          <h3 className={ui.cap}>Narrow: the row scrolls and fades its hidden edge</h3>
          <Segmented size="compact" value={width} onValueChange={setWidth} aria-label="Toolbar width">
            <SegmentedItem value="wide">Fits</SegmentedItem>
            <SegmentedItem value="narrow">300px</SegmentedItem>
          </Segmented>
          <div style={{ width: width === "narrow" ? 300 : "auto", maxWidth: "100%", minWidth: 0, marginTop: 12 }} data-testid="tb-narrow">
            <Toolbar aria-label="Shipment actions">
              <ToolbarButton>Assign carrier</ToolbarButton>
              <ToolbarButton>Reschedule pickup window</ToolbarButton>
              <ToolbarButton affix={<kbd>⌘P</kbd>}>Print labels</ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton>Cancel</ToolbarButton>
            </Toolbar>
          </div>
        </div>
      </div>
    </div>
  )
}
