"use client";

import { Minus, MousePointer2, Move, Plus, Ruler } from "lucide-react";
import { useState } from "react";
import { Toolbar, ToolbarButton, ToolbarToggle, ToolbarToggleGroup } from "../ui/toolbar";

export function FloorPlanTools() {
  const [tool, setTool] = useState<string[]>(["pointer"]);
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex items-start gap-3">
      <Toolbar orientation="vertical" aria-label="Warehouse floor plan tools">
        <ToolbarToggleGroup
          aria-label="Tool"
          multiple={false}
          value={tool}
          onValueChange={(v) => v.length && setTool(v)}
        >
          <ToolbarToggle icon value="pointer" aria-label="Select">
            <MousePointer2 size={16} aria-hidden="true" />
          </ToolbarToggle>
          <ToolbarToggle icon value="pan" aria-label="Pan">
            <Move size={16} aria-hidden="true" />
          </ToolbarToggle>
          <ToolbarToggle icon value="measure" aria-label="Measure">
            <Ruler size={16} aria-hidden="true" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
        <ToolbarButton icon aria-label="Zoom in" disabled={zoom >= 200} onClick={() => setZoom((z) => z + 25)}>
          <Plus size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton icon aria-label="Zoom out" disabled={zoom <= 50} onClick={() => setZoom((z) => z - 25)}>
          <Minus size={16} aria-hidden="true" />
        </ToolbarButton>
      </Toolbar>
      <p role="status">
        Tool: {tool[0]} · zoom {zoom}%
      </p>
    </div>
  );
}
