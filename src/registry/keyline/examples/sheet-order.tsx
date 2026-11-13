"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetPopup,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Status } from "../ui/status";

export function OrderSheet() {
  const [delivered, setDelivered] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 text-[14px]">
      <span className="font-kl-mono text-[13px]">DM-4107</span>
      <span>Lackawanna County</span>
      <Status kind={delivered ? "done" : "normal"}>{delivered ? "Delivered" : "Out for delivery"}</Status>
      <Sheet>
        <SheetTrigger render={<Button size="compact" />}>Details</SheetTrigger>
        <SheetPopup side="end" size={420}>
          <SheetHeader>
            <SheetTitle>DM-4107</SheetTitle>
            <SheetDescription>Lackawanna County · Dwight Schrute</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14px]">
              <dt className="text-kl-ink-3">Paper</dt>
              <dd className="m-0">Copy paper, letter, 20 lb</dd>
              <dt className="text-kl-ink-3">Quantity</dt>
              <dd className="m-0">120 cases</dd>
              <dt className="text-kl-ink-3">Deliver to</dt>
              <dd className="m-0">200 North Washington Avenue, loading dock</dd>
              <dt className="text-kl-ink-3">Status</dt>
              <dd className="m-0">
                <Status kind={delivered ? "done" : "normal"}>{delivered ? "Delivered" : "Out for delivery"}</Status>
              </dd>
            </dl>
          </SheetBody>
          <SheetFooter>
            <SheetClose render={<Button layout="cell" />}>Close</SheetClose>
            <Button layout="cell" variant="primary" disabled={delivered} onClick={() => setDelivered(true)}>
              {delivered ? "Delivered" : "Mark delivered"}
            </Button>
          </SheetFooter>
        </SheetPopup>
      </Sheet>
    </div>
  );
}
