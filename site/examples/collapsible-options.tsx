"use client";

import { useState } from "react";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/keyline/ui/collapsible";
import { Field, FieldDescription, FieldFrame, FieldInput, FieldLabel } from "@/components/keyline/ui/field";
import { SwitchField } from "@/components/keyline/ui/switch";

export function DeliveryOptions() {
  const [liftgate, setLiftgate] = useState(false);
  const [window, setWindow] = useState("");
  const set = (liftgate ? 1 : 0) + (window ? 1 : 0);

  return (
    <div className="grid max-w-[420px] gap-4">
      <Field>
        <FieldLabel>Deliver to</FieldLabel>
        <FieldFrame>
          <FieldInput defaultValue="200 North Washington Avenue" />
        </FieldFrame>
      </Field>
      <Collapsible>
        <CollapsibleTrigger meta={set ? `${set} set` : undefined}>Delivery options</CollapsibleTrigger>
        <CollapsiblePanel className="grid gap-4">
          <SwitchField
            label="Liftgate truck"
            description="For a dock without a ramp."
            checked={liftgate}
            onCheckedChange={setLiftgate}
          />
          <Field>
            <FieldLabel>Delivery window</FieldLabel>
            <FieldFrame>
              <FieldInput value={window} onChange={(e) => setWindow(e.target.value)} placeholder="9:00 to 11:00" />
            </FieldFrame>
            <FieldDescription>Darryl plans the route the night before.</FieldDescription>
          </Field>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}
