"use client";

import { useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuPopup,
  MenuGroup,
  MenuGroupLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/keyline/ui/menu";

const EVENTS = { shipped: "An order ships", complaint: "A client complains", mention: "Someone mentions me" };
type Event = keyof typeof EVENTS;

export function NotificationMenu() {
  const [on, setOn] = useState<Record<Event, boolean>>({ shipped: true, complaint: true, mention: false });
  const [when, setWhen] = useState("now");
  const chosen = (Object.keys(EVENTS) as Event[]).filter((e) => on[e]);

  return (
    <div className="grid gap-4">
      <Menu>
        <MenuTrigger render={<Button className="justify-self-start" />}>Notify me</MenuTrigger>
        <MenuPopup>
          <MenuGroup>
            <MenuGroupLabel>When</MenuGroupLabel>
            {(Object.keys(EVENTS) as Event[]).map((e) => (
              <MenuCheckboxItem key={e} checked={on[e]} onCheckedChange={(c) => setOn({ ...on, [e]: c })}>
                {EVENTS[e]}
              </MenuCheckboxItem>
            ))}
          </MenuGroup>
          <MenuSeparator />
          <MenuRadioGroup value={when} onValueChange={setWhen}>
            <MenuGroupLabel>How often</MenuGroupLabel>
            <MenuRadioItem value="now">Right away</MenuRadioItem>
            <MenuRadioItem value="daily" description="One email at 5 PM">
              Daily digest
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuPopup>
      </Menu>
      <p role="status" className="m-0 min-h-10 max-w-[52ch] text-[14px] text-kl-ink-2">
        {chosen.length
          ? `${when === "now" ? "Right away" : "Once a day"}: ${chosen.map((e) => EVENTS[e].toLowerCase()).join(", ")}.`
          : "No notifications. You’ll hear about it at the next conference room meeting."}
      </p>
    </div>
  );
}
