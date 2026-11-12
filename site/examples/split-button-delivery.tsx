"use client";

import { useState } from "react";
import { MenuItem, MenuSeparator } from "@/components/keyline/ui/menu";
import { SplitButton, SplitButtonAction, SplitButtonMenu } from "@/components/keyline/ui/split-button";

export function BookDelivery() {
  const [booked, setBooked] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      <p className="m-0 text-[14px]">
        Order <span className="font-kl-mono whitespace-nowrap">DM-4120</span> · Wilkes-Barre Library · 6 cases, recycled
        bond
      </p>
      <SplitButton variant="primary" className="justify-self-start">
        <SplitButtonAction onClick={() => setBooked("Booked on Darryl’s next truck, today at 2 PM.")}>
          Book delivery
        </SplitButtonAction>
        <SplitButtonMenu label="Other ways to deliver">
          <MenuItem onClick={() => setBooked("Booked for tomorrow, 8 AM. The library opens at 9.")}>
            Tomorrow morning
          </MenuItem>
          <MenuItem onClick={() => setBooked("Held at the branch. Pam will call when it’s at reception.")}>
            Customer pickup at the branch
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            description="Half today, half on Friday"
            onClick={() => setBooked("Split: 3 cases today, 3 cases Friday.")}
          >
            Split across two trucks
          </MenuItem>
        </SplitButtonMenu>
      </SplitButton>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {booked ?? "Not booked yet. The warehouse closes at 5."}
      </p>
    </div>
  );
}
