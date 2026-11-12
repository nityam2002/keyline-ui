import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Panel, PanelHeader } from "@/registry/keyline/ui/panel";
import { Segmented, SegmentedItem } from "@/registry/keyline/ui/segmented";
import { Nav } from "@/registry/keyline/ui/nav";
import { AppShell } from "@/registry/keyline/ui/app-shell";
import { Breadcrumb } from "@/registry/keyline/ui/breadcrumb";
import {
  Inspector,
  InspectorHeader,
  InspectorFacts,
  InspectorBody,
  InspectorSection,
} from "@/registry/keyline/ui/inspector";
import { Status } from "@/registry/keyline/ui/status";
import { Item, ItemList, ItemContent, ItemMeta } from "@/registry/keyline/ui/item";

/* ------------------------------------------------------------------ *
 * 4. App shell
 * ------------------------------------------------------------------ */
const SHELL_ROWS = [
  { id: "SHP-24018", dest: "Rotterdam Europoort", carrier: "Maersk", status: "transit" as const },
  { id: "SHP-24019", dest: "Hamburg Waltershof", carrier: "DHL Freight", status: "docs" as const },
  { id: "SHP-24020", dest: "Antwerp Deurganck", carrier: "Raben", status: "delayed" as const },
  { id: "SHP-24021", dest: "Gdańsk DCT", carrier: "DSV Road", status: "delivered" as const },
];
const STATUS_TEXT = {
  transit: ["normal", "In transit"],
  docs: ["waiting", "Awaiting docs"],
  delayed: ["attention", "Delayed 2 d"],
  delivered: ["done", "Delivered"],
} as const;
export function AppShellSpecimen() {
  const [width, setWidth] = React.useState("wide");
  const [place, setPlace] = React.useState("shipments");
  const [open, setOpen] = React.useState<string | null>(null);
  const row = SHELL_ROWS.find((r) => r.id === open);
  return (
    <div className={ui.stack}>
      <Segmented value={width} onValueChange={setWidth} aria-label="Shell width">
        <SegmentedItem value="wide">Wide</SegmentedItem>
        <SegmentedItem value="narrow">600px (sheets)</SegmentedItem>
      </Segmented>
      <div className={ui.shellBox} data-width={width} data-testid="specimen-shell">
        <AppShell
          narrowAt={640}
          asideInlineAt={1000}
          navLabel="Navigation"
          nav={
            <Nav
              layout="cell"
              label="Main"
              header={
                <>
                  <span className="block size-3.5 bg-current" aria-hidden /> Northwind Freight
                </>
              }
              value={place}
              onValueChange={setPlace}
              items={[
                { value: "shipments", label: "Shipments", count: 64 },
                { value: "carriers", label: "Carriers", count: 9 },
                { value: "docks", label: "Dock schedule" },
                { value: "invoices", label: "Invoices", count: 3 },
              ]}
            />
          }
          header={
            <Breadcrumb
              layout="cell"
              items={[
                { label: "Northwind", href: "#" },
                { label: "Europe", href: "#" },
                { label: "Netherlands", href: "#" },
                {
                  label: place === "shipments" ? "Shipments" : place.charAt(0).toUpperCase() + place.slice(1),
                  href: "#",
                },
                ...(row ? [{ label: row.id }] : [{ label: "All" }]),
              ]}
            />
          }
          actions={
            <Button layout="cell" variant="quiet">
              Export
            </Button>
          }
          aside={
            row ? (
              <Inspector aria-label={`Shipment ${row.id}`}>
                <InspectorHeader
                  code={row.id}
                  title={row.dest}
                  status={<Status kind={STATUS_TEXT[row.status][0]}>{STATUS_TEXT[row.status][1]}</Status>}
                  onClose={() => setOpen(null)}
                />
                <InspectorFacts
                  items={[
                    { label: "Carrier", value: row.carrier },
                    { label: "ETA", value: "Thu 12 Nov" },
                  ]}
                />
                <InspectorBody>
                  <InspectorSection>Two legs. Customs cleared at Rotterdam on Monday.</InspectorSection>
                </InspectorBody>
              </Inspector>
            ) : null
          }
          asideOpen={!!row}
          onAsideOpenChange={(o) => !o && setOpen(null)}
          asideLabel={row ? `Shipment ${row.id}` : "Shipment"}
        >
          <Panel>
            <PanelHeader title="Shipments" code="64" />
            <ItemList layout="cell" aria-label="Shipments">
              {SHELL_ROWS.map((r) => (
                <Item
                  key={r.id}
                  render={<button type="button" onClick={() => setOpen(r.id)} aria-pressed={open === r.id} />}
                >
                  <ItemContent title={r.dest} description={r.carrier} />
                  <ItemMeta>{r.id}</ItemMeta>
                </Item>
              ))}
            </ItemList>
          </Panel>
        </AppShell>
      </div>
    </div>
  );
}
