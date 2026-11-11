"use client"

import { useDocToc } from "./docs-shell"
import type { TocGroup } from "./page-toc"

/** Hands the page's index to the docs shell's aside; renders nothing itself. */
export function DocToc({ toc }: { toc: TocGroup[] }) {
  useDocToc(toc)
  return null
}
