// Fictional demo data for the Shipments block. Deterministic, so renders are reproducible.
export type StatusKey = "booked" | "transit" | "delayed" | "docs" | "delivered" | "none"
export type Shipment = {
  id: string
  dest: string
  carrier: string
  status: StatusKey
  kg: number | null
  eur: number
  eta: Date
  pallets: number
  reference: string
}

export const STATUS: Record<StatusKey, { label: string; kind: "normal" | "waiting" | "attention" | "done" | "none" }> = {
  booked: { label: "Booked", kind: "normal" },
  transit: { label: "In transit", kind: "normal" },
  delayed: { label: "Delayed 2 d", kind: "attention" },
  docs: { label: "Awaiting docs", kind: "waiting" },
  delivered: { label: "Delivered", kind: "done" },
  none: { label: "Not booked", kind: "none" },
}

export const CARRIERS: { value: string; label: string; count: number; disabled?: boolean; description?: string }[] = [
  { value: "DHL Freight", label: "DHL Freight", count: 412 },
  { value: "Maersk", label: "Maersk", count: 298 },
  { value: "Raben", label: "Raben", count: 141 },
  { value: "DSV Road", label: "DSV Road", count: 96 },
  { value: "Kuehne+Nagel", label: "Kuehne+Nagel", count: 88 },
  { value: "DB Schenker", label: "DB Schenker", count: 77 },
  { value: "GEODIS", label: "GEODIS", count: 64 },
  { value: "CEVA Logistics", label: "CEVA Logistics", count: 59, disabled: true, description: "Contract paused" },
  { value: "Rhenus Road", label: "Rhenus Road", count: 49 },
]

export const TODAY = new Date(2026, 10, 7)
export const UNAVAILABLE: Record<number, string> = { 17: "depot closed", 22: "depot closed" }
export const isUnavailable = (d: Date) => (d.getFullYear() === 2026 && d.getMonth() === 10 ? UNAVAILABLE[d.getDate()] : undefined)

const nov = (d: number) => new Date(2026, 10, d)
const SEED: Omit<Shipment, "reference">[] = [
  { id: "SH-20481", dest: "Hamburg, DE", carrier: "DHL Freight", status: "transit", kg: 1240.5, eur: 18420, eta: nov(14), pallets: 4 },
  { id: "SH-20482", dest: "Antwerpen, BE", carrier: "Maersk", status: "delayed", kg: 860, eur: 9975.5, eta: nov(15), pallets: 3 },
  { id: "SH-20483", dest: "Lyon, FR", carrier: "DHL Freight", status: "transit", kg: 12004, eur: 142880, eta: nov(16), pallets: 22 },
  { id: "SH-20484", dest: "Kraków, PL", carrier: "Raben", status: "docs", kg: 3310, eur: 27040, eta: nov(16), pallets: 9 },
  { id: "SH-20485", dest: "Göteborg, SE", carrier: "Maersk", status: "transit", kg: 5770, eur: 61300, eta: nov(16), pallets: 14 },
  { id: "SH-20486", dest: "Zaragoza, ES", carrier: "DSV Road", status: "none", kg: null, eur: 0, eta: nov(18), pallets: 0 },
  { id: "SH-20487", dest: "Thessaloníki, GR", carrier: "DHL Freight", status: "booked", kg: 98.2, eur: 1204, eta: nov(18), pallets: 1 },
  { id: "SH-20488", dest: "Bratislava, SK", carrier: "Raben", status: "booked", kg: 2410, eur: 20118.75, eta: nov(19), pallets: 6 },
  { id: "SH-20489", dest: "Porto, PT", carrier: "Kuehne+Nagel", status: "delivered", kg: 640, eur: 5880, eta: nov(11), pallets: 2 },
  { id: "SH-20490", dest: "Ljubljana, SI", carrier: "DB Schenker", status: "transit", kg: 7125, eur: 88410, eta: nov(17), pallets: 18 },
  { id: "SH-20491", dest: "Tallinn, EE", carrier: "Maersk", status: "docs", kg: 1980, eur: 14600, eta: nov(19), pallets: 5 },
  { id: "SH-20492", dest: "Bologna, IT", carrier: "GEODIS", status: "booked", kg: 455.5, eur: 3912.4, eta: nov(20), pallets: 2 },
]

const CITIES = ["Rotterdam, NL", "Gdańsk, PL", "Wien, AT", "Milano, IT", "Brno, CZ", "Lille, FR", "Aarhus, DK", "Valencia, ES", "Debrecen, HU", "Graz, AT", "Leipzig, DE", "Bordeaux, FR", "Vilnius, LT", "Cluj-Napoca, RO", "Sevilla, ES", "Kortrijk, BE", "Malmö, SE", "Plovdiv, BG", "Rijeka, HR", "Oulu, FI", "Saint-Quentin-Fallavier, FR"]
const KEYS: StatusKey[] = ["transit", "transit", "booked", "delivered", "delivered", "docs", "delayed", "transit", "booked", "delivered"]

function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
}

export function makeShipments(n = 64): Shipment[] {
  const r = rng(20483)
  const out: Shipment[] = SEED.map((s, i) => ({ ...s, reference: `PO-${88201 + i}-${s.dest.slice(0, 3).toUpperCase()}` }))
  for (let i = out.length; i < n; i++) {
    const status = KEYS[Math.floor(r() * KEYS.length)]
    const carrier = CARRIERS.filter((c) => !c.disabled)[Math.floor(r() * 8)]?.value
    const dest = CITIES[Math.floor(r() * CITIES.length)]
    if (!status || !carrier || !dest) continue
    const kg = Math.round(r() * 9000 * 10) / 10 + 40
    out.push({
      id: `SH-${20481 + i}`,
      dest,
      carrier,
      status,
      kg,
      eur: Math.round(kg * (6 + r() * 8) * 100) / 100,
      eta: nov(status === "delivered" ? 3 + Math.floor(r() * 6) : 9 + Math.floor(r() * 18)),
      pallets: Math.max(1, Math.round(kg / 520)),
      reference: `PO-${88201 + i}-${dest.slice(0, 3).toUpperCase()}`,
    })
  }
  return out
}

export const LEGS = [
  { at: "09 Nov 06:10", place: "Rotterdam hub", what: "Picked up", state: "done" as const },
  { at: "10 Nov 14:45", place: "Venlo cross-dock", what: "Consolidated", state: "done" as const },
  { at: "12 Nov 08:20", place: "Metz, FR", what: "In transit · on time", state: "current" as const },
  { at: "16 Nov (ETA)", place: "Lyon, FR", what: "Delivery window 08:00–12:00", state: "next" as const },
]

/** Simulated carrier search: latency, abort, and an error for the query "err". */
export function searchCarriers(q: string, signal: AbortSignal) {
  return new Promise<typeof CARRIERS>((resolve, reject) => {
    const t = setTimeout(() => {
      if (q.trim().toLowerCase() === "err") reject(new Error("Carrier service timed out (504)"))
      else resolve(CARRIERS.filter((c) => c.label.toLowerCase().includes(q.trim().toLowerCase())))
    }, 260 + Math.random() * 260)
    signal.addEventListener("abort", () => clearTimeout(t))
  })
}

export const fmtKg = (n: number | null) => (n == null ? "—" : n.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 }))
export const fmtEur = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtDay = (d: Date) => `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en-GB", { month: "short" })}`
