// Panel's parts (Keyline renders them: Panel, PanelHeader, PanelBody, PanelFooter, PanelGrid), axe, and the look the
// utilities carry: the header and footer keylines (1px in a cell panel), a cell row's keyline, the actions' cells, the
// body that takes the rest, and the joined grid.
import "./render-count";

import { Button } from "@/components/keyline/ui/button";
import { OtpField } from "@/components/keyline/ui/otp-field";
import { Toolbar, ToolbarButton } from "@/components/keyline/ui/toolbar";
import { Panel, PanelBody, PanelFooter, PanelGrid, PanelHeader } from "@/components/keyline/ui/panel";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("panel", {
  Panel: { element: <Panel />, refInstanceof: HTMLElement, slot: "panel" },
  PanelHeader: { element: <PanelHeader title="Manifests" />, refInstanceof: HTMLElement, slot: "panel-header" },
  PanelBody: { element: <PanelBody />, refInstanceof: HTMLDivElement, slot: "panel-body" },
  PanelFooter: { element: <PanelFooter />, refInstanceof: HTMLDivElement, slot: "panel-footer" },
  PanelGrid: { element: <PanelGrid />, refInstanceof: HTMLDivElement, slot: "panel-grid" },
});

const q = (slot: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
const cs = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo);
function color(value: string, root: Element = document.body) {
  const probe = document.createElement("span");
  probe.style.color = value;
  root.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}
const px = (el: Element, v: string) => {
  const probe = document.createElement("span");
  probe.style.width = `var(${v})`;
  el.append(probe);
  const w = getComputedStyle(probe).width;
  probe.remove();
  return w;
};
/* In light every edge is ink, so an edge colour is only told apart in dark */
const dark = () => document.querySelector(".dark")!;

function Example({ layout }: { layout?: "control" | "cell" }) {
  return (
    <Panel layout={layout} aria-label="Yard" style={{ height: 320 }}>
      <PanelHeader
        code="Y1"
        title="Yard"
        description="Slots in use"
        actions={
          <>
            <Button layout="cell">Export</Button>
            <Button layout="cell">Share</Button>
          </>
        }
      />
      <PanelBody>
        <p className="m-0">Twelve slots free.</p>
      </PanelBody>
      <PanelFooter>
        <span className="kl-cell">Updated 09:40</span>
        <Button layout="cell">Refresh</Button>
      </PanelFooter>
    </Panel>
  );
}

afterEach(async () => {
  await page.viewport(1280, 900);
});

describe("panel: axe", () => {
  it("has no violations: a panel with header, body and footer, and a grid of cell panels", async () => {
    await render(
      <main>
        <Example />
        <PanelGrid min={160}>
          <Panel layout="cell" aria-label="Sales">
            <PanelHeader headingLevel={3} title="Sales" />
            <PanelBody>1,810</PanelBody>
          </Panel>
          <Panel layout="cell" aria-label="Stock">
            <PanelHeader headingLevel={3} title="Stock" />
            <PanelBody flush>30 cases</PanelBody>
          </Panel>
        </PanelGrid>
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("panel: style", () => {
  it("the header and footer keylines are 3px on a panel, 1px on a cell panel; the body takes the rest", async () => {
    await render(
      <div className="dark" style={{ width: 480 }}>
        <Example />
        <Example layout="cell" />
      </div>,
    );
    const [control, cell] = [...document.querySelectorAll<HTMLElement>('[data-slot="panel"]')];
    for (const [p, w] of [
      [control!, "--kl-k3"],
      [cell!, "--kl-k1"],
    ] as const) {
      const h = q("panel-header", p);
      const f = q("panel-footer", p);
      expect(cs(h).borderBottomWidth).toBe(px(p, w));
      expect(cs(h).borderBottomColor).toBe(color("var(--kl-line)", dark()));
      expect(cs(f).borderTopWidth).toBe(px(p, w));
      expect(cs(f).borderTopColor).toBe(color("var(--kl-line)", dark()));
    }
    // the footer sits on the frame's bottom keyline: the body grew to fill
    const pr = control!.getBoundingClientRect();
    const bw = parseFloat(cs(control!).borderBottomWidth);
    expect(q("panel-footer", control!).getBoundingClientRect().bottom).toBeCloseTo(pr.bottom - bw, 1);
    expect(q("panel-header", control!).getBoundingClientRect().height).toBeGreaterThanOrEqual(52);
    expect(cs(q("panel-header", control!)).minHeight).toBe("52px");
    // the body takes the rest: it runs from the header to the footer
    const body = q("panel-body", control!);
    expect(cs(body).flexGrow).toBe("1");
    expect(body.getBoundingClientRect().bottom).toBeCloseTo(q("panel-footer", control!).getBoundingClientRect().top, 1);
  });

  it("without a body the footer still sits on the frame's bottom keyline", async () => {
    await render(
      <Panel aria-label="Short" style={{ height: 240 }}>
        <PanelHeader title="Short" />
        <PanelFooter>
          <Button layout="cell">Refresh</Button>
        </PanelFooter>
      </Panel>,
    );
    const p = q("panel");
    expect(q("panel-footer").getBoundingClientRect().bottom).toBeCloseTo(
      p.getBoundingClientRect().bottom - parseFloat(cs(p).borderBottomWidth),
      1,
    );
  });

  it("the title is 16px over a 13px description in the second ink; a text cell in the footer is 13px", async () => {
    await render(
      <div className="dark">
        <Example />
      </div>,
    );
    const title = q("panel-title");
    expect(cs(title).fontSize).toBe("16px");
    expect(cs(title).lineHeight).toBe("20px");
    expect(cs(title).marginTop).toBe("0px");
    const desc = q("panel-description");
    expect(cs(desc).fontSize).toBe("13px");
    expect(cs(desc).color).toBe(color("var(--kl-ink-2)", dark()));
    const text = q("panel-footer").querySelector<HTMLElement>(".kl-cell")!;
    expect(cs(text).fontSize).toBe("13px");
    expect(cs(text).color).toBe(color("var(--kl-ink-2)", dark()));
    expect(cs(text).flexGrow).toBe("1");
    expect(cs(text).flexBasis).toBe("auto");
    // any other footer cell shares the row equally (flex: 1 1 0)
    const refresh = q("panel-footer").querySelector<HTMLElement>("button")!;
    expect(cs(refresh).flexGrow).toBe("1");
    expect(cs(refresh).flexBasis).toBe("0px");
  });

  it("cell actions run edge to edge: no padding, a seam between them", async () => {
    await render(
      <div className="dark">
        <Example />
      </div>,
    );
    const actions = q("panel-actions");
    expect(cs(actions).paddingInlineStart).toBe("0px");
    expect(cs(actions).columnGap).toBe("0px");
    const [first, second] = [...actions.children] as HTMLElement[];
    expect(cs(first!).borderInlineStartWidth).toBe("0px");
    expect(cs(second!).borderInlineStartWidth).toBe(px(actions, "--kl-k1"));
    expect(cs(second!).borderInlineStartColor).toBe(color("var(--kl-seam)", dark()));
  });

  it("a cell row placed straight in the panel hands the keyline to the body under it", async () => {
    await render(
      <div className="dark">
        <Panel aria-label="Rows">
          <PanelHeader title="Rows" />
          <div data-kl-layout="cell" data-testid="row">
            Filter
          </div>
          <PanelBody>Body</PanelBody>
        </Panel>
      </div>,
    );
    const body = q("panel-body");
    expect(cs(body).borderTopWidth).toBe(px(body, "--kl-k1"));
    expect(cs(body).borderTopColor).toBe(color("var(--kl-line)", dark()));
    expect(cs(document.querySelector('[data-testid="row"]')!).flexShrink).toBe("0");
  });

  it("a cell Toolbar placed straight in the panel keeps its own fill (the panel's rule over its rows never beat it)", async () => {
    await render(
      <Panel aria-label="Records">
        <PanelHeader title="Records" />
        <Toolbar layout="cell" aria-label="Actions">
          <ToolbarButton>Export</ToolbarButton>
        </Toolbar>
        <PanelBody>Body</PanelBody>
      </Panel>,
    );
    const tb = q("toolbar");
    expect(cs(tb).flexGrow).toBe("1");
    expect(cs(tb).flexShrink).toBe("1");
    expect(cs(q("panel-header")).flexShrink).toBe("0");
  });

  it("a cell field in the footer keeps its own fill (flex: 1, the field's rule that beat the footer's)", async () => {
    await render(
      <Panel aria-label="Gate">
        <PanelHeader title="Gate check-in" />
        <PanelFooter>
          <OtpField label="Gate code" layout="cell" length={4} />
          <Button layout="cell">Open gate</Button>
        </PanelFooter>
      </Panel>,
    );
    const field = q("otp-field");
    expect(cs(field).flexGrow).toBe("1");
    expect(cs(field).flexBasis).toBe("0%");
    expect(cs(q("panel-footer").querySelector("button")!).flexBasis).toBe("0px");
  });

  it("a flush body has no padding and no gap", async () => {
    await render(
      <Panel aria-label="Flush">
        <PanelBody flush>Rows</PanelBody>
      </Panel>,
    );
    const body = q("panel-body");
    expect(body.hasAttribute("data-flush")).toBe(true);
    expect(cs(body).paddingTop).toBe("0px");
    expect(cs(body).rowGap).toBe("0px");
  });

  it("a grid joins its cells on 1px rings; a cell panel stays transparent, any other child takes the cell surface", async () => {
    await page.viewport(1280, 900);
    await render(
      <div className="dark" style={{ width: 720 }}>
        <PanelGrid min={200}>
          <Panel layout="cell" aria-label="A">
            <PanelHeader title="A" />
          </Panel>
          <div data-testid="plain" data-span="2">
            Plain
          </div>
        </PanelGrid>
      </div>,
    );
    const grid = q("panel-grid");
    const [cell, plain] = [...grid.children] as HTMLElement[];
    expect(cs(cell!).boxShadow).toBe(`${color("var(--kl-seam)", dark())} 0px 0px 0px ${px(grid, "--kl-k1")}`);
    expect(cs(cell!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(cs(plain!).backgroundColor).toBe(color("var(--kl-cell)", dark()));
    expect(cs(plain!).gridColumnEnd).toBe("span 2");
    // the first cell clears the frame's cut: its room is a share of --kl-c
    expect(cs(cell!).getPropertyValue("--kl-c-room").replace(/\s/g, "")).toMatch(/\*0\.35\)$/);
    expect(cs(plain!).getPropertyValue("--kl-c-room")).toBe("");
  });

  it("at 640px and under, a wide cell takes one track like the others", async () => {
    await page.viewport(640, 900);
    await render(
      <PanelGrid min={200}>
        <div data-testid="wide" data-span="2">
          Wide
        </div>
      </PanelGrid>,
    );
    expect(cs(document.querySelector('[data-testid="wide"]')!).gridColumnEnd).toBe("auto");
  });
});
