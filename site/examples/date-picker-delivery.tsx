"use client";

import { useState } from "react";
import { DatePicker } from "@/components/keyline/ui/date-picker";

const day = (offset: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset);
};
const nextMonday = () => day((8 - new Date().getDay()) % 7 || 7);

export function DeliveryDay() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div className="grid max-w-[360px] gap-3">
      <DatePicker
        label="Deliver on"
        locale="en-US"
        min={day(1)}
        max={day(60)}
        value={date}
        onValueChange={setDate}
        isDateUnavailable={(d) => (d.getDay() === 0 || d.getDay() === 6 ? "no weekend deliveries" : false)}
        presets={[{ label: "Next Monday", date: nextMonday }]}
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {date
          ? `On Darryl's route for ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.`
          : "Weekdays only, from tomorrow."}
      </p>
    </div>
  );
}
