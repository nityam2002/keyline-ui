"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";

import { cn } from "@/lib/utils";
import { useStretch } from "../lib/keyline-motion";
import { resolveClassName } from "../lib/keyline-render";
import { useMergedRef } from "../lib/keyline-scope";
import { choiceStyles } from "./checkbox";

/*
 * Radio group, as Base UI's parts (RadioGroup, Radio, also exported as RadioRoot, and RadioIndicator), and
 * RadioGroupItem, a labelled row built from them:
 *
 *   ┌────┬───────────────────────────┬──────┐
 *   │ ▣  │ Road  Door to door, 2–4 d │    € │   the chosen row is ink: one band that STRETCHES between rows
 *   ├────┼───────────────────────────┼──────┤
 *   │ □  │ Rail                      │   €€ │   rows: box cell · label + description · meta cell
 *   └────┴───────────────────────────┴──────┘
 */

/**
 * The radio group's look, for a component that draws its rows over its own inputs (Questionnaire). `group` is the
 * frame (it carries the band and the rows), `band` the ink band, `row` a row, `indicator` the box and `dot` its dot,
 * `meta` a trailing cell. Rows read Base UI's state attributes and the band's `data-kl-covered`.
 */
const radioStyles = {
  group: cn(
    "kl-ctl kl-rows group/radio-group relative isolate flex min-w-0 flex-col bg-kl-cell data-[kl-layout=cell]:bg-transparent",
    // a row with meta: the group says so to its rows (a :has() on the group itself; a group-has-* rule restyles the
    // whole document on any DOM change)
    "[--kl-radio-fill:initial] has-[.kl-radio-meta]:[--kl-radio-fill:'']",
    // the band is the first child, so the first row is the second: it sits on the frame's top edge, not a divider
    "*:nth-2:[border-block-start:0]",
  ),
  band: "pointer-events-none absolute -z-1 bg-kl-inverse forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none",
  row: cn(
    "kl-key group/radio box-border flex min-h-(--kl-row) cursor-pointer items-stretch text-kl-ink",
    "hover:not-data-checked:not-data-disabled:bg-kl-tint",
    "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus",
    "focus-visible:outline-solid",
    // under the band the row reads covered (the band is drawn under it; its keylines stay on top)
    "data-kl-covered:text-kl-on-inverse",
    "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
    "data-disabled:data-kl-covered:text-kl-on-inverse",
    "forced-colors:data-kl-covered:text-[HighlightText] forced-colors:data-kl-covered:forced-color-adjust-none",
    // one row with meta: every row keeps the meta column (an empty cell), so the divider runs straight
    // (the cell exists only while the group's fill is set: without it the content is invalid, so no ::after)
    "not-has-[.kl-radio-meta]:after:min-w-(--kl-radio-meta,64px) not-has-[.kl-radio-meta]:after:flex-none",
    "not-has-[.kl-radio-meta]:after:border-s-(length:--kl-k1) not-has-[.kl-radio-meta]:after:border-s-current",
    "not-has-[.kl-radio-meta]:after:content-[var(--kl-radio-fill)]",
  ),
  indicator: "group/radio-indicator grid size-[18px] place-items-center border-2 border-current",
  dot: "size-2 bg-current group-data-unchecked/radio-indicator:invisible",
  description: cn(choiceStyles.description, "group-data-kl-covered/radio:text-inherit"),
  // kl-radio-meta: the theme keeps a meta cell in place while its row is pressed (its ink travels instead)
  meta: cn(
    "kl-radio-meta flex min-w-(--kl-radio-meta,64px) flex-none items-center justify-end px-(--kl-inset)",
    "border-s-(length:--kl-k1) border-s-current font-(--kl-weight-strong) text-kl-ink-2 tabular-nums",
    "group-data-kl-covered/radio:text-inherit",
  ),
};

type RadioGroupProps = Omit<RadioGroupPrimitive.Props, "value" | "defaultValue" | "onValueChange"> & {
  value?: string;
  defaultValue?: string;
  /** Called with the chosen value and Base UI's event details (the reason, the event). */
  onValueChange?: (value: string, eventDetails: RadioGroupPrimitive.ChangeEventDetails) => void;
  /** control: its own 2px frame. cell: rows sit directly in an enclosing frame (e.g. a panel body). */
  layout?: "control" | "cell";
};

/**
 * Exclusive choice as framed rows. The chosen row is ink: one band that STRETCHES between rows (leading edge first,
 * zero bounce), the same behaviour as the segmented control turned vertical. Arrow keys move and select (radio
 * semantics and roving focus from Base UI); the group participates in forms via `name`. Its rows are its direct
 * children (Radio or RadioGroupItem), each with a `value`.
 */
function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  layout = "control",
  className,
  children,
  ref: refProp,
  ...props
}: RadioGroupProps): React.ReactElement {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const ref = React.useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(ref, refProp as React.Ref<HTMLDivElement> | undefined);
  const values = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((c) => (c.props as { value?: string }).value);
  useStretch(ref, values.indexOf(current), { axis: "y" });
  return (
    <RadioGroupPrimitive
      ref={setRef}
      data-kl-stretch=""
      data-kl-layout={layout}
      value={current}
      onValueChange={(v, eventDetails) => {
        setInner(v as string);
        onValueChange?.(v as string, eventDetails);
      }}
      className={resolveClassName(radioStyles.group, className)}
      {...props}
      data-slot="radio-group"
    >
      <span data-kl-band="" className={radioStyles.band} aria-hidden hidden />
      {children}
    </RadioGroupPrimitive>
  );
}

/** One row: Base UI's Radio.Root. Compose its contents (a RadioIndicator in a box cell, the label). */
function Radio({ className, ...props }: RadioPrimitive.Root.Props): React.ReactElement {
  return (
    <RadioPrimitive.Root
      data-kl-item=""
      className={resolveClassName(radioStyles.row, className)}
      {...props}
      data-slot="radio"
    />
  );
}

/** Radio, by Base UI's name for the part. */
const RadioRoot = Radio;

/** The box: hollow, with a dot while its row is chosen. Kept mounted by default, so the box is always drawn. */
function RadioIndicator({
  className,
  keepMounted = true,
  children,
  ...props
}: RadioPrimitive.Indicator.Props): React.ReactElement {
  return (
    <RadioPrimitive.Indicator
      keepMounted={keepMounted}
      className={resolveClassName(radioStyles.indicator, className)}
      {...props}
      data-slot="radio-indicator"
    >
      {children ?? <span className={radioStyles.dot} />}
    </RadioPrimitive.Indicator>
  );
}

/**
 * A labelled row: the box cell, the label with an optional description, and an optional meta cell. Once one row has
 * meta, every row keeps the meta column.
 */
function RadioGroupItem({
  className,
  label,
  description,
  meta,
  ...props
}: RadioPrimitive.Root.Props & {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing cell: price, count, code. */ meta?: React.ReactNode;
}): React.ReactElement {
  const id = React.useId();
  return (
    <RadioPrimitive.Root
      data-kl-item=""
      aria-labelledby={`${id}-l`}
      aria-describedby={description ? `${id}-d` : undefined}
      className={resolveClassName(radioStyles.row, className)}
      {...props}
      data-slot="radio-group-item"
    >
      <span data-slot="radio-group-item-box" className={choiceStyles.box} aria-hidden>
        <RadioIndicator />
      </span>
      <span data-slot="radio-group-item-text" className={choiceStyles.text}>
        <span id={`${id}-l`} data-slot="radio-group-item-label" className={choiceStyles.label}>
          {label}
        </span>
        {description ? (
          <span id={`${id}-d`} data-slot="radio-group-item-description" className={radioStyles.description}>
            {description}
          </span>
        ) : null}
      </span>
      {meta != null ? (
        <span data-slot="radio-group-item-meta" className={radioStyles.meta}>
          {meta}
        </span>
      ) : null}
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, Radio, RadioRoot, RadioIndicator, RadioGroupItem, radioStyles, type RadioGroupProps };
