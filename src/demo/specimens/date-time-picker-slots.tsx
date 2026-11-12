import * as React from "react";
import * as ui from "../demo-ui";
import { DateTimePicker } from "@/registry/keyline/ui/date-picker";
import { TODAY } from "@/registry/keyline/blocks/shipments/shipments-data";

/* ------------------------------------------------------------------ *
 * 3. Unavailable time slots in the DateTimePicker
 * ------------------------------------------------------------------ */
const HALF_HOURS = Array.from(
  { length: 16 },
  (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
);
const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
// dock 4's bookings: a few slots on most days, every slot on 12 November; Sundays the dock is shut
const BOOKED: Record<string, string[]> = {
  "2026-11-9": ["08:00", "08:30", "10:00", "13:30"],
  "2026-11-10": ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00"],
  "2026-11-11": ["08:00", "12:00", "12:30"],
  "2026-11-12": HALF_HOURS,
  "2026-11-13": ["15:00", "15:30"],
};
const dockSlots = (d: Date) => (d.getDay() === 0 ? [] : d.getDay() === 6 ? HALF_HOURS.slice(0, 8) : HALF_HOURS);
const dockBooked = (d: Date, t: string) =>
  BOOKED[ymd(d)]?.includes(t) ? "booked" : t === "12:00" || t === "12:30" ? "lunch" : false;
export function TimeSlotsSpecimen() {
  const [v, setV] = React.useState<Date | null>(null);
  return (
    <div className={ui.stack} data-testid="specimen-slots">
      <div className={ui.group}>
        <h3 className={ui.cap}>
          Dock 4: half-hour slots, booked ones hatched; 12 Nov is fully booked, Sundays have no slots
        </h3>
        <div style={{ maxWidth: 360 }} data-testid="ts-pick">
          <DateTimePicker
            label="Unloading slot"
            today={TODAY}
            defaultMonth={TODAY}
            min={TODAY}
            slots={dockSlots}
            isTimeUnavailable={dockBooked}
            zone="CET"
            value={v}
            onValueChange={setV}
            name="slot"
          />
        </div>
        <p className={ui.note} data-testid="ts-log">
          Value:{" "}
          {v ? `${ymd(v)} ${String(v.getHours()).padStart(2, "0")}:${String(v.getMinutes()).padStart(2, "0")}` : "—"}
        </p>
      </div>
      <div className={ui.group}>
        <h3 className={ui.cap}>Without slots: a typed time that is booked is invalid</h3>
        <div style={{ maxWidth: 360 }} data-testid="ts-typed">
          <DateTimePicker
            label="Typed time"
            today={TODAY}
            defaultValue={new Date(2026, 10, 10, 9, 0)}
            isTimeUnavailable={dockBooked}
            validationMode="onChange"
          />
        </div>
      </div>
      <div className={ui.group}>
        <h3 className={ui.cap}>12-hour, en-US</h3>
        <div style={{ maxWidth: 360 }} data-testid="ts-12">
          <DateTimePicker
            label="Pickup (12-hour)"
            today={TODAY}
            defaultMonth={TODAY}
            slots={HALF_HOURS}
            isTimeUnavailable={dockBooked}
            hourCycle={12}
            locale="en-US"
          />
        </div>
      </div>
    </div>
  );
}
