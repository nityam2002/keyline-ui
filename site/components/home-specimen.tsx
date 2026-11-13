"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ACTION_BUTTONS } from "@site/lib/action-buttons";
import { HeroPlates } from "@site/components/hero-plates";

/* Sheet 1's body: the plates on the land, and the title block where a drawing keeps its name, its legend and
   its next step. Turning a plate is a change under the mark, so the mark absorbs it (site.css: Absorb). */
export function HomeSpecimen({ identity, actions }: { identity: React.ReactNode; actions: React.ReactNode }) {
  const idRef = React.useRef<HTMLDivElement>(null);
  const absorb = React.useCallback(() => {
    const glyph = idRef.current?.querySelector<SVGElement>(".s-mark-glyph");
    if (!glyph) return;
    glyph.removeAttribute("data-absorb");
    void glyph.getBoundingClientRect();
    glyph.setAttribute("data-absorb", "");
  }, []);

  return (
    <>
      <div className="s-map">
        <HeroPlates onTurn={absorb} />
      </div>

      <footer className="s-block">
        <div className="s-tb-id" ref={idRef}>
          {identity}
        </div>
        <ol className="s-legend" aria-label="What that means">
          <li>
            <span className="s-legend-n">1</span>
            <span className="s-legend-t">
              <b>Related controls touch.</b> A field and its unit, a button and its count: one frame, one shared line.
              Unrelated groups sit a full gap apart.
            </span>
          </li>
          <li>
            <span className="s-legend-n">2</span>
            <span className="s-legend-t">
              <b>Line weight shows the role.</b> 3px around a region, 2px around a control, 1px between cells.
            </span>
          </li>
          <li>
            <span className="s-legend-n">3</span>
            <span className="s-legend-t">
              <b>State stays in place.</b> A selection, an error or a finished task fills its own cell. Nothing around
              it moves.
            </span>
          </li>
        </ol>
        <div className={cn("s-tb-act **:data-[slot=button]:justify-center", ACTION_BUTTONS)}>{actions}</div>
      </footer>
    </>
  );
}
