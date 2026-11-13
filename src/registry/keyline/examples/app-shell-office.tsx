"use client";

import { useRef, useState } from "react";
import { AppShell } from "../ui/app-shell";
import { Breadcrumb } from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { Inspector, InspectorActions, InspectorBody, InspectorFacts, InspectorHeader } from "../ui/inspector";
import { Item, ItemContent, ItemList, ItemMedia } from "../ui/item";
import { Nav } from "../ui/nav";
import { Status } from "../ui/status";

const VIEWS = { orders: "Orders", clients: "Clients", warehouse: "Warehouse" } as const;
type View = keyof typeof VIEWS;

const ORDERS = [
  { id: "DM-4107", client: "Lackawanna County", cases: 120, rep: "Dwight Schrute" },
  { id: "DM-4108", client: "Blue Cross of Pennsylvania", cases: 60, rep: "Jim Halpert" },
  { id: "DM-4109", client: "Vance Refrigeration", cases: 12, rep: "Phyllis Vance" },
];

export function OfficeShell() {
  const [view, setView] = useState<View>("orders");
  const [open, setOpen] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const order = ORDERS.find((o) => o.id === open);

  return (
    <AppShell
      // a low breakpoint keeps the sidebar in a preview this narrow
      narrowAt={400}
      mainProps={{ className: "min-h-[300px]" }}
      navSize={180}
      navLabel="Scranton branch"
      nav={
        <Nav
          layout="cell"
          label="Scranton branch"
          value={view}
          onValueChange={(v) => setView(v as View)}
          items={Object.entries(VIEWS).map(([value, label]) => ({ value, label }))}
        />
      }
      header={
        <Breadcrumb
          layout="cell"
          items={[
            {
              label: "Scranton",
              render: <a href="?view=orders" onClick={(e) => (e.preventDefault(), setView("orders"))} />,
            },
            { label: VIEWS[view] },
          ]}
        />
      }
      actions={
        <Button layout="cell" variant="primary">
          New order
        </Button>
      }
      aside={
        order ? (
          <Inspector>
            <InspectorHeader
              code={order.id}
              title={order.client}
              status={<Status kind="normal">Out for delivery</Status>}
              onClose={() => setOpen(null)}
            />
            <InspectorBody>
              <InspectorFacts
                items={[
                  { label: "Cases", value: order.cases },
                  { label: "Rep", value: order.rep },
                ]}
              />
            </InspectorBody>
            <InspectorActions>
              <Button layout="cell" onClick={() => setOpen(null)}>
                Close
              </Button>
            </InspectorActions>
          </Inspector>
        ) : null
      }
      asideLabel="Order"
      asideOpen={!!order}
      onAsideOpenChange={(o) => (o ? null : setOpen(null))}
      asideFinalFocus={opener}
    >
      {view === "orders" ? (
        <ItemList aria-label="Open orders">
          {ORDERS.map((o) => (
            <Item
              key={o.id}
              current={o.id === open}
              render={<button type="button" />}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(o.id);
              }}
            >
              <ItemMedia>{o.id.slice(3)}</ItemMedia>
              <ItemContent title={o.client} description={o.rep} />
            </Item>
          ))}
        </ItemList>
      ) : (
        <p className="m-0 text-[14px] text-kl-ink-2">
          {view === "clients" ? "64 active clients." : "88 pallets on the floor."}
        </p>
      )}
    </AppShell>
  );
}
