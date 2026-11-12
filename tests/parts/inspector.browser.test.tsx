// Inspector's parts (Keyline renders them; InspectorBody is a Keyline Scroll Area), axe, the close cell by keyboard,
// and the look the utilities carry: the mono title, the facts two-up on seams, the sections and a row of two, the
// sticky action strip, and a Notice under the header owning its keyline while open.
import "./render-count";

import * as React from "react";
import { Button } from "@/components/keyline/ui/button";
import {
  Inspector,
  InspectorActions,
  InspectorBody,
  InspectorFacts,
  InspectorHeader,
  InspectorRow,
  InspectorSection,
} from "@/components/keyline/ui/inspector";
import { Notice } from "@/components/keyline/ui/notice";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inInspector = (part: React.ReactNode) => <Inspector aria-label="R3/12">{part}</Inspector>;

describeConformance("inspector", {
  Inspector: { element: <Inspector aria-label="R3/12" />, refInstanceof: HTMLElement, slot: "inspector" },
  InspectorHeader: {
    element: <InspectorHeader title="MSCU 1234567" />,
    refInstanceof: HTMLElement,
    slot: "inspector-header",
    wrap: inInspector,
  },
  InspectorFacts: {
    element: <InspectorFacts items={[{ label: "Status", value: "Held" }]} />,
    refInstanceof: HTMLDListElement,
    slot: "inspector-facts",
    wrap: inInspector,
  },
  InspectorSection: { element: <InspectorSection />, refInstanceof: HTMLDivElement, slot: "inspector-section" },
  InspectorRow: { element: <InspectorRow />, refInstanceof: HTMLDivElement, slot: "inspector-row" },
  InspectorActions: { element: <InspectorActions />, refInstanceof: HTMLDivElement, slot: "inspector-actions" },
});

/*
 * InspectorBody is a Keyline Scroll Area (its root takes the props, a function className or style resolved against
 * the inspector's empty state), keeping its own slot; `contentClassName` reaches what it holds.
 */
describe("inspector: InspectorBody", () => {
  it("props, ref, className and style reach the scroll area's root, which carries the body's slot", async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(
      inInspector(
        <InspectorBody
          ref={ref}
          data-testid="part"
          data-probe="kept"
          data-slot="other"
          className={() => "from-fn"}
          style={() => ({ marginTop: 3 })}
          contentClassName="from-content"
        >
          Body
        </InspectorBody>,
      ),
    );
    const node = document.querySelector<HTMLElement>('[data-testid="part"]')!;
    expect(ref.current).toBe(node);
    expect(node.getAttribute("data-probe")).toBe("kept");
    expect(node.getAttribute("data-slot")).toBe("inspector-body");
    expect(node.classList.contains("from-fn")).toBe(true);
    expect(node.style.marginTop).toBe("3px");
    expect(node.querySelector('[data-slot="scroll-area-content"]')!.classList.contains("from-content")).toBe(true);
  });
});

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
const q = (slot: string, root: ParentNode = document) => root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;

function Example({ theme = "dark", notice = true, onClose = () => {} }) {
  return (
    <div className={theme} style={{ width: 360, height: 640, display: "flex" }}>
      <Inspector aria-label="MSCU 1234567">
        <InspectorHeader code="R3/12" title="MSCU 1234567" onClose={onClose} />
        {notice === null ? null : (
          <Notice layout="cell" tone="attention" title="Held at customs" open={notice} data-testid="notice" />
        )}
        <InspectorFacts
          items={[
            { label: "Status", value: "Held" },
            { label: "Carrier", value: "Maersk" },
            { label: "Weight", value: "21.4 t" },
            { label: "Seal", value: "ML-88" },
          ]}
        />
        <InspectorBody>
          <InspectorSection>
            <p className="m-0">Arrived 08:02.</p>
          </InspectorSection>
          <InspectorRow>
            <InspectorSection>From</InspectorSection>
            <InspectorSection>To</InspectorSection>
          </InspectorRow>
        </InspectorBody>
        <InspectorActions>
          <Button layout="cell">Release</Button>
          <button type="button" className="kl-cell" data-testid="plain">
            Hold
          </button>
        </InspectorActions>
      </Inspector>
    </div>
  );
}

describe("inspector: axe and keyboard", () => {
  it("has no violations", async () => {
    await render(
      <main>
        <Example theme="" />
      </main>,
    );
    await expectNoAxeViolations();
  });

  it("Tab reaches the close cell (a native button: Option+Tab in WebKit); Enter closes", async () => {
    let closed = 0;
    await render(
      <main>
        <Example onClose={() => closed++} notice={null as unknown as boolean} />
      </main>,
    );
    await userEvent.keyboard(server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}");
    const close = q("inspector-close");
    expect(document.activeElement).toBe(close);
    expect(close.getAttribute("aria-label")).toBe("Close inspector");
    await userEvent.keyboard("{Enter}");
    expect(closed).toBe(1);
  });
});

describe("inspector: style", () => {
  it("the header sits on a 3px keyline; the title is 24px mono; the close cell is 46px wide", async () => {
    await render(<Example />);
    const h = q("inspector-header");
    expect(cs(h).borderBottomWidth).toBe(px(h, "--kl-k3"));
    expect(cs(h).borderBottomColor).toBe(color("var(--kl-line)", dark()));
    expect(cs(h).flexShrink).toBe("0");
    const t = q("inspector-title");
    expect(cs(t).fontSize).toBe("24px");
    expect(parseFloat(cs(t).lineHeight)).toBeCloseTo(26.4, 3);
    expect(cs(t).marginTop).toBe("0px");
    expect(cs(t).fontFamily).toBe(cs(document.querySelector(".kl-code")!).fontFamily);
    const heading = q("inspector-heading");
    expect(cs(heading).rowGap).toBe("3px");
    expect(cs(heading).paddingBottom).toBe("12px");
    const close = q("inspector-close");
    expect(cs(close).width).toBe("46px");
    expect(cs(close).justifyContent).toBe("center");
  });

  it("facts run two-up on seams: the second of a row draws the seam between, rows after the first the one above", async () => {
    await render(<Example />);
    const facts = q("inspector-facts");
    expect(cs(facts).gridTemplateColumns.split(" ")).toHaveLength(2);
    expect(cs(facts).borderBottomWidth).toBe(px(facts, "--kl-k1"));
    expect(cs(facts).borderBottomColor).toBe(color("var(--kl-seam)", dark()));
    const [a, b, c, d] = [...facts.children] as HTMLElement[];
    const k1 = px(facts, "--kl-k1");
    expect([a, b, c, d].map((f) => cs(f!).borderInlineStartWidth)).toEqual(["0px", k1, "0px", k1]);
    expect([a, b, c, d].map((f) => cs(f!).borderTopWidth)).toEqual(["0px", "0px", k1, k1]);
    expect(cs(b!).borderInlineStartColor).toBe(color("var(--kl-seam)", dark()));
    expect(cs(c!).borderTopColor).toBe(color("var(--kl-seam)", dark()));
    expect(cs(a!.querySelector("dd")!).marginInlineStart).toBe("0px");
    expect(cs(a!.querySelector("dd")!).overflowWrap).toBe("anywhere");
  });

  it("a section owns its bottom seam; in a row the row owns it and the second section draws the seam between", async () => {
    await render(<Example />);
    const body = q("inspector-body");
    expect(cs(body).flexGrow).toBe("1");
    expect(cs(q("scroll-area-viewport", body)).overscrollBehaviorY).toBe("contain");
    const [solo] = [...body.querySelectorAll<HTMLElement>('[data-slot="inspector-section"]')];
    const k1 = px(body, "--kl-k1");
    expect(cs(solo!).borderBottomWidth).toBe(k1);
    expect(cs(solo!).borderBottomColor).toBe(color("var(--kl-seam)", dark()));
    expect(cs(solo!).paddingTop).toBe("12px");
    expect(cs(solo!).paddingBottom).toBe("14px");
    const row = q("inspector-row");
    expect(cs(row).borderBottomWidth).toBe(k1);
    const [first, second] = [...row.children] as HTMLElement[];
    expect(cs(first!).borderBottomWidth).toBe("0px");
    expect(cs(second!).borderBottomWidth).toBe("0px");
    expect(cs(first!).borderInlineStartWidth).toBe("0px");
    expect(cs(second!).borderInlineStartWidth).toBe(k1);
    expect(cs(second!).borderInlineStartColor).toBe(color("var(--kl-seam)", dark()));
  });

  it("the action strip sits on a 3px keyline on the cell surface; its cells share it, a plain cell is a strong action", async () => {
    await render(<Example />);
    const a = q("inspector-actions");
    expect(cs(a).borderTopWidth).toBe(px(dark(), "--kl-k3"));
    expect(cs(a).borderTopColor).toBe(color("var(--kl-line)", dark()));
    expect(cs(a).backgroundColor).toBe(color("var(--kl-cell)", dark()));
    expect(cs(a).flexShrink).toBe("0");
    const [release, plain] = [...a.children] as HTMLElement[];
    expect(cs(release!).flexGrow).toBe("1");
    expect(cs(plain!).flexGrow).toBe("1");
    expect(cs(plain!).minHeight).toBe("48px");
    expect(cs(plain!).justifyContent).toBe("center");
    expect(cs(plain!).fontWeight).toBe(cs(q("inspector-title")).fontWeight);
    // the strip is the frame's foot: it ends on the inspector's bottom border
    const insp = q("inspector");
    expect(a.getBoundingClientRect().bottom).toBeCloseTo(
      insp.getBoundingClientRect().bottom - parseFloat(cs(insp).borderBottomWidth),
      1,
    );
  });

  it("a Notice under the header keeps its height and owns its bottom seam while open; folded away it owns none", async () => {
    const screen = await render(<Example />);
    const root = q("notice-root");
    expect(cs(root).flexShrink).toBe("0");
    expect(cs(root).borderBottomWidth).toBe(px(root, "--kl-k1"));
    expect(cs(root).borderBottomColor).toBe(color("var(--kl-seam)", dark()));
    await screen.rerender(<Example notice={false} />);
    await expect.poll(() => cs(q("notice-root")).borderBottomWidth).toBe("0px");
  });
});
