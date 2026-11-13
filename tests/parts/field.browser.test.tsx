import "./render-count";

import * as React from "react";
import {
  Field,
  FieldAffix,
  FieldBar,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldFrame,
  FieldGroup,
  FieldGroupError,
  FieldGroupJoin,
  FieldGroupPart,
  FieldLabel,
  FieldRoot,
  FieldTextarea,
  FieldValidity,
  Fieldset,
  FieldsetLegend,
  Form,
  FormActions,
} from "@/components/keyline/ui/field";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inField = (part: React.ReactNode) => <Field>{part}</Field>;
const inFrame = (part: React.ReactNode) => inField(<FieldFrame>{part}</FieldFrame>);

describeConformance("field", {
  Form: { element: <Form />, refInstanceof: HTMLFormElement, slot: "form" },
  FormActions: { element: <FormActions />, refInstanceof: HTMLDivElement, slot: "form-actions" },
  FieldRoot: { element: <FieldRoot />, refInstanceof: HTMLDivElement, slot: "field" },
  FieldLabel: {
    element: <FieldLabel>Reference</FieldLabel>,
    refInstanceof: HTMLLabelElement,
    slot: "field-label",
    wrap: inField,
  },
  FieldFrame: { element: <FieldFrame />, refInstanceof: HTMLDivElement, slot: "field-frame", wrap: inField },
  FieldControl: {
    element: <FieldControl aria-label="Reference" />,
    refInstanceof: HTMLInputElement,
    slot: "field-control",
    wrap: inFrame,
  },
  FieldTextarea: {
    element: <FieldTextarea aria-label="Note" />,
    refInstanceof: HTMLTextAreaElement,
    slot: "field-textarea",
    wrap: inFrame,
  },
  FieldAffix: {
    element: <FieldAffix>EUR</FieldAffix>,
    refInstanceof: HTMLSpanElement,
    slot: "field-affix",
    wrap: inFrame,
  },
  FieldBar: { element: <FieldBar />, refInstanceof: HTMLDivElement, slot: "field-bar", wrap: inFrame },
  FieldDescription: {
    element: <FieldDescription>As printed on the label</FieldDescription>,
    refInstanceof: HTMLParagraphElement,
    slot: "field-description",
    wrap: inField,
  },
  FieldError: {
    element: <FieldError match>Enter a reference</FieldError>,
    refInstanceof: HTMLDivElement,
    slot: "field-error",
    wrap: inField,
  },
  Fieldset: { element: <Fieldset />, refInstanceof: HTMLFieldSetElement, slot: "fieldset" },
  FieldsetLegend: {
    element: <FieldsetLegend>Dimensions</FieldsetLegend>,
    refInstanceof: HTMLDivElement,
    slot: "fieldset-legend",
    wrap: (part) => <Fieldset>{part}</Fieldset>,
  },
  FieldGroup: { element: <FieldGroup legend="Dimensions" />, refInstanceof: HTMLFieldSetElement, slot: "field-group" },
  FieldGroupPart: {
    element: <FieldGroupPart label="L" />,
    refInstanceof: HTMLDivElement,
    slot: "field-group-part",
    wrap: (part) => <FieldGroup legend="Dimensions">{part}</FieldGroup>,
  },
  FieldGroupJoin: { element: <FieldGroupJoin />, refInstanceof: HTMLSpanElement, slot: "field-group-join" },
  FieldGroupError: {
    element: <FieldGroupError>Height exceeds the trailer</FieldGroupError>,
    refInstanceof: HTMLParagraphElement,
    slot: "field-group-error",
  },
});

function Example({ required = true, ...props }: Partial<React.ComponentProps<typeof Field>> & { required?: boolean }) {
  return (
    <main>
      <input aria-label="Before" />
      <Field {...props}>
        <FieldLabel>Reference</FieldLabel>
        <FieldFrame>
          <FieldControl required={required} />
        </FieldFrame>
        <FieldDescription>As printed on the label</FieldDescription>
        <FieldError />
      </Field>
      <input aria-label="After" />
    </main>
  );
}

const control = () => document.querySelector<HTMLInputElement>('[data-slot="field-control"]')!;
const field = () => document.querySelector<HTMLElement>('[data-slot="field"]')!;
const frame = () => document.querySelector<HTMLElement>('[data-slot="field-frame"]')!;

function color(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

const describedBy = () =>
  (control().getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.getAttribute("data-slot"));

describe("field: wiring", () => {
  it("the label names the control, and the description describes it", async () => {
    await render(<Example />);
    expect(control().labels![0]!.textContent).toBe("Reference");
    expect(describedBy()).toEqual(["field-description"]);
  });

  it("on blur an invalid value marks the field and the error joins the description", async () => {
    await render(
      <Example required={false} validationMode="onBlur" validate={(v) => (v ? null : "Enter a reference")} />,
    );
    // Base UI holds a check back until the value has been edited: type, clear, leave
    await userEvent.type(control(), "x");
    await userEvent.clear(control());
    expect(field().hasAttribute("data-invalid")).toBe(false);
    await userEvent.keyboard("{Tab}");
    await expect.poll(() => field().hasAttribute("data-invalid")).toBe(true);
    const error = document.querySelector('[data-slot="field-error"]')!;
    expect(error.textContent).toBe("Enter a reference");
    expect(describedBy()).toEqual(["field-description", "field-error"]);
    expect(control().getAttribute("aria-invalid")).toBe("true");
  });

  it("on submit a Form validates its fields, and Validity reports the state", async () => {
    await render(
      <Form onFormSubmit={() => {}}>
        <Field name="reference" validate={(v) => (v ? null : "Enter a reference")}>
          <FieldLabel>Reference</FieldLabel>
          <FieldFrame>
            <FieldControl />
          </FieldFrame>
          <FieldError />
          <FieldValidity>{(s) => <output data-testid="validity">{String(s.validity.valid)}</output>}</FieldValidity>
        </Field>
        <FormActions>
          <button type="submit">Save</button>
        </FormActions>
      </Form>,
    );
    expect(field().hasAttribute("data-invalid")).toBe(false);
    await userEvent.click(document.querySelector("button[type=submit]")!);
    await expect.poll(() => field().hasAttribute("data-invalid")).toBe(true);
    expect(document.querySelector('[data-slot="field-error"]')!.textContent).toBe("Enter a reference");
    expect(document.querySelector('[data-testid="validity"]')!.textContent).toBe("false");
    await userEvent.type(control(), "SH-1");
    await userEvent.click(document.querySelector("button[type=submit]")!);
    await expect.poll(() => field().hasAttribute("data-invalid")).toBe(false);
  });
});

describe("field: axe", () => {
  it("has no violations: plain, invalid, disabled, a group", async () => {
    await render(
      <main>
        <Field>
          <FieldLabel>Reference</FieldLabel>
          <FieldFrame>
            <FieldControl required />
          </FieldFrame>
          <FieldDescription>As printed on the label</FieldDescription>
        </Field>
        <Field invalid>
          <FieldLabel>Consignee</FieldLabel>
          <FieldFrame>
            <FieldAffix>@</FieldAffix>
            <FieldControl />
          </FieldFrame>
          <FieldError match>Enter a consignee</FieldError>
        </Field>
        <Field disabled>
          <FieldLabel>Seal</FieldLabel>
          <FieldFrame>
            <FieldTextarea />
          </FieldFrame>
        </Field>
        <FieldGroup legend="Dimensions">
          <FieldGroupPart label="L" />
          <FieldGroupJoin />
          <FieldGroupPart label="W" />
        </FieldGroup>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("field: keyboard", () => {
  it("Tab reaches the control and leaves it at both edges", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(control());
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("After");
    await userEvent.keyboard("{Shift>}{Tab}{Tab}{/Shift}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Before");
  });
});

describe("field: style", () => {
  it("invalid: the frame turns red and the ! cell opens", async () => {
    await render(<Example invalid />);
    expect(getComputedStyle(frame()).borderTopColor).toBe(color("var(--kl-red)"));
    const bang = frame().querySelector<HTMLElement>(".kl-field-bang")!;
    expect(bang.getBoundingClientRect().width).toBeGreaterThan(20);
  });

  it("disabled: the frame is hatched on its keyline colour", async () => {
    await render(<Example disabled />);
    expect(getComputedStyle(frame()).backgroundImage).toMatch(/linear-gradient/);
    expect(getComputedStyle(frame()).borderTopColor).toBe(color("var(--kl-dis-line)"));
  });

  it("focus: the frame's edge is the ring, the input draws none", async () => {
    await render(<Example />);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(control());
    expect(getComputedStyle(frame()).borderTopColor).toBe(color("var(--kl-focus)"));
    expect(getComputedStyle(frame(), "::before").borderTopColor).toBe(color("var(--kl-focus)"));
    expect(getComputedStyle(control()).outlineStyle).toBe("none");
  });
});
