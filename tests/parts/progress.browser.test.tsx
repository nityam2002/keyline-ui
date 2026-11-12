import "./render-count";

import {
  Progress,
  ProgressDetail,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/keyline/ui/progress";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inRoot = (part: React.ReactNode) => <Progress value={40}>{part}</Progress>;

describeConformance("progress", {
  Progress: {
    element: <Progress label="Uploading manifest.pdf" value={40} />,
    refInstanceof: HTMLDivElement,
    slot: "progress",
  },
  ProgressLabel: {
    element: <ProgressLabel>Uploading manifest.pdf</ProgressLabel>,
    refInstanceof: HTMLSpanElement,
    slot: "progress-label",
    wrap: inRoot,
  },
  ProgressValue: { element: <ProgressValue />, refInstanceof: HTMLSpanElement, slot: "progress-value", wrap: inRoot },
  ProgressTrack: { element: <ProgressTrack />, refInstanceof: HTMLDivElement, slot: "progress-track", wrap: inRoot },
  ProgressIndicator: {
    element: <ProgressIndicator />,
    refInstanceof: HTMLDivElement,
    slot: "progress-indicator",
    wrap: (part) => inRoot(<ProgressTrack>{part}</ProgressTrack>),
  },
  ProgressDetail: {
    element: <ProgressDetail>3.2 of 5 MB</ProgressDetail>,
    refInstanceof: HTMLSpanElement,
    slot: "progress-detail",
    wrap: inRoot,
  },
});

function Uploads() {
  return (
    <main style={{ width: 360 }}>
      <Progress data-testid="done" label="Commercial invoice.pdf" value={100} detail="212 KB · uploaded" />
      <Progress data-testid="running" label="Packing list.xlsx" value={64} detail="56 of 88 KB" />
      <Progress data-testid="waiting" label="Scanning for viruses" value={null} />
      <Progress
        data-testid="failed"
        label="EUR.1 certificate.pdf"
        value={38}
        failed
        detail="The connection dropped at 38%. Retry; the upload resumes where it stopped."
      />
      <Progress data-testid="hidden" label="In a table cell" hideLabel value={30} />
      <Progress data-testid="composed" value={20}>
        <ProgressLabel>Customs pack</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </main>
  );
}

const bar = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const part = (id: string, slot: string) => bar(id).querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const fill = (id: string) => part(id, "progress-indicator");

/** A token's computed colour, read through a probe so it compares with getComputedStyle values. */
function token(name: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("progress: axe", () => {
  it("has no violations: complete, progressing, indeterminate, failed, hidden label, composed", async () => {
    await render(<Uploads />);
    await expectNoAxeViolations();
  });
});

describe("progress: semantics", () => {
  it("is a progressbar named by its label and described by its detail; failed says so in its value text", async () => {
    await render(<Uploads />);
    const running = bar("running");
    expect(running.getAttribute("role")).toBe("progressbar");
    expect(running.getAttribute("aria-valuenow")).toBe("64");
    const label = part("running", "progress-label");
    expect(running.getAttribute("aria-labelledby")).toBe(label.id);
    expect(document.getElementById(running.getAttribute("aria-describedby")!)!.textContent).toBe("56 of 88 KB");
    expect(bar("failed").getAttribute("aria-valuetext")).toBe("Failed at 38%");
    expect(bar("failed").hasAttribute("data-failed")).toBe(true);
    expect(bar("hidden").getAttribute("aria-label")).toBe("In a table cell");
    expect(bar("hidden").querySelector('[data-slot="progress-label"]')).toBeNull();
    expect(bar("waiting").getAttribute("aria-valuenow")).toBeNull();
  });

  it("the readout: the value, the done glyph when complete, the failure in attention red", async () => {
    await render(<Uploads />);
    expect(part("running", "progress-value").textContent).toBe("64%");
    expect(part("done", "progress-value").querySelector('.kl-glyph[data-kind="done"]')).not.toBeNull();
    expect(part("running", "progress-value").querySelector(".kl-glyph")).toBeNull();
    const failed = part("failed", "progress-value");
    expect(failed.textContent).toBe("Failed");
    expect(failed.querySelector('.kl-glyph[data-kind="attention"]')).not.toBeNull();
    expect(getComputedStyle(failed).color).toBe(token("--kl-red-text"));
    expect(getComputedStyle(part("failed", "progress-detail")).color).toBe(token("--kl-ink"));
    expect(getComputedStyle(part("running", "progress-detail")).color).toBe(token("--kl-ink-2"));
    expect(part("composed", "progress-value").textContent).toBe("20%");
  });
});

describe("progress: drawing", () => {
  it("label and readout share a row at either end; the rail spans the bar under them", async () => {
    await render(<Uploads />);
    for (const id of ["running", "composed"]) {
      const root = bar(id).getBoundingClientRect();
      const label = part(id, "progress-label").getBoundingClientRect();
      const value = part(id, "progress-value").getBoundingClientRect();
      const track = part(id, "progress-track").getBoundingClientRect();
      expect(label.left).toBe(root.left);
      expect(value.right).toBe(root.right);
      expect(value.top).toBeLessThan(label.bottom);
      expect(track.width).toBe(root.width);
      expect(track.height).toBe(10);
      expect(track.top).toBeGreaterThanOrEqual(label.bottom);
    }
  });

  it("the fill is yellow with an ink leading edge; failed, red to its edge", async () => {
    await render(<Uploads />);
    const running = getComputedStyle(fill("running"));
    expect(running.backgroundColor).toBe(token("--kl-yellow"));
    expect(running.borderInlineEndWidth).toBe("1px");
    expect(running.borderInlineEndColor).toBe(token("--kl-line"));
    const failed = getComputedStyle(fill("failed"));
    expect(failed.backgroundColor).toBe(token("--kl-red"));
    expect(failed.borderInlineEndWidth).toBe("1px");
    expect(failed.borderInlineEndColor).toBe(token("--kl-red"));
    // complete: no leading edge to draw
    expect(getComputedStyle(fill("done")).borderInlineEndWidth).toBe("0px");
  });

  it("indeterminate runs the pending segment, reversed in RTL", async () => {
    await render(
      <>
        <Uploads />
        <div dir="rtl">
          <Progress data-testid="rtl" label="Scanning" value={null} />
        </div>
      </>,
    );
    const s = getComputedStyle(fill("waiting"));
    expect(s.animationName).toBe("kl-run");
    expect(s.animationIterationCount).toBe("infinite");
    expect(s.position).toBe("absolute");
    expect(s.borderInlineStartWidth).toBe("1px");
    expect(parseFloat(s.width) / part("waiting", "progress-track").clientWidth).toBeCloseTo(0.34, 2);
    expect(getComputedStyle(fill("rtl")).animationDirection).toBe("reverse");
  });

  it("reduced motion (data-kl-motion) stills it: a hatched full rail, no segment", async () => {
    await render(
      <div data-kl-motion="reduce">
        <Uploads />
      </div>,
    );
    const s = getComputedStyle(fill("waiting"));
    expect(s.animationName).toBe("none");
    expect(s.width).toBe(`${part("waiting", "progress-track").clientWidth}px`);
    expect(s.borderInlineStartWidth).toBe("0px");
    expect(s.backgroundImage).toMatch(/^repeating-linear-gradient/);
    expect(s.backgroundColor).toBe(token("--kl-yellow"));
    // a determinate bar is not affected
    expect(getComputedStyle(fill("running")).backgroundImage).toBe("none");
  });
});
