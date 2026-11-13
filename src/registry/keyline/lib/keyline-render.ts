import type * as React from "react";
import type { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * KEYLINE RENDER HELPERS
 * A Base UI part takes `className` and `style` either as values or as functions of the part's state. A wrapper
 * that writes cn("…", className) breaks the function form. These helpers merge Keyline's look with either form.
 * ------------------------------------------------------------------ */

export type ClassName<State> = string | ((state: State) => string | undefined) | undefined;
export type Style<State> = React.CSSProperties | ((state: State) => React.CSSProperties | undefined) | undefined;

/** Keyline's classes first, then the consumer's (a string, or the result of their function of state), merged by
 * cn() so a consumer utility replaces the matching Keyline one. */
export function resolveClassName<State>(base: string, className: ClassName<State>): (state: State) => string {
  return (state) => cn(base, typeof className === "function" ? className(state) : className);
}

/** Keyline's style, then the consumer's (an object, or the result of their function of state). */
export function resolveStyle<State>(
  base: React.CSSProperties | ((state: State) => React.CSSProperties) | undefined,
  style: Style<State>,
): (state: State) => React.CSSProperties {
  return (state) => ({
    ...(typeof base === "function" ? base(state) : base),
    ...(typeof style === "function" ? style(state) : style),
  });
}

/** Variant props mirrored to data attributes (data-variant, data-size, data-layout), so CSS and consumers select
 * on attributes, never on class strings. Undefined values are left out. */
export function dataAttrs(props: Record<string, string | null | undefined>): Record<`data-${string}`, string> {
  const out: Record<`data-${string}`, string> = {};
  for (const [k, v] of Object.entries(props)) if (v != null) out[`data-${k}`] = v;
  return out;
}

/** Props of a Keyline part that is not a Base UI primitive (it renders through useRender): the element's props,
 * `render`, and `className`/`style` as values or functions of the part's state, like a Base UI part. */
export type PartProps<Tag extends keyof React.JSX.IntrinsicElements, State> = Omit<
  React.ComponentPropsWithRef<Tag>,
  "className" | "style"
> & {
  render?: useRender.RenderProp<State>;
  className?: ClassName<State>;
  style?: Style<State>;
};
