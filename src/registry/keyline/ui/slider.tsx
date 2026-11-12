"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { type PartProps, resolveClassName, resolveStyle } from "../lib/keyline-render";
import { useDomDirection, useMergedRef } from "../lib/keyline-scope";
import { longestValue } from "../lib/options";
import { FieldMessages, type FieldParticipantProps } from "./field";

/*
 * Slider, as Base UI's parts (SliderRoot, SliderLabel, SliderControl, SliderTrack, SliderIndicator, SliderThumb,
 * SliderValue), Keyline's SliderFrame (the control frame of cells), and Slider, the field built from them.
 *
 *   Weight
 *   ┌──────────────────────────────────┬────────┐
 *   │ [▓▓▓▓▓▓▓▓▓▓▓█▌─────────────────] │ 12 kg  │   track (k1) · ink indicator · thumb · value cell
 *   └──────────────────────────────────┴────────┘
 *
 * The track and indicator are the Meter's construction (k1 rail, ink fill), so a measured quantity and a chosen one
 * read as the same family; the thumb is what makes it a control.
 */

type Layout = "control" | "cell";

type SliderRootProps<V extends number | readonly number[]> = SliderPrimitive.Root.Props<V> & {
  /** control: the root is a field (label above the frame). cell: it fills a cell of an enclosing frame. */
  layout?: Layout;
};

const root = cn(
  "kl-field group/slider [--kl-slider-rail:10px] [--kl-slider-th:24px] [--kl-slider-tw:14px]",
  "[[data-kl-density=compact]_&]:[--kl-slider-rail:8px] [[data-kl-density=compact]_&]:[--kl-slider-th:18px]",
  "data-[kl-density=compact]:[--kl-slider-rail:8px] [[data-kl-density=compact]_&]:[--kl-slider-tw:12px]",
  "data-[kl-density=compact]:[--kl-slider-th:18px] data-[kl-density=compact]:[--kl-slider-tw:12px]",
  // layout="cell": the enclosing cell is the frame
  "data-[kl-layout=cell]:flex data-[kl-layout=cell]:min-w-0 data-[kl-layout=cell]:flex-1 data-[kl-layout=cell]:flex-col",
  "data-[kl-layout=cell]:gap-0 data-[kl-layout=cell]:self-stretch",
);

/**
 * Base UI's Slider.Root, laid out as a field (label, frame, messages). Direction comes from the DOM `dir` (read again
 * before each press and focus), so RTL mirrors geometry and arrow keys. Keyboard, pointer, range collisions, form
 * value (`name`) and controlled/uncontrolled state are Base UI's; `onValueChange` gets its event details last.
 */
function SliderRoot<V extends number | readonly number[]>({
  layout = "control",
  className,
  ref: refProp,
  onPointerDownCapture,
  onFocusCapture,
  ...props
}: SliderRootProps<V>): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(ref, refProp);
  const [dir, refreshDir] = useDomDirection(ref);
  return (
    <DirectionProvider direction={dir}>
      <SliderPrimitive.Root<V>
        ref={setRef}
        data-kl-layout={layout}
        className={resolveClassName(root, className)}
        onPointerDownCapture={(e) => {
          refreshDir();
          onPointerDownCapture?.(e);
        }}
        onFocusCapture={(e) => {
          refreshDir();
          onFocusCapture?.(e);
        }}
        {...props}
        data-slot="slider"
      />
    </DirectionProvider>
  );
}

/** Names the slider; Base UI ties it to every thumb. */
function SliderLabel({ className, ...props }: SliderPrimitive.Label.Props): React.ReactElement {
  return (
    <SliderPrimitive.Label
      className={resolveClassName("kl-field-label", className)}
      {...props}
      data-slot="slider-label"
    />
  );
}

type FrameState = { layout: Layout };

const frame = cn(
  "kl-ctl kl-cells min-h-(--kl-ctl) bg-kl-cell data-[kl-layout=cell]:min-h-(--kl-row) data-[kl-layout=cell]:flex-1",
  // a cell gives up its own background (the foundation's cell rule, which a utility would otherwise beat)
  "data-[kl-layout=cell]:bg-transparent",
  // the ! cell is Field's (closed slot, opens red while invalid); the cell after it draws no seam while it is closed
  "[&>.kl-slot:first-child+*]:border-s-0",
  // invalid (Base UI Field): the frame turns red, as a field does
  "group-[[data-invalid]:not([data-disabled])]/slider:border-kl-red",
  "group-[[data-invalid]:not([data-disabled])]/slider:[--kl-cut-line:var(--kl-red)]",
  "group-[[data-invalid]:not([data-disabled])]/slider:[&>*+*]:border-kl-red",
  "group-[[data-invalid]:not([data-disabled])]/slider:[&>.kl-slot:first-child+*]:border-s-(length:--kl-k1)",
  "group-[[data-invalid]:not([data-disabled])]/slider:[&>.kl-slot:first-child+*]:border-s-kl-red",
  // disabled: out of service; the value stays readable
  "group-data-disabled/slider:border-kl-dis-line group-data-disabled/slider:bg-(image:--kl-hatch)",
  "group-data-disabled/slider:[--kl-cut-line:var(--kl-dis-line)] group-data-disabled/slider:[&>*+*]:border-kl-dis-line",
);

/**
 * The control frame: a row of cells (the control, then the value). The attention cell is inserted at its start and
 * opens while the slider is invalid. `layout="cell"`: the frame is a cell of an enclosing frame (no border of its own).
 * Sits inside SliderRoot, whose state it follows.
 */
function SliderFrame({
  layout = "control",
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"div", FrameState> & { layout?: Layout }): React.ReactElement {
  const state = React.useMemo(() => ({ layout }), [layout]);
  const own = {
    "data-slot": "slider-frame",
    "data-kl-layout": layout,
    className: resolveClassName(frame, className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        {/* the attention cell, as every field has: in a cell layout there is no frame to turn red, so this is the
            only mark of the state beside the (visually hidden) message */}
        <span className="kl-slot kl-field-bang" aria-hidden>
          <span>
            <span>!</span>
          </span>
        </span>
        {children}
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(props, own) });
}

/**
 * The rail cell: the whole cell is the hit area. The thumb's centre reaches the track's ends, so the cell keeps half a
 * thumb plus the inset clear on each side.
 */
function SliderControl({ className, ...props }: SliderPrimitive.Control.Props): React.ReactElement {
  return (
    <SliderPrimitive.Control
      className={resolveClassName(
        cn(
          "relative flex min-w-[96px] flex-[1_1_auto] cursor-pointer touch-none items-center select-none",
          "px-[calc(var(--kl-inset)+var(--kl-slider-tw)/2)] data-disabled:cursor-not-allowed data-dragging:cursor-grabbing",
        ),
        className,
      )}
      {...props}
      data-slot="slider-control"
    />
  );
}

/** The rail: the Meter's k1 track. Give it a `style` background to paint the scale itself (a hue spectrum). */
function SliderTrack({ className, ...props }: SliderPrimitive.Track.Props): React.ReactElement {
  return (
    <SliderPrimitive.Track
      className={resolveClassName(
        cn(
          "relative box-border h-(--kl-slider-rail) flex-1 border-(length:--kl-k1) border-kl-line bg-kl-cell",
          "data-disabled:border-kl-dis-line",
        ),
        className,
      )}
      {...props}
      data-slot="slider-track"
    />
  );
}

/**
 * The fill: ink, the current choice on a continuum; a range fills between its two thumbs. A press on the rail or an
 * arrow key moves its end with the stretch lead (100ms, zero bounce); while dragging it follows the pointer directly.
 * Hidden on a painted rail (`data-kl-rail="painted"` on the root).
 */
function SliderIndicator({ className, ...props }: SliderPrimitive.Indicator.Props): React.ReactElement {
  return (
    <SliderPrimitive.Indicator
      className={resolveClassName(
        cn(
          "bg-kl-inverse data-disabled:bg-kl-dis data-dragging:transition-none",
          "[transition:width_calc(var(--kl-stretch-lead)*1ms)_var(--kl-ease-out),inset-inline-start_calc(var(--kl-stretch-lead)*1ms)_var(--kl-ease-out)]",
          "group-data-[kl-rail=painted]/slider:invisible",
          "forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none",
        ),
        className,
      )}
      {...props}
      data-slot="slider-indicator"
    />
  );
}

const thumb = cn(
  "kl-key box-border grid h-(--kl-slider-th) w-(--kl-slider-tw) cursor-grab place-items-center outline-none",
  "border-(length:--kl-k2) border-kl-line bg-kl-cell text-kl-inverse hover:bg-kl-tint",
  "[transition:inset-inline-start_calc(var(--kl-stretch-lead)*1ms)_var(--kl-ease-out),bottom_calc(var(--kl-stretch-lead)*1ms)_var(--kl-ease-out)]",
  // dragging: the thumb floods ink (its own state while held) and follows the pointer, no transition
  "data-dragging:cursor-grabbing data-dragging:border-kl-inverse data-dragging:bg-kl-inverse",
  "data-dragging:text-kl-on-inverse data-dragging:transition-none",
  "data-disabled:cursor-not-allowed data-disabled:border-kl-dis data-disabled:bg-kl-cell data-disabled:text-kl-dis",
  // focus lands on the hidden range input inside; the ring belongs to the thumb (standalone, outside)
  "has-[input:focus-visible]:outline-(length:--kl-ring) has-[input:focus-visible]:outline-offset-(--kl-ring-out)",
  "has-[input:focus-visible]:outline-kl-focus has-[input:focus-visible]:outline-solid",
  "forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
  "forced-colors:forced-color-adjust-none forced-colors:data-dragging:border-[Highlight]",
  "forced-colors:data-dragging:bg-[Highlight] forced-colors:data-dragging:text-[HighlightText]",
  "forced-colors:has-[input:focus-visible]:outline-3 forced-colors:has-[input:focus-visible]:outline-[Highlight]",
);

/** The thumb: a standalone 2px block; its centre is the value. Without children it draws its grip keyline. */
function SliderThumb({ className, children, ...props }: SliderPrimitive.Thumb.Props): React.ReactElement {
  return (
    <SliderPrimitive.Thumb className={resolveClassName(thumb, className)} {...props} data-slot="slider-thumb">
      {children ?? (
        <span
          data-slot="slider-thumb-grip"
          className="h-[calc(var(--kl-slider-th)-12px)] w-0.5 bg-current"
          aria-hidden
        />
      )}
    </SliderPrimitive.Thumb>
  );
}

/**
 * The value cell. Its children are Base UI's: a function of the formatted values (and the numbers). Slider fills it
 * with the live value and a hidden sizer holding the longest value the scale can print, in one grid cell, so the cell
 * is as wide as its widest value and never moves the rail.
 */
function SliderValue({ className, ...props }: SliderPrimitive.Value.Props): React.ReactElement {
  return (
    <SliderPrimitive.Value
      className={resolveClassName(
        cn(
          "box-border grid flex-none items-center justify-items-end px-(--kl-inset) text-[14px] font-(--kl-weight-strong)",
          "whitespace-nowrap tabular-nums group-data-disabled/slider:text-kl-ink-2",
        ),
        className,
      )}
      {...props}
      data-slot="slider-value"
    />
  );
}

/* ------------------------------------------------------------------ the field */

type SliderProps<V extends number | readonly number[]> = Omit<
  SliderPrimitive.Root.Props<V>,
  "children" | "className" | "render" | "orientation"
> & {
  /** Visible label (visually hidden with layout="cell"). Names every thumb. */
  label: React.ReactNode;
  /** Unit printed after the value in the readout cell, in the Code voice ("kg", "°", "%"). */
  unit?: React.ReactNode;
  /** The readout cell. Hide it only when the surrounding text already prints the value. */
  showValue?: boolean;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (no border, label visually hidden). */
  layout?: Layout;
  /** Range sliders: one accessible name per thumb. Defaults to "<label>, from" / "<label>, to" when the label is text. */
  thumbLabels?: string[];
  /** Text read for a thumb's value (e.g. "12 kilograms"). Defaults to the formatted value and unit when the unit is text. */
  getAriaValueText?: SliderPrimitive.Thumb.Props["getAriaValueText"];
  /** Paints the rail itself, for a slider whose scale is visual (a hue spectrum). The fill is then drawn as a hollow window. */
  railStyle?: React.CSSProperties;
  className?: string;
} & FieldParticipantProps;

const count = (v: unknown) => (Array.isArray(v) ? v.length : 1);

/**
 * A continuous or stepped value in one control frame of two cells, built from the parts above. The readout cell is
 * sized for the longest value the scale can print, so the frame never jitters.
 *
 * Field: the slider sits in a Base UI Field.Root, so a Form collects its value under `name` (a number, or an array for
 * a range) and `validate`, `invalid` and the Form's `errors` print under the frame, and the frame inserts the ! cell
 * before the rail, in either layout. The Field.Root is a `display: contents` host: the SliderRoot (role="group") stays
 * the grid that a horizontal Form lays out.
 */
function Slider<V extends number | readonly number[]>({
  label,
  unit,
  showValue = true,
  layout = "control",
  thumbLabels,
  getAriaValueText,
  railStyle,
  className,
  invalid,
  error,
  description,
  validate,
  validationMode,
  orientation,
  ...props
}: SliderProps<V>) {
  const thumbs = count(props.value ?? props.defaultValue);
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  // A hidden sizer holding the longest value the scale can print shares the readout's grid cell, so the cell never
  // changes width while the value moves (digits, separators and the unit measured in their own fonts).
  const longest = React.useMemo(
    () => longestValue(min, max, props.step ?? 1, props.locale, props.format),
    [props.locale, props.format, props.step, min, max],
  );
  const unitText = typeof unit === "string" ? unit : "";
  const labelText = typeof label === "string" ? label : undefined;
  const names = thumbLabels ?? (thumbs > 1 && labelText ? [`${labelText}, from`, `${labelText}, to`] : undefined);
  const firstName = names?.[0];
  const valueText = getAriaValueText ?? (unitText ? (formatted: string) => `${formatted} ${unitText}` : undefined);

  return (
    <FieldPrimitive.Root
      className="contents"
      name={props.name}
      disabled={props.disabled}
      invalid={invalid}
      validate={validate}
      validationMode={validationMode}
    >
      <SliderRoot<V>
        layout={layout}
        data-kl-range={thumbs > 1 || undefined}
        data-kl-rail={railStyle ? "painted" : undefined}
        data-kl-orientation={orientation}
        className={className}
        {...props}
      >
        <SliderLabel className={layout === "cell" ? "kl-sr" : undefined}>{label}</SliderLabel>
        <SliderFrame layout={layout}>
          <SliderControl>
            <SliderTrack style={railStyle}>
              <SliderIndicator />
              {Array.from({ length: thumbs }, (_, i) => (
                <SliderThumb
                  key={i}
                  index={i}
                  getAriaLabel={names && firstName !== undefined ? (j) => names[j] ?? firstName : undefined}
                  getAriaValueText={valueText}
                />
              ))}
            </SliderTrack>
          </SliderControl>
          {showValue ? (
            <SliderValue>
              {(formatted) => (
                <>
                  <Readout values={formatted} unit={unit} />
                  <Readout values={Array.from({ length: thumbs }, () => longest)} unit={unit} sizer />
                </>
              )}
            </SliderValue>
          ) : null}
        </SliderFrame>
        <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
      </SliderRoot>
    </FieldPrimitive.Root>
  );
}

function Readout({ values, unit, sizer }: { values: readonly string[]; unit?: React.ReactNode; sizer?: boolean }) {
  return (
    <span
      data-slot="slider-readout"
      data-kl-sizer={sizer || undefined}
      className={cn(
        "flex items-center gap-1 [grid-area:1/1] [&>span[aria-hidden]]:font-medium [&>span[aria-hidden]]:text-kl-ink-2",
        sizer && "invisible",
      )}
      aria-hidden={sizer || undefined}
    >
      {values.map((f, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <span aria-hidden>–</span> : null}
          <bdi>{f}</bdi>
        </React.Fragment>
      ))}
      {/* isolated (a <bdi>), so a unit led by a neutral character ("°C") keeps its order in RTL */}
      {unit != null ? <bdi className="kl-code">{unit}</bdi> : null}
    </span>
  );
}

export {
  Slider,
  SliderRoot,
  SliderLabel,
  SliderFrame,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
  SliderValue,
  type SliderProps,
};
