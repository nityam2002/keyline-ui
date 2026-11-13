"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { ToastFloating, ToastProvider, useToaster } from "../ui/toast";

const ORDERS = [
  "DM-4103 · Scranton Business Park",
  "DM-4104 · Penn Paper Supply",
  "DM-4105 · Blue Cross of Pennsylvania",
];

function Orders() {
  const toast = useToaster();
  const [orders, setOrders] = useState(ORDERS);

  const archive = (o: string) => {
    const at = orders.indexOf(o);
    setOrders((all) => all.filter((x) => x !== o));
    toast.notify({
      title: `${o.split(" · ")[0]} archived`,
      description: "It stays in the quarter's reports.",
      action: { label: "Undo", onClick: () => setOrders((all) => [...all.slice(0, at), o, ...all.slice(at)]) },
    });
  };

  return (
    <ul aria-label="Delivered orders" className="m-0 grid list-none gap-3 p-0 text-[14px]">
      {orders.map((o) => (
        <li key={o} className="grid grid-cols-[1fr_auto] items-center gap-3">
          <span>{o}</span>
          <Button size="compact" onClick={() => archive(o)}>
            Archive
          </Button>
        </li>
      ))}
      {orders.length ? null : <li className="text-kl-ink-2">Everything delivered is archived.</li>}
    </ul>
  );
}

export function ArchiveUndo() {
  return (
    <ToastProvider>
      <Orders />
      <ToastFloating />
    </ToastProvider>
  );
}
