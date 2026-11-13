import "./render-count";

import { Button } from "@/components/keyline/ui/button";
import { Notice } from "@/components/keyline/ui/notice";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

describeConformance("notice", {
  Notice: { element: <Notice title="Customs hold on 3 shipments" />, refInstanceof: HTMLDivElement, slot: "notice" },
});

const TONES = ["info", "done", "attention", "neutral"] as const;

function Notices({ width, onDismiss }: { width: number; onDismiss?: () => void }) {
  return (
    <div style={{ width }}>
      {TONES.map((tone) => (
        <Notice
          key={tone}
          data-testid={tone}
          tone={tone}
          title={`A ${tone} notice`}
          description="Three shipments are waiting on documents."
          actions={
            <Button layout="cell" data-testid={`${tone}-action`}>
              Review
            </Button>
          }
          onDismiss={onDismiss ?? (() => {})}
        />
      ))}
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

describe("notice: axe", () => {
  it("has no violations: every tone, wide and narrow, live, folded", async () => {
    await render(
      <main>
        <Notices width={760} />
        <Notices width={340} />
        <Notice live tone="attention" title="Upload failed" />
        <Notice live title="Saved" />
        <Notice open={false} title="Folded away" />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("notice: semantics", () => {
  it("is a live region only when asked: alert for attention, status otherwise; folded, it is inert", async () => {
    await render(
      <main>
        <Notice data-testid="alert" live tone="attention" title="Upload failed" />
        <Notice data-testid="status" live tone="done" title="Saved" />
        <Notice data-testid="quiet" tone="attention" title="Furniture" />
        <Notice data-testid="folded" open={false} title="Folded away" />
      </main>,
    );
    expect(el("alert").getAttribute("role")).toBe("alert");
    expect(el("status").getAttribute("role")).toBe("status");
    expect(el("quiet").hasAttribute("role")).toBe(false);
    const fold = el("folded").closest<HTMLElement>('[data-slot="notice-root"]')!;
    expect(fold.inert).toBe(true);
    expect(fold.hasAttribute("data-open")).toBe(false);
    expect(el("quiet").closest<HTMLElement>('[data-slot="notice-root"]')!.hasAttribute("data-open")).toBe(true);
    expect(part("quiet", "notice-signal").getAttribute("aria-hidden")).toBe("true");
    expect(el("quiet").getAttribute("data-tone")).toBe("attention");
  });
});

/* WebKit on macOS leaves native buttons out of the Tab order unless the user turns on "Press Tab to highlight each
   item"; Option+Tab walks every control, so it is the key a WebKit keyboard user presses for the same order */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";

describe("notice: keyboard", () => {
  it("Tab reaches the actions, then the dismiss cell; Enter and Space dismiss", async () => {
    const onDismiss = vi.fn();
    await render(
      <main>
        <input aria-label="Before" />
        <Notice
          data-testid="n"
          title="Customs hold"
          actions={
            <Button layout="cell" data-testid="action">
              Review
            </Button>
          }
          onDismiss={onDismiss}
          dismissLabel="Dismiss customs hold"
        />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement).toBe(el("action"));
    await userEvent.keyboard(TAB);
    const dismiss = part("n", "notice-dismiss");
    await expect.poll(() => document.activeElement).toBe(dismiss);
    expect(dismiss.getAttribute("aria-label")).toBe("Dismiss customs hold");
    await userEvent.keyboard("{Enter}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    expect(onDismiss).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement).toBe(document.querySelector('[aria-label="After"]'));
  });
});

describe("notice: drawing", () => {
  it("each tone fills its signal cell; neutral has none; attention draws its frame and title red", async () => {
    await render(
      <main>
        <Notices width={760} />
      </main>,
    );
    const fills: Record<(typeof TONES)[number], [string, string]> = {
      info: ["--kl-cobalt", "--kl-on-cobalt"],
      done: ["--kl-yellow", "--kl-on-yellow"],
      attention: ["--kl-red", "--kl-on-red"],
      neutral: ["--kl-cell", "--kl-ink"],
    };
    for (const tone of TONES) {
      const s = getComputedStyle(part(tone, "notice-signal"));
      const [bg, fg] = fills[tone];
      if (tone === "neutral") expect(s.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      else expect(s.backgroundColor).toBe(token(bg));
      expect(s.color).toBe(token(fg));
    }
    expect(getComputedStyle(el("attention")).borderTopColor).toBe(token("--kl-red"));
    expect(getComputedStyle(el("info")).borderTopColor).not.toBe(token("--kl-red"));
    expect(getComputedStyle(part("attention", "notice-title")).color).toBe(token("--kl-red-text"));
    expect(getComputedStyle(part("info", "notice-title")).color).toBe(token("--kl-ink"));
  });

  it("wide: signal · message · actions · dismiss in one row", async () => {
    await render(
      <main>
        <Notices width={760} />
      </main>,
    );
    const signal = rect("info", "notice-signal");
    const content = rect("info", "notice-content");
    const actions = rect("info", "notice-actions");
    const dismiss = rect("info", "notice-dismiss");
    expect(signal.right).toBeLessThanOrEqual(content.left);
    expect(content.right).toBeLessThanOrEqual(actions.left);
    expect(actions.right).toBeLessThanOrEqual(dismiss.left);
    expect(actions.top).toBe(content.top);
    expect(getComputedStyle(part("info", "notice-actions")).borderInlineStartWidth).toBe("1px");
  });

  it("narrow (520px and under): the actions drop to a full row of cells under the message", async () => {
    await render(
      <main>
        <Notices width={340} />
      </main>,
    );
    const root = el("info").getBoundingClientRect();
    const content = rect("info", "notice-content");
    const actions = rect("info", "notice-actions");
    expect(actions.top).toBeGreaterThanOrEqual(content.bottom);
    const s = getComputedStyle(part("info", "notice-actions"));
    expect(s.borderTopWidth).toBe("1px");
    expect(s.borderInlineStartWidth).toBe("0px");
    // the row spans the frame inside its border
    const border = parseFloat(getComputedStyle(el("info")).borderLeftWidth);
    expect(actions.width).toBe(root.width - 2 * border);
    expect(el("info-action").getBoundingClientRect().width).toBe(actions.width);
  });
});
