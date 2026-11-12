import "./render-count";

import { Button } from "@/components/keyline/ui/button";
import { Item, ItemActions, ItemContent, ItemList, ItemMedia, ItemMeta } from "@/components/keyline/ui/item";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const inItem = (part: React.ReactNode) => <Item>{part}</Item>;

describeConformance("item", {
  ItemList: { element: <ItemList />, refInstanceof: HTMLDivElement, slot: "item-list" },
  Item: { element: <Item />, refInstanceof: HTMLDivElement, slot: "item", wrap: (part) => <ItemList>{part}</ItemList> },
  ItemMedia: { element: <ItemMedia>ERP</ItemMedia>, refInstanceof: HTMLSpanElement, slot: "item-media", wrap: inItem },
  ItemContent: {
    element: <ItemContent title="Rotterdam hub" />,
    refInstanceof: HTMLSpanElement,
    slot: "item-content",
    wrap: inItem,
  },
  ItemMeta: { element: <ItemMeta>2.4 MB</ItemMeta>, refInstanceof: HTMLSpanElement, slot: "item-meta", wrap: inItem },
  ItemActions: { element: <ItemActions />, refInstanceof: HTMLSpanElement, slot: "item-actions", wrap: inItem },
});

function Files({ width, onOpen }: { width: number; onOpen?: () => void }) {
  return (
    <div style={{ width }}>
      <ItemList aria-label="Documents">
        <Item data-testid="plain">
          <ItemMedia>PDF</ItemMedia>
          <ItemContent title="Commercial invoice" description="Uploaded by customs desk" />
          <ItemMeta>212 KB</ItemMeta>
          <ItemActions>
            <Button layout="cell" data-testid="download">
              Download
            </Button>
          </ItemActions>
        </Item>
        <Item data-testid="current" current render={<button type="button" onClick={onOpen} />}>
          <ItemMedia>XLS</ItemMedia>
          <ItemContent title="Packing list" />
          <ItemMeta>56 KB</ItemMeta>
        </Item>
        <Item data-testid="bare">
          <ItemContent title="Notes without a media cell" />
          <ItemMeta>3 KB</ItemMeta>
        </Item>
      </ItemList>
    </div>
  );
}

const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const part = (id: string, slot: string) => el(id).querySelector<HTMLElement>(`:scope > [data-slot="${slot}"]`)!;
const rect = (id: string, slot: string) => part(id, slot).getBoundingClientRect();

function token(name: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

/* WebKit on macOS leaves buttons out of the Tab order by default; Option+Tab walks every control */
const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";

describe("item: axe", () => {
  it("has no violations: wide and narrow, plain, current and interactive, without media", async () => {
    await render(
      <main>
        <Files width={640} />
        <Files width={360} />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("item: semantics", () => {
  it("a list of list items; an interactive row keeps its role inside one, and says it is current", async () => {
    await render(
      <main>
        <Files width={640} />
      </main>,
    );
    const list = document.querySelector<HTMLElement>('[data-slot="item-list"]')!;
    expect(list.getAttribute("role")).toBe("list");
    for (const child of list.children) expect(child.getAttribute("role")).toBe("listitem");
    expect(el("plain").getAttribute("role")).toBe("listitem");
    const current = el("current");
    expect(current.tagName).toBe("BUTTON");
    expect(current.hasAttribute("role")).toBe(false);
    expect(current.parentElement!.getAttribute("data-slot")).toBe("item-row");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.hasAttribute("data-current")).toBe(true);
    expect(current.hasAttribute("data-interactive")).toBe(true);
    expect(current.classList.contains("kl-key")).toBe(true);
    expect(el("plain").hasAttribute("data-interactive")).toBe(false);
  });

  it("outside a list an Item is a plain row", async () => {
    await render(
      <main>
        <Item data-testid="alone">
          <ItemContent title="Alone" />
        </Item>
      </main>,
    );
    expect(el("alone").hasAttribute("role")).toBe(false);
  });
});

describe("item: keyboard", () => {
  it("Tab reaches the row's action and the interactive row; Enter and Space press it", async () => {
    const onOpen = vi.fn();
    await render(
      <main>
        <input aria-label="Before" />
        <Files width={640} onOpen={onOpen} />
        <input aria-label="After" />
      </main>,
    );
    document.querySelector<HTMLElement>('[aria-label="Before"]')!.focus();
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement).toBe(el("download"));
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement).toBe(el("current"));
    await userEvent.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    expect(onOpen).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(TAB);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("After");
  });
});

describe("item: drawing", () => {
  it("wide: media · content · meta · actions in one row; the current row's media floods cobalt", async () => {
    await render(
      <main>
        <Files width={640} />
      </main>,
    );
    const media = rect("plain", "item-media");
    const content = rect("plain", "item-content");
    const meta = rect("plain", "item-meta");
    const actions = rect("plain", "item-actions");
    expect(media.right).toBeLessThanOrEqual(content.left);
    expect(content.right).toBeLessThanOrEqual(meta.left);
    expect(meta.right).toBeLessThanOrEqual(actions.left);
    const flood = getComputedStyle(part("current", "item-media"));
    expect(flood.backgroundColor).toBe(token("--kl-cobalt"));
    expect(flood.color).toBe(token("--kl-on-cobalt"));
    expect(getComputedStyle(part("plain", "item-media")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    // the content seam runs straight down the list
    expect(rect("current", "item-content").left).toBe(content.left);
  });

  it("without media the content takes the first column", async () => {
    await render(
      <main>
        <Files width={640} />
      </main>,
    );
    const row = el("bare").getBoundingClientRect();
    expect(rect("bare", "item-content").left).toBe(row.left);
    // the content takes the flexible track; the meta keeps its own width at the end
    const meta = rect("bare", "item-meta");
    expect(meta.right).toBe(row.right);
    expect(meta.width).toBeLessThan(100);
    expect(rect("bare", "item-content").right).toBe(meta.left);
    expect(getComputedStyle(part("bare", "item-content")).paddingInlineStart).toBe(
      getComputedStyle(part("plain", "item-content")).paddingInlineStart,
    );
  });

  it("narrow (420px of list and under): the meta moves under the title, in the content column", async () => {
    await render(
      <main>
        <Files width={360} />
      </main>,
    );
    for (const id of ["plain", "bare"]) {
      const content = rect(id, "item-content");
      const meta = rect(id, "item-meta");
      expect(meta.left).toBe(content.left);
      expect(meta.width).toBe(content.width);
      expect(meta.top).toBeGreaterThanOrEqual(content.bottom);
      expect(getComputedStyle(part(id, "item-meta")).textAlign).toBe("start");
    }
    // media and actions span both lines
    const row = el("plain").getBoundingClientRect();
    expect(rect("plain", "item-media").height).toBe(row.height);
    expect(rect("plain", "item-actions").bottom).toBe(row.bottom);
    expect(getComputedStyle(part("bare", "item-meta")).paddingInlineStart).toBe(
      getComputedStyle(part("bare", "item-content")).paddingInlineStart,
    );
  });
});
