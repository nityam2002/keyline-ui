"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type PanelLayout = "control" | "cell";
type PanelState = { layout: PanelLayout };
type PanelBodyState = { flush: boolean };
type PanelPartState = Record<string, never>;
const PART_STATE: PanelPartState = {};

/*
 * A region: 3px frame, region cut. Header, body and footer are cells stacked on shared keylines. Its rows keep their
 * height (the body takes the rest). A cell row placed straight in the panel (a Toolbar, a Notice, an ItemList as a
 * cell) is a row of the frame: the body or row under it owns the keyline between them (one edge, one owner).
 * The rules over its children have no specificity (:where), so a child's own utilities win, as they did over the
 * panel's stylesheet (a Scroll Area given `flex-[1_1_auto]` takes the rest). A cell Toolbar and a cell field are left
 * out: their own flex (the toolbar's flex-auto, .kl-field's flex 1) stands.
 */
const panel = cn(
  "kl-frame flex min-h-0 min-w-0 flex-col",
  "[:where(&>:not(:is([data-slot=toolbar],.kl-field)[data-kl-layout=cell]))]:flex-none",
  "[:where(&>[data-kl-layout=cell]+:is([data-slot=panel-body],[data-kl-layout=cell]))]:border-t-(length:--kl-k1)",
  "[:where(&>[data-kl-layout=cell]+:is([data-slot=panel-body],[data-kl-layout=cell]))]:border-t-kl-line",
);

type PanelProps = PartProps<"section", PanelState> & {
  /** cell: a cell of a PanelGrid (or any frame); no own border or cut. */
  layout?: PanelLayout;
};

/**
 * A region: 3px frame, region cut. Header, body and footer are cells stacked on shared keylines.
 * Standalone panels sit one gutter apart. Inside a PanelGrid they become cells of ONE frame.
 */
function Panel({ layout = "control", render, className, style, ...props }: PanelProps): React.ReactElement {
  const state: PanelState = { layout };
  const own = {
    ...dataAttrs({ "kl-layout": layout }),
    "data-slot": "panel",
    className: resolveClassName(panel, className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  return useRender({ defaultTagName: "section", render, state, props: mergeProps<"section">(props, own) });
}

/* In a cell panel the header and footer keylines drop to 1px: the grid's keylines are the region's. */
const header = cn(
  "kl-cells min-h-[52px] border-b-(length:--kl-k3) border-b-kl-line",
  "[[data-slot=panel][data-kl-layout=cell]>&]:border-b-(length:--kl-k1)",
);
/* the title block clears the frame's cut (--kl-c-room) */
const heading = cn(
  "grid min-w-0 flex-1 [align-content:center] gap-0.5 py-2.5 pe-(--kl-inset)",
  "ps-[calc(var(--kl-inset)+2px+var(--kl-c-room,0px))]",
);
/* actions are controls one gutter apart, or cells (layout="cell") that run edge to edge on seams */
const actionsCell = cn(
  "flex flex-none items-center gap-(--kl-gutter) px-(--kl-inset)",
  "has-[>[data-kl-layout=cell]]:items-stretch has-[>[data-kl-layout=cell]]:gap-0 has-[>[data-kl-layout=cell]]:p-0",
  "[:where(&>[data-kl-layout=cell]+[data-kl-layout=cell])]:border-s-(length:--kl-k1)",
  "[:where(&>[data-kl-layout=cell]+[data-kl-layout=cell])]:border-s-kl-seam",
);

type PanelHeaderProps = Omit<PartProps<"header", PanelPartState>, "title" | "children"> & {
  title: React.ReactNode;
  code?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  headingLevel?: 2 | 3 | 4;
};

/** Title (+ optional code and actions). The first header of a cut frame reserves the cut's room. */
function PanelHeader({
  title,
  code,
  description,
  actions,
  headingLevel = 2,
  render,
  className,
  style,
  ...props
}: PanelHeaderProps): React.ReactElement {
  const H = `h${headingLevel}` as "h2";
  const own = {
    "data-slot": "panel-header",
    className: resolveClassName(header, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <>
        <div data-slot="panel-heading" className={heading}>
          {code != null ? <span className="kl-code">{code}</span> : null}
          <H data-slot="panel-title" className="m-0 text-[16px]/[1.25] font-(--kl-weight-strong)">
            {title}
          </H>
          {description ? (
            <p data-slot="panel-description" className="m-0 text-[13px] text-kl-ink-2">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div data-slot="panel-actions" className={actionsCell}>
            {actions}
          </div>
        ) : null}
      </>
    ),
  };
  return useRender({
    defaultTagName: "header",
    render,
    state: PART_STATE,
    props: mergeProps<"header">(props, own),
  });
}

const body = cn(
  "grid min-h-0 flex-[1_1_auto] [align-content:start] gap-(--kl-gutter) p-[calc(var(--kl-inset)+4px)]",
  "data-flush:gap-0 data-flush:p-0",
);

type PanelBodyProps = PartProps<"div", PanelBodyState> & {
  /** No padding: for rows, lists or tables that bring their own keylines. */
  flush?: boolean;
};

/** Padded content. Standalone controls (2px) live here, one gutter apart. */
function PanelBody({ flush = false, render, className, style, ...props }: PanelBodyProps): React.ReactElement {
  const state: PanelBodyState = { flush };
  const own = {
    "data-slot": "panel-body",
    className: resolveClassName(body, className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(props, own) });
}

/* footer cells share the row (flex 1 1 0); a cell field keeps its own (flex: 1), which beat the footer's rule */
const footer = cn(
  "kl-cells mt-auto border-t-(length:--kl-k3) border-t-kl-line [:where(&>*)]:min-w-0",
  "[:where(&>:not(:is([data-slot=toolbar],.kl-field)[data-kl-layout=cell]))]:flex-[1_1_0]",
  "[[data-slot=panel][data-kl-layout=cell]>&]:border-t-(length:--kl-k1)",
  "[:where(&)>.kl-cell]:flex-auto [:where(&)>.kl-cell]:text-[13px] [:where(&)>.kl-cell]:text-kl-ink-2",
);

/** A row of cells on the bottom keyline: use Button layout="cell" for actions, or text cells for status. */
function PanelFooter({ render, className, style, ...props }: PartProps<"div", PanelPartState>): React.ReactElement {
  const own = {
    "data-slot": "panel-footer",
    className: resolveClassName(footer, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

/*
 * Joined grid (its rules over the children have no specificity, so a child's own utilities win): each cell draws a 1px ring that fills the 1px gap, so neighbours share ONE keyline at any wrap; the
 * frame clips the outer half of the ring under its own border. A child gets the cell surface unless it is a frame
 * given up to the grid (layout="cell": the foundation keeps it transparent). Unfilled grid area stays paper. The first
 * cell clears the frame's cut.
 */
const grid = cn(
  "kl-frame grid grid-cols-[repeat(auto-fit,minmax(min(var(--kl-pg-min,240px),100%),1fr))] gap-(--kl-k1)",
  "[:where(&>*)]:min-w-0 [:where(&>*)]:[box-shadow:0_0_0_var(--kl-k1)_var(--kl-seam)]",
  "[:where(&>:not(:is(.kl-frame,.kl-ctl)[data-kl-layout=cell]))]:bg-kl-cell",
  "[:where(&>[data-span='2'])]:col-span-2 [@media(max-width:640px)]:[:where(&>[data-span])]:col-auto",
  "[:where(&>:first-child)]:[--kl-c-room:calc(var(--kl-c,0px)*0.35)]",
);

type PanelGridProps = PartProps<"div", PanelPartState> & {
  /** Minimum cell width in px before the grid wraps. */
  min?: number;
};

/**
 * Joins panels into one region frame: children are separated by 1px keylines that stay correct at any
 * wrap (the frame's line shows through a 1px gap), so a dashboard reads as one instrument, not a pile of cards.
 * Children should be <Panel layout="cell"> (or any element with a background).
 */
function PanelGrid({ min = 240, render, className, style, ...props }: PanelGridProps): React.ReactElement {
  const own = {
    "data-slot": "panel-grid",
    className: resolveClassName(grid, className)(PART_STATE),
    style: resolveStyle({ "--kl-pg-min": `${min}px` } as React.CSSProperties, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

export {
  Panel,
  PanelHeader,
  PanelBody,
  PanelFooter,
  PanelGrid,
  type PanelProps,
  type PanelHeaderProps,
  type PanelBodyProps,
  type PanelGridProps,
};
