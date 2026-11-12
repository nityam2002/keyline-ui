"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { MenuContent } from "./menu";

type Ctx = {
  frame: React.RefObject<HTMLDivElement | null>;
  variant: "primary" | "secondary";
  layout: "control" | "cell";
};
const SplitCtx = React.createContext<Ctx | null>(null);

/** One control frame, two cells: the action and its menu. The menu docks to the whole frame. */
function SplitButton({
  className,
  variant = "secondary",
  layout = "control",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "primary" | "secondary";
  /** cell: a cell of an enclosing frame (e.g. a bulk bar). */ layout?: "control" | "cell";
}) {
  const frame = React.useRef<HTMLDivElement>(null);
  return (
    <SplitCtx.Provider value={{ frame, variant, layout }}>
      <div
        ref={frame}
        role="group"
        data-slot="split-button"
        data-variant={variant}
        data-kl-layout={layout}
        className={cn("kl-ctl kl-cells kl-split", className)}
        {...props}
      >
        {children}
      </div>
    </SplitCtx.Provider>
  );
}

function SplitButtonAction({ className, children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="split-button-action"
      className={cn("kl-key kl-split-cell kl-split-action", className)}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}

function SplitButtonMenu({
  label,
  children,
  contentClassName,
  finalFocus,
}: {
  label: string;
  children: React.ReactNode;
  contentClassName?: string;
  finalFocus?: React.ComponentProps<typeof MenuContent>["finalFocus"];
}) {
  const ctx = React.useContext(SplitCtx);
  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        aria-label={label}
        data-slot="split-button-trigger"
        className="kl-key kl-split-cell kl-split-caret"
      >
        <span>
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
            aria-hidden
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </MenuPrimitive.Trigger>
      <MenuContent
        anchor={ctx?.frame}
        attachWeight={ctx?.layout === "cell" ? 1 : 2}
        className={contentClassName}
        finalFocus={finalFocus}
      >
        {children}
      </MenuContent>
    </MenuPrimitive.Root>
  );
}

export { SplitButton, SplitButtonAction, SplitButtonMenu };
