"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { useDomDirection } from "../lib/keyline-scope";
import { longestValue } from "../lib/options";
import { FieldMessages, type FieldParticipantProps } from "./field";

type SliderRootProps<V extends number | readonly number[]> = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root<V>>,
  "children" | "className" | "render" | "orientation"
>;

type SliderProps<V extends number | readonly number[]> = SliderRootProps<V> & {
  /** Visible label (visually hidden with layout="cell"). Names every thumb. */
  label: React.ReactNode;
  /** Unit printed after the value in the readout cell, in the Code voice ("kg", "°", "%"). */
  unit?: React.ReactNode;
  /** The readout cell. Hide it only when the surrounding text already prints the value. */
  showValue?: boolean;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (no border, label visually hidden). */
  layout?: "control" | "cell";
  /** Range sliders: one accessible name per thumb. Defaults to "<label>, from" / "<label>, to" when the label is text. */
  thumbLabels?: string[];
  /** Text read for a thumb's value (e.g. "12 kilograms"). Defaults to the formatted value and unit when the unit is text. */
  getAriaValueText?: React.ComponentProps<typeof SliderPrimitive.Thumb>["getAriaValueText"];
  /** Paints the rail itself, for a slider whose scale is visual (a hue spectrum). The fill is then drawn as a hollow window. */
  railStyle?: React.CSSProperties;
  className?: string;
} & FieldParticipantProps;

const count = (v: unknown) => (Array.isArray(v) ? v.length : 1);

/**
 * A continuous or stepped value in one control frame of two cells:
 *
 *   Weight
 *   ┌──────────────────────────────────┬────────┐
 *   │ [▓▓▓▓▓▓▓▓▓▓▓█▌─────────────────] │ 12 kg  │   rail (k1) · ink fill · thumb · readout cell
 *   └──────────────────────────────────┴────────┘
 *
 * - The rail is the Meter's rail (the same measured-quantity construction); the fill is ink, the current
 *   choice on a continuum. A range fills between its two thumbs.
 * - The thumb is a standalone 2px block with a grip keyline; it floods ink while dragged. Its ring is the
 *   standalone ring (outside), because it sits clear of the cell's keylines.
 * - The readout cell is sized for the longest value the scale can print, so the frame never jitters.
 * - Motion: a press on the rail or an arrow key moves the fill's end and the thumb with the stretch lead
 *   (100ms, zero bounce, retargets); while dragging there is no transition, the thumb is under the pointer.
 *   Reduced motion: instant.
 *
 * Keyboard, pointer, range collisions, form value (`name`), Field validation and controlled/uncontrolled
 * state are Base UI Slider's. Direction comes from the DOM `dir`, so RTL mirrors geometry and arrow keys.
 *
 * Field: the slider sits in a Base UI Field.Root, so a Form collects its value under `name`
 * (a number, or an array for a range) and `validate`, `invalid` and the Form's `errors` print under the
 * frame, and the frame inserts the ! cell before the rail, in either layout. The Field.Root is a `display: contents` host: the Slider root (role="group") stays the grid
 * that a horizontal Form lays out.
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
  const ref = React.useRef<HTMLDivElement>(null);
  const [dir, refreshDir] = useDomDirection(ref);
  const thumbs = count(props.value ?? props.defaultValue);
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  // A hidden sizer holding the longest value the scale can print shares the readout's grid cell, so the
  // cell never changes width while the value moves (digits, separators and the unit measured in their own fonts).
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
      <DirectionProvider direction={dir}>
        <SliderPrimitive.Root<V>
          ref={ref}
          data-slot="slider"
          data-kl-layout={layout}
          data-kl-range={thumbs > 1 || undefined}
          data-kl-rail={railStyle ? "painted" : undefined}
          data-kl-orientation={orientation}
          className={cn("kl-field kl-slider", className)}
          onPointerDownCapture={refreshDir}
          onFocusCapture={refreshDir}
          {...props}
        >
          <SliderPrimitive.Label className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
            {label}
          </SliderPrimitive.Label>
          <div data-kl-layout={layout} className="kl-ctl kl-cells kl-slider-frame">
            {/* the attention cell, as every field has: in a cell layout there is no frame to turn red, so
                this is the only mark of the state beside the (visually hidden) message */}
            <span className="kl-slot kl-field-bang" aria-hidden>
              <span>
                <span>!</span>
              </span>
            </span>
            <SliderPrimitive.Control className="kl-slider-control">
              <SliderPrimitive.Track className="kl-slider-rail" style={railStyle}>
                <SliderPrimitive.Indicator className="kl-slider-fill" />
                {Array.from({ length: thumbs }, (_, i) => (
                  <SliderPrimitive.Thumb
                    key={i}
                    index={i}
                    className="kl-key kl-slider-thumb"
                    getAriaLabel={names && firstName !== undefined ? (j) => names[j] ?? firstName : undefined}
                    getAriaValueText={valueText}
                  >
                    <span className="kl-slider-grip" aria-hidden />
                  </SliderPrimitive.Thumb>
                ))}
              </SliderPrimitive.Track>
            </SliderPrimitive.Control>
            {showValue ? (
              <SliderPrimitive.Value className="kl-slider-value">
                {(formatted) => (
                  <>
                    <Readout values={formatted} unit={unit} />
                    <Readout values={Array.from({ length: thumbs }, () => longest)} unit={unit} sizer />
                  </>
                )}
              </SliderPrimitive.Value>
            ) : null}
          </div>
          <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
        </SliderPrimitive.Root>
      </DirectionProvider>
    </FieldPrimitive.Root>
  );
}

function Readout({ values, unit, sizer }: { values: readonly string[]; unit?: React.ReactNode; sizer?: boolean }) {
  return (
    <span className={sizer ? "kl-slider-out kl-slider-sizer" : "kl-slider-out"} aria-hidden={sizer || undefined}>
      {values.map((f, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <span aria-hidden>–</span> : null}
          <bdi>{f}</bdi>
        </React.Fragment>
      ))}
      {/* isolated, so a unit led by a neutral character ("°C") keeps its order in RTL */}
      {unit != null ? <bdi className="kl-code">{unit}</bdi> : null}
    </span>
  );
}

export { Slider, type SliderProps };
