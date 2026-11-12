"use client";

import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";

import { cn } from "@/lib/utils";
import { dockGeometry, scopeProps, useKeylineScope } from "../lib/keyline-scope";

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
  onValueChange?: (value: MultiselectOption[]) => void;
  /** Async source. Called on open (query "") and on every input change; earlier requests are aborted. */
  loadOptions: (query: string, signal: AbortSignal) => Promise<MultiselectOption[]>;
  placeholder?: string;
  noun?: [singular: string, plural: string];
  /** control: its own 2px frame. cell: a cell of an enclosing frame (e.g. a toolbar); the label is visually hidden. */
  layout?: "control" | "cell";
  disabled?: boolean;
  className?: string;
  container?: React.ComponentProps<typeof Combobox.Portal>["container"];
};

function highlight(text: string, q: string) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="kl-match">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * Searchable async multiselect. Tokens are yellow cells in the field frame; the list docks to the frame.
 * Selected options stay listed while new matches stream in; requests are aborted when superseded.
 * Escape closes the list; on a closed field it clears only typed text, never the tokens (Base UI would
 * clear them all): a token's remove cell, Backspace and Clear remove.
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
  const dock = dockGeometry(layout);
  const [open, setOpen] = React.useState(false);
  const [marker, scope] = useKeylineScope(open, container);
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

  const set = (v: MultiselectOption[]) => {
    setInner(v);
    onValueChange?.(v);
  };
  const n = selected.length;

  return (
    <Combobox.Root
      items={items}
      multiple
      value={selected}
      onValueChange={(v, details) => {
        // Escape on a closed field: Base UI clears every token; keep them
        if (details.reason === "escape-key") return details.cancel();
        set(v as MultiselectOption[]);
      }}
      itemToStringLabel={(o: MultiselectOption) => o.label}
      isItemEqualToValue={(a: MultiselectOption, b: MultiselectOption) => a.value === b.value}
      filter={null}
      disabled={disabled}
      onOpenChange={(o) => {
        setOpen(o);
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
      <div data-slot="multiselect" data-kl-layout={layout} className={cn("kl-field kl-multiselect", className)}>
        {marker}
        <label htmlFor={id} className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
          {label}
        </label>
        <Combobox.InputGroup data-kl-layout={layout} className="kl-ctl kl-cells kl-field-frame kl-edge kl-ms-frame">
          <Combobox.Chips className="kl-ms-chips">
            {selected.map((o) => (
              <Combobox.Chip key={o.value} className="kl-ms-chip kl-edge-part" aria-label={o.label}>
                <span>{o.label}</span>
                <Combobox.ChipRemove className="kl-ms-chip-x" aria-label={`Remove ${o.label}`}>
                  <svg
                    viewBox="0 0 16 16"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="square"
                    aria-hidden
                  >
                    <path d="m4.5 4.5 7 7m0-7-7 7" />
                  </svg>
                </Combobox.ChipRemove>
              </Combobox.Chip>
            ))}
            <Combobox.Input
              id={id}
              placeholder={n ? "" : placeholder}
              className="kl-ms-input"
              aria-description={n ? `${n} selected. Backspace removes the last.` : undefined}
            />
          </Combobox.Chips>
          <span className="kl-ms-count" aria-hidden data-zero={n === 0 || undefined}>
            {n}
          </span>
          <Combobox.Trigger className="kl-ms-trigger" aria-label={`Open ${noun[1]}`}>
            <svg
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="square"
              aria-hidden
            >
              <path d="m4 6 4 4 4-4" />
            </svg>
          </Combobox.Trigger>
        </Combobox.InputGroup>
      </div>
      <Combobox.Portal container={container}>
        <Combobox.Positioner
          sideOffset={dock.sideOffset}
          alignOffset={dock.alignOffset}
          align="start"
          collisionPadding={12}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <Combobox.Popup
            className="kl-attached kl-dock kl-dock-min kl-ms-panel"
            aria-busy={pending || undefined}
            style={dock.style}
          >
            <div className="kl-ms-head">
              <Combobox.Status className="kl-ms-status">
                {pending
                  ? "Searching…"
                  : error
                    ? error
                    : query
                      ? `${results.length} ${results.length === 1 ? "match" : "matches"} for “${query}”`
                      : `${results.length} ${noun[1]}`}
              </Combobox.Status>
              {error ? (
                <button type="button" className="kl-ms-retry" onClick={() => load(query)}>
                  Retry
                </button>
              ) : null}
              {pending ? <span className="kl-pending" aria-hidden /> : null}
            </div>
            <Combobox.Empty className="kl-ms-empty">
              {!pending && !error ? (
                <>
                  <span className="kl-count">0</span>
                  <span>
                    No {noun[1]} match “{query}”.
                  </span>
                </>
              ) : null}
            </Combobox.Empty>
            <Combobox.List className="kl-ms-list">
              {(o: MultiselectOption) => (
                <Combobox.Item key={o.value} value={o} disabled={o.disabled} className="kl-ms-opt">
                  <span className="kl-ms-check" aria-hidden>
                    <Combobox.ItemIndicator className="kl-ms-indicator">
                      <svg
                        viewBox="0 0 16 16"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="square"
                      >
                        <path d="m3.5 8.5 3 3 6-7" />
                      </svg>
                    </Combobox.ItemIndicator>
                  </span>
                  <span className="kl-ms-label">
                    <span>{highlight(o.label, query)}</span>
                    {o.description ? <small>{o.description}</small> : null}
                  </span>
                  <span className="kl-ms-n">{o.count?.toLocaleString()}</span>
                </Combobox.Item>
              )}
            </Combobox.List>
            <div className="kl-cells kl-ms-foot">
              <span className="kl-cell">
                <b>{n}</b>&nbsp;selected
              </span>
              <button type="button" className="kl-cell kl-ms-clear" disabled={!n} onClick={() => set([])}>
                Clear
              </button>
            </div>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

export { Multiselect };
