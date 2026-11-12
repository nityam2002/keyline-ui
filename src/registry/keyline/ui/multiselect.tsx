"use client";

import * as React from "react";
import type { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import {
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxClear,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxRoot,
  ComboboxStatus,
  ComboboxTrigger,
} from "./combobox";

/*
 * Multiselect: a preset over Combobox's parts with Base UI's `multiple`. Selection, filtering, chips, keyboard
 * (Backspace removes the last chip, arrows walk the chips) and focus are Base UI Combobox's; this file adds the async
 * source, the count cell and the list's head and foot.
 *
 *   ┌──────────────────────────────────┬────┬────┐
 *   │ [MSC ×] [Maersk ×] search…       │  2 │ ⌄  │   chips and the input · count cell · caret cell
 *   └──────────────────────────────────┴────┴────┘
 */

export type MultiselectOption = {
  value: string;
  label: string;
  description?: string;
  count?: number;
  disabled?: boolean;
};

type MultiselectProps = {
  label: React.ReactNode;
  value?: MultiselectOption[];
  defaultValue?: MultiselectOption[];
  /** Called with the chosen options and Base UI's event details (the reason, the event). */
  onValueChange?: (value: MultiselectOption[], eventDetails: ComboboxPrimitive.Root.ChangeEventDetails) => void;
  /** Async source. Called on open (query "") and on every input change; earlier requests are aborted. */
  loadOptions: (query: string, signal: AbortSignal) => Promise<MultiselectOption[]>;
  placeholder?: string;
  noun?: [singular: string, plural: string];
  /** control: its own 2px frame. cell: a cell of an enclosing frame (e.g. a toolbar); the label is visually hidden. */
  layout?: "control" | "cell";
  disabled?: boolean;
  className?: string;
  /** Where the list's portal renders (defaults to <body>). */
  container?: ComboboxPrimitive.Portal.Props["container"];
};

/* the typed text, underlined in each match */
function highlight(text: string, q: string) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark
        className={cn(
          "bg-transparent font-[inherit] text-inherit underline decoration-kl-cobalt-text decoration-2 underline-offset-3",
          "group-data-highlighted/combobox-item:decoration-kl-yellow",
        )}
      >
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

/*
 * A row of a list that holds several values. ComboboxItem's mark is the exclusive-choice square; several values take
 * a check box instead: the box is always drawn (dashed while the row is out of service), a chosen row floods its mark
 * cell yellow (the working set) and the box's inner square turns into a tick drawn from two borders, which never
 * mirrors. The trailing cell is a count in the plain voice, not a code.
 */
const row = cn(
  "grid-cols-[40px_minmax(0,1fr)_auto] **:data-[slot=combobox-item-label]:py-1",
  "data-selected:*:first:bg-kl-yellow data-selected:*:first:text-kl-on-yellow",
  "data-highlighted:data-selected:*:first:border-e-kl-on-yellow",
  "**:data-[slot=combobox-item-indicator]:border-[1.5px] **:data-[slot=combobox-item-indicator]:not-data-selected:visible",
  "data-disabled:**:data-[slot=combobox-item-indicator]:border-dashed",
  "not-data-selected:**:data-[slot=combobox-item-indicator]:*:invisible",
  "**:data-[slot=combobox-item-indicator]:*:mb-0.5 **:data-[slot=combobox-item-indicator]:*:h-2.5",
  "**:data-[slot=combobox-item-indicator]:*:w-[5px] **:data-[slot=combobox-item-indicator]:*:rotate-45",
  "**:data-[slot=combobox-item-indicator]:*:border-current **:data-[slot=combobox-item-indicator]:*:bg-transparent",
  "**:data-[slot=combobox-item-indicator]:*:border-r-2 **:data-[slot=combobox-item-indicator]:*:border-b-2",
  "**:data-[slot=combobox-item-code]:font-(family-name:--kl-font) **:data-[slot=combobox-item-code]:font-normal",
  "**:data-[slot=combobox-item-code]:text-(length:--kl-text-label) **:data-[slot=combobox-item-code]:leading-[inherit]",
  "**:data-[slot=combobox-item-code]:tabular-nums",
);

/**
 * Searchable async multiselect. Chips are yellow cells in the field frame; the list docks to the frame.
 * Selected options stay listed while new matches stream in; requests are aborted when superseded.
 * Escape closes the list; on a closed field it clears only typed text, never the chips (Base UI would
 * clear them all): a chip's remove cell, Backspace and Clear remove.
 */
function Multiselect({
  label,
  value,
  defaultValue = [],
  onValueChange,
  loadOptions,
  placeholder = "Search…",
  noun = ["item", "items"],
  layout = "control",
  disabled,
  className,
  container,
}: MultiselectProps) {
  const id = React.useId();
  const [inner, setInner] = React.useState(defaultValue);
  const selected = value ?? inner;
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<MultiselectOption[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const ctrl = React.useRef<AbortController | null>(null);
  // The open handler runs in the same event as the input change that opened the list (a paste opens and
  // searches at once), before React re-renders: it reads the latest query and the request in flight from
  // refs, so it never supersedes that search with the query of the previous render.
  const latest = React.useRef("");
  const inflight = React.useRef<string | null>(null);

  const load = React.useCallback(
    (q: string) => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      inflight.current = q;
      setPending(true);
      setError(null);
      loadOptions(q, c.signal).then(
        (r) => {
          if (c.signal.aborted) return;
          inflight.current = null;
          setResults(r);
          setPending(false);
        },
        (e: unknown) => {
          if (c.signal.aborted) return;
          inflight.current = null;
          setError(e instanceof Error ? e.message : "Couldn't load options");
          setPending(false);
        },
      );
    },
    [loadOptions],
  );
  React.useEffect(() => () => ctrl.current?.abort(), []);

  const items = React.useMemo(() => {
    const merged = [...results];
    if (!query) selected.forEach((s) => merged.some((m) => m.value === s.value) || merged.unshift(s));
    return merged;
  }, [results, selected, query]);

  const n = selected.length;

  return (
    // a Base UI Field, as Combobox's own field is: its label stays the input's name while the list is open
    <FieldPrimitive.Root
      data-slot="multiselect"
      data-kl-layout={layout}
      disabled={disabled}
      className={cn("kl-field", className)}
    >
      <ComboboxRoot<MultiselectOption, true>
        items={items}
        multiple
        value={selected}
        onValueChange={(v, details) => {
          // Escape on a closed field: Base UI clears every chip; keep them
          if (details.reason === "escape-key") return details.cancel();
          setInner(v);
          onValueChange?.(v, details);
        }}
        itemToStringLabel={(o) => o.label}
        isItemEqualToValue={(a, b) => a.value === b.value}
        filter={null}
        disabled={disabled}
        onOpenChange={(o) => {
          // every open refreshes the list, unless this event already started the search for the current query
          if (o && inflight.current !== latest.current) load(latest.current);
        }}
        onInputValueChange={(q, { reason, allowPropagation }) => {
          if (reason === "escape-key" && !latest.current) {
            // nothing typed: Escape changes nothing here, so it reaches an enclosing overlay
            allowPropagation();
            return;
          }
          latest.current = q;
          setQuery(q);
          if (reason !== "item-press") load(q);
        }}
      >
        <FieldPrimitive.Label htmlFor={id} className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
          {label}
        </FieldPrimitive.Label>
        <ComboboxInputGroup layout={layout} className="min-h-[calc(var(--kl-ctl)+8px)]">
          <ComboboxChips>
            {selected.map((o) => (
              <ComboboxChip key={o.value} aria-label={o.label}>
                <span>{o.label}</span>
                <ComboboxChipRemove aria-label={`Remove ${o.label}`} />
              </ComboboxChip>
            ))}
            <ComboboxInput
              id={id}
              placeholder={n ? "" : placeholder}
              className={cn("h-[26px] flex-1 px-1", n ? "min-w-7" : "min-w-16")}
              aria-description={n ? `${n} selected. Backspace removes the last.` : undefined}
            />
          </ComboboxChips>
          {/* the count: how many are chosen, in the Count voice (tabular), dimmed at zero */}
          <span
            className={cn(
              "grid min-w-10 flex-none place-items-center text-[18px] font-(--kl-weight-display) tabular-nums",
              "data-zero:font-medium data-zero:text-kl-ink-3",
            )}
            aria-hidden
            data-zero={n === 0 || undefined}
            data-slot="multiselect-count"
          >
            {n}
          </span>
          <ComboboxTrigger aria-label={`Open ${noun[1]}`} />
        </ComboboxInputGroup>
        <ComboboxPopup
          layout={layout}
          container={container}
          aria-busy={pending || undefined}
          className="max-h-[min(var(--available-height),420px)]"
        >
          <div
            className={cn(
              "relative flex min-h-8 flex-none items-center justify-between gap-2 px-(--kl-inset)",
              "border-b-(length:--kl-k1) border-b-kl-seam text-kl-ink-2",
              "font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/[1.2] font-medium not-italic normal-nums",
            )}
            data-slot="multiselect-head"
          >
            <ComboboxStatus>
              {pending
                ? "Searching…"
                : error
                  ? error
                  : query
                    ? `${results.length} ${results.length === 1 ? "match" : "matches"} for “${query}”`
                    : `${results.length} ${noun[1]}`}
            </ComboboxStatus>
            {error ? (
              <button
                type="button"
                className={cn(
                  "cursor-pointer bg-transparent py-1.5 text-kl-cobalt-text underline decoration-[1.5px] underline-offset-3",
                  "font-(family-name:--kl-font) text-(length:--kl-text-label)/none font-bold",
                )}
                onClick={() => load(query)}
              >
                Retry
              </button>
            ) : null}
            {pending ? <span className="kl-pending [inset-block-end:-1px] h-0.5" aria-hidden /> : null}
          </div>
          <ComboboxEmpty className="not-empty:border-b-(length:--kl-k1) not-empty:border-b-kl-line-soft">
            {!pending && !error ? (
              <>
                <span
                  className={cn(
                    "kl-count grid place-items-center self-stretch border-e-(length:--kl-k1) border-e-kl-seam",
                    "text-(length:--kl-text-display)",
                  )}
                >
                  0
                </span>
                <span className="px-(--kl-inset) text-kl-ink-2">
                  No {noun[1]} match “{query}”.
                </span>
              </>
            ) : null}
          </ComboboxEmpty>
          <ComboboxList>
            {(o: MultiselectOption) => (
              <ComboboxItem
                key={o.value}
                value={o}
                disabled={o.disabled}
                description={o.description}
                code={o.count?.toLocaleString()}
                className={row}
              >
                {highlight(o.label, query)}
              </ComboboxItem>
            )}
          </ComboboxList>
          <div
            className="kl-cells border-t-(length:--kl-k1) border-t-kl-seam text-(length:--kl-text-label)"
            data-slot="multiselect-foot"
          >
            <span className="kl-cell min-h-9 flex-1">
              <b>{n}</b>&nbsp;selected
            </span>
            {/* Base UI's clear: empties the value (and the typed text) through onValueChange */}
            <ComboboxClear
              keepMounted
              disabled={!n}
              aria-label={`Clear ${noun[1]}`}
              className={cn(
                "kl-cell min-h-9 w-auto px-(--kl-inset) font-(--kl-weight-strong) text-kl-ink hover:text-kl-ink",
                "active:[&>span]:translate-y-px",
              )}
            >
              <span>Clear</span>
            </ComboboxClear>
          </div>
        </ComboboxPopup>
      </ComboboxRoot>
    </FieldPrimitive.Root>
  );
}

export { Multiselect, type MultiselectProps };
