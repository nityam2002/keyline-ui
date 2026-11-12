import * as React from "react";
import { Combobox, type ComboboxOption } from "@/registry/keyline/ui/combobox";
import { Multiselect, type MultiselectOption } from "@/registry/keyline/ui/multiselect";

/* Async search races: a pasted query must not be superseded by the open, and Escape on a closed field must keep the value.
   Public API only: props and Tailwind; data-testid hooks for the browser specs.

   The async sources are held: every request is recorded on window.__klAsyncRequests and settles only when the script says
   so, in any order. They ignore the abort signal on purpose (as a careless API client would), so a superseded
   response really does arrive late and the component has to drop it. */

type Held = { field: string; q: string; aborted: boolean; settle: (ok: boolean) => void };
declare global {
  interface Window {
    __klAsyncRequests?: Held[];
  }
}
const CARRIERS = ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "Evergreen", "ONE", "COSCO"];
function held<T>(field: string, make: (label: string) => T) {
  return (q: string, signal: AbortSignal) =>
    new Promise<T[]>((resolve, reject) => {
      const r: Held = {
        field,
        q,
        aborted: false,
        settle: (ok) =>
          ok
            ? resolve(CARRIERS.filter((c) => c.toLowerCase().includes(q.toLowerCase())).map(make))
            : reject(new Error(`The carrier search for “${q}” failed.`)),
      };
      signal.addEventListener("abort", () => (r.aborted = true));
      (window.__klAsyncRequests ??= []).push(r);
    });
}
const cbOption = (label: string): ComboboxOption => ({ value: label.toLowerCase(), label });
const msOption = (label: string): MultiselectOption => ({ value: label.toLowerCase(), label });
const loadCbControlled = held("cb-c", cbOption);
const loadCbUncontrolled = held("cb-u", cbOption);
const loadMsControlled = held("ms-c", msOption);
const loadMsUncontrolled = held("ms-u", msOption);
const LOCAL = CARRIERS.map(cbOption);
/** Counts the Escape presses that reach the field's surroundings (an enclosing overlay would close on them). */
function Case({ id, said, children }: { id: string; said: string; children: React.ReactNode }) {
  const [reached, setReached] = React.useState(0);
  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- counts the Escapes that reach the case from the combobox inside
    <div
      data-testid={id}
      className="grid content-start gap-2"
      onKeyDown={(e) => e.key === "Escape" && setReached((n) => n + 1)}
    >
      {children}
      <output data-testid={`${id}-value`} className="font-mono text-[12px] text-kl-ink-2">
        {said}
      </output>
      <output data-testid={`${id}-escapes`} className="font-mono text-[12px] text-kl-ink-3">
        {reached}
      </output>
    </div>
  );
}
export function AsyncRaceSpecimen() {
  const [cb, setCb] = React.useState<string | null>(null);
  const [cbU, setCbU] = React.useState<string | null>(null);
  const [cbL, setCbL] = React.useState<string | null>("msc");
  const [ms, setMs] = React.useState<MultiselectOption[]>([msOption("Evergreen")]);
  const [msU, setMsU] = React.useState<MultiselectOption[]>([msOption("Evergreen")]);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
      <Case id="cb-c" said={cb ?? "none"}>
        <Combobox
          label="Carrier (controlled, async)"
          noun={["carrier", "carriers"]}
          loadOptions={loadCbControlled}
          value={cb}
          onValueChange={setCb}
        />
      </Case>
      <Case id="cb-u" said={cbU ?? "none"}>
        <Combobox
          label="Carrier (uncontrolled, async)"
          noun={["carrier", "carriers"]}
          loadOptions={loadCbUncontrolled}
          onValueChange={setCbU}
        />
      </Case>
      <Case id="cb-l" said={cbL ?? "none"}>
        <Combobox
          label="Carrier (uncontrolled, local)"
          noun={["carrier", "carriers"]}
          options={LOCAL}
          defaultValue="msc"
          onValueChange={setCbL}
        />
      </Case>
      <Case id="ms-c" said={ms.map((o) => o.value).join(",") || "none"}>
        <Multiselect
          label="Carriers (controlled)"
          noun={["carrier", "carriers"]}
          loadOptions={loadMsControlled}
          value={ms}
          onValueChange={setMs}
        />
      </Case>
      <Case id="ms-u" said={msU.map((o) => o.value).join(",") || "none"}>
        <Multiselect
          label="Carriers (uncontrolled)"
          noun={["carrier", "carriers"]}
          loadOptions={loadMsUncontrolled}
          defaultValue={[msOption("Evergreen")]}
          onValueChange={setMsU}
        />
      </Case>
    </div>
  );
}
