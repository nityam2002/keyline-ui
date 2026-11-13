import "./render-count";

import { Skeleton, SkeletonGroup } from "@/components/keyline/ui/skeleton";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("skeleton", {
  Skeleton: { element: <Skeleton />, refInstanceof: HTMLSpanElement, slot: "skeleton" },
  SkeletonGroup: {
    element: (
      <SkeletonGroup label="Loading carrier details">
        <Skeleton />
      </SkeletonGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "skeleton-group",
  },
});

function Loading({ busy = true }: { busy?: boolean }) {
  return (
    <main style={{ width: 320 }}>
      <SkeletonGroup label="Loading carrier details" busy={busy}>
        <Skeleton />
        <Skeleton lines={3} />
        <Skeleton shape="value" />
        <Skeleton shape="control" />
        <Skeleton shape="block" height={120} />
      </SkeletonGroup>
    </main>
  );
}

const boxes = () =>
  [...document.querySelectorAll<HTMLElement>('[data-slot="skeleton"], [data-slot="skeleton-line"]')].filter(
    (s) => s.dataset["shape"] !== "lines",
  );

describe("skeleton: axe", () => {
  it("has no violations, busy and settled", async () => {
    const screen = await render(<Loading />);
    await expectNoAxeViolations();
    await screen.rerender(<Loading busy={false} />);
    await expectNoAxeViolations();
  });
});

describe("skeleton: semantics", () => {
  it("the group is busy and names what is loading once; every placeholder is hidden", async () => {
    const screen = await render(<Loading />);
    const group = document.querySelector<HTMLElement>('[data-slot="skeleton-group"]')!;
    expect(group.getAttribute("aria-busy")).toBe("true");
    expect(group.querySelector('[role="status"]')!.textContent).toBe("Loading carrier details");
    for (const s of document.querySelectorAll('[data-slot="skeleton"]'))
      expect(s.getAttribute("aria-hidden")).toBe("true");
    await screen.rerender(<Loading busy={false} />);
    expect(group.getAttribute("aria-busy")).toBeNull();
    expect(group.querySelector('[role="status"]')!.textContent).toBe("");
  });
});

describe("skeleton: motion", () => {
  it("runs its segment, reversed in RTL", async () => {
    await render(
      <>
        <Loading />
        <div dir="rtl">
          <Skeleton data-testid="rtl" />
        </div>
      </>,
    );
    for (const s of boxes()) expect(getComputedStyle(s, "::after").animationName).toBe("kl-run-30");
    const rtl = document.querySelector<HTMLElement>('[data-testid="rtl"]')!;
    expect(getComputedStyle(rtl, "::after").animationDirection).toBe("reverse");
  });

  it("reduced motion (data-kl-motion) shows the static box alone", async () => {
    await render(
      <div data-kl-motion="reduce">
        <Loading />
      </div>,
    );
    expect(boxes().length).toBe(7);
    for (const s of boxes()) expect(getComputedStyle(s, "::after").display).toBe("none");
  });
});

describe("skeleton: footprint", () => {
  it("a control skeleton is a control frame's height and weight; lines stack, the last one shorter", async () => {
    await render(<Loading />);
    const ctl = document.querySelector<HTMLElement>('[data-shape="control"]')!;
    const probe = document.createElement("span");
    probe.style.height = "var(--kl-ctl)";
    probe.style.display = "block";
    document.body.append(probe);
    const ctlHeight = probe.getBoundingClientRect().height;
    probe.remove();
    expect(ctl.getBoundingClientRect().height).toBe(ctlHeight);
    expect(getComputedStyle(ctl).borderTopWidth).toBe("2px");
    const lines = [...document.querySelectorAll<HTMLElement>('[data-slot="skeleton-line"]')];
    expect(lines.length).toBe(3);
    expect(lines.at(-1)!.style.width).toBe("58%");
    expect(getComputedStyle(lines[0]!).marginTop).toBe("0px");
  });
});
