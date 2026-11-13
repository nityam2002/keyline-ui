// Select and SelectRoot are generic in the value: the value type a caller gives flows to every callback.
import { Select, SelectRoot } from "@/components/keyline/ui/select";

import { expectType } from "./expect";

type Lane = "road" | "rail";
const options = [
  { value: "road", label: "Road" },
  { value: "rail", label: "Rail" },
];

export const inferred = (
  <Select
    label="Lane"
    options={options}
    value={"road" as Lane}
    onValueChange={(value) => {
      expectType<Lane | null>()(value);
    }}
  />
);

export const explicit = (
  <Select<Lane>
    label="Lane"
    options={options}
    onValueChange={(value) => {
      expectType<Lane | null>()(value);
    }}
  />
);

// @ts-expect-error a value outside the declared type
export const wrongValue = <Select<Lane> label="Lane" options={options} value="sea" />;

export const root = (
  <SelectRoot<number>
    defaultValue={3}
    onValueChange={(value) => {
      expectType<number | null>()(value);
    }}
  />
);
