"use client";

import { useState } from "react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarPopup,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/keyline/ui/menubar";

export function SalesReportMenus() {
  const [period, setPeriod] = useState("quarter");
  const [targets, setTargets] = useState(true);
  const [byRep, setByRep] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      <Menubar aria-label="Sales report">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPopup>
            <MenubarItem onClick={() => setLast("Saved a copy for David Wallace.")}>Save a copy</MenubarItem>
            <MenubarItem shortcut="⌘P" onClick={() => setLast("Sent to the printer by the annex.")}>
              Print
            </MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPopup>
            <MenubarCheckboxItem checked={targets} onCheckedChange={setTargets}>
              Branch targets
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={byRep} onCheckedChange={setByRep}>
              Split by sales rep
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup value={period} onValueChange={setPeriod}>
              <MenubarRadioItem value="month">This month</MenubarRadioItem>
              <MenubarRadioItem value="quarter">This quarter</MenubarRadioItem>
              <MenubarRadioItem value="year">This year</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Share</MenubarTrigger>
          <MenubarPopup>
            <MenubarItem onClick={() => setLast("Emailed to the Scranton sales team.")}>
              Email the sales team
            </MenubarItem>
            <MenubarItem onClick={() => setLast("Posted on the break room board.")}>Post in the break room</MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarPopup>
            <MenubarItem onClick={() => setLast("Ticket opened with IT. Nick will be up shortly.")}>Ask IT</MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
      </Menubar>
      <p role="status" className="m-0 min-h-10 text-[14px] text-kl-ink-2">
        Q3 sales, Scranton · {period === "month" ? "this month" : period === "quarter" ? "this quarter" : "this year"}
        {targets ? " · against targets" : ""}
        {byRep ? " · by rep" : ""}
        {last ? ` · ${last}` : ""}
      </p>
    </div>
  );
}
