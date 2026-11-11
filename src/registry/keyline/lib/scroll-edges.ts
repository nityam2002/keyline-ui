"use client";

import * as React from "react"

/* Scroll-edge affordance for cell rows (an ink shadow).
   A row of cells that scrolls sideways (tabs, toggles, a segmented control, a nav row, a menubar) marks the
   edge where items are hidden: the hook writes data-kl-more="start", "end" or "start end" on the scroller,
   and the theme casts an ink shadow inward from that edge (.kl-more-fade), so the content reads as running
   on under the frame.
   - Two inert spans (aria-hidden, no pointer events) are appended to the scroller; the theme makes them sticky
     flex items of no net width at the row's start and end. The browser keeps them on the edges as
     part of the scroll: written from the scroll event (--kl-sx, before) they lagged a frame behind the cells.
   - Appended last, so first-child and nth-child rules on the row's cells are unchanged.
   - Logical: "start" is the reading start, so RTL rows are handled (scrollLeft is negative there).
   - Written to the DOM directly, never through React state, so scrolling does not re-render the row.
   - The shadow is the same over any cell, so no sampling of the covered cell's fill (and its
     hit-testing on every scroll) is gone. */

export function scrollEdges(el: HTMLElement): "" | "start" | "end" | "start end" {
  const max = el.scrollWidth - el.clientWidth
  if (max <= 1) return ""
  const x = Math.abs(el.scrollLeft)
  const start = x > 1
  const end = x < max - 1
  return start && end ? "start end" : start ? "start" : end ? "end" : ""
}

export function useScrollEdges(ref: React.RefObject<HTMLElement | null>) {
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fades = (["start", "end"] as const).map((side) => {
      // a list may only contain list items: in a <ul>/<ol> the fade is a presentational <li>
      const list = el.tagName === "UL" || el.tagName === "OL"
      const f = document.createElement(list ? "li" : "span")
      if (list) f.setAttribute("role", "presentation")
      f.className = "kl-more-fade"
      f.setAttribute("data-kl-fade", side)
      f.setAttribute("aria-hidden", "true")
      return f
    })
    // a scroll only reads the offset and writes the attribute when an edge changes (the shadows' position is
    // the browser's: they are sticky)
    let range = ""
    const update = () => {
      const v = scrollEdges(el)
      // the scroll range carries the shadows on the scroll timeline (theme); it changes only with size
      const max = el.scrollWidth - el.clientWidth
      const r = `${getComputedStyle(el).direction === "rtl" ? -max : max}px`
      if (r !== range) el.style.setProperty("--kl-more-max", (range = r))
      if ((el.getAttribute("data-kl-more") ?? "") !== v) {
        if (v) el.setAttribute("data-kl-more", v)
        else el.removeAttribute("data-kl-more")
      }
      // keep the fades last (React may have appended cells after them)
      if (v && el.lastElementChild !== fades[1]) el.append(...fades)
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    // the row's own size, and its items' sizes (a count loading in, a label changing), move the edges
    const ro = new ResizeObserver(update)
    const observeAll = () => {
      ro.disconnect()
      ro.observe(el)
      // not the fades: update() sizes and shows them, which would re-trigger the observer (a loop in WebKit)
      for (const c of Array.from(el.children)) if (!fades.includes(c as HTMLSpanElement)) ro.observe(c)
    }
    observeAll()
    const mo = new MutationObserver((records) => {
      // the fades moving themselves is not a change to the row
      if (records.every((r) => [...r.addedNodes, ...r.removedNodes].every((n) => fades.includes(n as HTMLSpanElement)))) return
      observeAll()
      update()
    })
    mo.observe(el, { childList: true })
    return () => {
      for (const f of fades) f.remove()
      el.removeAttribute("data-kl-more")
      el.style.removeProperty("--kl-more-max")
      el.removeEventListener("scroll", update)
      ro.disconnect()
      mo.disconnect()
    }
  }, [ref])
}
