"use client";

import { useState } from "react";
import { Slider } from "../ui/slider";

const ORDER = 12_400; // Lackawanna County's annual paper order, in dollars
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function CountyDiscount() {
  const [pct, setPct] = useState(6);
  const needsMichael = pct > 10;

  return (
    <div className="grid max-w-[440px] gap-3">
      <Slider
        label="Discount for Lackawanna County"
        unit="%"
        min={0}
        max={15}
        value={pct}
        onValueChange={(v) => setPct(v as number)}
        description="Over 10% needs Michael's sign-off."
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {usd((ORDER * pct) / 100)} off {usd(ORDER)}: they pay {usd(ORDER - (ORDER * pct) / 100)}.
        {needsMichael ? " Michael has to approve this one." : ""}
      </p>
    </div>
  );
}
