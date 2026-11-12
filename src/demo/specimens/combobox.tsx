import * as React from "react";
import * as ui from "../demo-ui";
import { Combobox, type ComboboxOption } from "@/registry/keyline/ui/combobox";
import { searchCarriers } from "@/registry/keyline/blocks/shipments/shipments-data";

/* shared fixtures --------------------------------------------------- */
const TERMINALS: ComboboxOption[] = (
  [
    ["Rotterdam", "Europoort ECT Delta", "NL", "RTM-1"],
    ["Rotterdam", "Maasvlakte II APMT", "NL", "RTM-2"],
    ["Rotterdam", "Waalhaven Uniport", "NL", "RTM-3"],
    ["Antwerp", "Deurganck DP World", "BE", "ANR-1"],
    ["Antwerp", "Noordzee PSA", "BE", "ANR-2"],
    ["Hamburg", "Burchardkai CTB", "DE", "HAM-1"],
    ["Hamburg", "Altenwerder CTA (automated, rail-connected, shore power on berths 1–4)", "DE", "HAM-2"],
    ["Hamburg", "Tollerort CTT", "DE", "HAM-3"],
    ["Bremerhaven", "North Sea Terminal", "DE", "BRV-1"],
  ] satisfies [port: string, name: string, country: string, code: string][]
).map(([port, name, , code], i) => ({
  value: code,
  label: `${port} ${name}`,
  code,
  group: port,
  disabled: i === 7 ? true : undefined,
  description: i === 7 ? "Closed for berth works" : undefined,
}));
/* ------------------------------------------------------------------ */
export function ComboboxSpecimen() {
  const [terminal, setTerminal] = React.useState<string | null>("HAM-2");
  const [carrier, setCarrier] = React.useState<string | null>(null);
  return (
    <div className={ui.grid2}>
      <Combobox
        label="Terminal (local, grouped)"
        noun={["terminal", "terminals"]}
        options={TERMINALS}
        value={terminal}
        onValueChange={setTerminal}
        name="terminal"
      />
      <Combobox
        label="Carrier (async)"
        noun={["carrier", "carriers"]}
        loadOptions={searchCarriers}
        value={carrier}
        onValueChange={setCarrier}
        placeholder="Type “err” to fail"
      />
      <Combobox label="Terminal (invalid)" options={TERMINALS} invalid placeholder="Required" />
      <Combobox label="Terminal (disabled)" options={TERMINALS} defaultValue="RTM-1" disabled />
    </div>
  );
}
