import * as React from "react";
import * as ui from "../demo-ui";
import { TimeField } from "@/registry/keyline/ui/time-field";
import { DatePicker } from "@/registry/keyline/ui/date-picker";
import { Panel, PanelHeader } from "@/registry/keyline/ui/panel";
import { TODAY } from "@/registry/keyline/blocks/shipments/shipments-data";

/* ------------------------------------------------------------------ *
 * 5. Time field
 * ------------------------------------------------------------------ */
export function TimeFieldSpecimen() {
  const [date, setDate] = React.useState<Date | null>(TODAY);
  const [from, setFrom] = React.useState<string | null>("08:00");
  const [to, setTo] = React.useState<string | null>("16:00");
  const bad = from && to && from >= to;
  return (
    <div className={ui.grid2}>
      <TimeField label="Pickup" zone="CET" defaultValue="14:30" description="24-hour; arrows wrap past midnight." />
      <TimeField label="Cut-off (15-minute steps)" minuteStep={15} defaultValue="17:45" />
      <TimeField label="Empty, required" required />
      <TimeField label="Gate closes" defaultValue="23:59" invalid error="The terminal closes at 22:00." />
      <TimeField label="Driver check-in" defaultValue="06:15" disabled />
      <TimeField
        label="Earliest time the consignee accepts a delivery at the rear loading bay, Mondays"
        defaultValue="07:00"
        zone="local"
      />
      <Panel style={{ gridColumn: "1 / -1" }}>
        <PanelHeader title="Pickup slot" />
        <div className="kl-cells">
          <DatePicker
            layout="cell"
            label="Date"
            value={date}
            onValueChange={setDate}
            today={TODAY}
            defaultMonth={TODAY}
          />
          <TimeField
            layout="cell"
            label="From"
            value={from}
            onValueChange={setFrom}
            invalid={!!bad}
            error="Must be before the end."
          />
          <TimeField layout="cell" label="To" value={to} onValueChange={setTo} invalid={!!bad} />
        </div>
      </Panel>
      <p className={ui.note} data-testid="specimen-slot">
        Slot: {date ? date.toDateString() : "no date"}, {from ?? "––:––"}–{to ?? "––:––"}
        {bad ? " (end is before start)" : ""}
      </p>
    </div>
  );
}
