"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle } from "../lib/keyline-render";
import {
  DialogBackdrop,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

/* A sheet is a region docked to an edge of the viewport. Behaviour is Base UI Dialog (focus trap, return
   focus, Escape, scroll lock, modal or not); the parts below only add construction and motion. Every part but the
   popup is Dialog's own. */
const SheetRoot = DialogPrimitive.Root;
const Sheet = SheetRoot;

/*
 * The frame draws only the edge that faces the page (3px, region weight); the edges against the viewport are the
 * screen's. The cut sits on the top-start corner, and a cut is an L-junction of two keylines (C3): the bevel strokes
 * the transition between the two edges it joins, so with one of them at 0px its diagonal tapers to nothing. Each side
 * therefore draws both keylines that meet at that corner, at region weight:
 * - end: the page-facing start edge and the top edge (the region's top, against the top of the screen);
 * - bottom: the page-facing top edge and the start edge;
 * - start: the corner is the screen's own corner, so this side keeps no cut.
 * It unfolds from the docked edge and folds back to it (clip-path, physical per direction). The clip-path fallback cut
 * needs room past the frame edge, so where the cut is not a corner shape the sheet is not clipped at rest.
 */
const sheet = cn(
  "kl-frame fixed z-(--kl-z-overlay) flex flex-col border-0 text-kl-ink outline-0 [--kl-cell:var(--kl-raised)]",
  "[clip-path:inset(0)] not-supports-[corner-start-start-shape:bevel]:[clip-path:none]",
  "transition-[clip-path] duration-(--kl-t-unfold) ease-(--kl-ease-out)",
  "data-ending-style:pointer-events-none data-ending-style:duration-(--kl-t-fold) data-ending-style:ease-(--kl-ease-in)",
  "data-[side=end]:inset-y-0 data-[side=end]:end-0 data-[side=end]:w-[min(var(--kl-sheet-size,440px),calc(100vw-40px))]",
  "data-[side=end]:border-s-(length:--kl-k3) data-[side=end]:border-t-(length:--kl-k3)",
  "data-[side=start]:inset-y-0 data-[side=start]:start-0 data-[side=start]:w-[min(var(--kl-sheet-size,440px),calc(100vw-40px))]",
  "data-[side=start]:border-e-(length:--kl-k3) data-[side=start]:[--kl-cut-size:0px]",
  "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:max-h-[min(var(--kl-sheet-size,70vh),calc(100vh-40px))]",
  "data-[side=bottom]:border-s-(length:--kl-k3) data-[side=bottom]:border-t-(length:--kl-k3)",
  "data-[side=end]:[&:is([data-starting-style],[data-ending-style])]:[clip-path:inset(0_0_0_100%)]",
  "kl-rtl:data-[side=end]:[&:is([data-starting-style],[data-ending-style])]:[clip-path:inset(0_100%_0_0)]",
  "data-[side=start]:[&:is([data-starting-style],[data-ending-style])]:[clip-path:inset(0_100%_0_0)]",
  "kl-rtl:data-[side=start]:[&:is([data-starting-style],[data-ending-style])]:[clip-path:inset(0_0_0_100%)]",
  "data-[side=bottom]:[&:is([data-starting-style],[data-ending-style])]:[clip-path:inset(100%_0_0_0)]",
);

type SheetPopupProps = DialogPrimitive.Popup.Props & {
  /** end: the inline-end edge (mirrors in RTL) · start · bottom. */
  side?: "end" | "start" | "bottom";
  /** Width (end/start) or height (bottom) in px or any CSS length. */
  size?: number | string;
  /** Where the portal renders (defaults to <body>). */
  container?: DialogPrimitive.Portal.Props["container"];
  /** Props for Base UI's Dialog.Portal. */
  portalProps?: Omit<DialogPrimitive.Portal.Props, "container" | "children">;
};

/**
 * The sheet: Base UI's Portal, Backdrop and Popup in one part, docked to a viewport edge. It carries the
 * configuration (cut, density, motion, theme, dir) of the place it is written, not of <body>.
 */
function SheetPopup({
  side = "end",
  size,
  className,
  container,
  portalProps,
  style,
  ...props
}: SheetPopupProps): React.ReactElement {
  const [marker, scope, probe] = useKeylineScope(false, container);
  const len = typeof size === "number" ? `${size}px` : size;
  return (
    <>
      {marker}
      <DialogPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <DialogBackdrop {...scopeProps(scope)} />
        {/* carries the scope to the popup without a box of its own */}
        <div {...scopeProps(scope, { className: "contents" })}>
          <DialogPrimitive.Popup
            data-side={side}
            className={resolveClassName(sheet, className)}
            style={resolveStyle(len ? ({ "--kl-sheet-size": len } as React.CSSProperties) : undefined, style)}
            {...props}
            data-slot="sheet-popup"
          />
        </div>
      </DialogPrimitive.Portal>
    </>
  );
}

const SheetTrigger = DialogTrigger;
const SheetClose = DialogClose;
const SheetHeader = DialogHeader;
const SheetBody = DialogBody;
const SheetFooter = DialogFooter;
const SheetTitle = DialogTitle;
const SheetDescription = DialogDescription;

export {
  Sheet,
  SheetRoot,
  SheetTrigger,
  SheetClose,
  SheetPopup,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
