"use client";

import * as React from "react";
import { Questionnaire as Q } from "@shadcn/react/questionnaire";

import { cn } from "@/lib/utils";
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
      className={cn("kl-frame kl-rows kl-q", className)}
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
        <div data-slot="questionnaire-progress" className={cn("kl-q-progress", className)}>
          <span className="kl-q-count">
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
        className={cn("kl-q-item", className)}
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
    <Q.Title className="kl-q-legend">
      <H id={headingId} tabIndex={-1} data-slot="questionnaire-heading" className={cn("kl-q-title", className)}>
        {children}
        {!required && optionalText ? <span className="kl-code kl-q-opt">{optionalText}</span> : null}
      </H>
    </Q.Title>
  );
}

function QuestionnaireDescription({ className, ...props }: React.ComponentProps<typeof Q.Description>) {
  return <Q.Description className={cn(fieldStyles.description, "kl-q-desc", className)} {...props} />;
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
      className={cn(radioStyles.group, "kl-q-choices", className)}
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
      className={cn(radioStyles.row, "kl-q-choice", className)}
      {...props}
      render={(rp, s) => (
        <label {...rp}>
          <Q.ChoiceInput className="kl-q-input" />
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
            <span data-slot="questionnaire-choice-label" className={choiceStyles.label}>
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
            className={cn("kl-code", radioStyles.meta, "kl-q-key")}
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
          className="kl-field kl-q-field"
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
      className={cn(fieldStyles.error, "kl-q-error", className)}
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
function QuestionnaireActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="questionnaire-actions" className={cn("kl-cells kl-q-actions", className)} {...props} />;
}

type NavProps<T extends React.ElementType> = Omit<React.ComponentProps<T>, "render"> &
  Pick<React.ComponentProps<typeof Button>, "signal">;

function QuestionnairePrevious({ className, children, signal, ...props }: NavProps<typeof Q.Previous>) {
  return (
    <Q.Previous
      className={cn("kl-q-prev", className)}
      render={<Button layout="cell" variant="quiet" signal={signal} />}
      {...props}
    >
      {children ?? "Back"}
    </Q.Previous>
  );
}
function QuestionnaireSkip({ className, children, signal, ...props }: NavProps<typeof Q.Skip>) {
  return (
    <Q.Skip
      className={cn("kl-q-skip", className)}
      render={<Button layout="cell" variant="quiet" signal={signal} />}
      {...props}
    >
      {children ?? "Skip"}
    </Q.Skip>
  );
}
function QuestionnaireNext({ className, children, signal, ...props }: NavProps<typeof Q.Next>) {
  return (
    <Q.Next
      className={cn("kl-q-next", className)}
      render={<Button layout="cell" variant="primary" signal={signal} />}
      {...props}
    >
      {children ?? "Next"}
    </Q.Next>
  );
}
/** Submits the form on the last step. `signal` shows the submission: pending, done, failed (Button's signals). */
function QuestionnaireSubmit({ className, children, signal, ...props }: NavProps<typeof Q.Submit>) {
  return (
    <Q.Submit
      className={cn("kl-q-next", className)}
      render={<Button layout="cell" variant="primary" signal={signal} />}
      {...props}
    >
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
