"use client";

import { useState } from "react";
import { Panel, PanelBody, PanelHeader } from "@/components/keyline/ui/panel";
import { ToggleGroup, ToggleGroupItem } from "@/components/keyline/ui/toggle-group";

const STOCK = [
  { item: "20 lb copy paper", cases: 4, low: true, onOrder: false },
  { item: "Cardstock, ivory", cases: 31, low: false, onOrder: false },
  { item: "Legal pads, yellow", cases: 2, low: true, onOrder: false },
  { item: "Toner, HP 26A", cases: 9, low: false, onOrder: true },
];

export function SupplyRoom() {
  const [show, setShow] = useState<string[]>([]);
  const rows = STOCK.filter((s) => (!show.includes("low") || s.low) && (!show.includes("order") || s.onOrder));

  return (
    <Panel className="max-w-[520px]">
      <PanelHeader
        title="Supply room"
        actions={
          <ToggleGroup layout="cell" aria-label="Show" value={show} onValueChange={setShow}>
            <ToggleGroupItem value="low">Low stock</ToggleGroupItem>
            <ToggleGroupItem value="order">On order</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <PanelBody>
        {rows.length ? (
          <ul className="m-0 grid list-none gap-1 p-0 text-[14px]" aria-label="Stock">
            {rows.map((s) => (
              <li key={s.item} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
                <span className="truncate">{s.item}</span>
                <span className="text-kl-ink-2 tabular-nums">{s.cases} cases</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-[14px] text-kl-ink-2">
            Nothing low is on order yet: {STOCK.filter((s) => s.low).length} items need a reorder. Turn off On order to
            see them.
          </p>
        )}
      </PanelBody>
    </Panel>
  );
}
