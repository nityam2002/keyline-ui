// The playground's Preview, rendered with only what the consumer installed: the keyline item, the
// components, and (when installed) keyline-config.json. Mode attributes go on <html>, as the export says.
//   ?page=preview&attrs=dark,compact&w=1180
import * as React from "react"
import { Preview } from "./Preview"

export default function PreviewPage() {
  React.useLayoutEffect(() => {
    const q = new URLSearchParams(location.search)
    const h = document.documentElement
    for (const a of (q.get("attrs") ?? "").split(",").filter(Boolean)) {
      if (a === "dark" || a === "light") h.classList.add(a)
      else if (a === "reduce") h.dataset.klMotion = "reduce"
      else h.dataset.klDensity = a
    }
  }, [])
  return (
    <div style={{ padding: 20, width: Number(q.get("w")) || undefined, background: "var(--kl-paper)" }}>
      <Preview />
    </div>
  )
}
