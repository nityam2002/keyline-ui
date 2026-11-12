"use client";

import * as React from "react";
import { Command as Cmdk } from "cmdk";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { Kbd } from "./kbd";
import { DialogPopup } from "./dialog";

/*
 * ⌘K command menu, as parts named as cmdk names them (cmdk owns filtering and active-item scrolling), and
 * CommandDialog, the menu in Dialog's frame. Results are numbered by a CSS counter, so the digit cell always matches
 * the visible order after filtering; ⌥1–⌥9 runs that result. Activation floods the row, then runs immediately.
 *
 *   ┌────┬──────────────────────────────────┬─────┐
 *   │ ⌕  │ Type a command…                  │ esc │   input row, on the frame's 3px keyline
 *   ├────┴──────────────────────────────────┴─────┤
 *   │ VIEW                                         │   group heading
 *   │  1 │ Show overdue                    │  12   │   digit cell · label · meta and shortcut
 *   └────┴──────────────────────────────────┴─────┘
 */

/** cmdk's root: the menu's filter and keyboard. ⌥1–⌥9 run the visible result with that number. */
function Command({ className, onKeyDown, ...props }: React.ComponentProps<typeof Cmdk>): React.ReactElement {
  return (
    <Cmdk
      className={cn("flex max-h-[inherit] flex-col", className)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || !e.altKey || !/^Digit[1-9]$/.test(e.code)) return;
        const items = e.currentTarget.querySelectorAll<HTMLElement>("[cmdk-item]:not([aria-disabled=true])");
        const el = items[Number(e.code.slice(5)) - 1];
        if (el) {
          e.preventDefault();
          el.click();
        }
      }}
      {...props}
      data-slot="command"
    />
  );
}

type CommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean, eventDetails: DialogPrimitive.Root.ChangeEventDetails) => void;
  children: React.ReactNode;
  label?: string;
  /** Class for the dialog's frame (Dialog's DialogPopup). */
  className?: string;
  /** Where the portal renders (defaults to <body>). */
  container?: DialogPrimitive.Portal.Props["container"];
  /** Props for Base UI's Dialog.Portal. */
  portalProps?: Omit<DialogPrimitive.Portal.Props, "container" | "children">;
  /** Return false when a command hands focus to another surface (e.g. opens a dialog). */
  finalFocus?: DialogPrimitive.Popup.Props["finalFocus"];
};

/** The command menu in Dialog's frame: Base UI's Dialog root and DialogPopup around Command. */
function CommandDialog({
  open,
  onOpenChange,
  children,
  label = "Command menu",
  className,
  container,
  portalProps,
  finalFocus,
}: CommandDialogProps): React.ReactElement {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {/* Dialog's frame (it carries dialog-popup's slot); the command menu is wider and not a column of rows */}
      <DialogPopup
        aria-label={label}
        className={cn("block w-[min(600px,calc(100vw-32px))] p-0", className)}
        container={container}
        portalProps={portalProps}
        finalFocus={finalFocus}
      >
        <Command label={label} loop>
          {children}
        </Command>
      </DialogPopup>
    </DialogPrimitive.Root>
  );
}

/** The query row: a search glyph cell, the input, and an esc cell, on the frame's region keyline. `className` goes
 * to the input. */
function CommandInput({ className, ...props }: React.ComponentProps<typeof Cmdk.Input>): React.ReactElement {
  return (
    <div className="kl-cells border-b-(length:--kl-k3) border-b-kl-line" data-slot="command-input-wrapper">
      {/* the first cell keeps the cut's room (--kl-c) clear */}
      <span className="kl-cell ps-[calc(14px+var(--kl-c,0px)*0.35)] pe-3.5" aria-hidden>
        <svg
          viewBox="0 0 16 16"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="square"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="m10.5 10.5 3.5 3.5" />
        </svg>
      </span>
      <Cmdk.Input
        className={cn(
          // a search field's own size, pinned: it heads the panel and does not follow density
          "min-h-[54px] min-w-0 flex-1 bg-transparent px-3.5 text-[18px] font-medium text-inherit outline-0",
          "font-(family-name:--kl-font) placeholder:text-kl-ink-3 placeholder:opacity-100",
          className,
        )}
        {...props}
        data-slot="command-input"
      />
      <span className="kl-cell" aria-hidden>
        <Kbd>esc</Kbd>
      </span>
    </div>
  );
}

/** The results. They scroll natively (cmdk scrolls the active row into view), in the Scroll Area's tones, and
 * number their rows with the kl-cmd counter. Rows are separated by soft rules. */
function CommandList({ className, ...props }: React.ComponentProps<typeof Cmdk.List>): React.ReactElement {
  return (
    <Cmdk.List
      className={cn(
        "max-h-[min(380px,52vh)] overflow-auto overscroll-contain [counter-reset:kl-cmd]",
        "[scrollbar-width:thin] [scrollbar-color:var(--kl-ink-3)_transparent]",
        "[&_[data-slot=command-item]+[data-slot=command-item]]:border-t-(length:--kl-k1)",
        "[&_[data-slot=command-item]+[data-slot=command-item]]:border-t-kl-line-soft",
        className,
      )}
      {...props}
      data-slot="command-list"
    />
  );
}

/** Shown while nothing matches: a zero count beside what was searched for, and an optional hint. */
function CommandEmpty({
  className,
  children,
  query,
  ...props
}: Omit<React.ComponentProps<typeof Cmdk.Empty>, "children"> & {
  children?: React.ReactNode;
  /** The search, quoted in the message. */
  query?: string;
}): React.ReactElement {
  return (
    <Cmdk.Empty
      className={cn("kl-cells border-b-(length:--kl-k1) border-b-kl-seam", className)}
      {...props}
      data-slot="command-empty"
    >
      {/* a glyph in its fixed 96px cell, not text: it does not follow the type scale */}
      <span className="kl-count grid min-w-24 place-items-center py-3.5 text-[48px]">0</span>
      <span className="grid content-center gap-1 p-3.5">
        <b>No commands match “{query}”.</b>
        {children ? <small className="text-(length:--kl-text-label) text-kl-ink-2">{children}</small> : null}
      </span>
    </Cmdk.Empty>
  );
}

/** Results under one heading (with an optional code). A group after a group is divided by a seam. */
function CommandGroup({
  className,
  code,
  heading,
  ...props
}: React.ComponentProps<typeof Cmdk.Group> & { code?: string }): React.ReactElement {
  return (
    <Cmdk.Group
      className={cn(
        "[[data-slot=command-group]+&]:border-t-(length:--kl-k1) [[data-slot=command-group]+&]:border-t-kl-seam",
        "[&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-baseline [&_[cmdk-group-heading]]:gap-2",
        "[&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5",
        "[&_[cmdk-group-heading]]:border-b-(length:--kl-k1) [&_[cmdk-group-heading]]:border-b-kl-seam",
        "[&_[cmdk-group-heading]]:bg-kl-paper [&_[cmdk-group-heading]]:font-(--kl-weight-strong)",
        "[&_[cmdk-group-heading]]:text-(length:--kl-text-meta)",
        className,
      )}
      heading={
        <>
          {code ? <span className="kl-code">{code}</span> : null}
          {heading}
        </>
      }
      {...props}
      data-slot="command-group"
    />
  );
}

/** A seam between results. Drawn only: a listbox may hold options and groups, not a separator, so it is hidden from
 * assistive technology (cmdk fixes its role). */
function CommandSeparator({ className, ...props }: React.ComponentProps<typeof Cmdk.Separator>): React.ReactElement {
  return (
    <Cmdk.Separator
      className={cn("h-0 border-t-(length:--kl-k1) border-t-kl-seam", className)}
      aria-hidden
      {...props}
      data-slot="command-separator"
    />
  );
}

/**
 * One result: its digit cell (the counter; · after the ninth), the label, and its meta and shortcut. The cursor is
 * the inverse row; running it floods the row yellow (the flood owns the fill while it is on).
 */
function CommandItem({
  className,
  meta,
  shortcut,
  onSelect,
  children,
  ...props
}: React.ComponentProps<typeof Cmdk.Item> & {
  meta?: React.ReactNode;
  shortcut?: React.ReactNode;
}): React.ReactElement {
  const [fired, setFired] = React.useState(false);
  return (
    <Cmdk.Item
      className={cn(
        "kl-flood group/command-item grid min-h-11 cursor-pointer grid-cols-[44px_1fr_auto] items-stretch",
        "[counter-increment:kl-cmd]",
        "data-[selected=true]:not-data-kl-on:bg-kl-inverse data-[selected=true]:not-data-kl-on:text-kl-on-inverse",
        "aria-disabled:cursor-not-allowed aria-disabled:bg-(image:--kl-hatch) aria-disabled:text-kl-dis",
        "forced-colors:data-[selected=true]:outline-3 forced-colors:data-[selected=true]:outline-offset-[-4px]",
        "forced-colors:data-[selected=true]:outline-[Highlight]",
        className,
      )}
      data-kl-flood="manual"
      data-kl-on={fired ? "" : undefined}
      onSelect={(v) => {
        setFired(true);
        onSelect?.(v);
      }}
      {...props}
      data-slot="command-item"
    >
      <span
        className={cn(
          "grid place-items-center border-e-(length:--kl-k1) border-e-kl-seam",
          "font-(family-name:--kl-font-mono) text-(length:--kl-text-lead)/none font-bold not-italic normal-nums",
          "before:content-[counter(kl-cmd)] group-nth-[n+10_of_[data-slot=command-item]]/command-item:before:content-['·']",
          "group-[[data-selected=true]:not([data-kl-on])]/command-item:border-e-kl-on-inverse",
          "group-data-kl-on/command-item:border-e-kl-on-yellow",
        )}
        aria-hidden
        data-slot="command-item-index"
      />
      <span className="flex min-w-0 items-center px-3.5 text-(length:--kl-text-lead)">{children}</span>
      <span
        className={cn(
          "flex items-center gap-1.5 px-3.5 text-(length:--kl-text-label) text-kl-ink-2",
          "group-data-kl-on/command-item:text-inherit group-data-[selected=true]/command-item:text-inherit",
        )}
      >
        {meta}
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </span>
    </Cmdk.Item>
  );
}

type PartState = Record<string, never>;
const PART_STATE: PartState = {};

/** The menu's foot: hints and keys on the bottom keyline, in the meta voice. */
function CommandFooter({ render, className, style, ...props }: PartProps<"div", PartState>): React.ReactElement {
  const own = {
    "data-slot": "command-footer",
    className: resolveClassName(
      cn(
        "flex flex-wrap items-center gap-x-3.5 gap-y-1 border-t-(length:--kl-k1) border-t-kl-seam px-3.5 py-2",
        "text-(length:--kl-text-meta) text-kl-ink-2",
        "**:data-[slot=kbd]:text-kl-ink [&>span]:inline-flex [&>span]:items-center [&>span]:gap-[5px]",
      ),
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
  CommandItem,
  CommandFooter,
};
