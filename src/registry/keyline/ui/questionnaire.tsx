"use client";

import * as React from "react";
import { Questionnaire as Q } from "@shadcn/react/questionnaire";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { useStretch } from "../lib/keyline-motion";
import { Button } from "./button";
import { checkboxStyles, choiceStyles } from "./checkbox";
import { FieldFrame, fieldStyles } from "./field";
import { Progress } from "./progress";
import { radioStyles } from "./radio-group";

/*
 * A questionnaire on @shadcn/react's Questionnaire, as the reference. The library owns the behaviour:
 * the steps and their order, required and optional steps, Skip, validation that blocks Next, answers kept while
 * you go back (inactive steps stay mounted, hidden and inert), errors described on the current step only, the
 * Enter / Cmd+Enter / arrow keys, choice shortcuts, and FormData on submit. Keyline draws it with its own parts:
 * the radio group's rows and stretching ink band, the checkbox's box, the field frame with its ! cell, Progress,
 * and Button cells in the action row. Keyline adds one behaviour: a new step moves focus to its heading.
 *
 *   ┌───────────────────────────────────────────────┐
 *   │ Question 2 of 4                       Optional │  progress cell
 *   │ [▓▓▓▓▓▓▓▓▓▓|                                 ] │
 *   ├───────────────────────────────────────────────┤
 *   │ Which docks can take reefers?                  │  the step: heading (focused), description,
 *   │ ┌───────────────────────────────────────────┐ │  choices or an input, the error
 *   │ │ ■ Rotterdam                             A │ │
 *   ├─┴───────────────────────────────────────────┴─┤
 *   │ Back │                          │ Skip │ Next │  action cells
 *   └───────────────────────────────────────────────┘
 */

/* ------------------------------------------------------------------ *
 * CLASSES
 * ------------------------------------------------------------------ */

const root = "kl-frame kl-rows min-w-0";

/* the padding is physical, as the stylesheet had it: the cut's room is on the left in both directions */
const progress = cn(
  "grid gap-1.5 pt-3 pr-(--kl-inset) pb-3.5 pl-[calc(var(--kl-inset)+var(--kl-c-room,0px))]",
  // the seam under it, while a step shows below (see `item`)
  "has-[~[data-slot=questionnaire-item]:not([hidden])]:border-b-(length:--kl-k1) has-[~[data-slot=questionnaire-item]:not([hidden])]:border-b-kl-line",
);
const count = "text-[13px] font-(--kl-weight-strong) tabular-nums";

/* the step: inactive steps keep their answers but are hidden (and inert) by the library. A step draws no seam of its
   own: WebKit treats its floated legend as the fieldset's rendered legend, so a top border (the frame's row seam) is
   cut either side of the question. The progress row above owns that edge instead (one edge, one owner). */
const item = cn(
  "group/questionnaire-item min-w-0 border-t-0 outline-none",
  // spacing by the legend's own padding and by margins, not the fieldset's padding or a grid gap: WebKit places the
  // rendered legend above the padding and outside the grid, Blink inside both; this reads the same in each
  "[&:not([hidden])]:grid [&:not([hidden])]:px-(--kl-inset) [&:not([hidden])]:pb-5 [&>*+*]:mt-3",
);
const legend = "float-start w-full pt-[18px] [&+*]:clear-both";
const title = cn(
  "flex scroll-my-(--kl-gutter) flex-wrap items-baseline gap-x-3 gap-y-1",
  "text-[17px]/[1.3] font-(--kl-weight-display) text-pretty",
  "focus:outline-none focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-4 focus-visible:outline-kl-focus focus-visible:outline-solid",
);
const optional = "kl-code text-[12px] font-normal text-kl-ink-2";

/* an invalid step: the choice frame turns red, as a field's does */
const choices = cn(
  "group/questionnaire-choices",
  "group-data-invalid/questionnaire-item:border-kl-red group-data-invalid/questionnaire-item:[--kl-cut-line:var(--kl-red)]",
  "forced-colors:group-data-invalid/questionnaire-item:border-[CanvasText]",
);
/* the native input covers the row (the library's), so its focus marks the row; checkbox rows tint under the pointer
   even when checked */
const choice = cn(
  "relative",
  "has-[>[data-slot=questionnaire-choice-input]:focus-visible]:outline-(length:--kl-ring)",
  "has-[>[data-slot=questionnaire-choice-input]:focus-visible]:outline-offset-(--kl-ring-in)",
  "has-[>[data-slot=questionnaire-choice-input]:focus-visible]:outline-kl-focus",
  "has-[>[data-slot=questionnaire-choice-input]:focus-visible]:outline-solid",
  "group-data-multiple/questionnaire-choices:not-data-disabled:hover:bg-kl-tint",
);
const choiceInput = "absolute inset-0 z-1 m-0 size-full cursor-[inherit] opacity-0";
/* the shortcut cell is a radio meta cell, centred and narrower */
const choiceKey = "justify-center px-0 font-normal [--kl-radio-meta:40px] [&[hidden]]:hidden";

/* action cells: Back at the start, Skip and Next at the end; hidden ones take no room */
const actions = cn(
  "kl-cells justify-end [&>[hidden]]:hidden",
  "[&>[data-slot=button][data-kl-layout=cell]]:min-w-24 [&>[data-slot=button][data-kl-layout=cell]]:flex-none",
  "[&>[data-slot=button][data-kl-layout=cell]]:[--kl-button-px:32px]",
);
const previous = "me-auto border-e-(length:--kl-k1) border-e-kl-line";

type ItemCtx = { headingId: string; required: boolean; multiple: boolean };
const ItemContext = React.createContext<ItemCtx>({ headingId: "", required: false, multiple: false });

/**
 * The form, in one region frame. `items` declares the steps (`name`, `required`, `choices`) and drives progress,
 * navigation and validation; read the answers from FormData in `onSubmit`. `item` / `onItemChange` control the
 * step; `shortcuts="letters" | "numbers"` turns on choice keys.
 */
function Questionnaire({ className, onFocus, ...props }: React.ComponentProps<typeof Q.Root>) {
  return (
    <Q.Root
      data-slot="questionnaire"
      className={cn(root, className)}
      onFocus={(e) => {
        onFocus?.(e);
        // the library focuses the new step's fieldset; Keyline moves on to its heading, so the question is what
        // a screen reader reads and where the next Tab starts. (An invalid answer is focused directly: untouched.)
        const t = e.target as HTMLElement;
        if (t.matches('fieldset[data-slot="questionnaire-item"]'))
          t.querySelector<HTMLElement>('[data-slot="questionnaire-heading"]')?.focus();
      }}
      {...props}
    />
  );
}

/** "Question 2 of 4" over a Keyline Progress whose fill is the steps behind you. */
function QuestionnaireProgress({
  className,
  label = (c: number, t: number) => `Question ${c} of ${t}`,
}: {
  className?: string;
  label?: (current: number, total: number) => string;
}) {
  return (
    <Q.Progress
      render={(_props, s) => (
        <div data-slot="questionnaire-progress" className={cn(progress, className)}>
          <span data-slot="questionnaire-count" className={count}>
            <bdi>{label(s.current, s.total)}</bdi>
          </span>
          <Progress
            label={label(s.current, s.total)}
            hideLabel
            value={s.total ? s.current - 1 : 0}
            max={Math.max(1, s.total)}
            getAriaValueText={() => label(s.current, s.total)}
          />
        </div>
      )}
    />
  );
}

/** One step: a fieldset named by its title. `required`, `multiple`, `invalid` (your own check) and `name` as the library. */
function QuestionnaireItem({
  className,
  children,
  required = false,
  multiple = false,
  ...props
}: React.ComponentProps<typeof Q.Item>) {
  const headingId = React.useId();
  return (
    <ItemContext.Provider value={{ headingId, required, multiple }}>
      <Q.Item
        data-slot="questionnaire-item"
        required={required}
        multiple={multiple}
        className={cn(item, className)}
        {...props}
      >
        {children}
      </Q.Item>
    </ItemContext.Provider>
  );
}

/**
 * The step's question: a heading inside the fieldset's legend. It takes focus when the step appears. Optional
 * steps say so (`optionalText`, null to hide it).
 */
function QuestionnaireTitle({
  className,
  children,
  level = 2,
  optionalText = "Optional",
}: {
  className?: string;
  children: React.ReactNode;
  level?: 2 | 3 | 4 | 5 | 6;
  optionalText?: React.ReactNode;
}) {
  const { headingId, required } = React.useContext(ItemContext);
  const H = `h${level}` as "h2";
  return (
    <Q.Title data-slot="questionnaire-legend" className={legend}>
      <H id={headingId} tabIndex={-1} data-slot="questionnaire-heading" className={cn(title, className)}>
        {children}
        {!required && optionalText ? (
          <span data-slot="questionnaire-optional" className={optional}>
            {optionalText}
          </span>
        ) : null}
      </H>
    </Q.Title>
  );
}

function QuestionnaireDescription({ className, ...props }: React.ComponentProps<typeof Q.Description>) {
  return <Q.Description className={cn(fieldStyles.description, className)} {...props} />;
}

/**
 * The choices: the radio group's rows in one control frame. A single choice is covered by its ink band, which
 * stretches between rows; several choices (`multiple` on the item) are checkbox rows.
 */
function QuestionnaireChoices({ className, children, ...props }: React.ComponentProps<typeof Q.Choices>) {
  const { multiple } = React.useContext(ItemContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const [chosen, setChosen] = React.useState(-1);
  // the chosen row is read from the library's data-checked: it changes on a press, a key, Skip, reset or a
  // controlled value, and only the attribute sees all of them
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || multiple) return;
    const read = () =>
      setChosen(Array.from(el.querySelectorAll("[data-kl-item]")).findIndex((r) => r.hasAttribute("data-checked")));
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { subtree: true, attributes: true, attributeFilter: ["data-checked"] });
    return () => mo.disconnect();
  }, [multiple]);
  useStretch(ref, multiple ? -1 : chosen, { axis: "y" });
  return (
    <Q.Choices
      ref={ref}
      data-slot="questionnaire-choices"
      data-kl-stretch=""
      data-multiple={multiple || undefined}
      className={cn(radioStyles.group, choices, className)}
      {...props}
    >
      <span data-kl-band="" className={radioStyles.band} aria-hidden hidden />
      {children}
    </Q.Choices>
  );
}

/** A choice row: a native radio or checkbox under the row, the box, the label and description, the shortcut cell. */
function QuestionnaireChoice({
  className,
  children,
  description,
  ...props
}: React.ComponentProps<typeof Q.Choice> & { description?: React.ReactNode }) {
  return (
    <Q.Choice
      data-slot="questionnaire-choice"
      data-kl-item=""
      className={cn(radioStyles.row, choice, className)}
      {...props}
      render={(rp, s) => (
        <label {...rp}>
          <Q.ChoiceInput data-slot="questionnaire-choice-input" className={choiceInput} />
          <span data-slot="questionnaire-choice-box" className={choiceStyles.box} aria-hidden>
            {s.type === "radio" ? (
              <span
                data-slot="questionnaire-choice-mark"
                className={radioStyles.indicator}
                data-checked={s.checked ? "" : undefined}
                data-unchecked={s.checked ? undefined : ""}
              >
                <span className={radioStyles.dot} />
              </span>
            ) : (
              <span
                data-slot="questionnaire-choice-mark"
                className={checkboxStyles.root}
                data-checked={s.checked ? "" : undefined}
                data-unchecked={s.checked ? undefined : ""}
                data-disabled={s.disabled ? "" : undefined}
              >
                <span
                  className={checkboxStyles.indicator}
                  data-checked={s.checked ? "" : undefined}
                  data-unchecked={s.checked ? undefined : ""}
                />
              </span>
            )}
          </span>
          <Q.ChoiceLabel data-slot="questionnaire-choice-text" className={choiceStyles.text}>
            <span data-slot="questionnaire-choice-label" className={cn(choiceStyles.label, "wrap-anywhere")}>
              {children}
            </span>
            {description ? (
              <span data-slot="questionnaire-choice-description" className={radioStyles.description}>
                {description}
              </span>
            ) : null}
          </Q.ChoiceLabel>
          <Q.ChoiceShortcut
            data-slot="questionnaire-choice-key"
            className={cn("kl-code", radioStyles.meta, choiceKey)}
          />
        </label>
      )}
    />
  );
}

/**
 * A free-text answer in the field frame (the ! cell appears when the step is invalid), named by the question.
 * `type` as the library: text, email, number, url, tel, date and the other input types.
 */
function QuestionnaireInput({ className, ...props }: React.ComponentProps<typeof Q.Input>) {
  const { headingId } = React.useContext(ItemContext);
  return (
    <Q.Input
      aria-labelledby={headingId}
      {...props}
      render={(ip, s) => (
        <div
          data-slot="questionnaire-field"
          className="kl-field"
          data-invalid={s.invalid ? "" : undefined}
          data-disabled={s.disabled ? "" : undefined}
        >
          <FieldFrame>
            <input {...ip} className={cn("kl-field-input", className)} />
          </FieldFrame>
        </div>
      )}
    />
  );
}

/** The step's error: the field error's look, announced (role=alert) and described on the step only while it shows. */
function QuestionnaireError({ className, ...props }: React.ComponentProps<typeof Q.Error>) {
  return (
    <Q.Error
      data-slot="questionnaire-error"
      className={cn(fieldStyles.error, "[&[hidden]]:hidden", className)}
      {...props}
      render={(ep) => (
        <p {...ep}>
          <span className="kl-glyph" data-kind="attention" aria-hidden />
          <span>{ep["children"] as React.ReactNode}</span>
        </p>
      )}
    />
  );
}

/** The action row: Back at the start; Skip and Next (or Submit on the last step) at the end. */
function QuestionnaireActions({
  render,
  className,
  style,
  ...props
}: PartProps<"div", Record<string, never>>): React.ReactElement {
  const state = {};
  return useRender({
    defaultTagName: "div",
    render,
    state,
    props: mergeProps<"div">(props, {
      className: resolveClassName(actions, className)(state),
      style: resolveStyle(undefined, style)(state),
      "data-slot": "questionnaire-actions",
    } as React.ComponentProps<"div">),
  });
}

type NavProps<T extends React.ElementType> = Omit<React.ComponentProps<T>, "render"> &
  Pick<React.ComponentProps<typeof Button>, "signal">;

function QuestionnairePrevious({ className, children, signal, ...props }: NavProps<typeof Q.Previous>) {
  return (
    <Q.Previous
      className={cn(previous, className)}
      render={<Button layout="cell" variant="quiet" signal={signal} />}
      {...props}
    >
      {children ?? "Back"}
    </Q.Previous>
  );
}
function QuestionnaireSkip({ className, children, signal, ...props }: NavProps<typeof Q.Skip>) {
  return (
    <Q.Skip className={className} render={<Button layout="cell" variant="quiet" signal={signal} />} {...props}>
      {children ?? "Skip"}
    </Q.Skip>
  );
}
function QuestionnaireNext({ className, children, signal, ...props }: NavProps<typeof Q.Next>) {
  return (
    <Q.Next className={className} render={<Button layout="cell" variant="primary" signal={signal} />} {...props}>
      {children ?? "Next"}
    </Q.Next>
  );
}
/** Submits the form on the last step. `signal` shows the submission: pending, done, failed (Button's signals). */
function QuestionnaireSubmit({ className, children, signal, ...props }: NavProps<typeof Q.Submit>) {
  return (
    <Q.Submit className={className} render={<Button layout="cell" variant="primary" signal={signal} />} {...props}>
      {children ?? "Submit"}
    </Q.Submit>
  );
}

export {
  Questionnaire,
  QuestionnaireProgress,
  QuestionnaireItem,
  QuestionnaireTitle,
  QuestionnaireDescription,
  QuestionnaireChoices,
  QuestionnaireChoice,
  QuestionnaireInput,
  QuestionnaireError,
  QuestionnaireActions,
  QuestionnairePrevious,
  QuestionnaireSkip,
  QuestionnaireNext,
  QuestionnaireSubmit,
};
