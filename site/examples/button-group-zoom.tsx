"use client";

import { useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/keyline/ui/button-group";

export function ReportZoom() {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="grid gap-4">
      <ButtonGroup aria-label="Zoom the quarterly sales report" className="justify-self-start">
        <Button
          layout="cell"
          size="icon"
          aria-label="Zoom out"
          disabled={zoom <= 50}
          onClick={() => setZoom(zoom - 25)}
        >
          −
        </Button>
        <ButtonGroupText className="min-w-[7ch] justify-center tabular-nums">
          <bdi>{zoom}%</bdi>
        </ButtonGroupText>
        <Button
          layout="cell"
          size="icon"
          aria-label="Zoom in"
          disabled={zoom >= 200}
          onClick={() => setZoom(zoom + 25)}
        >
          +
        </Button>
        <ButtonGroupSeparator />
        <Button layout="cell" disabled={zoom === 100} onClick={() => setZoom(100)}>
          Actual size
        </Button>
      </ButtonGroup>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        Q3 sales report, Scranton branch · shown at {zoom}%
      </p>
    </div>
  );
}
