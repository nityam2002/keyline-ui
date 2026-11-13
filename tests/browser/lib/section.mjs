// Specimen-section helpers for the specs (questionnaire, sidebar, dialog, toast,
// button group, marker, direction).
//   at(p, id)   scrolls the specimen section #id into view and lets it render, returns its locator
//   focused(p)  the focused element: { tag, slot, text, label }
import { settle } from "../fixtures.mjs";

export const at = async (p, id) => {
  const el = p.locator(`#${id}`);
  await el.scrollIntoViewIfNeeded();
  await settle(p);
  return el;
};

export const focused = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    return {
      tag: a?.tagName.toLowerCase(),
      slot: a?.getAttribute("data-slot"),
      text: a?.textContent?.trim().slice(0, 60),
      label: a?.getAttribute("aria-label"),
    };
  });
