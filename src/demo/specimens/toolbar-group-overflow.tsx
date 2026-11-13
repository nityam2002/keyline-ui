import * as React from "react";
import * as ui from "../demo-ui";
import { Segmented, SegmentedItem } from "@/registry/keyline/ui/segmented";
import { Toolbar, ToolbarButton, ToolbarToggle, ToolbarGroup } from "@/registry/keyline/ui/toolbar";
import { GLYPH } from "./glyphs";

export const G = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden
  >
    <path d={d} />
  </svg>
);
export function Sizes({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Segmented size="compact" value={value} onValueChange={onValueChange} aria-label={label}>
      {options.map((o) => (
        <SegmentedItem key={o} value={o}>
          {o}
        </SegmentedItem>
      ))}
    </Segmented>
  );
}
/* ------------------------------------------------------------------ *
 * 1. Overflow inside groups: a group gives up its items one at a time
 * ------------------------------------------------------------------ */
export function GroupOverflowSpecimen() {
  const [w, setW] = React.useState("Fits");
  const [log, setLog] = React.useState("—");
  const px = w === "Fits" ? undefined : parseInt(w);
  return (
    <div className={ui.stack} data-testid="specimen-groups">
      <div className={ui.group}>
        <h3 className={ui.cap}>Format leaves one item at a time; Align (keepTogether) leaves whole</h3>
        <Sizes label="Toolbar width" value={w} onValueChange={setW} options={["Fits", "270px", "220px", "150px"]} />
        <div style={{ width: px ?? "auto", maxWidth: "100%", minWidth: 0, marginTop: 12 }} data-testid="gs-box">
          <Toolbar aria-label="Editor" overflow="menu" data-testid="gs-tb">
            <ToolbarGroup aria-label="Align" keepTogether>
              <ToolbarButton icon aria-label="Align start" onClick={() => setLog("Align start")}>
                <G d={GLYPH.start} />
              </ToolbarButton>
              <ToolbarButton icon aria-label="Centre" onClick={() => setLog("Centre")}>
                <G d={GLYPH.centre} />
              </ToolbarButton>
              <ToolbarButton icon aria-label="Align end" onClick={() => setLog("Align end")}>
                <G d={GLYPH.end} />
              </ToolbarButton>
            </ToolbarGroup>
            <ToolbarGroup aria-label="Format">
              <ToolbarToggle icon aria-label="Bold" defaultPressed>
                <G d={GLYPH.bold} />
              </ToolbarToggle>
              <ToolbarToggle icon aria-label="Italic">
                <G d={GLYPH.italic} />
              </ToolbarToggle>
              <ToolbarToggle icon aria-label="Underline">
                <G d={GLYPH.under} />
              </ToolbarToggle>
              <ToolbarButton onClick={() => setLog("Clear format")}>Clear</ToolbarButton>
            </ToolbarGroup>
            <ToolbarButton primary onClick={() => setLog("Save")}>
              Save
            </ToolbarButton>
          </Toolbar>
        </div>
        <p className={ui.note} data-testid="gs-log">
          Last: {log}
        </p>
      </div>
    </div>
  );
}
