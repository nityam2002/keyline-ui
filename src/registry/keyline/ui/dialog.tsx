"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlertDialog as AlertPrimitive } from "@base-ui/react/alert-dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* Modal surfaces are region frames: 3px, region cut. They are the only overlays that carry a cut,
   because they are not attached to an owner. Parts are named as Base UI names them; AlertDialog's Title,
   Description, Close and Backdrop are Dialog's own parts in Base UI, so the Dialog parts serve both. */

const DialogRoot = DialogPrimitive.Root;
const Dialog = DialogRoot;

/** The element that opens the dialog. Rendered as another part (`render={<Button />}`), the element is that part's
 * and carries its data-slot. */
function DialogTrigger(props: DialogPrimitive.Trigger.Props): React.ReactElement {
  return <DialogPrimitive.Trigger {...props} data-slot="dialog-trigger" />;
}

function DialogClose(props: DialogPrimitive.Close.Props): React.ReactElement {
  return <DialogPrimitive.Close {...props} data-slot="dialog-close" />;
}

/** The scrim behind a modal surface. It fades in with the surface and leaves with it, not after it. */
function DialogBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <DialogPrimitive.Backdrop
      className={resolveClassName(
        cn(
          "fixed inset-0 z-(--kl-z-overlay) bg-kl-scrim transition-opacity duration-(--kl-t-unfold) ease-linear",
          "data-ending-style:opacity-0 data-ending-style:duration-(--kl-t-fold) data-starting-style:opacity-0",
        ),
        className,
      )}
      {...props}
      data-slot="dialog-backdrop"
    />
  );
}

/*
 * The modal frame: fixed, centred, region weight, lifted to the overlay surface. It unfolds from its top keyline
 * (clip-path) and folds back to it. A closing dialog is inert: a second click 60ms after the first landed on its
 * confirm button and ran it twice.
 */
const modal = cn(
  "kl-frame fixed inset-x-0 top-[14vh] z-(--kl-z-overlay) mx-auto max-h-[calc(100vh-20vh)] text-kl-ink outline-0",
  "[--kl-cell:var(--kl-raised)]",
  "transition-[clip-path] duration-(--kl-t-unfold) ease-(--kl-ease-out) [clip-path:inset(-8px)]",
  "data-ending-style:[clip-path:inset(0_0_100%_0)] data-starting-style:[clip-path:inset(0_0_100%_0)]",
  "data-ending-style:pointer-events-none data-ending-style:duration-(--kl-t-fold) data-ending-style:ease-(--kl-ease-in)",
);

type PortalProps = {
  /** Where the portal renders (defaults to <body>). */
  container?: DialogPrimitive.Portal.Props["container"];
  /** Props for Base UI's Dialog.Portal. */
  portalProps?: Omit<DialogPrimitive.Portal.Props, "container" | "children">;
};

/** Portal, backdrop and the configuration of the place the surface is written, around a popup. */
function ModalPortal({
  container,
  portalProps,
  children,
}: PortalProps & { children: React.ReactNode }): React.ReactElement {
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <DialogPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <DialogBackdrop {...scopeProps(scope)} />
        {/* carries the scope to the popup without a box of its own */}
        <div {...scopeProps(scope, { className: "contents" })}>{children}</div>
      </DialogPrimitive.Portal>
    </>
  );
}

type DialogPopupProps = DialogPrimitive.Popup.Props & PortalProps;

/**
 * The dialog: Base UI's Portal, Backdrop and Popup in one part. A region frame over a scrim, with a header, a body
 * that scrolls and a footer of cells. It carries the configuration (cut, density, motion, theme, dir) of the place
 * it is written, not of <body>.
 */
function DialogPopup({ className, container, portalProps, ...props }: DialogPopupProps): React.ReactElement {
  return (
    <ModalPortal container={container} portalProps={portalProps}>
      <DialogPrimitive.Popup
        className={resolveClassName(cn(modal, "flex w-[min(560px,calc(100vw-32px))] flex-col"), className)}
        {...props}
        data-slot="dialog-popup"
      />
    </ModalPortal>
  );
}

type PartState = Record<string, never>;
const PART_STATE: PartState = {};

/** Header cell row of a dialog: title, description, optional close. Reserves the cut's room. */
function DialogHeader({ render, className, style, ...props }: PartProps<"div", PartState>): React.ReactElement {
  const own = {
    "data-slot": "dialog-header",
    className: resolveClassName(
      cn(
        "grid flex-none gap-1 border-b-(length:--kl-k3) border-b-kl-line pe-[18px] pt-4 pb-3.5",
        "ps-[calc(18px+var(--kl-c-room,0px))]",
      ),
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

type DialogBodyProps = Omit<React.ComponentProps<typeof ScrollArea>, "className" | "style"> & {
  className?: string | ((state: PartState) => string | undefined);
  style?: React.CSSProperties | ((state: PartState) => React.CSSProperties | undefined);
};

/** The dialog's scrolling body: a Keyline Scroll Area. `className` and `style` reach the scroll area itself;
 * `contentClassName` lays out the content (a grid with a 16px gap by default). Fields and groups go here, standalone
 * (2px). */
function DialogBody({ className, style, contentClassName, children, ...props }: DialogBodyProps): React.ReactElement {
  return (
    <ScrollArea
      className={resolveClassName("min-h-0 flex-[1_1_auto]", className)(PART_STATE)}
      style={resolveStyle(undefined, style)(PART_STATE)}
      viewportClassName="overscroll-contain"
      contentClassName={cn("grid content-start gap-4 p-[18px]", contentClassName)}
      {...props}
      data-slot="dialog-body"
    >
      {children}
    </ScrollArea>
  );
}

/** Footer: a row of cells (use Button layout="cell") sharing the dialog's bottom keyline. */
function DialogFooter({ render, className, style, ...props }: PartProps<"div", PartState>): React.ReactElement {
  const own = {
    "data-slot": "dialog-footer",
    className: resolveClassName(
      "kl-cells flex-none border-t-(length:--kl-k3) border-t-kl-line *:min-w-0 *:flex-[1_1_0]",
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props): React.ReactElement {
  return (
    <DialogPrimitive.Title
      className={resolveClassName("m-0 text-(length:--kl-text-title)/[1.2] font-(--kl-weight-strong)", className)}
      {...props}
      data-slot="dialog-title"
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props): React.ReactElement {
  return (
    <DialogPrimitive.Description
      className={resolveClassName("m-0 text-kl-ink-2", className)}
      {...props}
      data-slot="dialog-description"
    />
  );
}

/* ---------- confirmation (alert) dialog ---------- */

const AlertDialogRoot = AlertPrimitive.Root;
const AlertDialog = AlertDialogRoot;

function AlertDialogTrigger(props: AlertPrimitive.Trigger.Props): React.ReactElement {
  return <AlertPrimitive.Trigger {...props} data-slot="alert-dialog-trigger" />;
}

type Tone = "destructive" | "primary";

type AlertDialogPopupProps = DialogPrimitive.Popup.Props &
  PortalProps & {
    /** The signal of the question: red attention for a destructive action, cobalt for a commitment. */
    tone?: Tone;
  };

/** The confirmation frame: Base UI's Portal, Backdrop and Popup in one part. A narrower region of rows. */
function AlertDialogPopup({
  tone = "destructive",
  className,
  container,
  portalProps,
  ...props
}: AlertDialogPopupProps): React.ReactElement {
  return (
    <ModalPortal container={container} portalProps={portalProps}>
      <AlertPrimitive.Popup
        data-tone={tone}
        className={resolveClassName(cn(modal, "kl-rows w-[min(480px,calc(100vw-32px))]"), className)}
        {...props}
        data-slot="alert-dialog-popup"
      />
    </ModalPortal>
  );
}

/* the two answers: cells of the footer, the confirm cell flooded with the tone */
const answer =
  "kl-cell kl-key min-h-[52px] flex-1 justify-center text-(length:--kl-text-lead) font-(--kl-weight-strong)";
const confirmTone: Record<Tone, string> = {
  destructive: cn(
    "bg-kl-red text-kl-on-red hover:bg-kl-red-hi focus-visible:outline-current",
    "forced-colors:bg-[Mark] forced-colors:text-[MarkText] forced-colors:forced-color-adjust-none",
  ),
  primary: "bg-kl-cobalt text-kl-on-cobalt hover:bg-kl-cobalt-hi focus-visible:outline-current",
};

type AlertDialogContentProps = Omit<AlertDialogPopupProps, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The safe action receives initial focus. */
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
};

/**
 * The usual confirmation, built from the parts: an attention cell (! or ?) beside the question, optional detail, and
 * two answers on the bottom keyline. Focus lands on the safe answer.
 */
function AlertDialogContent({
  title,
  description,
  cancelLabel,
  confirmLabel,
  onConfirm,
  tone = "destructive",
  children,
  ...props
}: AlertDialogContentProps): React.ReactElement {
  const safe = React.useRef<HTMLButtonElement>(null);
  return (
    <AlertDialogPopup tone={tone} initialFocus={safe} {...props}>
      <div data-slot="alert-dialog-header" className="kl-cells min-h-20">
        <span
          data-slot="alert-dialog-signal"
          aria-hidden
          className={cn(
            // a glyph pinned to its fixed 60px cell, not text: it does not follow the type scale
            "grid w-[60px] flex-none place-items-center text-[26px] font-(--kl-weight-display)",
            tone === "destructive" ? "bg-kl-red text-kl-on-red" : "bg-kl-cobalt text-kl-on-cobalt",
            "forced-colors:bg-[Mark] forced-colors:text-[MarkText] forced-colors:forced-color-adjust-none",
          )}
        >
          {tone === "destructive" ? "!" : "?"}
        </span>
        <div className="grid flex-1 content-center gap-1.5 px-[18px] py-3.5">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </div>
      </div>
      {children ? (
        <div data-slot="alert-dialog-body" className="grid gap-2.5 px-[18px] py-4">
          {children}
        </div>
      ) : null}
      {/* the footer is a row of the frame (kl-rows draws its top keyline) at region weight */}
      <div data-slot="alert-dialog-footer" className="kl-cells border-t-(length:--kl-k3)">
        <AlertPrimitive.Close ref={safe} className={answer} data-slot="alert-dialog-cancel">
          <span>{cancelLabel}</span>
        </AlertPrimitive.Close>
        <AlertPrimitive.Close
          className={cn(answer, confirmTone[tone])}
          onClick={onConfirm}
          data-slot="alert-dialog-confirm"
        >
          <span>{confirmLabel}</span>
        </AlertPrimitive.Close>
      </div>
    </AlertDialogPopup>
  );
}

export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogClose,
  DialogBackdrop,
  DialogPopup,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogContent,
};
