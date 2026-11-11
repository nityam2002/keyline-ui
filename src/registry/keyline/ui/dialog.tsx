"use client";

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { AlertDialog as AlertPrimitive } from "@base-ui/react/alert-dialog"

import { cn } from "@/lib/utils"
import { ScrollArea } from "./scroll-area"
import { scopeProps, useKeylineScope } from "../lib/keyline-scope"

/* Modal surfaces are region frames: 3px, region cut. They are the only overlays that carry a cut,
   because they are not attached to an owner. */

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

function DialogContent({ className, container, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Popup> & { container?: React.ComponentProps<typeof DialogPrimitive.Portal>["container"] }) {
  const [marker, scope, probe] = useKeylineScope(false, container)
  return (
    <>
      {marker}
      <DialogPrimitive.Portal container={container}>
        {probe}
        <DialogPrimitive.Backdrop {...scopeProps(scope, { className: "kl-scrim" })} />
        <div {...scopeProps(scope, { className: "kl-dialog-scope" })}>
          <DialogPrimitive.Popup data-slot="dialog" className={cn("kl-frame kl-dialog", className)} {...props}>
            {children}
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </>
  )
}

/** Header cell row of a dialog: title, description, optional close. Reserves the cut's room. */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("kl-dialog-h", className)} {...props} />
}
/** Body: padded, scrolls when the dialog hits its max height. Fields and groups go here, standalone (2px). */
/** The dialog's scrolling body: a Keyline Scroll Area; `className` lays out the content. */
function DialogBody({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <ScrollArea data-slot="dialog-body" className="kl-dialog-scroll" contentClassName={cn("kl-dialog-b", className)} {...(props as object)}>
      {children}
    </ScrollArea>
  )
}
/** Footer: a row of cells (use Button layout="cell") sharing the dialog's bottom keyline. */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("kl-cells kl-dialog-f", className)} {...props} />
}
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("kl-dialog-title", className)} {...props} />
}
function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("kl-dialog-desc", className)} {...props} />
}

/* ---------- confirmation (alert) dialog ---------- */

const AlertDialog = AlertPrimitive.Root
const AlertDialogTrigger = AlertPrimitive.Trigger

type AlertContentProps = React.ComponentProps<typeof AlertPrimitive.Popup> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** The safe action receives initial focus. */
  cancelLabel: string
  confirmLabel: string
  onConfirm: () => void
  tone?: "destructive" | "primary"
  container?: React.ComponentProps<typeof AlertPrimitive.Portal>["container"]
}

function AlertDialogContent({ title, description, cancelLabel, confirmLabel, onConfirm, tone = "destructive", children, className, container, ...props }: AlertContentProps) {
  const safe = React.useRef<HTMLButtonElement>(null)
  const [marker, scope, probe] = useKeylineScope(false, container)
  return (
    <>
    {marker}
    <AlertPrimitive.Portal container={container}>
      {probe}
      <AlertPrimitive.Backdrop {...scopeProps(scope, { className: "kl-scrim" })} />
      <div {...scopeProps(scope, { className: "kl-dialog-scope" })}>
      <AlertPrimitive.Popup data-slot="alert-dialog" data-tone={tone} initialFocus={safe} className={cn("kl-frame kl-rows kl-dialog kl-alert", className)} {...props}>
        <div className="kl-cells kl-alert-head">
          <span className="kl-alert-sig" aria-hidden>
            {tone === "destructive" ? "!" : "?"}
          </span>
          <div className="kl-alert-t">
            <AlertPrimitive.Title className="kl-dialog-title">{title}</AlertPrimitive.Title>
            {description ? <AlertPrimitive.Description className="kl-dialog-desc">{description}</AlertPrimitive.Description> : null}
          </div>
        </div>
        {children ? <div className="kl-alert-body">{children}</div> : null}
        <div className="kl-cells kl-alert-foot">
          <AlertPrimitive.Close ref={safe} className="kl-cell kl-key kl-alert-btn">
            <span>{cancelLabel}</span>
          </AlertPrimitive.Close>
          <AlertPrimitive.Close className={cn("kl-cell kl-key kl-alert-btn", tone === "destructive" ? "kl-alert-danger" : "kl-alert-primary")} onClick={onConfirm}>
            <span>{confirmLabel}</span>
          </AlertPrimitive.Close>
        </div>
      </AlertPrimitive.Popup>
      </div>
    </AlertPrimitive.Portal>
    </>
  )
}

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription, AlertDialog, AlertDialogTrigger, AlertDialogContent }
