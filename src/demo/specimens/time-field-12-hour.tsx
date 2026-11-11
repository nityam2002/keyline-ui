import * as React from "react"
import * as ui from "../demo-ui"
import { TimeField } from "@/registry/keyline/ui/time-field"

/* ------------------------------------------------------------------ *
 * 1. TimeField: 12-hour cycle and day period
 * ------------------------------------------------------------------ */
export function TimeCycleSpecimen() {
  const [t, setT] = React.useState<string | null>("14:30")
  return (
    <div className={ui.stack} data-testid="specimen-time">
      <div className={ui.grid2}>
        <TimeField label="Pickup (24-hour)" zone="CET" value={t} onValueChange={setT} />
        <TimeField label="Pickup (12-hour, en-US)" zone="CET" hourCycle={12} locale="en-US" value={t} onValueChange={setT} description="The same value: stored as 24-hour HH:MM." />
        <TimeField label="Gate (12-hour, ko)" hourCycle={12} locale="ko" defaultValue="07:05" description="The period comes first where the locale puts it." />
        <TimeField label="Empty, required, 12-hour" hourCycle={12} locale="en-GB" required />
        <TimeField label="Late slot" hourCycle={12} locale="en-US" defaultValue="23:45" invalid error="The terminal closes at 10:00 PM." />
        <TimeField label="Driver check-in" hourCycle={12} locale="en-US" defaultValue="06:15" disabled />
      </div>
      <p className={ui.note} data-testid="tc-log">
        Shared value: {t ?? "null"}
      </p>
    </div>
  )
}
