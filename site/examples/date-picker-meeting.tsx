"use client";

import { useState } from "react";
import { DateTimePicker } from "@/components/keyline/ui/date-picker";

const tomorrow = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
};

// Michael's calendar: the 9 AM slot is his "conference room meeting" every Monday
const busy = (day: Date, time: string) =>
  day.getDay() === 1 && time === "09:00"
    ? "Michael's Monday meeting"
    : day.getDay() === 5 && time === "15:00"
      ? "pretzel day"
      : false;

export function ClientMeeting() {
  const [when, setWhen] = useState<Date | null>(null);

  return (
    <div className="grid max-w-[360px] gap-3">
      <DateTimePicker
        label="Meet the Lackawanna County buyer"
        locale="en-US"
        hourCycle={12}
        min={tomorrow()}
        slots={["09:00", "11:00", "13:30", "15:00"]}
        isTimeUnavailable={busy}
        isDateUnavailable={(d) => (d.getDay() === 0 || d.getDay() === 6 ? "weekend" : false)}
        value={when}
        onValueChange={setWhen}
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {when ? `Booked. Jim takes the meeting; Dwight is not to attend.` : "Pick a day, then one of the open slots."}
      </p>
    </div>
  );
}
