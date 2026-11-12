"use client";

import { useState } from "react";
import { NumberField } from "@/components/keyline/ui/number-field";

const IN_STOCK = 480;

export function Reorder() {
  const [cases, setCases] = useState<number | null>(24);
  const over = cases != null && cases > IN_STOCK;

  return (
    <div className="grid max-w-[320px] gap-3">
      <NumberField
        label="Reorder for Blue Cross"
        unit="cases"
        min={1}
        largeStep={10}
        value={cases}
        onValueChange={setCases}
        invalid={over}
        error={`The warehouse has ${IN_STOCK}. Split it into two deliveries.`}
        description="Shift + arrow keys step by 10."
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {cases == null ? "Enter a quantity." : over ? "Not sent." : `${cases * 10} reams, on Thursday's truck.`}
      </p>
    </div>
  );
}
