import { land, isIndex, VIEW, TENTHS } from "@site/lib/contours"
import { Backdrop } from "@site/components/backdrop"

/** The sheet's land: contours and the keyline, one level of the same field. Decorative, behind the heading and the
 * specimen. The keypoint is not drawn here: it belongs to the control that owns the state (the plates own their state).
 *
 * This is the resting drawing, server-rendered and complete on its own (and all that reduced motion ever shows).
 * Backdrop reads these same paths back and moves them with the living terrain (terrain.ts). */
export function Land() {
  const { rings, keyline } = land()
  return (
    <Backdrop>
      <svg className="s-land" viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <g transform={`scale(${1 / TENTHS})`}>
          {rings.map((r, i) => (
            <path key={i} className={isIndex(r.level) ? "s-contour s-index" : "s-contour"} d={r.d} data-level={r.level} />
          ))}
          <path className="s-keyline" d={keyline} />
        </g>
        {rings.map((r, i) =>
          r.label ? (
            <text key={`l${i}`} className="s-elev" x={r.label.x} y={r.label.y + 4} textAnchor="middle">
              {r.label.text}
            </text>
          ) : null,
        )}
      </svg>
    </Backdrop>
  )
}

/** Crop marks: the frame's edges carried outside it, as on a printed sheet. */
export function CropMarks() {
  return (
    <span className="s-crops" aria-hidden="true">
      {["tl", "tr", "bl", "br"].map((c) => (
        <span key={c} data-c={c}>
          <i />
          <i />
        </span>
      ))}
    </span>
  )
}

/** The mark (Trap): a cobalt plate slipped out of register, held by an exact ink keyline. The frame absorbs
 * what moves. Drawn on a 22px grid (keyline 19 at 3,3, edge 3; plate 14 at 0,0; drift 3) so every edge lands on
 * whole pixels at the header size. The edge is 3, not 2: it keeps the 16-unit drawing's weight (2/16 ≈ 3/22), and
 * the opening stays 60% cobalt. The favicon (app/icon.svg) is the 16-unit drawing. Only the plate ever moves
 * (site.css: Slip on the home sheet, Absorb when a plate turns). */
export function Mark() {
  return (
    <svg className="s-mark-glyph" viewBox="0 0 22 22" width="22" height="22" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <rect className="s-mark-plate" x="0" y="0" width="14" height="14" />
      <path className="s-mark-frame" d="M3 3h19v19H3zM6 6v13h13V6z" fillRule="evenodd" />
    </svg>
  )
}
