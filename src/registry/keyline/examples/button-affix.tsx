"use client";

import { useState } from "react";
import { Button, ButtonAffix } from "../ui/button";

export function WarehouseQueue() {
  const [slips, setSlips] = useState(4);
  const [printed, setPrinted] = useState(0);

  const print = () => {
    setPrinted((p) => p + slips);
    setSlips(0);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        <Button disabled={slips === 0} onClick={print}>
          Print packing slips
          <ButtonAffix>{slips}</ButtonAffix>
        </Button>
        <Button size="compact" onClick={() => setSlips((s) => s + 1)}>
          New order in
        </Button>
      </div>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {slips === 0
          ? `All caught up. ${printed} slips sent to Darryl’s printer.`
          : `${slips} slips waiting in the warehouse queue.`}
      </p>
    </div>
  );
}
