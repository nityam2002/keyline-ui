"use client"

import { useState } from "react"
import { Breadcrumb } from "@/components/keyline/ui/breadcrumb"
import { Button } from "@/components/keyline/ui/button"
import { DirectionProvider } from "@/components/keyline/ui/direction"
import { Pagination } from "@/components/keyline/ui/pagination"
import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented"
import { Tooltip } from "@/components/keyline/ui/tooltip"

// the same screen in English and in Arabic: the language and the direction change together
const COPY = {
  ltr: { lang: "en", clients: "Clients", client: "Lackawanna County", invoices: "Invoices", pages: "Invoice pages", print: "Print", tip: "Print this page" },
  rtl: { lang: "ar", clients: "العملاء", client: "مقاطعة لاكاوانا", invoices: "الفواتير", pages: "صفحات الفواتير", print: "طباعة", tip: "اطبع هذه الصفحة" },
}

const stay = (e: React.MouseEvent) => e.preventDefault()

export function MirroredInvoices() {
  const [dir, setDir] = useState<"ltr" | "rtl">("rtl")
  const [page, setPage] = useState(3)
  const t = COPY[dir]

  return (
    <div className="grid gap-4">
      <Segmented aria-label="Direction" value={dir} onValueChange={(v: string) => setDir(v as "ltr" | "rtl")} className="justify-self-start">
        <SegmentedItem value="ltr">English · LTR</SegmentedItem>
        <SegmentedItem value="rtl">Arabic · RTL</SegmentedItem>
      </Segmented>
      <DirectionProvider direction={dir} lang={t.lang}>
        <div className="grid gap-4">
          <Breadcrumb
            items={[
              { label: t.clients, render: <a href="?clients" onClick={stay} /> },
              { label: t.client, render: <a href="?client=lackawanna" onClick={stay} /> },
              { label: t.invoices },
            ]}
          />
          <Pagination page={page} pageCount={9} onPageChange={setPage} label={t.pages} />
          <Tooltip content={t.tip} side="inline-end">
            <Button size="compact" className="justify-self-start">
              {t.print}
            </Button>
          </Tooltip>
        </div>
      </DirectionProvider>
    </div>
  )
}
