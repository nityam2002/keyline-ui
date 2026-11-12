"use client";

import * as React from "react";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useStretch } from "../lib/keyline-motion";
import { dataAttrs, resolveClassName } from "../lib/keyline-render";
import { useScrollEdges } from "../lib/scroll-edges";
import { useMergedRef } from "../lib/keyline-scope";

/*
 * One control frame of cells and the ink band beneath them. The band and the covered labels are drawn by the
 * STRETCH engine (keyline-motion): it sizes the band and marks each item the band covers with data-kl-covered. In
 * flight it clones the row with every item covered and drops the clone's data-slot, so every style here sits on
 * the element it styles (no rule keys on a part's slot), and the clone reads the same.
 */
const segmentedVariants = cva(
  "kl-ctl kl-cells relative isolate inline-flex min-h-(--kl-ctl) max-w-full overflow-x-auto",
  {
    variants: {
      // a cell gives its background to the enclosing frame (the foundation's layout="cell")
      layout: { control: "bg-kl-cell", cell: "" },
      size: { default: "", compact: "min-h-[28px] [--kl-cut-size:var(--kl-cut-nested)]" },
    },
    defaultVariants: { layout: "control", size: "default" },
  },
);

const itemVariants = cva(
  [
    "kl-key inline-flex cursor-pointer items-center justify-center bg-transparent whitespace-nowrap text-kl-ink",
    "text-(length:--kl-text-body) font-(--kl-weight-strong)",
    "hover:not-data-checked:not-data-disabled:bg-kl-tint focus-visible:outline-offset-(--kl-ring-in)",
    "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:not-data-kl-covered:text-kl-dis",
    // covered by the band; a disabled choice that is still the chosen one keeps its label legible on it
    "data-kl-covered:text-kl-on-inverse",
    "forced-colors:data-kl-covered:text-[HighlightText] forced-colors:data-kl-covered:forced-color-adjust-none",
  ],
  {
    variants: {
      size: { default: "px-3.5", compact: "px-2.5 text-(length:--kl-text-label)" },
    },
    defaultVariants: { size: "default" },
  },
);

const SizeContext = React.createContext<"default" | "compact">("default");

type SegmentedProps = Omit<React.ComponentProps<typeof RadioGroup>, "value" | "defaultValue" | "onValueChange"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "default" | "compact";
  /** control: its own frame. cell: a cell of an enclosing frame. */
  layout?: "control" | "cell";
};

/**
 * Exclusive choice inside one control frame. Radio-group semantics (arrows move and select).
 * The ink band STRETCHES between cells: leading edge first, trailing edge follows, zero bounce.
 */
function Segmented({
  value,
  defaultValue,
  onValueChange,
  size = "default",
  layout = "control",
  className,
  children,
  ref: refProp,
  ...props
}: SegmentedProps): React.ReactElement {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const ref = React.useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(ref, refProp);
  const values = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((c) => (c.props as { value?: string }).value);
  useStretch(ref, values.indexOf(current));
  useScrollEdges(ref);
  return (
    <SizeContext.Provider value={size}>
      <RadioGroup
        ref={setRef}
        data-kl-stretch=""
        data-kl-layout={layout}
        {...dataAttrs({ size })}
        value={current}
        onValueChange={(v) => {
          setInner(v as string);
          onValueChange?.(v as string);
        }}
        className={resolveClassName(cn(segmentedVariants({ layout, size })), className)}
        {...props}
        data-slot="segmented"
      >
        <span
          data-kl-band=""
          className="pointer-events-none absolute -z-1 bg-kl-inverse forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none"
          aria-hidden
          hidden
        />
        {children}
      </RadioGroup>
    </SizeContext.Provider>
  );
}

type SegmentedItemProps = React.ComponentProps<typeof Radio.Root> & { value: string };

/** One choice: Base UI's Radio. */
function SegmentedItem({ className, children, ...props }: SegmentedItemProps): React.ReactElement {
  const size = React.useContext(SizeContext);
  return (
    <Radio.Root
      data-kl-item=""
      className={resolveClassName(cn(itemVariants({ size })), className)}
      {...props}
      data-slot="segmented-item"
    >
      <span>{children}</span>
    </Radio.Root>
  );
}

export { Segmented, SegmentedItem, type SegmentedProps, type SegmentedItemProps };
