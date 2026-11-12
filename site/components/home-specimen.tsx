"use client";

import * as React from "react";
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
        <ol className="s-legend" aria-label="How the parts join">
          <li>
            <span className="s-legend-n">1</span>
            <span className="s-legend-t">
              <b>Frame.</b> The cut. One 3px edge around the region, like a printer&rsquo;s keyline: it holds every part
              in register.
            </span>
          </li>
          <li>
            <span className="s-legend-n">2</span>
            <span className="s-legend-t">
              <b>Seam.</b> The fold. One 1px line where two parts meet, drawn by only one of them.
            </span>
          </li>
          <li>
            <span className="s-legend-n">3</span>
            <span className="s-legend-t">
              <b>Cell.</b> The keypoint. State lives in a cell; when the width runs out, a toolbar&rsquo;s filter flows
              into More and stays checked.
            </span>
          </li>
        </ol>
        <div className="s-tb-act">{actions}</div>
      </footer>
    </>
  );
}
