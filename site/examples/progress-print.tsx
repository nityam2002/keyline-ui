"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import { Progress } from "@/components/keyline/ui/progress";

const PAGES = 40;

export function PrintInvoices() {
  // null while the printer warms up: there is no figure to show yet, so the bar is indeterminate
  const [printed, setPrinted] = useState<number | null>(0);
  const [started, setStarted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const print = () => {
    timers.current.forEach(clearTimeout);
    setStarted(true);
    setPrinted(null);
    timers.current = [setTimeout(() => setPrinted(0), 2000)];
    for (let p = 1; p <= PAGES; p++) timers.current.push(setTimeout(() => setPrinted(p), 2000 + p * 70));
  };

  return (
    <div className="grid max-w-[480px] gap-4">
      <Progress
        label="Invoices on the second-floor printer"
        value={printed}
        max={PAGES}
        getAriaValueText={(_, v) => (v == null ? "Warming up" : `${v} of ${PAGES} pages`)}
        detail={
          !started
            ? `${PAGES} pages, waiting to start.`
            : printed == null
              ? "Warming up. It takes a while; it always has."
              : printed === PAGES
                ? "All 40 printed. Collect them before Creed does."
                : `${printed} of ${PAGES} pages`
        }
      />
      <Button className="justify-self-start" disabled={started && printed !== PAGES} onClick={print}>
        {printed === PAGES ? "Print again" : "Print"}
      </Button>
    </div>
  );
}
