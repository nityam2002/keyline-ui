"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Field, FieldFrame, FieldLabel, FieldTextarea } from "../ui/field";
import {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverPopup,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from "../ui/popover";

export function DeliveryNote() {
  const [note, setNote] = useState("Loading dock is round the back.");
  const [draft, setDraft] = useState(note);

  return (
    <div className="grid gap-3 text-[14px]">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          <span className="font-kl-mono text-[13px]">DM-4107</span> · Lackawanna County
        </span>
        <Popover onOpenChange={(o) => o && setDraft(note)}>
          <PopoverTrigger render={<Button size="compact" />}>Delivery note</PopoverTrigger>
          <PopoverPopup className="w-[min(340px,calc(100vw-24px))]">
            <PopoverHeader title="Delivery note" description="Darryl reads it before he loads the truck." />
            <PopoverBody>
              <Field>
                <FieldLabel className="sr-only">Note</FieldLabel>
                <FieldFrame>
                  <FieldTextarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
                </FieldFrame>
              </Field>
            </PopoverBody>
            <PopoverFooter>
              <PopoverClose render={<Button layout="cell" />}>Cancel</PopoverClose>
              <PopoverClose render={<Button layout="cell" variant="primary" onClick={() => setNote(draft.trim())} />}>
                Save note
              </PopoverClose>
            </PopoverFooter>
          </PopoverPopup>
        </Popover>
      </div>
      <p role="status" className="m-0 text-kl-ink-2">
        {note ? `Note: ${note}` : "No delivery note."}
      </p>
    </div>
  );
}
