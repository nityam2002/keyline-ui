"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "../ui/dialog";

const START = [
  { name: "Vance Refrigeration", orders: 6 },
  { name: "Penn Paper Supply", orders: 2 },
  { name: "Mount Airy Casino", orders: 0 },
];

export function RemoveClient() {
  const [clients, setClients] = useState(START);
  const [last, setLast] = useState("");

  return (
    <div className="grid gap-4">
      <ul aria-label="Clients" className="m-0 grid list-none gap-3 p-0 text-[14px]">
        {clients.map((c) => (
          <li key={c.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <span>
              {c.name}{" "}
              <span className="text-kl-ink-3">· {c.orders === 0 ? "no orders" : `${c.orders} open orders`}</span>
            </span>
            <AlertDialog>
              <AlertDialogTrigger render={<Button size="compact" />}>Remove</AlertDialogTrigger>
              <AlertDialogContent
                title={`Remove ${c.name}?`}
                description={
                  c.orders
                    ? `Their ${c.orders} open orders are cancelled and the account closes. This can't be undone.`
                    : "The account closes. This can't be undone."
                }
                cancelLabel="Keep the client"
                confirmLabel="Remove client"
                onConfirm={() => {
                  setClients((all) => all.filter((x) => x.name !== c.name));
                  setLast(`${c.name} removed.`);
                }}
              />
            </AlertDialog>
          </li>
        ))}
      </ul>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {clients.length ? last : `${last} No clients left; refresh the page to bring them back.`}
      </p>
    </div>
  );
}
