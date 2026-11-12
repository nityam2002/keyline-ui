"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { dockGeometry, scopeProps, useKeylineScope, type DockLayout, type KeylineScope } from "../lib/keyline-scope";
import { groupBy, hasGroups } from "../lib/options";
import { FieldMessages, type FieldParticipantProps } from "./field";

type Option = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  code?: React.ReactNode;
  /** Options sharing a group are listed under one heading, in first-appearance order. */
  group?: string;
  disabled?: boolean;
};

/* ------------------------------------------------------------------ *
 * PARTS
 * SelectRoot · SelectLabel · SelectTrigger · SelectContent · SelectItem · SelectGroup · SelectGroupLabel
 * · SelectSeparator. The root shares the layout (dock geometry) and the portal scope with its parts, so
 * a composed select docks and carries configuration exactly like the options form below, which is
 * itself built from these parts.
 * ------------------------------------------------------------------ */
type Ctx = { layout: DockLayout; scope: KeylineScope };
const SelectContext = React.createContext<Ctx>({ layout: "control", scope: {} });

type SelectRootProps<V> = Omit<React.ComponentProps<typeof SelectPrimitive.Root<V>>, "children"> & {
  children?: React.ReactNode;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (SelectLabel is then visually hidden). */
  layout?: DockLayout;
  /** Class for the field wrapper (label + trigger). */
  className?: string;
} & Omit<FieldParticipantProps, "error" | "description">;

/**
 * Behaviour, keyboard, typeahead, form participation (`name`, `required`) and controlled/uncontrolled
 * state are Base UI Select's. Pass `items` (an array of `{ value, label }` or a value→label map) so the
 * trigger prints the chosen label rather than the raw value; or give SelectTrigger a render function.
 *
 * The wrapper is a Base UI Field.Root: a Form collects the value under `name`, the Form's
 * `errors` and a `validate` function reach it, and FieldDescription / FieldError placed among the
 * children describe the trigger.
 */
function SelectRoot<V>({
  layout = "control",
  className,
  children,
  onOpenChange,
  invalid,
  validate,
  validationMode,
  orientation,
  ...props
}: SelectRootProps<V>) {
  const [open, setOpen] = React.useState(false);
  const [marker, scope] = useKeylineScope(open);
  const ctx = React.useMemo(() => ({ layout, scope }), [layout, scope]);
  return (
    <FieldPrimitive.Root
      data-slot="select"
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      name={props.name}
      disabled={props.disabled}
      invalid={invalid}
      validate={validate}
      validationMode={validationMode}
      className={cn("kl-field kl-select", className)}
    >
      <SelectPrimitive.Root<V>
        {...props}
        onOpenChange={(o, d) => {
          setOpen(o);
          onOpenChange?.(o, d);
        }}
      >
        <SelectContext.Provider value={ctx}>
          {marker}
          {children}
        </SelectContext.Provider>
      </SelectPrimitive.Root>
    </FieldPrimitive.Root>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  const { layout } = React.useContext(SelectContext);
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("kl-field-label", layout === "cell" && "kl-sr", className)}
      {...props}
    />
  );
}

type SelectTriggerProps = Omit<React.ComponentProps<typeof SelectPrimitive.Trigger>, "children"> & {
  placeholder?: React.ReactNode;
  /** Formats the chosen value (receives the raw value). Without it, the root's `items` give the label. */
  children?: React.ComponentProps<typeof SelectPrimitive.Value>["children"];
};

/**
 * The trigger is a field frame: value cell (truncates on one line) + caret cell (fixed 36px). Its own
 * edge takes keyboard focus (.kl-edge); open is the inverse caret cell, never a ring.
 */
function SelectTrigger({ placeholder = "Choose…", children, className, ...props }: SelectTriggerProps) {
  const { layout } = React.useContext(SelectContext);
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-kl-layout={layout}
      className={cn("kl-ctl kl-cells kl-field-frame kl-edge kl-select-trigger", className)}
      {...props}
    >
      {/* the attention cell a Field inserts when invalid (Select is a Field participant) */}
      <span className="kl-slot kl-field-bang" aria-hidden>
        <span>
          <span>!</span>
        </span>
      </span>
      <SelectPrimitive.Value
        className="kl-select-value"
        placeholder={<span className="kl-select-ph">{placeholder}</span>}
      >
        {children}
      </SelectPrimitive.Value>
      <SelectPrimitive.Icon className="kl-select-caret">
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
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.List> & {
  container?: React.ComponentProps<typeof SelectPrimitive.Portal>["container"];
  /** Class for the docked panel (e.g. a different max-height). */
  panelClassName?: string;
};

/** The docked list: dock geometry from keyline-scope, owner weight on the shared edge, no cut, unfolds from the edge. */
function SelectContent({ container, className, panelClassName, ...props }: SelectContentProps) {
  const { layout, scope } = React.useContext(SelectContext);
  const dock = dockGeometry(layout);
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner
        sideOffset={dock.sideOffset}
        alignOffset={dock.alignOffset}
        align="start"
        alignItemWithTrigger={false}
        collisionPadding={12}
        {...scopeProps(scope, { className: "kl-positioner" })}
      >
        <SelectPrimitive.Popup
          className={cn("kl-attached kl-dock kl-dock-min kl-select-panel", panelClassName)}
          style={dock.style}
        >
          <SelectPrimitive.List data-slot="select-content" className={cn("kl-select-list", className)} {...props} />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item> & {
  description?: React.ReactNode;
  /** Trailing code cell: ≤ 4 mono characters (an ID, a key). */
  code?: React.ReactNode;
};

/**
 * An option row: mark cell · label (wraps) · optional code cell. Two cues never confused: the chosen
 * option carries the exclusive-choice mark (RadioGroup's square-and-dot); the cursor is the inverse row.
 * Disabled options stay reachable (they can be read) but can't be chosen.
 */
function SelectItem({ className, description, code, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn("kl-select-opt", className)} {...props}>
      <span className="kl-select-mark" aria-hidden>
        {/* Base UI renders a "✔️" glyph when the indicator has no children; ours is the mark itself */}
        <SelectPrimitive.ItemIndicator className="kl-select-ind" keepMounted>
          <span className="kl-select-dot" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <span className="kl-select-label">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description ? <small>{description}</small> : null}
      </span>
      {code != null ? <span className="kl-code kl-select-code">{code}</span> : null}
    </SelectPrimitive.Item>
  );
}

/** A run of options under one heading. Groups are divided by a seam; the heading is in the Code voice. */
function SelectGroup({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("kl-select-group", className)} {...props} />;
}

function SelectGroupLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-group-label"
      className={cn("kl-select-group-label", className)}
      {...props}
    />
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator data-slot="select-separator" className={cn("kl-select-sep", className)} {...props} />
  );
}

/* ------------------------------------------------------------------ *
 * OPTIONS FORM: the common case in one element. Built from the parts above.
 * ------------------------------------------------------------------ */
type SelectProps<V extends string> = Omit<
  React.ComponentProps<typeof SelectPrimitive.Root<V>>,
  "children" | "items"
> & {
  label: React.ReactNode;
  options: Option[];
  placeholder?: React.ReactNode;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (label is visually hidden). */
  layout?: "control" | "cell";
  container?: React.ComponentProps<typeof SelectPrimitive.Portal>["container"];
  className?: string;
} & FieldParticipantProps;

const renderOption = (o: Option) => (
  <SelectItem key={o.value} value={o.value} disabled={o.disabled} description={o.description} code={o.code}>
    {o.label}
  </SelectItem>
);

/**
 * Single select from an options list. Options with a `group` are listed under headings. For custom rows,
 * separators or groups you build yourself, compose the parts (SelectRoot …) instead.
 * The trigger's accessible name always carries the full value; option labels wrap in the list.
 */
function Select<V extends string>({
  label,
  options,
  placeholder = "Choose…",
  layout = "control",
  container,
  className,
  description,
  error,
  ...props
}: SelectProps<V>) {
  const items = React.useMemo(() => Object.fromEntries(options.map((o) => [o.value, o.label])), [options]);
  const groups = React.useMemo(() => (hasGroups(options) ? groupBy(options) : null), [options]);
  return (
    <SelectRoot<V> items={items} layout={layout} className={className} {...props}>
      <SelectLabel>{label}</SelectLabel>
      <SelectTrigger placeholder={placeholder} />
      <SelectContent container={container}>
        {groups
          ? groups.map((g) =>
              g.group ? (
                <SelectGroup key={g.group}>
                  <SelectGroupLabel>{g.group}</SelectGroupLabel>
                  {g.items.map(renderOption)}
                </SelectGroup>
              ) : (
                <SelectGroup key="">{g.items.map(renderOption)}</SelectGroup>
              ),
            )
          : options.map(renderOption)}
      </SelectContent>
      <FieldMessages description={description} error={error} invalid={props.invalid} layout={layout} />
    </SelectRoot>
  );
}

export {
  Select,
  SelectRoot,
  SelectLabel,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
  type Option as SelectOption,
};
