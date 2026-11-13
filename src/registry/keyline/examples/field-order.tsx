"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Field,
  FieldAffix,
  FieldDescription,
  FieldError,
  FieldFrame,
  FieldControl,
  FieldLabel,
  FieldTextarea,
  Form,
  FormActions,
} from "../ui/field";

const IN_STOCK = 480;

export function NewOrder() {
  const [placed, setPlaced] = useState<string | null>(null);

  return (
    <Form
      orientation="responsive"
      onFormSubmit={(v) => {
        const cases = Number(v["cases"]);
        setPlaced(
          `Order DM-4142 placed: ${cases} ${cases === 1 ? "case" : "cases"} for ${v["client"]}. Darryl has the note.`,
        );
      }}
    >
      <Field name="client">
        <FieldLabel>Client</FieldLabel>
        <FieldFrame>
          <FieldControl required defaultValue="Scranton Business Park" autoComplete="organization" />
        </FieldFrame>
        <FieldError match="valueMissing">Who is the order for?</FieldError>
      </Field>
      <Field
        name="cases"
        validate={(value) =>
          Number(value) > IN_STOCK ? `The warehouse has ${IN_STOCK} cases. Split the order or ask Darryl.` : null
        }
      >
        <FieldLabel>Quantity</FieldLabel>
        <FieldFrame>
          <FieldControl type="number" inputMode="numeric" min={1} required defaultValue="40" align="end" />
          <FieldAffix>cases</FieldAffix>
        </FieldFrame>
        <FieldDescription>20 lb copy paper, 10 reams to a case.</FieldDescription>
        <FieldError />
      </Field>
      <Field name="note">
        <FieldLabel>Delivery note</FieldLabel>
        <FieldFrame>
          <FieldTextarea rows={3} placeholder="Loading dock is round the back." />
        </FieldFrame>
        <FieldDescription>Darryl reads this before he loads the truck.</FieldDescription>
      </Field>
      <FormActions>
        <Button type="submit" variant="primary">
          Place order
        </Button>
      </FormActions>
      <p role="status" data-kl-span="control" className="min-h-5 text-[14px] text-kl-ink-2">
        {placed ?? "Try 500 cases, or clear the client."}
      </p>
    </Form>
  );
}
