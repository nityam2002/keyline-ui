"use client";

import { Pin } from "lucide-react";
import { useState } from "react";
import { Toggle } from "../ui/toggle";

export function PinClient() {
  const [pinned, setPinned] = useState(true);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle icon pressed={pinned} onPressedChange={setPinned} aria-label="Pin to my clients">
        <Pin size={16} aria-hidden="true" />
      </Toggle>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        Blue Cross of Pennsylvania{" "}
        {pinned ? "is pinned to the top of Stanley’s clients." : "is back in alphabetical order."}
      </p>
    </div>
  );
}
