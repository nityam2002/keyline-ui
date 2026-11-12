"use client";

import * as React from "react";
import { DirectionProvider as BaseDirectionProvider, useDirection } from "@base-ui/react/direction-provider";

/**
 * Sets the writing direction of a subtree in both places Keyline reads it: the DOM `dir` (Keyline's
 * CSS, logical sides, mirrored glyphs, and the components that read the DOM: toolbar, slider, scroll area,
 * carousel) and Base UI's DirectionProvider (the side a tooltip, popover, hover card or menu takes, and arrow
 * keys in Base UI's composite widgets). Wrap the app once, or a region whose language differs from the page.
 *
 *   <DirectionProvider direction="rtl">…</DirectionProvider>
 *
 * The wrapper is `display: contents`, so it adds no box. Without it every Keyline item still follows the DOM
 * `dir`; only Base UI's positioning of `inline-start` / `inline-end` sides needs the provider.
 */
function DirectionProvider({
  direction,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "dir"> & { direction: "ltr" | "rtl" }) {
  return (
    <div data-slot="direction" dir={direction} style={{ display: "contents" }} {...props}>
      <BaseDirectionProvider direction={direction}>{children}</BaseDirectionProvider>
    </div>
  );
}

export { DirectionProvider, useDirection };
