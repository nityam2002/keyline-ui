"use client";

import { useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/keyline/ui/context-menu";

const CLIENTS = [
  { name: "Scranton Business Park", contact: "Front desk", rep: "Dwight" },
  { name: "Lackawanna County", contact: "Procurement office", rep: "Jim" },
  { name: "Blue Cross of Pennsylvania", contact: "Accounts payable", rep: "Stanley" },
];

export function ClientList() {
  const [log, setLog] = useState("Right-click a client, or focus one and press Shift+F10.");
  const [archived, setArchived] = useState<string[]>([]);
  const shown = CLIENTS.filter((c) => !archived.includes(c.name));

  return (
    <div className="grid gap-4">
      <ul className="m-0 grid list-none gap-2 p-0" aria-label="Clients">
        {shown.map((c) => (
          <li key={c.name}>
            <ContextMenu>
              <ContextMenuTrigger
                tabIndex={0}
                aria-label={`${c.name}. Actions available from the context menu.`}
                className="grid gap-0.5 border border-kl-line bg-kl-paper px-4 py-3 text-[14px] outline-offset-2 focus-visible:outline-2 focus-visible:outline-current"
              >
                <strong>{c.name}</strong>
                <span className="text-kl-ink-2">
                  {c.contact} · {c.rep}’s account
                </span>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => setLog(`Calling ${c.name}, ${c.contact}.`)}>Call</ContextMenuItem>
                <ContextMenuItem onClick={() => setLog(`New order started for ${c.name}.`)}>New order</ContextMenuItem>
                <ContextMenuItem
                  onClick={() => setLog(`${c.rep} will get a reminder to follow up with ${c.name} on Friday.`)}
                >
                  Remind {c.rep} to follow up
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => {
                    setArchived([...archived, c.name]);
                    setLog(`${c.name} archived.`);
                  }}
                >
                  Archive client
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </li>
        ))}
      </ul>
      {shown.length === 0 ? (
        <div className="grid justify-items-start gap-3 border border-dashed border-kl-line-soft px-4 py-4 text-[14px]">
          <p className="m-0">No clients left on the list. Michael would call this a crisis.</p>
          <Button size="compact" onClick={() => setArchived([])}>
            Restore all three
          </Button>
        </div>
      ) : null}
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {log}
      </p>
    </div>
  );
}
