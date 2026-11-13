import "./render-count";

import { Badge, Status } from "@/components/keyline/ui/status";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("status", {
  Status: { element: <Status kind="normal">In transit</Status>, refInstanceof: HTMLSpanElement, slot: "status" },
  Badge: { element: <Badge>A6</Badge>, refInstanceof: HTMLSpanElement, slot: "badge" },
});

const KINDS = ["normal", "waiting", "attention", "done", "none"] as const;

describe("status: axe", () => {
  it("has no violations: every kind, every badge tone", async () => {
    await render(
      <main>
        {KINDS.map((k) => (
          <Status key={k} kind={k}>
            {k}
          </Status>
        ))}
        <Badge>A6</Badge>
        <Badge tone="signal">3 free</Badge>
        <Badge tone="attention">LATE</Badge>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("status: shape and voice", () => {
  it("draws a glyph per kind beside the words, hidden from assistive tech", async () => {
    await render(
      <main>
        {KINDS.map((k) => (
          <Status key={k} kind={k}>
            {k}
          </Status>
        ))}
      </main>,
    );
    for (const s of document.querySelectorAll<HTMLElement>('[data-slot="status"]')) {
      const glyph = s.querySelector<HTMLElement>(".kl-glyph")!;
      expect(glyph.getAttribute("aria-hidden")).toBe("true");
      expect(glyph.dataset["kind"]).toBe(s.dataset["kind"]);
    }
  });

  it("a badge is the Code voice: mono, untabulated, whatever the row around it sets", async () => {
    await render(
      <main style={{ fontVariantNumeric: "tabular-nums", fontStyle: "italic" }}>
        <Badge>A6</Badge>
      </main>,
    );
    const badge = getComputedStyle(document.querySelector('[data-slot="badge"]')!);
    expect(badge.fontVariantNumeric).toBe("normal");
    expect(badge.fontStyle).toBe("normal");
    expect(badge.fontFamily.replace(/[\s"']/g, "")).toBe(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--kl-font-mono")
        .replace(/[\s"']/g, ""),
    );
  });
});
