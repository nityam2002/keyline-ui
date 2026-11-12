"use client";

import { useState } from "react";
import { TimeField } from "@/components/keyline/ui/time-field";

const show = (t: string) =>
  new Date(`2026-01-01T${t}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export function DockTime() {
  const [time, setTime] = useState<string | null>("10:30");

  return (
    <div className="grid max-w-[320px] gap-3">
      <TimeField
        label="Truck arrives at"
        hourCycle={12}
        locale="en-US"
        minuteStep={15}
        min="07:00"
        max="16:00"
        zone="EST"
        value={time}
        onValueChange={setTime}
        description="The dock is open 7 AM to 4 PM. Arrow keys move by 15 minutes."
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {time ? `Darryl will have the dock clear at ${show(time)}.` : "No arrival time yet."}
      </p>
    </div>
  );
}
