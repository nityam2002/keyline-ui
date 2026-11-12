"use client";

import { useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogPopup,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/keyline/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldFrame,
  FieldInput,
  FieldLabel,
  Form,
} from "@/components/keyline/ui/field";

export function NewClient() {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState(["Lackawanna County", "Blue Cross of Pennsylvania"]);

  return (
    <div className="grid gap-4">
      <ul aria-label="Clients" className="m-0 grid list-none gap-2 p-0 text-[14px]">
        {clients.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button className="justify-self-start" />}>Add a client</DialogTrigger>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Add a client</DialogTitle>
            <DialogDescription>They join Dwight&apos;s accounts until you assign a rep.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            {/* the footer's submit button names this form, so the form can stay in the scrolling body */}
            <Form
              id="new-client"
              onFormSubmit={(v) => {
                setClients((all) => [...all, String(v["company"]).trim()]);
                setOpen(false);
              }}
            >
              <Field name="company">
                <FieldLabel>Company</FieldLabel>
                <FieldFrame>
                  <FieldInput required autoComplete="organization" />
                </FieldFrame>
                <FieldError match="valueMissing">Which company?</FieldError>
              </Field>
              <Field name="contact">
                <FieldLabel>Contact</FieldLabel>
                <FieldFrame>
                  <FieldInput autoComplete="name" />
                </FieldFrame>
                <FieldDescription>Who orders the paper.</FieldDescription>
              </Field>
            </Form>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button layout="cell" />}>Cancel</DialogClose>
            <Button layout="cell" variant="primary" type="submit" form="new-client">
              Add client
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
