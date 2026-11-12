"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { dockGeometry, scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle } from "../lib/keyline-render";
import { groupBy, hasGroups } from "../lib/options";
import { FieldMessages, type FieldParticipantProps } from "./field";

/*
 * Select, as parts named as Base UI names them, and `Select`, the field built from them (a label, options, the
 * field's messages). The trigger is a field frame of cells:
 *
 *   ┌────────────────────────────────┬────┐
 *   │ Standard                       │ ⌄  │   value cell (truncates on one line) · caret cell (inverse while open)
 *   └────────────────────────────────┴────┘
 *
 * The list docks to the frame (dock geometry, owner weight on the shared edge, no cut). Two cues never confused:
 * the chosen option carries the exclusive-choice mark (RadioGroup's square-and-dot), the cursor is the inverse row.
 */

type Layout = "control" | "cell";

type Option = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  code?: React.ReactNode;
  /** Options sharing a group are listed under one heading, in first-appearance order. */
  group?: string;
  disabled?: boolean;
};

/* ------------------------------------------------------------------ parts */

/** Base UI's Select.Root: state, typeahead, the form value. Generic over the value and `multiple`. */
const SelectRoot = SelectPrimitive.Root;

/** The field's label. Inside `layout="cell"` hide it (`className="kl-sr"`); the trigger keeps the name. */
function SelectLabel({ className, ...props }: SelectPrimitive.Label.Props): React.ReactElement {
  return (
    <SelectPrimitive.Label
      className={resolveClassName("kl-field-label", className)}
      {...props}
      data-slot="select-label"
    />
  );
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
 * The trigger: a field frame of cells. It holds the attention cell a Field inserts when invalid, then its children
 * (by default the value and the caret). Its own edge takes keyboard focus; open is the inverse caret cell, never a
 * ring. `layout="cell"`: it fills a cell of an enclosing frame instead of drawing its own.
 */
function SelectTrigger({
  layout = "control",
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { layout?: Layout }): React.ReactElement {
  return (
    <SelectPrimitive.Trigger
      data-kl-layout={layout}
      className={resolveClassName(
        cn(
          "kl-ctl kl-cells kl-field-frame kl-edge group/select-trigger w-full cursor-pointer p-0 text-start",
          "font-(family-name:--kl-font) text-inherit",
          // disabled: out of service
          "data-disabled:cursor-not-allowed data-disabled:border-kl-dis-line data-disabled:bg-(image:--kl-hatch)",
          "data-disabled:text-kl-dis",
        ),
        className,
      )}
      {...props}
      data-slot="select-trigger"
    >
      {/* the attention cell a Field inserts when invalid (Select is a Field participant) */}
      <span className="kl-slot kl-field-bang" aria-hidden>
        <span>
          <span>!</span>
        </span>
      </span>
      {children ?? (
        <>
          <SelectValue />
          <SelectIcon />
        </>
      )}
    </SelectPrimitive.Trigger>
  );
}

/**
 * The value cell. A block, not a flex box: text-overflow applies only to a block's own line, so on a flex box the
 * ellipsis never appeared and a long value pushed the caret cell. It is centred, not stretched, so the seam a Field
 * draws after the attention cell would be a text-high red stub: the ! cell's red fill is already the edge there, and
 * the value draws no start border (`border-s-0` outranks the Field's cell rule).
 */
function SelectValue({ className, ...props }: SelectPrimitive.Value.Props): React.ReactElement {
  return (
    <SelectPrimitive.Value
      className={resolveClassName(
        cn(
          "block min-w-0 flex-[1_1_0] self-center truncate border-s-0 px-(--kl-inset)",
          "text-(length:--kl-text-lead)/[1.3] data-placeholder:text-kl-ink-3",
        ),
        className,
      )}
      {...props}
      data-slot="select-value"
    />
  );
}

/** The caret cell: inverse while the list is open. */
function SelectIcon({ className, children, ...props }: SelectPrimitive.Icon.Props): React.ReactElement {
  return (
    <SelectPrimitive.Icon
      className={resolveClassName(
        cn(
          "grid w-9 flex-none place-items-center self-stretch",
          "group-data-popup-open/select-trigger:bg-kl-inverse group-data-popup-open/select-trigger:text-kl-on-inverse",
        ),
        className,
      )}
      {...props}
      data-slot="select-icon"
    >
      {children ?? <Caret />}
    </SelectPrimitive.Icon>
  );
}

type PopupProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding" | "alignItemWithTrigger"
  > & {
    /** The frame the list docks to: `cell` when the trigger has `layout="cell"`. */
    layout?: Layout;
    /** Where the portal renders (defaults to <body>). */
    container?: SelectPrimitive.Portal.Props["container"];
    /** Props for Base UI's Select.Portal. */
    portalProps?: Omit<SelectPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * The list's surface: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props
 * lifted. It docks to the frame (its shared edge on the frame's keyline, no cut), unfolds from that edge, is at least
 * the owner's width (15rem only when the owner is clearly narrower), and carries the configuration (cut, density,
 * motion, theme, dir) of the place it is written. Rows are separated by soft rules.
 */
function SelectPopup({
  layout = "control",
  anchor,
  side,
  align = "start",
  sideOffset,
  alignOffset,
  collisionPadding = 12,
  alignItemWithTrigger = false,
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
      <SelectPrimitive.Portal container={container} {...portalProps}>
        <SelectPrimitive.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset ?? dock.sideOffset}
          alignOffset={alignOffset ?? dock.alignOffset}
          collisionPadding={collisionPadding}
          alignItemWithTrigger={alignItemWithTrigger}
          {...scopeProps(scope, { className: "kl-positioner" })}
          // Base UI keeps a select's popup mounted once it has opened, so a probe beside it would read the scope
          // only the first time. Rendered here, a fresh probe runs on every render of the positioner, which
          // includes each open: a configuration changed while the list was closed reaches it when it reopens.
          render={(positionerProps) => (
            <div {...positionerProps}>
              {React.cloneElement(probe)}
              {positionerProps.children}
            </div>
          )}
        >
          <SelectPrimitive.Popup
            className={resolveClassName(
              cn(
                "kl-attached kl-dock kl-dock-min [--kl-dock-w:15rem]",
                "max-h-[min(var(--available-height),360px)] scroll-py-1 overflow-auto overscroll-contain",
                "bg-kl-cell text-kl-ink outline-0",
                "[&_[data-slot=select-item]+[data-slot=select-item]]:border-t-(length:--kl-k1)",
                "[&_[data-slot=select-item]+[data-slot=select-item]]:border-t-kl-line-soft",
              ),
              className,
            )}
            style={resolveStyle(dock.style, style)}
            {...props}
            data-slot="select-popup"
          />
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </>
  );
}

/** The options' container inside the popup. */
function SelectList({ className, ...props }: SelectPrimitive.List.Props): React.ReactElement {
  return (
    <SelectPrimitive.List className={resolveClassName("outline-0", className)} {...props} data-slot="select-list" />
  );
}

/** The chosen option's mark: the exclusive-choice square and dot, drawn with borders so it survives forced colours.
 * Unchosen rows keep the cell empty. */
function SelectItemIndicator({
  className,
  children,
  keepMounted = true,
  ...props
}: SelectPrimitive.ItemIndicator.Props): React.ReactElement {
  return (
    <SelectPrimitive.ItemIndicator
      keepMounted={keepMounted}
      className={resolveClassName(
        "grid size-4 place-items-center border-2 border-current not-data-selected:invisible",
        className,
      )}
      {...props}
      data-slot="select-item-indicator"
    >
      {/* Base UI renders a "✔️" glyph when the indicator has no children; ours is the mark itself */}
      {children ?? <span className="size-1.5 bg-current" />}
    </SelectPrimitive.ItemIndicator>
  );
}

/** The option's text: what the trigger shows once it is chosen. */
function SelectItemText({ className, ...props }: SelectPrimitive.ItemText.Props): React.ReactElement {
  return <SelectPrimitive.ItemText className={className} {...props} data-slot="select-item-text" />;
}

type ItemProps = SelectPrimitive.Item.Props & {
  description?: React.ReactNode;
  /** Trailing code cell: ≤ 4 mono characters (an ID, a key). */
  code?: React.ReactNode;
};

/**
 * One option: the mark cell, the label (wraps; the full text is always readable here) with an optional
 * description, and an optional trailing code cell that never squeezes. The cursor is the inverse row. Disabled
 * options stay reachable (they can be read) but can't be chosen.
 */
function SelectItem({ className, description, code, children, ...props }: ItemProps): React.ReactElement {
  return (
    <SelectPrimitive.Item
      className={resolveClassName(
        cn(
          "group/select-item grid min-h-(--kl-row) cursor-default grid-cols-[36px_minmax(0,1fr)_auto] items-stretch",
          "outline-0 select-none",
          "data-highlighted:bg-kl-inverse data-highlighted:text-kl-on-inverse",
          "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
          "forced-colors:data-highlighted:outline-3 forced-colors:data-highlighted:outline-offset-[-4px]",
          "forced-colors:data-highlighted:outline-[Highlight]",
        ),
        className,
      )}
      {...props}
      data-slot="select-item"
    >
      <span
        className="grid place-items-center border-e-(length:--kl-k1) border-e-kl-seam group-data-highlighted/select-item:border-e-kl-on-inverse"
        aria-hidden
      >
        <SelectItemIndicator />
      </span>
      <span
        data-slot="select-item-label"
        className="grid min-w-0 content-center gap-px px-(--kl-inset) py-2 leading-[1.3] wrap-anywhere"
      >
        <SelectItemText>{children}</SelectItemText>
        {description ? (
          <small
            className={cn("text-(length:--kl-text-meta) text-kl-ink-2 group-data-highlighted/select-item:text-inherit")}
          >
            {description}
          </small>
        ) : null}
      </span>
      {code != null ? (
        <span
          data-slot="select-item-code"
          className="kl-code flex items-center px-(--kl-inset) whitespace-nowrap group-data-highlighted/select-item:text-inherit"
        >
          {code}
        </span>
      ) : null}
    </SelectPrimitive.Item>
  );
}

/** A run of options under one heading. A group after a group is divided by a seam. */
function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props): React.ReactElement {
  return (
    <SelectPrimitive.Group
      className={resolveClassName(
        "[[data-slot=select-group]+&]:border-t-(length:--kl-k1) [[data-slot=select-group]+&]:border-t-kl-seam",
        className,
      )}
      {...props}
      data-slot="select-group"
    />
  );
}

/** A group's heading, in the Code voice; the group's first option sits on its seam. */
function SelectGroupLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props): React.ReactElement {
  return (
    <SelectPrimitive.GroupLabel
      className={resolveClassName(
        cn(
          "block cursor-default px-(--kl-inset) pt-2.5 pb-1 text-kl-ink-2 not-italic normal-nums",
          "font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/[1.2] font-medium",
        ),
        className,
      )}
      {...props}
      data-slot="select-group-label"
    />
  );
}

/** A seam between options; the option after it draws no second rule. */
function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props): React.ReactElement {
  return (
    <SelectPrimitive.Separator
      className={resolveClassName("h-0 border-t-(length:--kl-k1) border-t-kl-seam", className)}
      {...props}
      data-slot="select-separator"
    />
  );
}

const arrow = cn(
  "sticky z-1 flex h-6 cursor-default items-center justify-center bg-kl-cell text-kl-ink-2",
  "data-[direction=up]:top-0 data-[direction=up]:border-b-(length:--kl-k1) data-[direction=up]:border-b-kl-seam",
  "data-[direction=down]:bottom-0 data-[direction=down]:border-t-(length:--kl-k1) data-[direction=down]:border-t-kl-seam",
);

/** Scrolls the list up while the pointer rests on it; shown only while there is more above. */
function SelectScrollUpArrow({
  className,
  children,
  ...props
}: SelectPrimitive.ScrollUpArrow.Props): React.ReactElement {
  return (
    <SelectPrimitive.ScrollUpArrow
      className={resolveClassName(arrow, className)}
      {...props}
      data-slot="select-scroll-up-arrow"
    >
      {children ?? (
        <span className="grid rotate-180">
          <Caret />
        </span>
      )}
    </SelectPrimitive.ScrollUpArrow>
  );
}

/** Scrolls the list down while the pointer rests on it; shown only while there is more below. */
function SelectScrollDownArrow({
  className,
  children,
  ...props
}: SelectPrimitive.ScrollDownArrow.Props): React.ReactElement {
  return (
    <SelectPrimitive.ScrollDownArrow
      className={resolveClassName(arrow, className)}
      {...props}
      data-slot="select-scroll-down-arrow"
    >
      {children ?? <Caret />}
    </SelectPrimitive.ScrollDownArrow>
  );
}

/* ------------------------------------------------------------------ the field */

type SelectProps<V extends string> = Omit<SelectPrimitive.Root.Props<V>, "children" | "items"> & {
  label: React.ReactNode;
  options: Option[];
  placeholder?: React.ReactNode;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (the label is visually hidden). */
  layout?: Layout;
  /** Where the list's portal renders (defaults to <body>). */
  container?: SelectPrimitive.Portal.Props["container"];
  className?: string;
} & FieldParticipantProps;

const renderOption = (o: Option) => (
  <SelectItem key={o.value} value={o.value} disabled={o.disabled} description={o.description} code={o.code}>
    {o.label}
  </SelectItem>
);

/**
 * Single select from an options list, built from the parts above. Options with a `group` are listed under headings.
 * For custom rows, separators or groups you build yourself, compose the parts instead. The trigger's accessible name
 * always carries the full value; option labels wrap in the list.
 *
 * Behaviour, keyboard, typeahead, form participation (`name`, `required`) and controlled/uncontrolled state are Base
 * UI Select's; `onValueChange` receives Base UI's event details (the reason, the event) after the value. The wrapper
 * is a Base UI Field.Root: a Form collects the value under `name`, and the Form's `errors`, `validate` and `required`
 * produce the message under the frame.
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
  invalid,
  validate,
  validationMode,
  orientation,
  ...props
}: SelectProps<V>) {
  const items = React.useMemo(() => Object.fromEntries(options.map((o) => [o.value, o.label])), [options]);
  const groups = React.useMemo(() => (hasGroups(options) ? groupBy(options) : null), [options]);
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
      className={cn("kl-field", className)}
    >
      <SelectRoot<V> items={items} {...props}>
        <SelectLabel className={layout === "cell" ? "kl-sr" : undefined}>{label}</SelectLabel>
        <SelectTrigger layout={layout}>
          <SelectValue placeholder={placeholder} />
          <SelectIcon />
        </SelectTrigger>
        <SelectPopup layout={layout} container={container}>
          <SelectList>
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
          </SelectList>
        </SelectPopup>
        <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
      </SelectRoot>
    </FieldPrimitive.Root>
  );
}

export {
  Select,
  SelectRoot,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPopup,
  SelectList,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
  SelectScrollUpArrow,
  SelectScrollDownArrow,
  type Option as SelectOption,
};
