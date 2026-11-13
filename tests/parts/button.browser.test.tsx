import "./render-count";

import { Button, ButtonAffix } from "@/components/keyline/ui/button";
import { render } from "vitest-browser-react";
import { describe, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("button", {
  Button: { element: <Button>Save</Button>, refInstanceof: HTMLButtonElement, slot: "button", button: true },
  ButtonAffix: { element: <ButtonAffix>3</ButtonAffix>, refInstanceof: HTMLSpanElement, slot: "button-affix" },
});

describe("button: axe", () => {
  it("has no violations in each variant, signal and layout", async () => {
    await render(
      <main>
        <Button>Save</Button>
        <Button variant="primary">Book</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="quiet">Cancel</Button>
        <Button size="compact">Compact</Button>
        <Button size="icon" aria-label="Add">
          +
        </Button>
        <Button signal="pending">Saving</Button>
        <Button signal="done">Saved</Button>
        <Button signal="failed">Retry</Button>
        <Button disabled>Disabled</Button>
        <Button>
          Inbox <ButtonAffix>3</ButtonAffix>
        </Button>
      </main>,
    );
    await expectNoAxeViolations();
  });
});
