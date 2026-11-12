"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { dockGeometry, scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle } from "../lib/keyline-render";
import { groupBy, hasGroups } from "../lib/options";
import { FieldMessages, type FieldParticipantProps } from "./field";

/*
 * Combobox, as parts named as Base UI names them, and `Combobox`, the field built from them (a label, options or
 * an async source, the field's messages). One field frame of cells:
 *
 *   ┌────────────────────────────────┬────┬────┐
 *   │ Rotterdam Europoort            │ ×  │ ⌄  │   input cell · clear cell (while chosen) · caret cell
 *   └────────────────────────────────┴────┴────┘
 *
 * The list docks to the frame exactly like Select's (dock geometry, owner weight on the shared edge, no cut) and
 * uses Select's two cues: the chosen option carries the exclusive-choice mark, the cursor is the inverse row.
 */

type Layout = "control" | "cell";

/* ------------------------------------------------------------------ parts */

/** Base UI's Combobox.Root: state, filtering, the form value. Generic over the item value and `multiple`. */
const ComboboxRoot = ComboboxPrimitive.Root;

const cellButton = cn(
  "grid w-9 flex-none cursor-pointer place-items-center bg-transparent p-0 text-inherit",
  "hover:bg-kl-tint active:bg-kl-press active:[&>svg]:translate-y-px",
  // a button cell inside the frame draws its own inset ring, never the frame's edge (one indicator)
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus",
  "focus-visible:outline-solid",
  "data-disabled:cursor-not-allowed data-disabled:text-kl-dis data-disabled:hover:bg-transparent",
);

/**
 * The field frame: a row of cells (the input, then the clear and caret cells). Its edge is the focus indicator.
 * `layout="cell"`: it fills a cell of an enclosing frame (a toolbar) instead of drawing its own.
 */
function ComboboxInputGroup({
  layout = "control",
  className,
  ...props
}: ComboboxPrimitive.InputGroup.Props & { layout?: Layout }): React.ReactElement {
  return (
    <ComboboxPrimitive.InputGroup
      data-kl-layout={layout}
      className={resolveClassName(
        cn(
          "kl-ctl kl-cells kl-field-frame kl-edge cursor-text",
          "data-[kl-layout=cell]:h-full data-[kl-layout=cell]:min-h-(--kl-row)",
          // invalid: red frame, and the edge at ring weight, as a field
          "data-invalid:border-kl-red data-invalid:[--kl-cut-line:var(--kl-red)] data-invalid:[--kl-edge-w:var(--kl-ring)]",
          // disabled: out of service
          "data-disabled:cursor-not-allowed data-disabled:border-kl-dis-line data-disabled:bg-(image:--kl-hatch)",
          "data-disabled:[--kl-cut-line:var(--kl-dis-line)] data-disabled:[&>*+*]:border-kl-dis-line",
        ),
        className,
      )}
      {...props}
      data-slot="combobox-input-group"
    />
  );
}

/** The text input cell. */
function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Input
      className={resolveClassName(
        cn(
          "m-0 w-0 min-w-0 flex-[1_1_auto] bg-transparent px-(--kl-inset) text-ellipsis text-inherit outline-0",
          "font-(family-name:--kl-font) text-(length:--kl-text-lead)",
          "placeholder:text-kl-ink-3 placeholder:opacity-100",
          "data-disabled:cursor-not-allowed data-disabled:text-kl-dis",
        ),
        className,
      )}
      {...props}
      data-slot="combobox-input"
    />
  );
}

/** The caret cell: opens the list; inverse while it is open, as Select's. */
function ComboboxTrigger({
  className,
  children,
  nativeButton,
  role,
  ...props
}: ComboboxPrimitive.Trigger.Props): React.ReactElement {
  // Base UI gives a trigger beside the input no role, which drops the button role a non-native element needs
  // (`render={<div />}` with `nativeButton={false}`); restore it. An explicit `role` wins.
  const restored = role ?? (nativeButton === false ? "button" : undefined);
  return (
    <ComboboxPrimitive.Trigger
      nativeButton={nativeButton}
      {...(restored ? { role: restored } : null)}
      className={resolveClassName(
        cn(
          cellButton,
          "data-popup-open:bg-kl-inverse data-popup-open:text-kl-on-inverse",
          "forced-colors:data-popup-open:bg-[Highlight] forced-colors:data-popup-open:text-[HighlightText]",
          "forced-colors:data-popup-open:forced-color-adjust-none",
        ),
        className,
      )}
      {...props}
      data-slot="combobox-trigger"
    >
      {children ?? (
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
      )}
    </ComboboxPrimitive.Trigger>
  );
}

const Cross = () => (
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
);

/** The clear cell. Give it an accessible name (`aria-label`): it shows only a cross. */
function ComboboxClear({
  className,
  children,
  ...props
}: ComboboxPrimitive.Clear.Props & { "aria-label": string }): React.ReactElement {
  return (
    <ComboboxPrimitive.Clear
      className={resolveClassName(cn(cellButton, "text-kl-ink-2 hover:text-kl-ink"), className)}
      {...props}
      data-slot="combobox-clear"
    >
      {children ?? <Cross />}
    </ComboboxPrimitive.Clear>
  );
}

type PopupProps = ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"
  > & {
    /** The frame the list docks to: `cell` when the input group has `layout="cell"`. */
    layout?: Layout;
    /** Where the portal renders (defaults to <body>). */
    container?: ComboboxPrimitive.Portal.Props["container"];
    /** Props for Base UI's Combobox.Portal. */
    portalProps?: Omit<ComboboxPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * The list's surface: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props
 * lifted. It docks to the frame (its shared edge on the frame's keyline, no cut) and carries the configuration
 * (cut, density, motion, theme, dir) of the place it is written. `aria-busy` dims the list.
 */
function ComboboxPopup({
  layout = "control",
  anchor,
  side,
  align = "start",
  sideOffset,
  alignOffset,
  collisionPadding = 12,
  container,
  portalProps,
  className,
  style,
  ...props
}: PopupProps): React.ReactElement {
  const dock = dockGeometry(layout);
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <ComboboxPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <ComboboxPrimitive.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset ?? dock.sideOffset}
          alignOffset={alignOffset ?? dock.alignOffset}
          collisionPadding={collisionPadding}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <ComboboxPrimitive.Popup
            className={resolveClassName(
              cn(
                "kl-attached kl-dock kl-dock-min group/combobox-popup [--kl-dock-w:15rem]",
                "flex max-h-[min(var(--available-height),380px)] flex-col bg-kl-cell text-kl-ink outline-0",
              ),
              className,
            )}
            style={resolveStyle(dock.style, style)}
            {...props}
            data-slot="combobox-popup"
          />
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </>
  );
}

/** The live region that says what the list is (searching, n matches, an error), in the Code voice. */
function ComboboxStatus({ className, ...props }: ComboboxPrimitive.Status.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Status
      className={resolveClassName("data-kl-error:font-bold data-kl-error:text-kl-red-text", className)}
      {...props}
      data-slot="combobox-status"
    />
  );
}

/** The options. Rows are separated by soft rules; it is not drawn while it has none. */
function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.List
      className={resolveClassName(
        cn(
          "flex-[1_1_auto] scroll-py-1 overflow-auto overscroll-contain outline-0 empty:hidden",
          "[scrollbar-width:thin] [scrollbar-color:var(--kl-ink-3)_transparent]",
          "group-aria-busy/combobox-popup:opacity-55",
          "[&_[data-slot=combobox-item]+[data-slot=combobox-item]]:border-t-(length:--kl-k1)",
          "[&_[data-slot=combobox-item]+[data-slot=combobox-item]]:border-t-kl-line-soft",
        ),
        className,
      )}
      {...props}
      data-slot="combobox-list"
    />
  );
}

/** Base UI's Combobox.Collection: renders a Group's items with a function child. */
const ComboboxCollection = ComboboxPrimitive.Collection;

type ItemProps = ComboboxPrimitive.Item.Props & {
  description?: React.ReactNode;
  /** Trailing code cell (an ID, a unit, a short key). */
  code?: React.ReactNode;
};

/**
 * One option: the choice mark (the exclusive-choice square, shown while chosen), the label with an optional
 * description, and an optional trailing code. The cursor is the inverse row.
 */
function ComboboxItem({ className, description, code, children, ...props }: ItemProps): React.ReactElement {
  return (
    <ComboboxPrimitive.Item
      className={resolveClassName(
        cn(
          "group/combobox-item grid min-h-(--kl-row) cursor-default grid-cols-[36px_minmax(0,1fr)_auto] items-stretch",
          "outline-0 select-none",
          "data-highlighted:bg-kl-inverse data-highlighted:text-kl-on-inverse",
          "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
          "forced-colors:data-highlighted:outline-3 forced-colors:data-highlighted:outline-offset-[-4px]",
          "forced-colors:data-highlighted:outline-[Highlight]",
        ),
        className,
      )}
      {...props}
      data-slot="combobox-item"
    >
      <span
        className="grid place-items-center border-e-(length:--kl-k1) border-e-kl-seam group-data-highlighted/combobox-item:border-e-kl-on-inverse"
        aria-hidden
      >
        <ComboboxPrimitive.ItemIndicator
          data-slot="combobox-item-indicator"
          className="grid size-4 place-items-center border-2 border-current not-data-selected:invisible"
          keepMounted
        >
          <span className="size-1.5 bg-current" />
        </ComboboxPrimitive.ItemIndicator>
      </span>
      <span
        data-slot="combobox-item-label"
        className="grid min-w-0 content-center gap-px px-(--kl-inset) py-2 leading-[1.3] wrap-anywhere"
      >
        <span>{children}</span>
        {description ? (
          <small
            className={cn(
              "text-(length:--kl-text-meta) text-kl-ink-2 group-data-disabled/combobox-item:text-kl-ink-2",
              "group-data-highlighted/combobox-item:text-inherit",
            )}
          >
            {description}
          </small>
        ) : null}
      </span>
      {code != null ? (
        <span
          data-slot="combobox-item-code"
          className="kl-code flex items-center px-(--kl-inset) whitespace-nowrap group-data-highlighted/combobox-item:text-inherit"
        >
          {code}
        </span>
      ) : null}
    </ComboboxPrimitive.Item>
  );
}

/** Options under one heading. A group after a group is divided by a seam. */
function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Group
      className={resolveClassName(
        "[[data-slot=combobox-group]+&]:border-t-(length:--kl-k1) [[data-slot=combobox-group]+&]:border-t-kl-seam",
        className,
      )}
      {...props}
      data-slot="combobox-group"
    />
  );
}

/** A group's heading, in the Code voice; the group's first option sits on its seam. */
function ComboboxGroupLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.GroupLabel
      className={resolveClassName(
        cn(
          "block px-(--kl-inset) pt-2.5 pb-1 text-kl-ink-2",
          "font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/[1.2] font-medium",
        ),
        className,
      )}
      {...props}
      data-slot="combobox-group-label"
    />
  );
}

/** Shown in place of the list while no option matches; render nothing in it while a search is pending. */
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Empty
      className={resolveClassName(
        "not-empty:grid not-empty:min-h-16 not-empty:grid-cols-[72px_1fr] not-empty:items-center",
        className,
      )}
      {...props}
      data-slot="combobox-empty"
    />
  );
}

/** The chosen values of a `multiple` combobox, before the input, in the frame. */
function ComboboxChips({ className, ...props }: ComboboxPrimitive.Chips.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Chips
      className={resolveClassName("flex min-w-0 flex-1 flex-wrap items-center gap-1 px-1.5 py-1", className)}
      {...props}
      data-slot="combobox-chips"
    />
  );
}

/**
 * One chosen value: a yellow tag. Reached with the arrow keys it is the cursor (ink); the frame shows the focus
 * edge, so the chip draws no ring of its own.
 */
function ComboboxChip({ className, ...props }: ComboboxPrimitive.Chip.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Chip
      className={resolveClassName(
        cn(
          "kl-edge-part group/combobox-chip inline-flex h-[26px] items-stretch",
          "border-(length:--kl-k1) border-kl-on-yellow bg-kl-yellow text-kl-on-yellow",
          "text-(length:--kl-text-label) font-(--kl-weight-strong)",
          "[&>span]:flex [&>span]:items-center [&>span]:px-2 [&>span]:whitespace-nowrap",
          "focus:border-kl-on-inverse focus:bg-kl-inverse focus:text-kl-on-inverse focus:outline-0",
          "forced-colors:border-[HighlightText] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
          "forced-colors:forced-color-adjust-none forced-colors:focus:border-2 forced-colors:focus:border-[Highlight]",
          "forced-colors:focus:bg-[Canvas] forced-colors:focus:text-[CanvasText]",
        ),
        className,
      )}
      {...props}
      data-slot="combobox-chip"
    />
  );
}

/** Removes its chip. Its accessible name is required (`aria-label`, e.g. "Remove Rotterdam"): it shows only a cross. */
function ComboboxChipRemove({
  className,
  children,
  ...props
}: ComboboxPrimitive.ChipRemove.Props & { "aria-label": string }): React.ReactElement {
  return (
    <ComboboxPrimitive.ChipRemove
      className={resolveClassName(
        cn(
          "grid w-6 cursor-pointer place-items-center bg-transparent p-0 text-inherit",
          "border-s-(length:--kl-k1) border-s-kl-on-yellow active:[&>svg]:translate-y-px",
          "group-data-highlighted/combobox-chip:bg-kl-on-yellow hover:bg-kl-on-yellow hover:text-kl-yellow",
          "group-data-highlighted/combobox-chip:text-kl-yellow",
          "group-focus/combobox-chip:border-s-kl-on-inverse group-focus/combobox-chip:bg-transparent",
          "group-focus/combobox-chip:text-inherit",
        ),
        className,
      )}
      {...props}
      data-slot="combobox-chip-remove"
    >
      {children ?? <Cross />}
    </ComboboxPrimitive.ChipRemove>
  );
}

/* ------------------------------------------------------------------ the field */

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
  /** Called with the chosen value, its option, and Base UI's event details (the reason, the event). */
  onValueChange?: (
    value: string | null,
    option: ComboboxOption | null,
    eventDetails: ComboboxPrimitive.Root.ChangeEventDetails,
  ) => void;
  placeholder?: string;
  /** Names the things listed, for the status line and the empty state. */
  noun?: [singular: string, plural: string];
  /** control: its own 2px frame. cell: a cell of an enclosing frame (e.g. a toolbar); the label is visually hidden. */
  layout?: Layout;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Form field name; the submitted value (FormData and Base UI Form values) is the option's `value`. */
  name?: string;
  /** Offer a clear cell while a value is chosen. Default true. */
  clearable?: boolean;
  id?: string;
  className?: string;
  container?: ComboboxPrimitive.Portal.Props["container"];
} & FieldParticipantProps;

/* the typed text, underlined in each match */
function highlight(text: string, q: string) {
  const i = q ? text.toLocaleLowerCase().indexOf(q.toLocaleLowerCase()) : -1;
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

function grouped(list: ComboboxOption[]): ComboboxOption[] | Group[] {
  return hasGroups(list) ? groupBy(list).map((g) => ({ value: g.group, items: g.items })) : list;
}

/**
 * Single-value combobox: a Select you can type into, built from the parts above.
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
    <ComboboxItem key={o.value} value={o} disabled={o.disabled} description={o.description} code={o.code}>
      {highlight(o.label, query)}
    </ComboboxItem>
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
      className={cn("kl-field", layout === "cell" && "flex-1 gap-0 self-stretch", className)}
    >
      <ComboboxRoot<ComboboxOption>
        items={items}
        value={selected}
        onValueChange={(o, details) => {
          // Escape on a closed field: Base UI clears the value; keep it (see onInputValueChange)
          if (details.reason === "escape-key") return details.cancel();
          const option = o ?? null;
          if (option) known.current.set(option.value, option);
          if (value === undefined) setInner(option?.value ?? null);
          onValueChange?.(option?.value ?? null, option, details);
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
        <FieldPrimitive.Label htmlFor={id} className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
          {label}
        </FieldPrimitive.Label>
        <ComboboxInputGroup layout={layout}>
          <span className="kl-slot kl-field-bang" aria-hidden>
            <span>
              <span>!</span>
            </span>
          </span>
          <ComboboxInput id={id} placeholder={placeholder} />
          {clearable && selected && !disabled && !readOnly ? (
            <ComboboxClear aria-label={`Clear ${typeof label === "string" ? label : noun[0]}`} />
          ) : null}
          <ComboboxTrigger aria-label={`Show ${noun[1]}`} />
        </ComboboxInputGroup>
        <FieldMessages description={description} error={errorMessage} invalid={invalid} layout={layout} />
        <ComboboxPopup layout={layout} container={container} aria-busy={pending || undefined}>
          {async ? (
            <div
              className={cn(
                "relative flex min-h-8 flex-none items-center justify-between gap-2 px-(--kl-inset)",
                "border-b-(length:--kl-k1) border-b-kl-seam text-kl-ink-2",
                "font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/[1.2] font-medium",
              )}
            >
              <ComboboxStatus data-kl-error={error ? "" : undefined}>{status}</ComboboxStatus>
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
          ) : null}
          <ComboboxEmpty>
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
                  {query ? `No ${noun[1]} match “${query}”.` : `No ${noun[1]} yet.`}
                </span>
              </>
            ) : null}
          </ComboboxEmpty>
          <ComboboxList>
            {isGrouped
              ? (g: Group) => (
                  <ComboboxGroup key={g.value} items={g.items}>
                    {g.value ? <ComboboxGroupLabel>{g.value}</ComboboxGroupLabel> : null}
                    <ComboboxCollection>{renderItem}</ComboboxCollection>
                  </ComboboxGroup>
                )
              : renderItem}
          </ComboboxList>
        </ComboboxPopup>
      </ComboboxRoot>
    </FieldPrimitive.Root>
  );
}

export {
  Combobox,
  ComboboxRoot,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxClear,
  ComboboxPopup,
  ComboboxStatus,
  ComboboxList,
  ComboboxCollection,
  ComboboxItem,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
};
