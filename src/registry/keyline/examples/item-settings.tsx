"use client";

import { useState } from "react";
import { Item, ItemActions, ItemContent, ItemList, ItemMedia } from "../ui/item";
import { Switch } from "../ui/switch";

const ALERTS = [
  { id: "new", code: "ORD", title: "New orders", desc: "When a client places an order through the website." },
  { id: "held", code: "DLV", title: "Held deliveries", desc: "When Darryl can't get a signature." },
  { id: "low", code: "STK", title: "Low paper stock", desc: "When a grade drops under a week's deliveries." },
  { id: "party", code: "PTY", title: "Party planning", desc: "Every message from the committee." },
];

export function AlertSettings() {
  const [on, setOn] = useState<Record<string, boolean>>({ new: true, held: true, low: false, party: false });
  return (
    <ItemList aria-label="Email me about">
      {ALERTS.map((a) => (
        <Item key={a.id}>
          <ItemMedia>{a.code}</ItemMedia>
          <ItemContent title={<span id={`alert-${a.id}`}>{a.title}</span>} description={a.desc} />
          <ItemActions>
            <Switch
              aria-labelledby={`alert-${a.id}`}
              checked={on[a.id]}
              onCheckedChange={(v) => setOn((s) => ({ ...s, [a.id]: v }))}
            />
          </ItemActions>
        </Item>
      ))}
    </ItemList>
  );
}
