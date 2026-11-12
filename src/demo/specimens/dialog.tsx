import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
} from "@/registry/keyline/ui/dialog";
import { Field, FieldLabel, FieldFrame, FieldControl, FieldDescription, FieldError } from "@/registry/keyline/ui/field";

/* ------------------------------------------------------------------ *
 * 2. Dialog and alert dialog
 * ------------------------------------------------------------------ */
export function DialogSpecimen() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("Late arrivals");
  const [draft, setDraft] = React.useState(name);
  return (
    <div className={ui.row} data-testid="specimen-dialog">
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o) setDraft(name);
        }}
      >
        <DialogTrigger render={<Button />}>Rename view…</DialogTrigger>
        <DialogPopup>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) {
                setName(draft.trim());
                setOpen(false);
              }
            }}
            style={{ display: "contents" }}
          >
            <DialogHeader>
              <DialogTitle>Rename view</DialogTitle>
              <DialogDescription>Everyone on the team sees the new name.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field invalid={!draft.trim()}>
                <FieldLabel>Name</FieldLabel>
                <FieldFrame>
                  {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- a rename dialog opens with its field focused */}
                  <FieldControl value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
                </FieldFrame>
                <FieldDescription>Up to 40 characters.</FieldDescription>
                <FieldError match>Give the view a name.</FieldError>
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogClose render={<Button layout="cell" />}>Cancel</DialogClose>
              <Button layout="cell" variant="primary" type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>
      <span className={ui.note}>
        View: <b>{name}</b>
      </span>
    </div>
  );
}
export function AlertDialogSpecimen() {
  const [last, setLast] = React.useState("—");
  return (
    <div className={ui.row} data-testid="specimen-alert">
      <AlertDialog onOpenChange={(o) => !o && setLast((l) => (l === "Deleted" ? l : "Kept"))}>
        <AlertDialogTrigger render={<Button variant="destructive" />} onClick={() => setLast("—")}>
          Delete view…
        </AlertDialogTrigger>
        <AlertDialogContent
          title="Delete “Late arrivals”?"
          description="The view's filters and columns are lost. Shipments are not affected."
          cancelLabel="Keep view"
          confirmLabel="Delete view"
          onConfirm={() => setLast("Deleted")}
        />
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Publish schedule…</AlertDialogTrigger>
        <AlertDialogContent
          tone="primary"
          title="Publish the dock schedule?"
          description="Carriers are notified of 14 slot changes."
          cancelLabel="Not yet"
          confirmLabel="Publish"
          onConfirm={() => setLast("Published")}
        />
      </AlertDialog>
      <span className={ui.note} aria-live="polite">
        Last answer: <b>{last}</b>
      </span>
    </div>
  );
}
