import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Panel } from "@/registry/keyline/ui/panel"
import { ScrollArea } from "@/registry/keyline/ui/scroll-area"

/* The scroll area's reveal, grip and release (after macOS overlay scrollbars), on every axis.
   Public API only: props and Tailwind; data-testid hooks for the browser specs. */

const EVENTS = [
  ["08:02", "SH-20481", "Departed Hamburg hub"],
  ["08:14", "SH-20476", "Customs cleared at Rotterdam"],
  ["08:31", "SH-20487", "Pickup booked for 9 Nov, 08:00–10:00"],
  ["08:44", "SH-20484", "Awaiting export documents from the shipper"],
  ["09:03", "SH-20489", "Delivered, signed by M. Costa"],
  ["09:12", "SH-20485", "ETA moved from 15 Nov to 16 Nov"],
  ["09:20", "SH-20490", "Temperature log uploaded (2–8 °C held)"],
  ["09:41", "SH-20491", "Seal 448 210 confirmed against the manifest"],
  ["10:05", "SH-20492", "Reefer unit TR-4492 plugged in at bay 2"],
  ["10:22", "SH-20493", "Return load assigned to dock 4"],
]
const DOCKS = Array.from({ length: 14 }, (_, i) => `Dock ${i + 1}`)
const HOURS = Array.from({ length: 18 }, (_, i) => `${String(6 + i).padStart(2, "0")}:00`)
/** A list whose rows end in a link at the bar's edge: the edge zone must leave it clickable. */
function Activity({ extra }: { extra: number }) {
  const rows = [...EVENTS, ...EVENTS.slice(0, extra).map(([t, id, s]) => [t, `${id}b`, `${s} (again)`])]
  return (
    <ul className="m-0 list-none p-0">
      {rows.map(([t, id, s]) => (
        <li key={id} className="flex items-baseline gap-3 border-b border-kl-line-soft px-3 py-2 last:border-b-0">
          <time className="font-mono text-[11px] text-kl-ink-2">{t}</time>
          <span className="min-w-0 flex-1">{s}</span>
          <a href={`#/specimen?shipment=${id}`} onClick={(e) => e.preventDefault()} className="font-mono text-[11px] text-kl-cobalt-text" data-testid="sa-edge-link">
            {id}
          </a>
        </li>
      ))}
    </ul>
  )
}
export function ScrollAreaSpecimen() {
  const [extra, setExtra] = React.useState(0)
  return (
    <div className={ui.stack}>
      <div className={ui.row}>
        <Button size="compact" onClick={() => setExtra((n) => Math.min(EVENTS.length, n + 5))} data-testid="sa-grow">
          Add five rows
        </Button>
        <Button size="compact" onClick={() => setExtra(0)} data-testid="sa-shrink">
          Remove them
        </Button>
      </div>
      <div className={ui.grid2}>
        <div className={ui.group}>
          <p className={ui.cap}>Vertical. Scroll, or point at the bar's cell: the thumb reveals, widens and fades.</p>
          <Panel className="h-56" data-testid="sa-v-frame">
            <ScrollArea className="h-full" label="Activity" data-testid="sa-v">
              <Activity extra={extra} />
            </ScrollArea>
          </Panel>
        </div>
        <div className={ui.group}>
          <p className={ui.cap}>Horizontal: a row of docks wider than its frame</p>
          <Panel data-testid="sa-h-frame">
            <ScrollArea scrollbars="horizontal" label="Docks" data-testid="sa-h">
              <div className="flex w-max">
                {DOCKS.map((d) => (
                  <div key={d} className="w-28 shrink-0 border-e border-kl-line-soft px-3 py-3 text-[13px] last:border-e-0">
                    <div className="font-bold">{d}</div>
                    <div className="font-mono text-[11px] text-kl-ink-2">free</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Panel>
        </div>
        <div className={ui.group}>
          <p className={ui.cap}>Both axes: the corner cell closes the L-junction; each thumb reveals for its own axis</p>
          <Panel className="h-56" data-testid="sa-both-frame">
            <ScrollArea scrollbars="both" className="h-full" label="Dock schedule" data-testid="sa-both">
              <table className="border-collapse text-[12px]">
                <tbody>
                  {DOCKS.map((d) => (
                    <tr key={d}>
                      <th className="sticky start-0 bg-kl-cell px-3 py-1.5 text-start whitespace-nowrap">{d}</th>
                      {HOURS.map((h) => (
                        <td key={h} className="border-s border-kl-line-soft px-3 py-1.5 font-mono text-[11px] whitespace-nowrap text-kl-ink-2">
                          {h}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </Panel>
        </div>
        <div className={`${ui.group} col-span-full`}>
          <p className={ui.cap}>scrollbarVisibility="always" (a classic-scrollbar platform), and the rail of a region that is not a frame</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-kl-gutter">
            <Panel className="h-56">
              <ScrollArea className="h-full" scrollbarVisibility="always" label="Activity, bar always shown" data-testid="sa-always">
                <Activity extra={0} />
              </ScrollArea>
            </Panel>
            <ScrollArea className="h-56" track="rail" label="Activity on a rail" data-testid="sa-rail">
              <Activity extra={0} />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
