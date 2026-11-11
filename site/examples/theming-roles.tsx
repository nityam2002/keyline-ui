"use client"

// A component of your own, built only from Keyline's role utilities: no colour is written down, so the same
// markup is right in a light region and a dark one, and under any palette you configure.
const STOCK = [
  { sku: "20LB-LTR", label: "20 lb letter", cases: 412, floor: 150 },
  { sku: "24LB-LGL", label: "24 lb legal", cases: 96, floor: 120 },
  { sku: "CARD-110", label: "110 lb cardstock", cases: 38, floor: 40 },
]

function ReorderCard() {
  const low = STOCK.filter((s) => s.cases < s.floor).length
  return (
    <section aria-label="Warehouse stock" className="min-w-0 flex-1 border-3 border-kl-line bg-kl-cell font-kl text-kl-ink" data-testid="role-card">
      <header className="flex items-baseline justify-between gap-3 border-b border-kl-seam px-kl-inset py-2.5">
        <h3 className="m-0 text-[15px] font-kl-strong">Warehouse stock</h3>
        <span className="font-kl-mono text-[12px] text-kl-ink-3">SCR-01</span>
      </header>
      <ul className="m-0 list-none p-0">
        {STOCK.map((s) => {
          const short = s.cases < s.floor
          return (
            <li key={s.sku} className="flex items-center gap-3 border-b border-kl-line-soft px-kl-inset py-2 last:border-b-0">
              <span className="min-w-0 flex-1 text-[14px]">{s.label}</span>
              <span className={`font-kl-mono text-[13px] tabular-nums ${short ? "text-kl-red-text" : "text-kl-ink-2"}`}>{s.cases} cases</span>
            </li>
          )
        })}
      </ul>
      <footer className="flex items-center gap-2 bg-kl-inverse px-kl-inset py-2 text-[13px] text-kl-on-inverse">
        <span className="kl-count text-[20px]">{low}</span> below the reorder floor
      </footer>
    </section>
  )
}

export function RoleCards() {
  return (
    <div className="flex w-full flex-wrap gap-kl-gutter">
      <div className="light flex min-w-[240px] flex-1 bg-kl-paper p-3">
        <ReorderCard />
      </div>
      <div className="dark flex min-w-[240px] flex-1 bg-kl-paper p-3">
        <ReorderCard />
      </div>
    </div>
  )
}
