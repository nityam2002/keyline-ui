"use client";

import * as React from "react";
import { Command as Cmdk } from "cmdk";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { Kbd } from "./kbd";

/**
 * ⌘K command menu. Results are numbered by a CSS counter, so the digit cell always matches the visible
 * order after filtering; ⌥1–⌥9 runs that result. Activation floods the row, then runs immediately.
 */
function CommandDialog({
  open,
  onOpenChange,
  children,
  label = "Command menu",
  container,
  finalFocus,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  children: React.ReactNode;
  label?: string;
  container?: React.ComponentProps<typeof DialogPrimitive.Portal>["container"];
  /** Return false when a command hands focus to another surface (e.g. opens a dialog). */ finalFocus?: React.ComponentProps<
    typeof DialogPrimitive.Popup
  >["finalFocus"];
}) {
  const [marker, scope] = useKeylineScope(open, container);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {marker}
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Backdrop {...scopeProps(scope, { className: "kl-scrim" })} />
        <div {...scopeProps(scope, { className: "kl-dialog-scope" })}>
          <DialogPrimitive.Popup aria-label={label} className="kl-frame kl-dialog kl-cmd" finalFocus={finalFocus}>
            <Cmdk
              label={label}
              loop
              onKeyDown={(e) => {
                if (!e.altKey || !/^Digit[1-9]$/.test(e.code)) return;
                const items = e.currentTarget.querySelectorAll<HTMLElement>("[cmdk-item]:not([aria-disabled=true])");
                const el = items[Number(e.code.slice(5)) - 1];
                if (el) {
                  e.preventDefault();
                  el.click();
                }
              }}
            >
              {children}
            </Cmdk>
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof Cmdk.Input>) {
  return (
    <div className="kl-cells kl-cmd-q">
      <span className="kl-cell" aria-hidden>
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
      <Cmdk.Input className={cn("kl-cmd-input", className)} {...props} />
      <span className="kl-cell" aria-hidden>
        <Kbd>esc</Kbd>
      </span>
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof Cmdk.List>) {
  return <Cmdk.List className={cn("kl-cmd-list", className)} {...props} />;
}

function CommandEmpty({ children, query }: { children?: React.ReactNode; query?: string }) {
  return (
    <Cmdk.Empty className="kl-cells kl-cmd-empty">
      <span className="kl-count">0</span>
      <span>
        <b>No commands match “{query}”.</b>
        {children ? <small>{children}</small> : null}
      </span>
    </Cmdk.Empty>
  );
}

function CommandGroup({
  className,
  code,
  heading,
  ...props
}: React.ComponentProps<typeof Cmdk.Group> & { code?: string }) {
  return (
    <Cmdk.Group
      className={cn("kl-cmd-g", className)}
      heading={
        <>
          {code ? <span className="kl-code kl-cmd-gc">{code}</span> : null}
          {heading}
        </>
      }
      {...props}
    />
  );
}

function CommandItem({
  className,
  meta,
  shortcut,
  onSelect,
  children,
  ...props
}: React.ComponentProps<typeof Cmdk.Item> & { meta?: React.ReactNode; shortcut?: React.ReactNode }) {
  const [fired, setFired] = React.useState(false);
  return (
    <Cmdk.Item
      className={cn("kl-cmd-item kl-flood", className)}
      data-kl-flood="manual"
      data-kl-on={fired ? "" : undefined}
      onSelect={(v) => {
        setFired(true);
        onSelect?.(v);
      }}
      {...props}
    >
      <span className="kl-cmd-ix" aria-hidden />
      <span className="kl-cmd-l">{children}</span>
      <span className="kl-cmd-m">
        {meta}
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </span>
    </Cmdk.Item>
  );
}

function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("kl-cmd-foot", className)} {...props} />;
}

export { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandFooter };
