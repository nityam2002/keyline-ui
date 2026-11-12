"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import { ButtonGroup } from "@/components/keyline/ui/button-group";
import { Menu, MenuPopup, MenuItem, MenuTrigger } from "@/components/keyline/ui/menu";

export function TrackingLink() {
  const [sent, setSent] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      <ButtonGroup aria-label="Tracking link for DM-4087" className="justify-self-start">
        <Button layout="cell" onClick={() => setSent("Link copied: dundermifflin.com/track/DM-4087")}>
          Copy tracking link
        </Button>
        <Menu>
          <MenuTrigger render={<Button layout="cell" aria-label="Send the tracking link" />}>
            Send
            <ChevronDown size={16} aria-hidden="true" />
          </MenuTrigger>
          <MenuPopup align="end">
            <MenuItem onClick={() => setSent("Emailed to the Lackawanna County clerk.")}>Email the client</MenuItem>
            <MenuItem onClick={() => setSent("Texted to Jim Halpert.")}>Text the sales rep</MenuItem>
            <MenuItem onClick={() => setSent("Printed at reception. Pam has it.")}>Print for reception</MenuItem>
          </MenuPopup>
        </Menu>
      </ButtonGroup>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {sent ?? "Order DM-4087 left the warehouse at 10:15."}
      </p>
    </div>
  );
}
