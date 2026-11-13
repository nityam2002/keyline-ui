"use client";

import { useState, type ChangeEvent } from "react";
import { FieldGroup, FieldGroupError, FieldGroupJoin, FieldGroupPart } from "../ui/field";

const SHELF = 30; // inches under the truck's top shelf

export function CartonSize() {
  const [size, setSize] = useState({ l: "24", w: "18", h: "34" });
  const tall = Number(size.h) > SHELF;
  const part = (k: keyof typeof size) => ({
    inputMode: "numeric" as const,
    value: size[k],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setSize({ ...size, [k]: e.target.value }),
  });

  return (
    <div className="grid max-w-[360px] gap-2">
      <FieldGroup legend="Carton size, inches" invalid={tall}>
        <FieldGroupPart label="L" inputProps={part("l")} />
        <FieldGroupJoin />
        <FieldGroupPart label="W" inputProps={part("w")} />
        <FieldGroupJoin />
        <FieldGroupPart label="H" invalid={tall} inputProps={part("h")} />
      </FieldGroup>
      <FieldGroupError>
        {tall ? `At ${size.h} in, it won't fit under the truck's top shelf. Keep it to ${SHELF} in.` : null}
      </FieldGroupError>
    </div>
  );
}
