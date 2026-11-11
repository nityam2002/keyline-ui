"use client";

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { scopeProps, useKeylineScope } from "../lib/keyline-scope"
import { DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog"

/* A sheet is a region docked to an edge of the viewport. Behaviour is Base UI Dialog (focus trap, return
   focus, Escape, scroll lock, modal or not); the parts below only add construction and motion. */
const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

type SheetContentProps = React.ComponentProps<typeof DialogPrimitive.Popup> & {
  /** end: the inline-end edge (mirrors in RTL) · start · bottom. */
  side?: "end" | "start" | "bottom"
  /** Width (end/start) or height (bottom) in px or any CSS length. */
  size?: number | string
  container?: React.ComponentProps<typeof DialogPrimitive.Portal>["container"]
}

/**
 * The frame draws only the edge that faces the page (3px, region weight); the edges against the viewport
 * are the screen's. The cut, when on, sits on the inner top corner, the one corner that is not against
 * the viewport. It unfolds from the docked edge and folds back to it.
 */
function SheetContent({ side = "end", size, className, container, style, children, ...props }: SheetContentProps) {
  const [marker, scope, probe] = useKeylineScope(false, container)
  const len = typeof size === "number" ? `${size}px` : size
  return (
    <>
      {marker}
      <DialogPrimitive.Portal container={container}>
        {probe}
        <DialogPrimitive.Backdrop {...scopeProps(scope, { className: "kl-scrim" })} />
        <div {...scopeProps(scope, { className: "kl-dialog-scope" })}>
          <DialogPrimitive.Popup
            data-slot="sheet"
            data-side={side}
            className={cn("kl-frame kl-sheet", className)}
            style={(state) => ({ ...(len ? { "--kl-sheet-size": len } : null), ...(typeof style === "function" ? style(state) : style) }) as React.CSSProperties}
            {...props}
          >
            {children}
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </>
  )
}

const SheetHeader = DialogHeader
const SheetBody = DialogBody
const SheetFooter = DialogFooter
const SheetTitle = DialogTitle
const SheetDescription = DialogDescription

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription }
