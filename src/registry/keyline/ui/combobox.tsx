"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { dockGeometry, scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { groupBy, hasGroups } from "../lib/options";
import { FieldMessages, type FieldParticipantProps } from "./field";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: React.ReactNode;
  /** Trailing code cell (an ID, a unit, a short key). */
  code?: React.ReactNode;
  /** Options sharing a group are listed under one heading, in first-appearance order. */
  group?: string;
  disabled?: boolean;
};

type Group = { value: string; items: ComboboxOption[] };

type ComboboxProps = {
  label: React.ReactNode;
  /**
   * Local options, filtered by Base UI as the user types (label match, locale-aware).
   * With `loadOptions`, these are the options known before any search (recents, the current value):
   * they are listed for an empty query and give a controlled value its label.
   */
  options?: ComboboxOption[];
  /** Async source. Called on open and on every edit; a superseded request is aborted. Errors offer Retry. */
  loadOptions?: (query: string, signal: AbortSignal) => Promise<ComboboxOption[]>;
  /** The chosen option's `value`. `null` is no choice. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null, option: ComboboxOption | null) => void;
  placeholder?: string;
  /** Names the things listed, for the status line and the empty state. */
  noun?: [singular: string, plural: string];
  /** control: its own 2px frame. cell: a cell of an enclosing frame (e.g. a toolbar); the label is visually hidden. */
  layout?: "control" | "cell";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Form field name; the submitted value (FormData and Base UI Form values) is the option's `value`. */
  name?: string;
  /** Offer a clear cell while a value is chosen. Default true. */
  clearable?: boolean;
  id?: string;
  className?: string;
  container?: React.ComponentProps<typeof ComboboxPrimitive.Portal>["container"];
} & FieldParticipantProps;

function highlight(text: string, q: string) {
  const i = q ? text.toLocaleLowerCase().indexOf(q.toLocaleLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="kl-match">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function grouped(list: ComboboxOption[]): ComboboxOption[] | Group[] {
  return hasGroups(list) ? groupBy(list).map((g) => ({ value: g.group, items: g.items })) : list;
}

const Caret = () => (
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
);

/**
 * Single-value combobox: a Select you can type into. One field frame of cells:
 *
 *   ┌────────────────────────────────┬────┬────┐
 *   │ Rotterdam Europoort            │ ×  │ ⌄  │   input cell · clear cell (while chosen) · caret cell
 *   └────────────────────────────────┴────┴────┘
 *
 * The list docks to the frame exactly like Select's (dock geometry, owner weight on the shared edge, no
 * cut) and uses Select's two cues: the chosen option carries the exclusive-choice mark, the cursor is
 * the inverse row. Typed text is underlined in each match.
 *
 * Two sources:
 * - `options`: local, filtered by Base UI as you type;
 * - `loadOptions`: async. A status line says what the list is (searching, n matches, the error with
 *   Retry); a superseded request is aborted; a pending search runs the pending segment on the panel's
 *   keyline. The chosen option stays known, so its label survives a new search.
 *
 * Keyboard, typeahead, focus return, form value and ARIA are Base UI Combobox's. Escape closes the list
 * and the input shows the chosen label again. Escape on a closed field keeps the choice (Base UI would clear
 * it) and passes on, so an enclosing dialog closes; the clear cell is the way to clear.
 *
 * The wrapper is a Base UI Field.Root: a Form collects the value under `name`, and the Form's
 * `errors`, `validate` and `required` produce the message under the frame.
 */
function Combobox({
  label,
  options = [],
  loadOptions,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Search…",
  noun = ["option", "options"],
  layout = "control",
  disabled,
  readOnly,
  required,
  invalid,
  error: errorMessage,
  description,
  validate,
  validationMode,
  orientation,
  name,
  clearable = true,
  id: idProp,
  className,
  container,
}: ComboboxProps) {
  const dock = dockGeometry(layout);
  const [open, setOpen] = React.useState(false);
  const [marker, scope] = useKeylineScope(open, container);
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const async = !!loadOptions;

  // every option this instance has seen, so a value (controlled or chosen from a past search) has a label
  const known = React.useRef(new Map<string, ComboboxOption>());
  for (const o of options) known.current.set(o.value, o);

  const [inner, setInner] = React.useState<string | null>(defaultValue);
  const current = value !== undefined ? value : inner;
  const selected = current != null ? (known.current.get(current) ?? null) : null;

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ComboboxOption[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const ctrl = React.useRef<AbortController | null>(null);
  // The open handler runs in the same event as the input change that opened the list (a paste opens and
  // searches at once), before React re-renders: it reads the latest query and the request in flight from
  // refs, never from the render it was created in, so it cannot supersede that search with a stale one.
  const latest = React.useRef("");
  const inflight = React.useRef(false);

  const load = React.useCallback(
    (q: string) => {
      if (!loadOptions) return;
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      inflight.current = true;
      setPending(true);
      setError(null);
      loadOptions(q, c.signal).then(
        (r) => {
          if (c.signal.aborted) return;
          inflight.current = false;
          r.forEach((o) => known.current.set(o.value, o));
          setResults(r);
          setPending(false);
        },
        (e: unknown) => {
          if (c.signal.aborted) return;
          inflight.current = false;
          setError(e instanceof Error ? e.message : "Couldn't load options");
          setPending(false);
        },
      );
    },
    [loadOptions],
  );
  React.useEffect(() => () => ctrl.current?.abort(), []);

  // async: the list is the latest results (the known options before the first search); the chosen option
  // is kept in the collection so Base UI can always resolve the value
  const list = React.useMemo(() => {
    if (!async) return options;
    const base = results ?? options;
    return selected && !base.some((o) => o.value === selected.value) ? [...base, selected] : base;
  }, [async, options, results, selected]);
  const items = React.useMemo(() => grouped(list), [list]);
  const isGrouped = items[0] !== undefined && "items" in items[0];

  const choose = (o: ComboboxOption | null) => {
    if (o) known.current.set(o.value, o);
    if (value === undefined) setInner(o?.value ?? null);
    onValueChange?.(o?.value ?? null, o);
  };

  const shown = async ? (results ?? options).length : null;
  const status = !async
    ? null
    : pending
      ? "Searching…"
      : error
        ? error
        : query
          ? `${shown} ${shown === 1 ? "match" : "matches"} for “${query}”`
          : `${shown} ${shown === 1 ? noun[0] : noun[1]}`;

  const renderItem = (o: ComboboxOption) => (
    <ComboboxPrimitive.Item key={o.value} value={o} disabled={o.disabled} className="kl-cb-opt">
      <span className="kl-cb-mark" aria-hidden>
        <ComboboxPrimitive.ItemIndicator className="kl-cb-ind" keepMounted>
          <span className="kl-cb-dot" />
        </ComboboxPrimitive.ItemIndicator>
      </span>
      <span className="kl-cb-label">
        <span>{highlight(o.label, query)}</span>
        {o.description ? <small>{o.description}</small> : null}
      </span>
      {o.code != null ? <span className="kl-code kl-cb-code">{o.code}</span> : null}
    </ComboboxPrimitive.Item>
  );

  return (
    <FieldPrimitive.Root
      data-slot="combobox"
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      name={name}
      disabled={disabled}
      invalid={invalid}
      validate={validate}
      validationMode={validationMode}
      className={cn("kl-field kl-combobox", className)}
    >
      <ComboboxPrimitive.Root<ComboboxOption>
        items={items}
        value={selected}
        onValueChange={(o, details) => {
          // Escape on a closed field: Base UI clears the value; keep it (see onInputValueChange)
          if (details.reason === "escape-key") return details.cancel();
          choose((o as ComboboxOption | null) ?? null);
        }}
        itemToStringLabel={(o) => o.label}
        itemToStringValue={(o) => o.value}
        isItemEqualToValue={(a, b) => a.value === b.value}
        filter={async ? null : undefined}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        autoHighlight
        onOpenChange={(o) => {
          setOpen(o);
          if (o && async && results == null && !inflight.current) load(latest.current);
        }}
        onInputValueChange={(q, details) => {
          // Escape on a closed field with a choice: keep the label in the input (the value change that follows
          // is cancelled too) and let the key reach an enclosing overlay, since it changed nothing here
          if (details.reason === "escape-key" && selected) {
            details.cancel();
            details.allowPropagation();
            return;
          }
          // the input shows the chosen label when a choice is made; that is not a search
          if (details.reason === "item-press" || (selected && q === selected.label)) {
            latest.current = "";
            setQuery("");
            return;
          }
          latest.current = q;
          setQuery(q);
          if (async) load(q);
        }}
      >
        {marker}
        <FieldPrimitive.Label htmlFor={id} className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
          {label}
        </FieldPrimitive.Label>
        <ComboboxPrimitive.InputGroup
          data-kl-layout={layout}
          className="kl-ctl kl-cells kl-field-frame kl-edge kl-cb-frame"
        >
          <span className="kl-slot kl-field-bang" aria-hidden>
            <span>
              <span>!</span>
            </span>
          </span>
          <ComboboxPrimitive.Input id={id} placeholder={placeholder} className="kl-cb-input" />
          {clearable && selected && !disabled && !readOnly ? (
            <ComboboxPrimitive.Clear
              className="kl-cb-btn kl-cb-clear"
              aria-label={`Clear ${typeof label === "string" ? label : noun[0]}`}
            >
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
            </ComboboxPrimitive.Clear>
          ) : null}
          <ComboboxPrimitive.Trigger className="kl-cb-btn kl-cb-trigger" aria-label={`Show ${noun[1]}`}>
            <Caret />
          </ComboboxPrimitive.Trigger>
        </ComboboxPrimitive.InputGroup>
        <FieldMessages description={description} error={errorMessage} invalid={invalid} layout={layout} />
        <ComboboxPrimitive.Portal container={container}>
          <ComboboxPrimitive.Positioner
            sideOffset={dock.sideOffset}
            alignOffset={dock.alignOffset}
            align="start"
            collisionPadding={12}
            {...scopeProps(scope, { className: "kl-positioner" })}
          >
            <ComboboxPrimitive.Popup
              className="kl-attached kl-dock kl-dock-min kl-cb-panel"
              aria-busy={pending || undefined}
              style={dock.style}
            >
              {async ? (
                <div className="kl-cb-head">
                  <ComboboxPrimitive.Status className="kl-cb-status" data-kl-error={error ? "" : undefined}>
                    {status}
                  </ComboboxPrimitive.Status>
                  {error ? (
                    <button type="button" className="kl-cb-retry" onClick={() => load(query)}>
                      Retry
                    </button>
                  ) : null}
                  {pending ? <span className="kl-pending" aria-hidden /> : null}
                </div>
              ) : null}
              <ComboboxPrimitive.Empty className="kl-cb-empty">
                {!pending && !error ? (
                  <>
                    <span className="kl-count">0</span>
                    <span>{query ? `No ${noun[1]} match “${query}”.` : `No ${noun[1]} yet.`}</span>
                  </>
                ) : null}
              </ComboboxPrimitive.Empty>
              <ComboboxPrimitive.List className="kl-cb-list">
                {isGrouped
                  ? (g: Group) => (
                      <ComboboxPrimitive.Group key={g.value} items={g.items} className="kl-cb-group">
                        {g.value ? (
                          <ComboboxPrimitive.GroupLabel className="kl-cb-group-label">
                            {g.value}
                          </ComboboxPrimitive.GroupLabel>
                        ) : null}
                        <ComboboxPrimitive.Collection>{renderItem}</ComboboxPrimitive.Collection>
                      </ComboboxPrimitive.Group>
                    )
                  : renderItem}
              </ComboboxPrimitive.List>
            </ComboboxPrimitive.Popup>
          </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
      </ComboboxPrimitive.Root>
    </FieldPrimitive.Root>
  );
}

export { Combobox };
