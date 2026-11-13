import * as React from "react";
import * as ui from "../demo-ui";
import { Calendar } from "@/registry/keyline/ui/date-picker";
import { RangeCalendar } from "@/registry/keyline/ui/date-range";
import { TODAY } from "@/registry/keyline/blocks/shipments/shipments-data";

const iso = (d: Date | null) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    : "null";
/* ------------------------------------------------------------------ *
 * 1. Calendar (react-day-picker): month and year dropdowns, min/max
 * ------------------------------------------------------------------ */
export function MonthJumpSpecimen() {
  const [d, setD] = React.useState<Date | null>(null);
  const [r, setR] = React.useState<{ from: Date; to: Date } | null>(null);
  const [b, setB] = React.useState<Date | null>(null);
  return (
    <div className={ui.stack} data-testid="specimen-jump">
      <div className={ui.split}>
        <div className={ui.group}>
          <h3 className={ui.cap}>Calendar: month and year dropdowns</h3>
          <div className="kl-ctl" style={{ display: "inline-block", justifySelf: "start" }} data-testid="jump-cal">
            <Calendar value={d} onValueChange={setD} today={TODAY} />
          </div>
          <p className={ui.note} data-testid="jump-log">
            Chosen: {iso(d)}
          </p>
        </div>
        <div className={ui.group}>
          <h3 className={ui.cap}>Range calendar (en-US, week from Sunday)</h3>
          <div className="kl-ctl" style={{ display: "inline-block", justifySelf: "start" }} data-testid="jump-range">
            <RangeCalendar value={r} onValueChange={setR} today={TODAY} locale="en-US" weekStartsOn={0} />
          </div>
        </div>
        <div className={ui.group}>
          <h3 className={ui.cap}>Bounded: 3 Nov to 4 Dec 2026</h3>
          <div className="kl-ctl" style={{ display: "inline-block", justifySelf: "start" }} data-testid="jump-bounded">
            <Calendar
              value={b}
              onValueChange={setB}
              today={TODAY}
              min={new Date(2026, 10, 3)}
              max={new Date(2026, 11, 4)}
            />
          </div>
        </div>
        <div className={ui.group} dir="rtl" data-testid="jump-rtl">
          <h3 className={ui.cap}>dir="rtl" (ar-EG)</h3>
          <div className="kl-ctl" style={{ display: "inline-block", justifySelf: "start" }}>
            <Calendar value={null} onValueChange={() => {}} today={TODAY} locale="ar-EG" weekStartsOn={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
