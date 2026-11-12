"use client";

import { useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldFrame,
  FieldControl,
  FieldLabel,
  Form,
} from "@/components/keyline/ui/field";

// stands in for your API: only today's shipments exist
const SHIPMENTS: Record<string, string> = {
  "DM-4102": "On Darryl's truck, due at Scranton Business Park by 2 PM.",
  "DM-4087": "Delivered to the Wilkes-Barre Library at 10:14 AM.",
};

export function TrackShipment() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [found, setFound] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Form
      className="max-w-[440px]"
      errors={errors}
      onFormSubmit={(v) => {
        const id = String(v["tracking"]).trim().toUpperCase();
        setBusy(true);
        setTimeout(() => {
          setBusy(false);
          if (SHIPMENTS[id]) {
            setErrors({});
            setFound(`${id}: ${SHIPMENTS[id]}`);
          } else {
            setFound(null);
            setErrors({ tracking: `No shipment ${id} today. Try DM-4102.` });
          }
        }, 600);
      }}
    >
      <Field name="tracking">
        <FieldLabel>Tracking number</FieldLabel>
        <FieldFrame>
          <FieldControl required defaultValue="DM-9999" spellCheck={false} className="font-kl-mono" />
          <Button type="submit" layout="cell" signal={busy ? "pending" : "idle"}>
            Track
          </Button>
        </FieldFrame>
        <FieldDescription>Printed on the packing slip.</FieldDescription>
        <FieldError />
      </Field>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {found}
      </p>
    </Form>
  );
}
