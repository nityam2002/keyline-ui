import "./render-count";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/keyline/ui/avatar";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="#456"/></svg>',
)}`;
const BROKEN = "data:image/png;base64,AAAA";

const image = () => document.querySelector<HTMLElement>('[data-slot="avatar-image"]');

describeConformance("avatar", {
  Avatar: { element: <Avatar name="Nora van der Berg" />, refInstanceof: HTMLSpanElement, slot: "avatar" },
  AvatarImage: {
    element: <AvatarImage src={PHOTO} />,
    refInstanceof: HTMLImageElement,
    slot: "avatar-image",
    wrap: (part) => <Avatar name="Nora van der Berg">{part}</Avatar>,
    // Base UI renders the image once it has loaded
    ready: () => expect.poll(image).not.toBeNull(),
  },
  AvatarFallback: {
    element: <AvatarFallback />,
    refInstanceof: HTMLSpanElement,
    slot: "avatar-fallback",
    wrap: (part) => <Avatar name="Nora van der Berg">{part}</Avatar>,
  },
  AvatarGroup: {
    element: (
      <AvatarGroup label="Assignees">
        <Avatar name="Nora van der Berg" />
      </AvatarGroup>
    ),
    refInstanceof: HTMLDivElement,
    slot: "avatar-group",
  },
  AvatarGroupCount: {
    element: <AvatarGroupCount count={3} />,
    refInstanceof: HTMLSpanElement,
    slot: "avatar-group-count",
    wrap: (part) => <AvatarGroup label="Assignees">{part}</AvatarGroup>,
  },
});

const STATUSES = ["normal", "waiting", "attention", "done", "none"] as const;

describe("avatar: axe", () => {
  it("has no violations: photo, initials, every status, decorative, a cell, a group with a count", async () => {
    await render(
      <main>
        <Avatar name="Nora van der Berg" src={PHOTO} />
        <Avatar name="María José Núñez" src={BROKEN} size="lg" />
        {STATUSES.map((s) => (
          <Avatar key={s} name="Ade Okafor" status={s} />
        ))}
        <Avatar name="Joost Brandsma" decorative />
        <div style={{ display: "grid", width: 64 }}>
          <Avatar name="Ade Okafor" layout="cell" status="attention" />
        </div>
        <AvatarGroup label="Assignees" max={2}>
          <Avatar name="Nora van der Berg" />
          <Avatar name="Ade Okafor" />
          <Avatar name="李小龍" />
        </AvatarGroup>
      </main>,
    );
    await expect.poll(image).not.toBeNull();
    await expectNoAxeViolations();
  });
});

describe("avatar: image and fallback", () => {
  it("names the avatar, with its status's words", async () => {
    await render(
      <main>
        <Avatar name="Ade Okafor" status="waiting" />
        <Avatar name="María José Núñez" status="attention" statusLabel="blocked at customs" />
      </main>,
    );
    const [away, blocked] = [...document.querySelectorAll<HTMLElement>('[data-slot="avatar"]')];
    expect(away!.getAttribute("role")).toBe("img");
    expect(away!.getAttribute("aria-label")).toBe("Ade Okafor, away");
    expect(blocked!.getAttribute("aria-label")).toBe("María José Núñez, blocked at customs");
  });

  it("a failed photo leaves the initials in the cell, never a broken image", async () => {
    await render(
      <main>
        <Avatar name="Nora van der Berg" src={PHOTO} data-testid="ok" />
        <Avatar name="María José Núñez" src={BROKEN} data-testid="failed" />
      </main>,
    );
    const ok = document.querySelector<HTMLElement>('[data-testid="ok"]')!;
    const failed = document.querySelector<HTMLElement>('[data-testid="failed"]')!;
    // the good photo loads, so the broken one has had its chance too
    await expect.poll(() => ok.querySelector("img")).not.toBeNull();
    await expect.poll(() => ok.querySelector('[data-slot="avatar-fallback"]')).toBeNull();
    expect(failed.querySelector("img")).toBeNull();
    const fb = failed.querySelector<HTMLElement>('[data-slot="avatar-fallback"]')!;
    expect(fb.textContent).toBe("MN");
    // the initials hold the square: visible, and centred in it
    expect(fb.checkVisibility()).toBe(true);
    const box = failed.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(fb);
    const text = range.getBoundingClientRect();
    expect(Math.abs(text.left + text.width / 2 - (box.left + box.width / 2))).toBeLessThan(1);
  });

  it("composes from its parts, the fallback showing the name's initials", async () => {
    await render(
      <main>
        <Avatar name="Wilhelmina Oostergetel-Vandersteen" size="xl">
          <AvatarImage src={BROKEN} />
          <AvatarFallback />
        </Avatar>
      </main>,
    );
    expect(document.querySelector('[data-slot="avatar-fallback"]')!.textContent).toBe("WV");
    expect(document.querySelector<HTMLElement>('[data-slot="avatar"]')!.getBoundingClientRect().width).toBe(56);
  });
});

describe("avatar: status floor", () => {
  it("each kind has its own line shape on the floor; attention turns the frame red; offline grays the photo", async () => {
    await render(
      <main>
        {STATUSES.map((s) => (
          <Avatar key={s} name="Nora van der Berg" src={PHOTO} status={s} />
        ))}
      </main>,
    );
    await expect.poll(() => document.querySelectorAll("img").length).toBe(5);
    const avatars: Record<string, CSSStyleDeclaration> = Object.fromEntries(
      [...document.querySelectorAll<HTMLElement>('[data-slot="avatar"]')].map((a) => [
        a.dataset["status"] ?? "",
        getComputedStyle(a),
      ]),
    );
    const floor = Object.fromEntries(
      Object.entries(avatars).map(([k, s]) => [k, [s.borderBottomStyle, s.borderBottomWidth]]),
    );
    expect(floor).toEqual({
      normal: ["solid", "3px"],
      waiting: ["dashed", "3px"],
      attention: ["solid", "3px"],
      done: ["double", "3px"],
      none: ["solid", "1px"],
    });
    const probe = document.createElement("span");
    probe.style.color = "var(--kl-red)";
    document.body.append(probe);
    const red = getComputedStyle(probe).color;
    probe.remove();
    expect([avatars["attention"]!.borderTopColor, avatars["attention"]!.borderBottomColor]).toEqual([red, red]);
    expect(avatars["normal"]!.borderTopColor).not.toBe(red);
    const offline = document.querySelector<HTMLElement>('[data-status="none"] img')!;
    expect(getComputedStyle(offline).filter).toContain("grayscale");
  });
});

describe("avatar: group", () => {
  it("cells on shared seams at the group's size; a cell keeps its status floor; the overflow is a count", async () => {
    await render(
      <main>
        <AvatarGroup label="Assignees" size="sm" max={4}>
          <Avatar name="Nora van der Berg" size="xl" />
          <Avatar name="Ade Okafor" status="normal" />
          <Avatar name="María José Núñez" status="attention" />
          <Avatar name="李小龍" />
          <Avatar name="Joost Brandsma" />
        </AvatarGroup>
      </main>,
    );
    const group = document.querySelector<HTMLElement>('[data-slot="avatar-group"]')!;
    const cells = [...group.children] as HTMLElement[];
    expect(cells.map((c) => c.dataset["slot"])).toEqual(["avatar", "avatar", "avatar", "avatar-group-count"]);
    // the group's size governs its cells, whatever their own (24px less the group's keylines)
    for (const c of cells.slice(0, 3)) expect(c.getBoundingClientRect().height).toBe(22);
    // the frame owns the outer edge, each later cell the seam before it
    expect(getComputedStyle(cells[0]!).borderInlineStartWidth).toBe("0px");
    expect(getComputedStyle(cells[0]!).borderTopWidth).toBe("0px");
    for (const c of cells.slice(1)) expect(getComputedStyle(c).borderInlineStartWidth).toBe("1px");
    for (let i = 1; i < cells.length; i++)
      expect(cells[i]!.getBoundingClientRect().left).toBe(cells[i - 1]!.getBoundingClientRect().right);
    expect(getComputedStyle(cells[0]!).borderBottomWidth).toBe("0px");
    expect(getComputedStyle(cells[1]!).borderBottomWidth).toBe("3px");
    // attention in a group: no frame of its own to turn red, so an inner keyline draws it
    const after = getComputedStyle(cells[2]!, "::after");
    expect(after.borderTopWidth).toBe("1px");
    expect(after.position).toBe("absolute");
    expect(cells[3]!.getAttribute("aria-label")).toBe("2 more");
    expect(cells[3]!.textContent).toBe("+2");
  });
});
