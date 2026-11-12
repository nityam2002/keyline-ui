import "./render-count";

import { Button } from "@/components/keyline/ui/button";
import { Empty } from "@/components/keyline/ui/empty";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("empty", {
  Empty: { element: <Empty title="No shipments match these filters" />, refInstanceof: HTMLDivElement, slot: "empty" },
});

function Places({ width }: { width: number }) {
  return (
    <div style={{ width }}>
      <Empty
        data-testid="empty"
        title="No shipments match these filters"
        description="Status is Delayed · Carrier is DHL"
        actions={<Button>Clear all</Button>}
      />
      <Empty
        data-testid="error"
        kind="error"
        live
        title="Shipments could not be loaded"
        description="The carrier feed timed out."
        actions={<Button>Retry</Button>}
      />
      <Empty
        data-testid="start"
        kind="start"
        headingLevel={2}
        title="No routes yet"
        actions={<Button>New route</Button>}
      />
    </div>
  );
}

const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const part = (id: string, slot: string) => el(id).querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const rect = (id: string, slot: string) => part(id, slot).getBoundingClientRect();

function token(name: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("empty: axe", () => {
  it("has no violations: empty, error (live), start, wide and narrow", async () => {
    await render(
      <main>
        <Places width={760} />
        <Places width={360} />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("empty: semantics", () => {
  it("the count and its code, the title at its heading level, live as status or alert", async () => {
    await render(
      <main>
        <Places width={760} />
      </main>,
    );
    expect(part("empty", "empty-figure").textContent).toBe("0");
    expect(part("empty", "empty-code").textContent).toBe("RESULTS");
    expect(part("error", "empty-figure").textContent).toBe("!");
    expect(part("start", "empty-figure").tagName).toBe("svg");
    expect(part("start", "empty-code").textContent).toBe("NEW");
    expect(part("empty", "empty-title").tagName).toBe("H3");
    expect(part("start", "empty-title").tagName).toBe("H2");
    expect(el("error").getAttribute("role")).toBe("alert");
    expect(el("empty").hasAttribute("role")).toBe(false);
    expect(el("error").getAttribute("data-kind")).toBe("error");
    expect(el("empty").getAttribute("data-kl-layout")).toBe("control");
  });
});

describe("empty: drawing", () => {
  it("wide: count · message · actions side by side; the error count floods red, its frame red", async () => {
    await render(
      <main>
        <Places width={760} />
      </main>,
    );
    const count = rect("empty", "empty-count");
    const content = rect("empty", "empty-content");
    const actions = rect("empty", "empty-actions");
    expect(count.right).toBeLessThanOrEqual(content.left);
    expect(content.right).toBeLessThanOrEqual(actions.left);
    expect(count.width).toBeGreaterThanOrEqual(168);
    expect(getComputedStyle(part("empty", "empty-count")).fontSize).toBe("72px");
    expect(getComputedStyle(part("error", "empty-count")).backgroundColor).toBe(token("--kl-red"));
    expect(getComputedStyle(el("error")).borderTopColor).toBe(token("--kl-red"));
    expect(getComputedStyle(part("start", "empty-count")).color).toBe(token("--kl-ink-2"));
  });

  it("narrow: the count is a band across the top, the actions a row under the message", async () => {
    await render(
      <main>
        <Places width={360} />
      </main>,
    );
    const root = el("empty").getBoundingClientRect();
    const count = rect("empty", "empty-count");
    const content = rect("empty", "empty-content");
    const actions = rect("empty", "empty-actions");
    expect(count.bottom).toBeLessThanOrEqual(content.top);
    expect(content.bottom).toBeLessThanOrEqual(actions.top);
    expect(count.left - root.left).toBeLessThan(4);
    expect(root.right - count.right).toBeLessThan(4);
    const s = getComputedStyle(part("empty", "empty-count"));
    expect(s.fontSize).toBe("40px");
    expect(s.borderBottomWidth).toBe("1px");
    expect(s.borderInlineEndWidth).toBe("0px");
  });

  it("the narrow bound is inclusive: 520px of its own width is narrow, 521px is wide", async () => {
    await render(
      <main>
        <Empty data-testid="at" layout="cell" title="At the bound" style={{ width: 520 }} />
        <Empty data-testid="over" layout="cell" title="Over the bound" style={{ width: 521 }} />
      </main>,
    );
    expect(getComputedStyle(part("at", "empty-count")).fontSize).toBe("40px");
    expect(getComputedStyle(part("over", "empty-count")).fontSize).toBe("72px");
  });

  it("compact density outranks the narrow band", async () => {
    await render(
      <main>
        <div data-kl-density="compact">
          <Places width={760} />
          <Places width={360} />
        </div>
      </main>,
    );
    const [wide, narrow] = document.querySelectorAll<HTMLElement>('[data-testid="empty"] [data-slot="empty-count"]');
    expect(getComputedStyle(wide!).fontSize).toBe("56px");
    expect(getComputedStyle(wide!).minWidth).toBe("128px");
    const s = getComputedStyle(narrow!);
    expect(s.fontSize).toBe("56px");
    expect(s.minWidth).toBe("128px");
    expect(s.paddingTop).toBe("16px");
    // the band's own shape still applies
    expect(s.borderBottomWidth).toBe("1px");
  });
});
