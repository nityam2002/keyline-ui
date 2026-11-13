// Attachment's parts (conformance), axe over every state and size, the Tab order through the frame's trigger and its
// action cells, and what each state says: the progressbar named by the file, the failure announced, the done flash.
import * as React from "react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGlyph,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/keyline/ui/attachment";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inFrame = (part: React.ReactNode) => <Attachment>{part}</Attachment>;

describeConformance("attachment", {
  Attachment: { element: <Attachment />, refInstanceof: HTMLDivElement, slot: "attachment" },
  AttachmentMedia: {
    element: <AttachmentMedia />,
    refInstanceof: HTMLDivElement,
    slot: "attachment-media",
    wrap: inFrame,
  },
  AttachmentContent: {
    element: <AttachmentContent />,
    refInstanceof: HTMLDivElement,
    slot: "attachment-content",
    wrap: inFrame,
  },
  AttachmentTitle: {
    element: <AttachmentTitle>CMR.pdf</AttachmentTitle>,
    refInstanceof: HTMLSpanElement,
    slot: "attachment-title",
    wrap: inFrame,
  },
  AttachmentDescription: {
    element: <AttachmentDescription>480 KB</AttachmentDescription>,
    refInstanceof: HTMLSpanElement,
    slot: "attachment-description",
    wrap: inFrame,
  },
  AttachmentActions: {
    element: <AttachmentActions />,
    refInstanceof: HTMLDivElement,
    slot: "attachment-actions",
    wrap: inFrame,
  },
  AttachmentAction: {
    element: <AttachmentAction aria-label="Remove CMR.pdf" />,
    refInstanceof: HTMLButtonElement,
    slot: "attachment-action",
    wrap: inFrame,
  },
  AttachmentTrigger: {
    element: <AttachmentTrigger aria-label="Open CMR.pdf" />,
    refInstanceof: HTMLButtonElement,
    slot: "attachment-trigger",
    wrap: inFrame,
  },
});

type State = "idle" | "uploading" | "processing" | "error" | "done";

function File({
  name,
  state,
  progress,
  size,
  layout,
  open,
}: {
  name: string;
  state: State;
  progress?: number;
  size?: "default" | "compact" | "tile";
  layout?: "control" | "cell";
  open?: boolean;
}) {
  return (
    <Attachment state={state} progress={progress} size={size} layout={layout} data-testid={name}>
      <AttachmentMedia>
        <AttachmentGlyph name="file" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        <AttachmentDescription>{state === "error" ? "Over the 25 MB limit." : "480 KB"}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label={`Remove ${name}`}>
          <AttachmentGlyph name="close" />
        </AttachmentAction>
      </AttachmentActions>
      {open ? <AttachmentTrigger aria-label={`Open ${name}`} /> : null}
    </Attachment>
  );
}

/* WebKit on macOS leaves buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const SHIFT_TAB = server.browser === "webkit" ? "{Alt>}{Shift>}{Tab}{/Shift}{/Alt}" : "{Shift>}{Tab}{/Shift}";
const active = () => document.activeElement as HTMLElement | null;
const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

describe("attachment: a11y", () => {
  it("has no axe violations in any state, size or layout", async () => {
    await render(
      <main>
        <File name="packing-list.xlsx" state="idle" />
        <File name="pallet-damage.jpg" state="uploading" progress={40} />
        <File name="delivery-note.pdf" state="processing" />
        <File name="customs-T1.pdf" state="error" progress={61} />
        <File name="CMR.pdf" state="done" size="compact" open />
        <File name="seal.jpg" state="done" size="tile" />
        <File name="dock-4.jpg" state="done" layout="cell" open />
      </main>,
    );
    await expectNoAxeViolations();
  });

  it("uploading: a progressbar named by the file, at the rounded percentage", async () => {
    await render(
      <main>
        <File name="pallet-damage.jpg" state="uploading" progress={40.4} />
      </main>,
    );
    const bar = el("pallet-damage.jpg").querySelector<HTMLElement>('[role="progressbar"]')!;
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    const title = document.getElementById(bar.getAttribute("aria-labelledby")!)!;
    expect(title.getAttribute("data-slot")).toBe("attachment-title");
    expect(title.textContent).toBe("pallet-damage.jpg");
    expect(el("pallet-damage.jpg").getAttribute("aria-busy")).toBe("true");
  });

  it("error: the reason is announced and the media cell carries the ! mark", async () => {
    await render(
      <main>
        <File name="customs-T1.pdf" state="error" progress={61} />
      </main>,
    );
    const file = el("customs-T1.pdf");
    expect(file.querySelector('[role="alert"]')?.textContent).toBe("Over the 25 MB limit.");
    expect(file.getAttribute("data-mark")).toBe("error");
    expect(file.querySelector('[data-slot="attachment-mark"]')?.textContent).toBe("!");
  });

  it("done after an upload: the media cell flashes the tick, then the file's glyph returns", async () => {
    function Upload() {
      const [state, setState] = React.useState<State>("uploading");
      return (
        <main>
          <File name="CMR.pdf" state={state} progress={100} />
          <button type="button" onClick={() => setState("done")}>
            Land
          </button>
        </main>
      );
    }
    await render(<Upload />);
    expect(el("CMR.pdf").hasAttribute("data-mark")).toBe(false);
    document.querySelector<HTMLButtonElement>("button:not([data-slot])")!.click();
    await expect.poll(() => el("CMR.pdf").getAttribute("data-mark")).toBe("done");
    await expect.poll(() => el("CMR.pdf").hasAttribute("data-mark")).toBe(false);
    expect(el("CMR.pdf").getAttribute("data-status")).toBe("done");
  });
});

describe("attachment: keyboard", () => {
  it("Tab runs from the field before, through the action cell and the open trigger, to the field after", async () => {
    await render(
      <main>
        <input aria-label="Before" />
        <File name="CMR.pdf" state="done" open />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLInputElement>('[aria-label="Before"]')!.focus();
    const order: string[] = [];
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard(TAB);
      order.push(active()?.getAttribute("aria-label") ?? "");
    }
    expect(order).toEqual(["Remove CMR.pdf", "Open CMR.pdf", "After"]);
    await userEvent.keyboard(SHIFT_TAB);
    await userEvent.keyboard(SHIFT_TAB);
    await userEvent.keyboard(SHIFT_TAB);
    expect(active()?.getAttribute("aria-label")).toBe("Before");
  });

  it("Enter on the trigger opens the file, and the action cell sits above the trigger", async () => {
    const opened: string[] = [];
    await render(
      <main>
        <Attachment data-testid="cmr">
          <AttachmentContent>
            <AttachmentTitle>CMR.pdf</AttachmentTitle>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove CMR.pdf" onClick={() => opened.push("remove")} />
          </AttachmentActions>
          <AttachmentTrigger aria-label="Open CMR.pdf" onClick={() => opened.push("open")} />
        </Attachment>
      </main>,
    );
    document.querySelector<HTMLElement>('[aria-label="Open CMR.pdf"]')!.focus();
    await userEvent.keyboard("{Enter}");
    // the pointer lands on the action, not the overlay under it
    const action = document.querySelector<HTMLElement>('[aria-label="Remove CMR.pdf"]')!;
    const r = action.getBoundingClientRect();
    expect(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)).toBe(action);
    await userEvent.click(action);
    expect(opened).toEqual(["open", "remove"]);
  });
});
