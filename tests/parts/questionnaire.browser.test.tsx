// Questionnaire: the action row Keyline renders itself (conformance), the @shadcn/react parts' forwarding, axe over a
// step at rest, invalid and on the free-text step, and the keyboard path: a letter chooses, Enter goes on and the
// next step's heading takes focus, Back keeps the answer.
import * as React from "react";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/keyline/ui/questionnaire";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("questionnaire", {
  QuestionnaireActions: {
    element: <QuestionnaireActions />,
    refInstanceof: HTMLDivElement,
    slot: "questionnaire-actions",
  },
});

/*
 * The other parts are @shadcn/react's Questionnaire (it owns the steps, validation and the keys). Keyline gives them a
 * string className, so Base UI's wrapper contract applies only in part: each forwards its props, its ref and a
 * className to its element, which carries the part's slot.
 */
const ITEMS = [{ name: "mode", required: true, choices: [{ value: "road" }, { value: "rail" }] }];
const inForm = (part: React.ReactNode) => (
  <Questionnaire items={ITEMS} aria-label="Request">
    {part}
  </Questionnaire>
);
const inItem = (part: React.ReactNode) => inForm(<QuestionnaireItem name="mode">{part}</QuestionnaireItem>);
const PRIMITIVE_PARTS: Record<
  string,
  {
    element: React.ReactElement<Record<string, unknown>>;
    slot: string;
    tag: string;
    wrap: (p: React.ReactNode) => React.ReactNode;
  }
> = {
  Questionnaire: {
    element: <Questionnaire items={ITEMS} aria-label="Request" />,
    slot: "questionnaire",
    tag: "FORM",
    wrap: (p) => p,
  },
  QuestionnaireItem: {
    element: <QuestionnaireItem name="mode" />,
    slot: "questionnaire-item",
    tag: "FIELDSET",
    wrap: inForm,
  },
  QuestionnaireChoices: {
    element: <QuestionnaireChoices />,
    slot: "questionnaire-choices",
    tag: "DIV",
    wrap: inItem,
  },
  QuestionnaireChoice: {
    element: <QuestionnaireChoice value="road">Road</QuestionnaireChoice>,
    slot: "questionnaire-choice",
    tag: "LABEL",
    wrap: (p) => inItem(<QuestionnaireChoices>{p}</QuestionnaireChoices>),
  },
};

describe("questionnaire: @shadcn/react parts", () => {
  for (const [name, part] of Object.entries(PRIMITIVE_PARTS)) {
    it(`${name}: props, ref and className reach its element, which carries its slot`, async () => {
      const ref = React.createRef<HTMLElement>();
      const el = React.cloneElement(part.element, {
        ref,
        "data-testid": "part",
        "data-probe": "kept",
        className: "from-part",
      });
      await render(<main>{part.wrap(el)}</main>);
      const node = document.querySelector<HTMLElement>('[data-testid="part"]')!;
      expect(node.tagName).toBe(part.tag);
      expect(ref.current).toBe(node);
      expect(node.getAttribute("data-probe")).toBe("kept");
      expect(node.classList.contains("from-part")).toBe(true);
      expect(node.getAttribute("data-slot")).toBe(part.slot);
    });
  }
});

const STEPS = [
  { name: "mode", required: true, choices: [{ value: "road" }, { value: "air", disabled: true }, { value: "rail" }] },
  { name: "docks", choices: [{ value: "rtm" }, { value: "ant" }] },
  { name: "email", required: true },
] as const;

function Form() {
  return (
    <Questionnaire items={STEPS} shortcuts="letters" aria-label="Capacity request" onSubmit={(e) => e.preventDefault()}>
      <QuestionnaireProgress />
      <QuestionnaireItem name="mode" required>
        <QuestionnaireTitle>How should the load travel?</QuestionnaireTitle>
        <QuestionnaireDescription>One mode per request.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="road" description="Door to door">
            Road
          </QuestionnaireChoice>
          <QuestionnaireChoice value="air" disabled>
            Air
          </QuestionnaireChoice>
          <QuestionnaireChoice value="rail">Rail</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError>Choose a mode to continue.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireItem name="docks" multiple>
        <QuestionnaireTitle>Which docks can take reefers?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="rtm">Rotterdam</QuestionnaireChoice>
          <QuestionnaireChoice value="ant">Antwerp</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="email" required>
        <QuestionnaireTitle>Where should the planner reply?</QuestionnaireTitle>
        <QuestionnaireInput type="email" />
        <QuestionnaireError>Enter an email address to continue.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}

const step = () => document.querySelector<HTMLElement>("[data-slot=questionnaire-item]:not([hidden])")!;
const heading = () => step().querySelector<HTMLElement>("[data-slot=questionnaire-heading]")!;
const button = (name: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("[data-slot=questionnaire-actions] button")].find(
    (b) => b.querySelector("[data-slot=button-label]")?.textContent === name && !b.hidden,
  )!;

describe("questionnaire: a11y", () => {
  it("has no axe violations at rest, on an invalid step and on the free-text step", async () => {
    await render(
      <main>
        <Form />
      </main>,
    );
    await expectNoAxeViolations();
    await userEvent.click(button("Next"));
    await expect.poll(() => step().querySelector("[data-slot=questionnaire-error]:not([hidden])")).not.toBeNull();
    await expectNoAxeViolations();
    await userEvent.click(step().querySelector<HTMLElement>("[data-slot=questionnaire-choice]")!);
    await userEvent.click(button("Next"));
    await userEvent.click(button("Skip"));
    await expect.poll(() => step().querySelector("input[type=email]")).not.toBeNull();
    await expectNoAxeViolations();
  });
});

describe("questionnaire: keyboard", () => {
  it("a letter chooses, Enter goes on and the next heading takes focus, Back keeps the answer", async () => {
    await render(
      <main>
        <Form />
      </main>,
    );
    const first = heading();
    step().querySelector<HTMLInputElement>("[data-slot=questionnaire-choice-input]")!.focus();
    // shortcuts letter the enabled choices only: Rail, after the disabled Air, is B
    await userEvent.keyboard("b");
    expect(step().querySelector<HTMLInputElement>('input[value="rail"]')!.checked).toBe(true);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement?.textContent).toMatch(/^Which docks can take reefers\?/);
    expect(document.activeElement?.getAttribute("data-slot")).toBe("questionnaire-heading");
    await userEvent.click(button("Back"));
    await expect.poll(() => document.activeElement).toBe(first);
    expect(step().querySelector<HTMLInputElement>('input[value="rail"]')!.checked).toBe(true);
  });

  it("the arrow keys move between choices and skip the disabled one", async () => {
    await render(
      <main>
        <Form />
      </main>,
    );
    const road = step().querySelector<HTMLInputElement>('input[value="road"]')!;
    road.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect((document.activeElement as HTMLInputElement).value).toBe("rail");
    await userEvent.keyboard("{ArrowUp}");
    expect((document.activeElement as HTMLInputElement).value).toBe("road");
  });
});
