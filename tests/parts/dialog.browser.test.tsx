import "./render-count";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogPopup,
  AlertDialogTrigger,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/keyline/ui/dialog";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const open = (part: React.ReactNode) => (
  <Dialog open>
    <DialogPopup aria-label="Rename view">{part}</DialogPopup>
  </Dialog>
);

describeConformance("dialog", {
  DialogTrigger: {
    element: <DialogTrigger>Rename</DialogTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "dialog-trigger",
    button: true,
    wrap: (part) => <Dialog>{part}</Dialog>,
  },
  DialogBackdrop: {
    element: <DialogBackdrop />,
    refInstanceof: HTMLDivElement,
    slot: "dialog-backdrop",
    wrap: (part) => (
      <Dialog open>
        <DialogPrimitive.Portal>{part}</DialogPrimitive.Portal>
      </Dialog>
    ),
  },
  DialogPopup: {
    element: <DialogPopup aria-label="Rename view">Body</DialogPopup>,
    refInstanceof: HTMLDivElement,
    slot: "dialog-popup",
    wrap: (part) => <Dialog open>{part}</Dialog>,
  },
  DialogClose: {
    element: <DialogClose>Cancel</DialogClose>,
    refInstanceof: HTMLButtonElement,
    slot: "dialog-close",
    button: true,
    wrap: open,
  },
  DialogTitle: {
    element: <DialogTitle>Rename</DialogTitle>,
    refInstanceof: HTMLHeadingElement,
    slot: "dialog-title",
    wrap: open,
  },
  DialogDescription: {
    element: <DialogDescription>The view keeps its filters.</DialogDescription>,
    refInstanceof: HTMLParagraphElement,
    slot: "dialog-description",
    wrap: open,
  },
  DialogHeader: {
    element: <DialogHeader>Head</DialogHeader>,
    refInstanceof: HTMLDivElement,
    slot: "dialog-header",
    wrap: open,
  },
  DialogBody: {
    element: <DialogBody>Body</DialogBody>,
    refInstanceof: HTMLDivElement,
    slot: "dialog-body",
    wrap: open,
  },
  DialogFooter: {
    element: <DialogFooter>Foot</DialogFooter>,
    refInstanceof: HTMLDivElement,
    slot: "dialog-footer",
    wrap: open,
  },
});

describeConformance("alert-dialog", {
  AlertDialogTrigger: {
    element: <AlertDialogTrigger>Delete</AlertDialogTrigger>,
    refInstanceof: HTMLButtonElement,
    slot: "alert-dialog-trigger",
    button: true,
    wrap: (part) => <AlertDialog>{part}</AlertDialog>,
  },
  AlertDialogPopup: {
    element: <AlertDialogPopup aria-label="Delete view">Body</AlertDialogPopup>,
    refInstanceof: HTMLDivElement,
    slot: "alert-dialog-popup",
    wrap: (part) => <AlertDialog open>{part}</AlertDialog>,
  },
});

/** A dialog between two page fields, portalled into the page's landmark. */
function Example() {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain} style={{ padding: 40, display: "grid", gridAutoRows: 40, justifyItems: "start" }}>
      {/* text fields: every engine tabs to them (WebKit on macOS does not tab to buttons by default) */}
      <input aria-label="Before" />
      <Dialog>
        <DialogTrigger>Rename view</DialogTrigger>
        <DialogPopup container={main}>
          <DialogHeader>
            <DialogTitle>Rename view</DialogTitle>
            <DialogDescription>The view keeps its filters.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <input aria-label="Name" />
            <input aria-label="Note" />
          </DialogBody>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
      <input aria-label="After" />
    </main>
  );
}

const trigger = () => document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!;
const popup = () => document.querySelector<HTMLElement>('[data-slot="dialog-popup"]');
const backdrop = () => document.querySelector<HTMLElement>('[data-slot="dialog-backdrop"]');
const focused = () => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent;
// WebKit on macOS tabs only to text fields unless Option is held
const tab = (n: number, shift = false) => {
  const tabs = "{Tab}".repeat(n);
  const alt = server.browser === "webkit";
  return userEvent.keyboard(
    `${shift ? "{Shift>}" : ""}${alt ? "{Alt>}" : ""}${tabs}${alt ? "{/Alt}" : ""}${shift ? "{/Shift}" : ""}`,
  );
};

async function openByKeyboard() {
  trigger().focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => popup()).not.toBeNull();
  await expect.poll(() => popup()!.contains(document.activeElement)).toBe(true);
  await expect.poll(() => popup()!.hasAttribute("data-starting-style")).toBe(false);
}

describe("dialog: axe", () => {
  it("has no violations, closed and open", async () => {
    await render(<Example />);
    await expectNoAxeViolations();
    await openByKeyboard();
    // modal: Base UI makes the rest of the page inert while it is open, and axe flags the page's own fields for that,
    // so the open state is judged on the dialog
    await expectNoAxeViolations(popup()!);
  });
});

describe("dialog: keyboard", () => {
  it("Escape closes the dialog and returns focus to the trigger", async () => {
    await render(<Example />);
    await openByKeyboard();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => popup()).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("traps focus: Tab from the last control wraps to the first, Shift+Tab from the first to the last", async () => {
    await render(<Example />);
    await openByKeyboard();
    [...popup()!.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent === "Cancel")!.focus();
    await tab(1);
    await expect.poll(focused).toBe("Name");
    await tab(1, true);
    await expect.poll(focused).toBe("Cancel");
  });
});

describe("dialog: construction", () => {
  it("is a region frame over a scrim", async () => {
    await render(<Example />);
    await openByKeyboard();
    const cs = getComputedStyle(popup()!);
    expect([cs.position, cs.borderTopWidth, cs.borderBottomWidth]).toEqual(["fixed", "3px", "3px"]);
    const b = getComputedStyle(backdrop()!);
    expect(b.position).toBe("fixed");
    expect(b.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    // the scrim sits under the frame
    expect(Number(cs.zIndex)).toBeGreaterThanOrEqual(Number(b.zIndex));
    expect(backdrop()!.compareDocumentPosition(popup()!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("unfolds from its top keyline and folds back, inert while it leaves, instantly under reduced motion", async () => {
    await render(<Example />);
    await openByKeyboard();
    const p = popup()!;
    const b = backdrop()!;
    p.style.transition = "none";
    b.style.transition = "none";
    for (const state of ["data-starting-style", "data-ending-style"]) {
      p.setAttribute(state, "");
      b.setAttribute(state, "");
      expect(getComputedStyle(p).clipPath).toBe("inset(0px 0px 100%)");
      expect(getComputedStyle(b).opacity).toBe("0");
      p.removeAttribute(state);
      b.removeAttribute(state);
    }
    p.setAttribute("data-ending-style", "");
    expect(getComputedStyle(p).pointerEvents).toBe("none");
    p.removeAttribute("data-ending-style");
    p.style.transition = "";
    b.style.transition = "";
    expect(parseFloat(getComputedStyle(p).transitionDuration)).toBeGreaterThan(0);
    expect(parseFloat(getComputedStyle(b).transitionDuration)).toBeGreaterThan(0);
    document.querySelector("main")!.setAttribute("data-kl-motion", "reduce");
    expect(getComputedStyle(p).transitionDuration).toBe("0s");
    expect(getComputedStyle(b).transitionDuration).toBe("0s");
  });
});

/** The usual confirmation. */
function Confirm({ onConfirm, tone }: { onConfirm: () => void; tone?: "destructive" | "primary" }) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <main ref={setMain} style={{ padding: 40 }}>
      <AlertDialog>
        <AlertDialogTrigger>Delete view</AlertDialogTrigger>
        <AlertDialogContent
          container={main}
          tone={tone}
          title="Delete this view?"
          description="Its filters are lost."
          cancelLabel="Keep view"
          confirmLabel="Delete view"
          onConfirm={onConfirm}
        />
      </AlertDialog>
    </main>
  );
}

const alertPopup = () => document.querySelector<HTMLElement>('[data-slot="alert-dialog-popup"]');

async function openAlert() {
  document.querySelector<HTMLElement>('[data-slot="alert-dialog-trigger"]')!.focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => alertPopup()).not.toBeNull();
  await expect.poll(() => alertPopup()!.hasAttribute("data-starting-style")).toBe(false);
}

describe("alert dialog", () => {
  it("has no violations, closed and open", async () => {
    await render(<Confirm onConfirm={() => {}} />);
    await expectNoAxeViolations();
    await openAlert();
    // modal: the page is inert behind it, so the open state is judged on the dialog
    await expectNoAxeViolations(alertPopup()!);
  });

  it("is an alertdialog that lands on the safe answer, and Escape returns focus to the trigger", async () => {
    await render(<Confirm onConfirm={() => {}} />);
    await openAlert();
    expect(alertPopup()!.getAttribute("role")).toBe("alertdialog");
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("alert-dialog-cancel");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => alertPopup()).toBeNull();
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("alert-dialog-trigger");
  });

  it("traps focus between its two answers", async () => {
    await render(<Confirm onConfirm={() => {}} />);
    await openAlert();
    await tab(1);
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("alert-dialog-confirm");
    await tab(1);
    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("alert-dialog-cancel");
  });

  it("confirms once and closes", async () => {
    let n = 0;
    await render(<Confirm onConfirm={() => n++} />);
    await openAlert();
    document.querySelector<HTMLElement>('[data-slot="alert-dialog-confirm"]')!.click();
    await expect.poll(() => alertPopup()).toBeNull();
    expect(n).toBe(1);
  });

  it("floods the confirm answer and the signal with the tone", async () => {
    await render(<Confirm onConfirm={() => {}} tone="primary" />);
    await openAlert();
    expect(alertPopup()!.getAttribute("data-tone")).toBe("primary");
    const signal = document.querySelector<HTMLElement>('[data-slot="alert-dialog-signal"]')!;
    const confirm = document.querySelector<HTMLElement>('[data-slot="alert-dialog-confirm"]')!;
    const cancel = document.querySelector<HTMLElement>('[data-slot="alert-dialog-cancel"]')!;
    expect(signal.textContent).toBe("?");
    expect(getComputedStyle(confirm).backgroundColor).toBe(getComputedStyle(signal).backgroundColor);
    expect(getComputedStyle(cancel).backgroundColor).not.toBe(getComputedStyle(confirm).backgroundColor);
    // region weight on the bottom keyline
    expect(getComputedStyle(document.querySelector('[data-slot="alert-dialog-footer"]')!).borderTopWidth).toBe("3px");
  });
});
