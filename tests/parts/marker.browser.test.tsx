import "./render-count";

import { Marker, MarkerContent, MarkerIcon } from "@/components/keyline/ui/marker";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const icon = (
  <svg viewBox="0 0 16 16">
    <path d="M2 8h12" stroke="currentColor" />
  </svg>
);

describeConformance("marker", {
  Marker: { element: <Marker>Yesterday</Marker>, refInstanceof: HTMLDivElement, slot: "marker" },
  MarkerIcon: {
    element: <MarkerIcon>{icon}</MarkerIcon>,
    refInstanceof: HTMLSpanElement,
    slot: "marker-icon",
    wrap: (part) => <Marker>{part}</Marker>,
  },
  MarkerContent: {
    element: <MarkerContent>Assigned to DHL Freight</MarkerContent>,
    refInstanceof: HTMLSpanElement,
    slot: "marker-content",
    wrap: (part) => <Marker>{part}</Marker>,
  },
});

function Timeline() {
  return (
    <main style={{ width: 420 }}>
      <Marker variant="separator">
        <MarkerContent>Yesterday</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>{icon}</MarkerIcon>
        <MarkerContent>Assigned SH-20483 to DHL Freight</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>Customs · 2 steps</MarkerContent>
      </Marker>
      <Marker pending data-testid="with-icon">
        <MarkerIcon>{icon}</MarkerIcon>
        <MarkerContent>Checking the customs declaration…</MarkerContent>
      </Marker>
      <Marker pending data-testid="no-icon">
        <MarkerContent>Thinking…</MarkerContent>
      </Marker>
    </main>
  );
}

describe("marker: axe", () => {
  it("has no violations: default, separator, border, pending", async () => {
    await render(<Timeline />);
    await expectNoAxeViolations();
  });
});

describe("marker: roles", () => {
  it("a separator is a separator; a pending step is a busy polite status", async () => {
    await render(<Timeline />);
    const [sep] = document.querySelectorAll<HTMLElement>('[data-slot="marker"]');
    expect(sep!.getAttribute("role")).toBe("separator");
    const pending = document.querySelector<HTMLElement>('[data-testid="with-icon"]')!;
    expect(pending.getAttribute("role")).toBe("status");
    expect(pending.getAttribute("aria-busy")).toBe("true");
  });
});

describe("marker: drawing", () => {
  it("a separator draws a keyline either side of the words, each a flexible run", async () => {
    await render(<Timeline />);
    const sep = document.querySelector<HTMLElement>('[data-variant="separator"]')!;
    for (const side of ["::before", "::after"]) {
      const s = getComputedStyle(sep, side);
      expect(s.borderTopWidth).toBe("1px");
      expect(s.flexGrow).toBe("1");
      expect(parseFloat(s.width)).toBeGreaterThan(12);
    }
  });

  it("the pending segment runs under the words: past the glyph cell, or from the start without one", async () => {
    await render(<Timeline />);
    const start = (id: string) => {
      const m = document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
      const run = m.querySelector<HTMLElement>('[data-slot="marker-run"]')!;
      const words = m.querySelector<HTMLElement>('[data-slot="marker-content"]')!;
      const left = m.getBoundingClientRect().left;
      return [run.getBoundingClientRect().left - left, words.getBoundingClientRect().left - left];
    };
    expect(start("with-icon")).toEqual([34, 34]);
    expect(start("no-icon")).toEqual([0, 0]);
  });
});
