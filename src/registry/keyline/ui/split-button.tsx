"use client";

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { MenuPopup } from "./menu";

/*
 * One control frame, two cells: the action and the caret that opens its menu. The menu docks to the whole frame,
 * not to the caret cell. Parts are named as Base UI names them:
 *
 *   <SplitButton>
 *     <SplitButtonAction>Book pickup</SplitButtonAction>
 *     <SplitButtonMenu>                                         Base UI's Menu.Root
 *       <SplitButtonTrigger aria-label="More booking options" />   Menu.Trigger, the caret cell
 *       <SplitButtonPopup>…MenuItem…</SplitButtonPopup>            MenuPopup, docked to the frame
 *     </SplitButtonMenu>
 *   </SplitButton>
 */

type Variant = "primary" | "secondary";
type Layout = "control" | "cell";

type Ctx = { frame: React.RefObject<HTMLDivElement | null>; variant: Variant; layout: Layout };
const SplitCtx = React.createContext<Ctx | null>(null);

const frameVariants = cva("kl-ctl kl-cells inline-flex min-h-(--kl-ctl)", {
  variants: {
    variant: {
      secondary: "",
      // the frame takes the fill's colour, and the seam between the cells the fill's ink
      primary: [
        "border-kl-cobalt bg-kl-cobalt text-kl-on-cobalt [--kl-cut-line:var(--kl-cobalt)]",
        "[&>:not(:first-child)]:border-s-kl-on-cobalt",
      ],
    },
    // a cell gives its background to the enclosing frame (the foundation's layout="cell"); a primary frame keeps its fill
    layout: { control: "", cell: "" },
  },
  compoundVariants: [{ variant: "secondary", layout: "control", className: "bg-kl-cell" }],
  defaultVariants: { variant: "secondary", layout: "control" },
});

/* an open menu is a held state: the frame goes back to the line, and the caret cell turns ink */
const openFrame = "has-[[data-slot=split-button-trigger][data-popup-open]]:border-kl-line";

type SplitButtonState = { variant: Variant; layout: Layout };

type SplitButtonProps = PartProps<"div", SplitButtonState> & {
  variant?: Variant;
  /** cell: a cell of an enclosing frame (e.g. a bulk bar). */
  layout?: Layout;
};

/** The frame: a group of the action cell and the menu's caret cell. */
function SplitButton({
  render,
  className,
  style,
  variant = "secondary",
  layout = "control",
  ref,
  ...props
}: SplitButtonProps): React.ReactElement {
  const frame = React.useRef<HTMLDivElement>(null);
  const state: SplitButtonState = { variant, layout };
  const own = {
    "data-slot": "split-button",
    "data-kl-layout": layout,
    ...dataAttrs({ variant }),
    className: resolveClassName(cn(frameVariants({ variant, layout }), openFrame), className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  const element = useRender({
    defaultTagName: "div",
    render,
    ref: ref ? [frame, ref] : frame,
    state,
    props: mergeProps<"div">({ role: "group" }, props, own),
  });
  const ctx = React.useMemo(() => ({ frame, variant, layout }), [variant, layout]);
  return <SplitCtx.Provider value={ctx}>{element}</SplitCtx.Provider>;
}

const cellVariants = cva(
  [
    "kl-key inline-flex cursor-pointer items-center justify-center bg-transparent px-3.5 whitespace-nowrap text-inherit",
    "text-(length:--kl-text-body) font-(--kl-weight-strong) focus-visible:outline-offset-(--kl-ring-in)",
    "data-popup-open:bg-kl-inverse data-popup-open:text-kl-on-inverse",
    "data-disabled:cursor-not-allowed data-disabled:bg-kl-cell data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
  ],
  {
    variants: {
      variant: {
        // an open menu is a held state: the caret stays ink under the pointer and the press
        secondary: [
          "hover:not-data-disabled:not-data-popup-open:bg-kl-tint",
          "active:not-data-disabled:not-data-popup-open:bg-kl-press",
        ],
        // a press deepens the cobalt (it turned ink, so a press read as a different button)
        primary: [
          "hover:not-data-disabled:not-data-popup-open:bg-kl-cobalt-hi",
          "active:not-data-disabled:not-data-popup-open:bg-kl-cobalt-lo",
          "focus-visible:outline-current",
        ],
      },
    },
    defaultVariants: { variant: "secondary" },
  },
);

/** The action cell: Base UI's Button. */
function SplitButtonAction({ className, children, ...props }: ButtonPrimitive.Props): React.ReactElement {
  const ctx = React.useContext(SplitCtx);
  return (
    <ButtonPrimitive
      className={resolveClassName(cn(cellVariants({ variant: ctx?.variant })), className)}
      {...props}
      data-slot="split-button-action"
    >
      <span className="inline-flex items-center gap-2">{children}</span>
    </ButtonPrimitive>
  );
}

/** The menu: Base UI's Menu.Root (no element). Holds the trigger and the popup. */
const SplitButtonMenu = MenuPrimitive.Root;

type SplitButtonTriggerProps = MenuPrimitive.Trigger.Props & {
  /** The caret shows no text: say what the menu holds ("More booking options"). */
  "aria-label": string;
};

/** The caret cell that opens the menu: Base UI's Menu.Trigger. Its children replace the caret. */
function SplitButtonTrigger({ className, children, ...props }: SplitButtonTriggerProps): React.ReactElement {
  const ctx = React.useContext(SplitCtx);
  return (
    <MenuPrimitive.Trigger
      className={resolveClassName(cn(cellVariants({ variant: ctx?.variant }), "px-[9px]"), className)}
      {...props}
      data-slot="split-button-trigger"
    >
      <span className="inline-flex items-center gap-2">
        {children ?? (
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
        )}
      </span>
    </MenuPrimitive.Trigger>
  );
}

/** The menu's popup: MenuPopup docked to the whole frame, taking the frame's weight on the shared edge. */
function SplitButtonPopup(props: React.ComponentProps<typeof MenuPopup>): React.ReactElement {
  const ctx = React.useContext(SplitCtx);
  return <MenuPopup anchor={ctx?.frame} attachWeight={ctx?.layout === "cell" ? 1 : 2} {...props} />;
}

export {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  SplitButtonTrigger,
  SplitButtonPopup,
  type SplitButtonProps,
  type SplitButtonTriggerProps,
};
