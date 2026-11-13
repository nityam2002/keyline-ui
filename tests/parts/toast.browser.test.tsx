import "./render-count";

import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import {
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastDock,
  ToastFloating,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  createToaster,
} from "@/components/keyline/ui/toast";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

/** Adds one toast on mount and hands it to `children` (a ToastRoot), as a toast list does. */
function OneToast({ children }: { children: React.ReactElement }) {
  const m = Toast.useToastManager();
  const added = React.useRef(false);
  React.useEffect(() => {
    if (added.current) return;
    added.current = true;
    m.add({
      title: "Manifest sent",
      description: "SH-204832 to the carrier.",
      timeout: 0,
      actionProps: { children: "Undo" },
    });
  }, [m]);
  const t = m.toasts[0];
  return t ? React.cloneElement(children as React.ReactElement<{ toast?: unknown }>, { toast: t }) : null;
}

const viewport = (part: React.ReactNode) => (
  <ToastProvider>
    <ToastViewport>{part}</ToastViewport>
  </ToastProvider>
);
const inToast = (part: React.ReactNode) =>
  viewport(
    <OneToast>
      {/* @ts-expect-error the toast is handed in by OneToast */}
      <ToastRoot>{part}</ToastRoot>
    </OneToast>,
  );
const rendered = (slot: string) => () =>
  expect.poll(() => document.querySelector(`[data-slot="${slot}"]`)).not.toBeNull() as unknown as Promise<void>;

describeConformance("toast", {
  ToastViewport: {
    element: <ToastViewport />,
    refInstanceof: HTMLDivElement,
    slot: "toast-viewport",
    wrap: (part) => <ToastProvider>{part}</ToastProvider>,
  },
  ToastDock: {
    element: <ToastDock />,
    refInstanceof: HTMLDivElement,
    slot: "toast-viewport",
    wrap: (part) => <ToastProvider>{part}</ToastProvider>,
  },
  ToastFloating: {
    element: <ToastFloating />,
    refInstanceof: HTMLDivElement,
    slot: "toast-viewport",
    wrap: (part) => <ToastProvider>{part}</ToastProvider>,
  },
  ToastRoot: {
    // @ts-expect-error the toast is handed in by OneToast
    element: <ToastRoot />,
    refInstanceof: HTMLDivElement,
    slot: "toast-root",
    wrap: (part) => viewport(<OneToast>{part as React.ReactElement}</OneToast>),
    ready: rendered("toast-root"),
  },
  ToastTitle: {
    element: <ToastTitle />,
    refInstanceof: HTMLHeadingElement,
    slot: "toast-title",
    wrap: inToast,
    ready: rendered("toast-title"),
  },
  ToastDescription: {
    element: <ToastDescription />,
    refInstanceof: HTMLParagraphElement,
    slot: "toast-description",
    wrap: inToast,
    ready: rendered("toast-description"),
  },
  ToastAction: {
    element: <ToastAction />,
    refInstanceof: HTMLButtonElement,
    slot: "toast-action",
    button: true,
    wrap: inToast,
    ready: rendered("toast-action"),
  },
  ToastClose: {
    element: <ToastClose aria-label="Dismiss" />,
    refInstanceof: HTMLButtonElement,
    slot: "toast-close",
    button: true,
    wrap: inToast,
    ready: rendered("toast-close"),
  },
});

type Toaster = ReturnType<typeof createToaster>;

/** A page with a dock (a host cell) or the floating corner; the floating viewport portals into the page's landmark. */
function Example({
  toaster,
  placement = "floating",
  motion,
}: {
  toaster: Toaster;
  placement?: "dock" | "floating";
  motion?: "reduce";
}) {
  const [main, setMain] = React.useState<HTMLElement | null>(null);
  return (
    <ToastProvider toastManager={toaster}>
      <main ref={setMain} data-kl-motion={motion} style={{ padding: 40 }}>
        <input aria-label="Before" />
        {placement === "dock" ? (
          <div className="kl-ctl" style={{ display: "flex", width: 480, minHeight: 44, marginTop: 200 }}>
            <ToastDock />
          </div>
        ) : (
          <ToastFloating container={main} />
        )}
      </main>
    </ToastProvider>
  );
}

const roots = () => [...document.querySelectorAll<HTMLElement>('[data-slot="toast-root"]')];
const live = () => roots().filter((r) => !r.hasAttribute("data-ending-style"));
const vp = () => document.querySelector<HTMLElement>('[data-slot="toast-viewport"]')!;
/* every toast has arrived and stopped moving (the stack's transitions have run) */
const settled = () =>
  expect
    .poll(() =>
      roots().some((r) => r.hasAttribute("data-starting-style") || r.getAnimations({ subtree: true }).length > 0),
    )
    .toBe(false);

function tone(v: string) {
  const i = document.createElement("i");
  i.style.color = `var(${v})`;
  document.querySelector("main")!.append(i);
  const c = getComputedStyle(i).color;
  i.remove();
  return c;
}

async function show(toaster: Toaster, n = 1, action = true) {
  for (let i = 0; i < n; i++)
    toaster.notify({
      title: `Manifest ${i + 1} sent`,
      description: "To the carrier.",
      timeout: 0,
      action: action ? { label: "Undo", onClick: () => {} } : undefined,
    });
  await expect.poll(() => live().length).toBe(n);
  await settled();
}

/* Base UI hides a toast's close button from assistive technology until the stack is expanded or the button has focus
   (ToastClose: aria-hidden={!expanded && !hasFocus}), so collapsed, axe's aria-hidden-focus flags it. That is Base UI's
   markup, not the part's: collapsed, the close cells are left out; expanded (F6 or hover), everything is judged. */
const closeCells = () => [...document.querySelectorAll('[data-slot="toast-close"]')];

describe("toast: axe", () => {
  for (const placement of ["dock", "floating"] as const) {
    it(`${placement}: has no violations, empty, with toasts, and expanded`, async () => {
      const toaster = createToaster();
      await render(<Example toaster={toaster} placement={placement} />);
      await expectNoAxeViolations();
      await show(toaster, 2);
      await expectNoAxeViolations(document.body, closeCells());
      document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
      await userEvent.keyboard("{F6}");
      await expect.poll(() => vp().hasAttribute("data-expanded")).toBe(true);
      await expect.poll(() => closeCells().every((c) => c.getAttribute("aria-hidden") === "false")).toBe(true);
      // the fan-out has finished: contrast is judged on the colours at rest, not mid-fade
      await settled();
      await expectNoAxeViolations();
    });
  }
});

describe("toast: keyboard", () => {
  it("F6 (Base UI's viewport hotkey) moves focus into the viewport; the action and the dismiss cell are reachable", async () => {
    const toaster = createToaster();
    await render(<Example toaster={toaster} />);
    await show(toaster);
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard("{F6}");
    await expect.poll(() => vp().contains(document.activeElement)).toBe(true);
    // into the toast, then its buttons (Option+Tab reaches a button in WebKit)
    const tab = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
    const seen: (string | null | undefined)[] = [];
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard(tab);
      seen.push(document.activeElement?.getAttribute("data-slot"));
    }
    expect(seen).toContain("toast-action");
    expect(seen).toContain("toast-close");
    document.querySelector<HTMLElement>('[data-slot="toast-close"]')!.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => live().length).toBe(0);
  });
});

describe("toast: construction", () => {
  it("dock: the signal, text, action and dismiss are cells on on-inverse dividers", async () => {
    const toaster = createToaster();
    await render(<Example toaster={toaster} placement="dock" />);
    await show(toaster);
    const divider = tone("--kl-on-inverse");
    for (const slot of ["toast-text", "toast-action", "toast-close"]) {
      const cs = getComputedStyle(document.querySelector(`[data-slot="${slot}"]`)!);
      expect([slot, cs.borderInlineStartWidth, cs.borderInlineStartStyle, cs.borderInlineStartColor]).toEqual([
        slot,
        "1px",
        "solid",
        divider,
      ]);
    }
    expect(getComputedStyle(document.querySelector('[data-slot="toast-signal"]')!).borderInlineStartWidth).toBe("0px");
  });

  it("the cells take the toast's colour (on-inverse), not the ink of an outermost Keyline element", async () => {
    const toaster = createToaster();
    await render(<Example toaster={toaster} />);
    await show(toaster);
    const ink = tone("--kl-on-inverse");
    for (const slot of ["toast-cells", "toast-title", "toast-description", "toast-close"])
      expect([slot, getComputedStyle(document.querySelector(`[data-slot="${slot}"]`)!).color]).toEqual([slot, ink]);
  });

  it("floating: the older toasts wait behind the front one as paper cards, each lifted by the peek", async () => {
    const toaster = createToaster();
    await render(<Example toaster={toaster} />);
    await show(toaster, 3);
    const [front, ...behind] = live();
    expect(front!.hasAttribute("data-kl-front")).toBe(true);
    expect(getComputedStyle(front!).backgroundColor).toBe(tone("--kl-inverse"));
    const f = front!.getBoundingClientRect();
    behind.forEach((b, i) => {
      expect(b.hasAttribute("data-kl-behind")).toBe(true);
      expect(getComputedStyle(b).backgroundColor).toBe(tone("--kl-cell"));
      const r = b.getBoundingClientRect();
      expect(r.bottom).toBeCloseTo(f.bottom - (i + 1) * 8, 0);
      expect(r.left).toBeCloseTo(f.left + (i + 1) * 8, 0);
    });
  });

  it("the stack moves on transitions, and instantly under reduced motion", async () => {
    const toaster = createToaster();
    const screen = await render(<Example toaster={toaster} />);
    await show(toaster, 2);
    const duration = () => getComputedStyle(live()[1]!).transitionDuration.split(", ")[0];
    expect(duration()).toBe("0.32s");
    await screen.rerender(<Example toaster={toaster} motion="reduce" />);
    await expect.poll(duration).toBe("0s");
  });

  it("a held swipe follows the pointer: no transition while swiping", async () => {
    const toaster = createToaster();
    await render(<Example toaster={toaster} />);
    await show(toaster);
    const r = live()[0]!;
    expect(getComputedStyle(r).transitionDuration).toContain("0.32s");
    r.setAttribute("data-swiping", "");
    expect(getComputedStyle(r).transitionDuration.split(", ")).toEqual(expect.arrayContaining(["0s"]));
    expect(getComputedStyle(r).transitionDuration).not.toContain("0.32s");
    r.removeAttribute("data-swiping");
  });

  it("the countdown drains the bottom keyline, and stops under reduced motion", async () => {
    const toaster = createToaster();
    const screen = await render(<Example toaster={toaster} />);
    toaster.notify({ title: "Archived SH-204832", timeout: 6000 });
    await expect.poll(() => document.querySelector('[data-slot="toast-drain"]')).not.toBeNull();
    const drain = () => getComputedStyle(document.querySelector('[data-slot="toast-drain"]')!);
    expect(drain().animationName).toBe("kl-drain");
    expect(drain().animationDuration).toBe("6s");
    expect(drain().height).toBe("3px");
    await screen.rerender(<Example toaster={toaster} motion="reduce" />);
    await expect.poll(() => drain().animationName).toBe("none");
  });
});
