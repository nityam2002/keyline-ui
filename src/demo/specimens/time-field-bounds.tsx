import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Form, FormActions } from "@/registry/keyline/ui/field";
import { TimeField } from "@/registry/keyline/ui/time-field";
import { DateTimePicker } from "@/registry/keyline/ui/date-picker";
import { TODAY } from "@/registry/keyline/blocks/shipments/shipments-data";

/* ------------------------------------------------------------------ *
 * 2. Time bounds
 * ------------------------------------------------------------------ */
export function TimeBoundsSpecimen() {
  const [t, setT] = React.useState<string | null>("21:30");
  const [submitted, setSubmitted] = React.useState("—");
  return (
    <div className={ui.stack} data-testid="specimen-bounds">
      <div className={ui.grid2}>
        <TimeField
          label="Gate open (06:00–22:00)"
          min="06:00"
          max="22:00"
          value={t}
          onValueChange={setT}
          minuteStep={15}
          zone="CET"
          validationMode="onChange"
          description="Arrows wrap from 22:00 to 06:00."
        />
        <TimeField
          label="Gate open (12-hour)"
          min="06:00"
          max="22:00"
          value={t}
          onValueChange={setT}
          minuteStep={15}
          hourCycle={12}
          locale="en-US"
          validationMode="onChange"
        />
        <TimeField label="Earliest only" min="08:30" defaultValue="07:00" validationMode="onChange" />
        <TimeField label="Disabled, bounded" min="06:00" max="22:00" defaultValue="12:00" disabled />
      </div>
      <p className={ui.note} data-testid="bounds-log">
        Shared value: {t ?? "null"}
      </p>
      <Form onFormSubmit={(v) => setSubmitted(JSON.stringify(v))} data-testid="bounds-form" style={{ maxWidth: 520 }}>
        <DateTimePicker
          label="Dock slot (06:00–22:00)"
          name="slot"
          required
          today={TODAY}
          defaultMonth={TODAY}
          minTime="06:00"
          maxTime="22:00"
          defaultTime="05:00"
          minuteStep={15}
        />
        <FormActions>
          <Button type="submit" variant="primary">
            Book
          </Button>
        </FormActions>
      </Form>
      <p className={ui.note} data-testid="bounds-submitted">
        Submitted: {submitted}
      </p>
    </div>
  );
}
