"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/** Whether an Item sits in an ItemList: only there is it a list item. */
const InList = React.createContext(false);

type ItemListLayout = "control" | "cell";
type ItemListState = { layout: ItemListLayout };

/* The list is the rows' size container. The cut's corner room is shared by every row: the first row clears the cut,
   and the rows below keep the same media width so the content seam runs straight down the list (a nested list
   has no corner of its own, so no room). As a cell, the foundation drops the frame's border, cut and fill. */
const list = cn(
  "kl-frame kl-rows @container min-w-0",
  "[--kl-c-room:calc(var(--kl-c,0px)*0.35)] in-data-[slot=item-list]:[--kl-c-room:0px]",
);

type ItemListProps = PartProps<"div", ItemListState> & { layout?: ItemListLayout };

/**
 * A list of rows on shared keylines: settings, members, files, integrations. As a standalone region it is
 * a 3px frame; with layout="cell" it is the body of an enclosing frame (a Panel body with `flush`).
 */
function ItemList({ layout = "control", render, className, style, ...props }: ItemListProps): React.ReactElement {
  const state: ItemListState = { layout };
  const own = {
    ...dataAttrs({ "kl-layout": layout }),
    "data-slot": "item-list",
    className: resolveClassName(list, className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  const el = useRender({
    defaultTagName: "div",
    render,
    state,
    props: mergeProps<"div">({ role: "list" }, props, own),
  });
  return <InList.Provider value={true}>{el}</InList.Provider>;
}

/*
 * One row: media · content · meta · actions, on a grid; without a media cell the content takes the first column and
 * the corner room. The row sets its parts' positions by their slots (one attribute more than the part's own
 * classes), so they win in any order. At 420px of list width and under, the meta moves under the title, in the
 * content column, instead of being dropped; the media and actions cells span both lines (column -4 is the content
 * column with or without a media cell).
 *
 * The row reads its own children (:has() on the row itself) and hands the answer to its parts as --kl-item-*
 * properties; no rule tests the row from a part's selector. A :has() that is not the rule's subject makes the engine
 * restyle the whole document on any DOM change anywhere (Chrome: ~10ms a change on a docs page, every row on the
 * page or not). Each row resets the properties, so a row nested in another's content reads its own.
 */
const item = cn(
  "group/item grid min-h-[calc(var(--kl-row)+12px)] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-stretch",
  "bg-kl-cell text-start font-(family-name:--kl-font) text-kl-ink no-underline",
  "[--kl-item-c-col:initial] [--kl-item-c-row:initial] [--kl-item-lead:initial] [--kl-item-span:initial]",
  "[--kl-item-c-pb:initial] [--kl-item-m-col:initial] [--kl-item-m-row:initial] [--kl-item-m-self:initial]",
  "[--kl-item-m-pb:initial] [--kl-item-m-ps:initial] [--kl-item-m-pt:initial] [--kl-item-m-text:initial]",
  "not-has-[>[data-slot=item-media]]:grid-cols-[minmax(0,1fr)_auto_auto]",
  "not-has-[>[data-slot=item-media]]:[--kl-item-lead:calc(var(--kl-inset)+var(--kl-c-room,0px))]",
  // placement is the row's: by slot, so the parts win in any order
  "*:row-[var(--kl-item-span,auto)]",
  "*:data-[slot=item-content]:col-[var(--kl-item-c-col,auto)] *:data-[slot=item-content]:row-[var(--kl-item-c-row,auto)]",
  "*:data-[slot=item-meta]:col-[var(--kl-item-m-col,auto)] *:data-[slot=item-meta]:row-[var(--kl-item-m-row,auto)]",
  "data-current:*:data-[slot=item-media]:bg-kl-cobalt data-current:*:data-[slot=item-media]:text-kl-on-cobalt",
  "data-current:*:data-[slot=item-media]:duration-(--kl-t-flood)",
  "data-interactive:cursor-pointer hover:data-interactive:bg-kl-tint active:data-interactive:bg-kl-press",
  "focus-visible:data-interactive:outline-offset-(--kl-ring-in)",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:grid-rows-[auto_auto]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-span:1/span_2]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-c-col:-4/-3]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-c-row:1]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-c-pb:calc(var(--spacing)*0.5)]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-m-col:-4/-3]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-m-row:2]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-m-self:start]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-m-text:start]",
  // under the title the meta starts where the content does (the corner room without a media cell)
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-m-ps:var(--kl-item-lead,var(--kl-inset))]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-m-pt:0px]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:[--kl-item-m-pb:calc(var(--spacing)*2)]",
);

type ItemState = { current: boolean; interactive: boolean };

type ItemProps = PartProps<"div", ItemState> & {
  /** Marks the row as the current location (master–detail): its leading cell floods with the commit signal. */
  current?: boolean;
};

/**
 * One row: media/code cell · content · meta · actions. Pass `render={<a href="…" />}` or
 * `render={<button />}` to make the whole row the interactive element; props, refs and handlers merge
 * through Base UI's useRender, as in every Base UI part.
 */
function Item({ render, className, style, current = false, ...props }: ItemProps): React.ReactElement {
  const interactive = !!render;
  const inList = React.useContext(InList);
  const state: ItemState = { current, interactive };
  const own = {
    "data-slot": "item",
    "data-current": current ? "" : undefined,
    "data-interactive": interactive ? "" : undefined,
    className: resolveClassName(cn(item, interactive && "kl-key"), className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  const defaults = {
    role: inList && !interactive ? "listitem" : undefined,
    "aria-current": current && interactive ? ("page" as const) : undefined,
  };
  const row = useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(defaults, props, own) });
  // a button or link keeps its own role, so in a list it sits inside a list item: a list holds only list items
  return inList && interactive ? (
    <div role="listitem" data-slot="item-row" className="block min-w-0">
      {row}
    </div>
  ) : (
    row
  );
}

type ItemPartState = Record<string, never>;
const PART_STATE: ItemPartState = {};

/* the media font shorthand it replaces also reset numerals and style, so they are set back here */
const media = cn(
  "grid w-[calc(var(--kl-row)+4px+var(--kl-c-room,0px))] place-items-center ps-[var(--kl-c-room,0px)]",
  "border-e-(length:--kl-k1) border-e-kl-seam text-kl-ink-2",
  "font-(family-name:--kl-font-mono) text-(length:--kl-text-label)/none font-(--kl-weight-strong) not-italic normal-nums",
  "transition-[background-color,color] duration-(--kl-t-unflood) ease-linear [&_svg]:size-4",
);

/** Leading cell: a 16px icon, an initial, or a code of up to four mono characters (ERP, DHL). Square and
 *  fixed, so the content seam lines up down the list; floods when the row is current. Longer values
 *  (times, IDs) belong in ItemMeta or the description, never here. */
function ItemMedia({ render, className, style, ...props }: PartProps<"span", ItemPartState>): React.ReactElement {
  const own = {
    "data-slot": "item-media",
    className: resolveClassName(media, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "span", render, state: PART_STATE, props: mergeProps<"span">(props, own) });
}

type ItemContentProps = Omit<PartProps<"span", ItemPartState>, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
};

/** The row's words: its title, an optional description, and any children under them. */
function ItemContent({
  title,
  description,
  render,
  className,
  style,
  children,
  ...props
}: ItemContentProps): React.ReactElement {
  const own = {
    "data-slot": "item-content",
    className: resolveClassName(
      "grid min-w-0 content-center gap-0.5 ps-[var(--kl-item-lead,var(--kl-inset))] pe-(--kl-inset) pt-2 pb-[var(--kl-item-c-pb,calc(var(--spacing)*2))]",
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <>
        <span data-slot="item-title" className="leading-[1.3] font-(--kl-weight-strong) wrap-anywhere">
          {title}
        </span>
        {description ? (
          <span
            data-slot="item-description"
            className="text-(length:--kl-text-label)/[1.35] wrap-anywhere text-kl-ink-2"
          >
            {description}
          </span>
        ) : null}
        {children}
      </>
    ),
  };
  return useRender({ defaultTagName: "span", render, state: PART_STATE, props: mergeProps<"span">(props, own) });
}

/** Trailing value in the Code voice (a size, a date, a count). Tabular, right-aligned. */
function ItemMeta({ render, className, style, ...props }: PartProps<"span", ItemPartState>): React.ReactElement {
  const own = {
    "data-slot": "item-meta",
    className: resolveClassName(
      "kl-code [align-self:var(--kl-item-m-self,center)] ps-[var(--kl-item-m-ps,var(--kl-inset))] pe-(--kl-inset) pt-[var(--kl-item-m-pt,0px)] pb-[var(--kl-item-m-pb,0px)] [text-align:var(--kl-item-m-text,end)]",
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "span", render, state: PART_STATE, props: mergeProps<"span">(props, own) });
}

/* a control that is not a cell (a Switch, a Badge) sits centred, an inset from the seams; the first cell draws the
   seam to the content */
const actionsClass = cn(
  "kl-cells items-stretch empty:hidden",
  "*:not-data-[kl-layout=cell]:mx-(--kl-inset) *:not-data-[kl-layout=cell]:self-center",
  "*:first:data-[kl-layout=cell]:border-s-(length:--kl-k1) *:first:data-[kl-layout=cell]:border-s-kl-seam",
);

/** Trailing controls. Cells (Button layout="cell") share the row's keylines; a Switch or Badge sits centred. */
function ItemActions({ render, className, style, ...props }: PartProps<"span", ItemPartState>): React.ReactElement {
  const own = {
    "data-slot": "item-actions",
    className: resolveClassName(actionsClass, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "span", render, state: PART_STATE, props: mergeProps<"span">(props, own) });
}

export {
  ItemList,
  Item,
  ItemMedia,
  ItemContent,
  ItemMeta,
  ItemActions,
  type ItemListProps,
  type ItemProps,
  type ItemContentProps,
};
