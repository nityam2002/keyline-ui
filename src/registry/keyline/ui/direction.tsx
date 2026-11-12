"use client";

import * as React from "react";
import { DirectionProvider as BaseDirectionProvider, useDirection } from "@base-ui/react/direction-provider";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type DirectionState = { direction: "ltr" | "rtl" };

type DirectionProviderProps = Omit<PartProps<"div", DirectionState>, "dir"> & { direction: "ltr" | "rtl" };

/**
 * Sets the writing direction of a subtree in both places Keyline reads it: the DOM `dir` (Keyline's
 * CSS, logical sides, mirrored glyphs, and the components that read the DOM: toolbar, slider, scroll area,
 * carousel) and Base UI's DirectionProvider (the side a tooltip, popover, hover card or menu takes, and arrow
 * keys in Base UI's composite widgets). Wrap the app once, or a region whose language differs from the page.
 *
 *   <DirectionProvider direction="rtl">…</DirectionProvider>
 *
 * The wrapper is `display: contents` (the `contents` class), so it adds no box. Without it every Keyline item still
 * follows the DOM `dir`; only Base UI's positioning of `inline-start` / `inline-end` sides needs the provider.
 */
function DirectionProvider({
  direction,
  children,
  render,
  className,
  style,
  ...props
}: DirectionProviderProps): React.ReactElement {
  const state: DirectionState = { direction };
  const own = {
    dir: direction,
    "data-slot": "direction",
    className: resolveClassName("contents", className)(state),
    style: resolveStyle(undefined, style)(state),
    children: <BaseDirectionProvider direction={direction}>{children}</BaseDirectionProvider>,
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(props, own) });
}

export { DirectionProvider, useDirection, type DirectionProviderProps };
