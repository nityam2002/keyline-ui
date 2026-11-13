import "./render-count";

import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue, Stat } from "@/components/keyline/ui/stat";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inMeter = (part: React.ReactNode) => <Meter value={40}>{part}</Meter>;

describeConformance("stat", {
  Stat: { element: <Stat label="Shipments" value="1,284" />, refInstanceof: HTMLDivElement, slot: "stat" },
  Meter: { element: <Meter label="Storage" value={40} />, refInstanceof: HTMLDivElement, slot: "meter" },
  MeterLabel: {
    element: <MeterLabel>Storage</MeterLabel>,
    refInstanceof: HTMLSpanElement,
    slot: "meter-label",
    wrap: inMeter,
  },
  MeterValue: { element: <MeterValue />, refInstanceof: HTMLSpanElement, slot: "meter-value", wrap: inMeter },
  MeterTrack: { element: <MeterTrack />, refInstanceof: HTMLDivElement, slot: "meter-track", wrap: inMeter },
  MeterIndicator: {
    element: <MeterIndicator />,
    refInstanceof: HTMLDivElement,
    slot: "meter-indicator",
    wrap: (part) => inMeter(<MeterTrack>{part}</MeterTrack>),
  },
});

function Metrics() {
  return (
    <div style={{ display: "flex", width: 720 }}>
      <Stat
        data-testid="good"
        label="On-time rate"
        value="96.4"
        unit="%"
        delta={{ value: "+1.2", direction: "up", tone: "good", label: "up 1.2 points" }}
      />
      <Stat
        data-testid="bad"
        label="Exceptions"
        value="38"
        delta={{ value: "+9", direction: "up", tone: "bad", label: "up 9 since yesterday" }}
      />
      <Stat data-testid="flat" label="Dwell" value="4.1" unit="d" delta={{ value: "0", direction: "flat" }} />
      <Stat
        data-testid="down"
        label="Holds"
        value="3"
        delta={{ value: "−2", direction: "down" }}
        meter={{ value: 3, max: 10 }}
      />
    </div>
  );
}

function Meters() {
  return (
    <div style={{ width: 360 }}>
      <Meter data-testid="under" label="Container fill" value={62} high={90} />
      <Meter data-testid="over" label="Reefer load" value={96} high={90} />
      <Meter data-testid="composed" value={30} max={50}>
        <MeterLabel>Pallets</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  );
}

const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const part = (id: string, slot: string) => el(id).querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;

function token(name: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

describe("stat: axe", () => {
  it("has no violations: stats with each delta, a stat with a meter, meters under and over high, composed", async () => {
    await render(
      <main>
        <Metrics />
        <Meters />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("stat: semantics", () => {
  it("the delta's words are read and its figure shown; the meter in a stat is named and labelless", async () => {
    await render(
      <main>
        <Metrics />
      </main>,
    );
    const delta = part("bad", "stat-delta");
    expect(delta.querySelector(".kl-sr")!.textContent).toBe("up 9 since yesterday");
    expect(delta.querySelector('[aria-hidden="true"]:not([data-slot])')!.textContent).toBe("+9");
    const meter = part("down", "meter");
    expect(meter.getAttribute("role")).toBe("meter");
    expect(meter.getAttribute("aria-label")).toBe("Holds");
    expect(meter.querySelector('[data-slot="meter-label"]')).toBeNull();
  });

  it("a meter is named by its label, its readout hidden (the meter announces its value)", async () => {
    await render(
      <main>
        <Meters />
      </main>,
    );
    const m = el("under");
    expect(m.getAttribute("role")).toBe("meter");
    expect(m.getAttribute("aria-valuenow")).toBe("62");
    expect(m.getAttribute("aria-labelledby")).toBe(part("under", "meter-label").id);
    expect(part("under", "meter-value").getAttribute("aria-hidden")).toBe("true");
    expect(part("under", "meter-value").textContent).toBe("62/100");
    expect(el("over").hasAttribute("data-over")).toBe(true);
    expect(el("under").hasAttribute("data-over")).toBe(false);
  });
});

describe("stat: drawing", () => {
  it("the delta is coloured only when it needs attention; its shape says the direction", async () => {
    await render(
      <main>
        <Metrics />
      </main>,
    );
    expect(getComputedStyle(part("bad", "stat-delta")).color).toBe(token("--kl-red-text"));
    expect(getComputedStyle(part("good", "stat-delta")).color).toBe(token("--kl-ink"));
    expect(getComputedStyle(part("flat", "stat-delta")).color).toBe(token("--kl-ink-2"));
    const up = getComputedStyle(part("good", "stat-arrow"));
    expect([up.borderBottomWidth, up.borderTopWidth, up.borderLeftWidth]).toEqual(["8px", "0px", "5px"]);
    const down = getComputedStyle(part("down", "stat-arrow"));
    expect([down.borderBottomWidth, down.borderTopWidth]).toEqual(["0px", "8px"]);
    const flat = getComputedStyle(part("flat", "stat-arrow"));
    expect([flat.width, flat.borderTopWidth, flat.borderLeftWidth]).toEqual(["10px", "2px", "0px"]);
  });

  it("stats in a row share it equally, and the count scales with its cell", async () => {
    await render(
      <main>
        <Metrics />
      </main>,
    );
    const widths = ["good", "bad", "flat", "down"].map((id) => el(id).getBoundingClientRect().width);
    expect(widths).toEqual([180, 180, 180, 180]);
    // 13cqi of a 180px cell minus its 2×(inset+4px) padding, clamped to 18..32px
    const count = part("good", "stat-value").querySelector<HTMLElement>(".kl-count")!;
    const inner = el("good").clientWidth - parseFloat(getComputedStyle(el("good")).paddingLeft) * 2;
    const px = parseFloat(getComputedStyle(count).fontSize);
    expect(px).toBeCloseTo(Math.min(32, Math.max(18, inner * 0.13)), 1);
    expect(px).toBeLessThan(32);
  });

  it("a meter's label and readout share a row; the fill is ink, red over high", async () => {
    await render(
      <main>
        <Meters />
      </main>,
    );
    for (const id of ["under", "composed"]) {
      const root = el(id).getBoundingClientRect();
      const value = part(id, "meter-value").getBoundingClientRect();
      const label = part(id, "meter-label").getBoundingClientRect();
      expect(label.left).toBe(root.left);
      expect(value.right).toBe(root.right);
      expect(value.top).toBeLessThan(label.bottom);
      expect(part(id, "meter-track").getBoundingClientRect().width).toBe(root.width);
    }
    expect(getComputedStyle(part("under", "meter-indicator")).backgroundColor).toBe(token("--kl-inverse"));
    expect(getComputedStyle(part("over", "meter-indicator")).backgroundColor).toBe(token("--kl-red"));
    expect(getComputedStyle(part("over", "meter-value")).color).toBe(token("--kl-red-text"));
    expect(getComputedStyle(part("under", "meter-value")).color).not.toBe(token("--kl-red-text"));
  });
});
