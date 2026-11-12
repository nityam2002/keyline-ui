"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";

import { cn } from "@/lib/utils";
import { useStretch } from "../lib/keyline-motion";

type RadioGroupProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive>,
  "value" | "defaultValue" | "onValueChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** control: its own 2px frame. cell: rows sit directly in an enclosing frame (e.g. a panel body). */
  layout?: "control" | "cell";
};

/**
 * Exclusive choice as framed rows. The chosen row is ink: one band that STRETCHES between rows
 * (leading edge first, zero bounce), the same behaviour as the segmented control turned vertical.
 * Arrow keys move and select (radio semantics from Base UI); the group participates in forms via `name`.
 */
function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  layout = "control",
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const ref = React.useRef<HTMLDivElement>(null);
  const values = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((c) => (c.props as { value?: string }).value);
  useStretch(ref, values.indexOf(current), { axis: "y" });
  return (
    <RadioGroupPrimitive
      ref={ref}
      data-slot="radio-group"
      data-kl-stretch=""
      data-kl-layout={layout}
      value={current}
      onValueChange={(v) => {
        setInner(v as string);
        onValueChange?.(v as string);
      }}
      className={cn("kl-ctl kl-rows kl-radio-group", className)}
      {...props}
    >
      <span data-kl-band="" className="kl-radio-band" aria-hidden hidden />
      {children}
    </RadioGroupPrimitive>
  );
}

function RadioGroupItem({
  className,
  label,
  description,
  meta,
  ...props
}: React.ComponentProps<typeof Radio.Root> & {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing cell: price, count, code. */ meta?: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <Radio.Root
      data-slot="radio-group-item"
      data-kl-item=""
      aria-labelledby={`${id}-l`}
      aria-describedby={description ? `${id}-d` : undefined}
      className={cn("kl-key kl-radio-row", className)}
      {...props}
    >
      <span className="kl-choice-box" aria-hidden>
        <span className="kl-radio">
          <Radio.Indicator className="kl-radio-dot" keepMounted />
        </span>
      </span>
      <span className="kl-choice-text">
        <span id={`${id}-l`} className="kl-choice-label">
          {label}
        </span>
        {description ? (
          <span id={`${id}-d`} className="kl-choice-desc">
            {description}
          </span>
        ) : null}
      </span>
      {meta != null ? <span className="kl-radio-meta">{meta}</span> : null}
    </Radio.Root>
  );
}

export { RadioGroup, RadioGroupItem };
