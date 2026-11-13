// Combobox's value is an option's `value` string; the change callback also hands back the chosen option.
import { Combobox, type ComboboxOption } from "@/components/keyline/ui/combobox";

import { expectType } from "./expect";

export const callback = (
  <Combobox
    label="Carrier"
    options={[{ value: "dhl", label: "DHL" }]}
    onValueChange={(value, option) => {
      expectType<string | null>()(value);
      expectType<ComboboxOption | null>()(option);
    }}
  />
);

export const loader = (
  <Combobox
    label="Carrier"
    loadOptions={async (query, signal) => {
      expectType<string>()(query);
      expectType<AbortSignal>()(signal);
      return [];
    }}
  />
);

// @ts-expect-error the value is a string, not an option
export const wrongValue = <Combobox label="Carrier" value={{ value: "dhl", label: "DHL" }} />;
