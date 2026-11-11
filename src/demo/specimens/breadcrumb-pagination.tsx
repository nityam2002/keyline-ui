import * as React from "react"
import * as ui from "../demo-ui"
import { Panel,PanelHeader,PanelBody } from "@/registry/keyline/ui/panel"
import { Breadcrumb } from "@/registry/keyline/ui/breadcrumb"
import { Pagination } from "@/registry/keyline/ui/pagination"

/* ------------------------------------------------------------------ */
export function WayfindingSpecimen() {
  const [page, setPage] = React.useState(5)
  const [big, setBig] = React.useState(1)
  return (
    <div className={ui.stack}>
      <Breadcrumb items={[{ label: "Network", href: "#/specimen" }, { label: "Rotterdam", href: "#/specimen" }, { label: "ECT Delta" }]} />
      <Breadcrumb
        items={[
          { label: "Network", href: "#/specimen" },
          { label: "Europe", href: "#/specimen" },
          { label: "Netherlands", href: "#/specimen" },
          { label: "Port of Rotterdam", href: "#/specimen" },
          { label: "Maasvlakte II", href: "#/specimen" },
          { label: "APM Terminals Maasvlakte II, berth 3 (automated, shore power)" },
        ]}
      />
      <div style={{ width: 360 }}>
        <Breadcrumb items={[{ label: "Network", href: "#/specimen" }, { label: "Europe", href: "#/specimen" }, { label: "Rotterdam", href: "#/specimen" }, { label: "ECT Delta" }]} />
      </div>
      <Pagination page={page} pageCount={20} onPageChange={setPage} />
      <Pagination page={big} pageCount={1250} onPageChange={setBig} label="Pagination, many pages" />
      <Pagination page={1} pageCount={null} label="Pagination, loading" />
      <Pagination page={2} pageCount={3} getHref={(p) => `#/specimen?page=${p}`} label="Pagination, links" />
      <div style={{ width: 320 }}>
        <Pagination page={page} pageCount={20} onPageChange={setPage} label="Pagination, narrow" />
      </div>
      <Panel>
        <PanelHeader title="Panel footer (cell)" />
        <PanelBody>Pagination as the last cell of a panel.</PanelBody>
        <Pagination layout="cell" page={page} pageCount={20} onPageChange={setPage} label="Pagination, in a panel" />
      </Panel>
    </div>
  )
}
