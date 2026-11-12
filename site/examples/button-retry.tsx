"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/keyline/ui/button";

type Signal = "idle" | "pending" | "done" | "failed";

export function CorporateSync() {
  const [signal, setSignal] = useState<Signal>("idle");
  const attempts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const sync = () => {
    setSignal("pending");
    attempts.current += 1;
    // for the demo, the first attempt fails and the second goes through
    const fails = attempts.current === 1;
    timer.current = setTimeout(() => setSignal(fails ? "failed" : "done"), 1000);
  };

  return (
    <div className="grid gap-4">
      <Button signal={signal} onClick={sync} className="justify-self-start">
        {signal === "failed" ? "Try again" : "Send 3 orders to corporate"}
      </Button>
      <p role="status" className="m-0 min-h-10 max-w-[48ch] text-[14px] text-kl-ink-2">
        {signal === "pending" && "Sending to the New York office…"}
        {signal === "failed" && "Corporate didn’t answer. The 3 orders are still saved here; try again."}
        {signal === "done" && "Sent. Corporate has orders DM-4102, DM-4087 and DM-4120."}
        {signal === "idle" && "3 orders are waiting for the end-of-day sync."}
      </p>
    </div>
  );
}
