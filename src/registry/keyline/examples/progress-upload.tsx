"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

const SIZE = 4.8; // MB

export function UploadReport() {
  const [sent, setSent] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const tries = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  const upload = () => {
    tries.current += 1;
    // the first try drops at 62%, as corporate's server does on Fridays; the retry goes through
    const dropAt = tries.current === 1 ? 62 : Infinity;
    setFailed(false);
    setSent(0);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSent((v) => {
        const next = Math.min(100, (v ?? 0) + 7);
        if (next >= dropAt) {
          clearInterval(timer.current);
          setFailed(true);
          return dropAt;
        }
        if (next === 100) clearInterval(timer.current);
        return next;
      });
    }, 180);
  };

  const mb = sent == null ? 0 : (SIZE * sent) / 100;
  const running = sent != null && sent < 100 && !failed;

  return (
    <div className="grid max-w-[480px] gap-4">
      <Progress
        label="Q4 sales report.xlsx to corporate"
        value={sent ?? 0}
        failed={failed}
        detail={
          failed
            ? "The connection to Stamford dropped. Nothing was saved there; try again."
            : sent === 100
              ? `${SIZE} MB sent. Jan in New York has it.`
              : sent == null
                ? `${SIZE} MB, not sent yet.`
                : `${mb.toFixed(1)} of ${SIZE} MB · about ${Math.ceil(((100 - sent) / 7) * 0.18)} s left`
        }
      />
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" disabled={running} onClick={upload}>
          {failed ? "Try again" : sent === 100 ? "Send again" : "Send report"}
        </Button>
      </div>
    </div>
  );
}
