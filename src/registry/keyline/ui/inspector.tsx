"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { ScrollArea } from "./scroll-area";

type InspectorPartState = Record<string, never>;
const PART_STATE: InspectorPartState = {};

/*
 * Non-modal contextual panel: a region frame (kl-frame clips it) stacking a header, facts, a scrolling body and a
 * sticky action strip. A Notice (layout="cell") under the header is a row of the inspector: like a section it owns its
 * bottom keyline; folded away it owns none. Its rules over children it does not render have no specificity (:where),
 * so the child's own utilities win, as they did over the inspector's stylesheet.
 */
const inspector = cn(
  "kl-frame flex min-h-0 flex-col",
  "[:where(&>[data-slot=notice-root])]:flex-none",
  "[:where(&>[data-slot=notice-root][data-open])]:border-b-(length:--kl-k1)",
  "[:where(&>[data-slot=notice-root][data-open])]:border-b-kl-seam",
);

/**
 * Non-modal contextual panel. Its header cites the inspected object's code (e.g. R3/12) so the object
 * and its detail share an address; the action strip is sticky and part of the frame.
 */
function Inspector({ render, className, style, ...props }: PartProps<"aside", InspectorPartState>): React.ReactElement {
  const own = {
    "data-slot": "inspector",
    className: resolveClassName(inspector, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "aside", render, state: PART_STATE, props: mergeProps<"aside">(props, own) });
}

/* the title block clears the frame's cut (--kl-c-room); the code is the record's address, the title its name */
const heading = "grid min-w-0 flex-1 gap-[3px] pt-2.5 pe-3.5 pb-3 ps-[calc(14px+var(--kl-c-room,0px))]";

type InspectorHeaderProps = Omit<PartProps<"header", InspectorPartState>, "title" | "children"> & {
  code?: React.ReactNode;
  title: React.ReactNode;
  status?: React.ReactNode;
  onClose?: () => void;
  closeLabel?: string;
};

function InspectorHeader({
  code,
  title,
  status,
  onClose,
  closeLabel = "Close inspector",
  render,
  className,
  style,
  ...props
}: InspectorHeaderProps): React.ReactElement {
  const own = {
    "data-slot": "inspector-header",
    className: resolveClassName("kl-cells flex-none border-b-(length:--kl-k3) border-b-kl-line", className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <>
        <div data-slot="inspector-heading" className={heading}>
          {code ? <span className="kl-code">{code}</span> : null}
          <h2
            data-slot="inspector-title"
            className="m-0 font-(family-name:--kl-font-mono) text-[24px]/[1.1] font-(--kl-weight-strong)"
          >
            {title}
          </h2>
          {status}
        </div>
        {onClose ? (
          <button
            type="button"
            data-slot="inspector-close"
            className="kl-cell w-[46px] flex-none justify-center"
            onClick={onClose}
            aria-label={closeLabel}
          >
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
              <path d="m4.5 4.5 7 7m0-7-7 7" />
            </svg>
          </button>
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

/* two facts to a row on seams: the second of a row draws the seam between them, rows after the first the one above */
const facts = "m-0 grid flex-none grid-cols-[1fr_1fr] border-b-(length:--kl-k1) border-b-kl-seam";
const fact = cn(
  "grid min-w-0 gap-0.5 px-3.5 py-2",
  "even:border-s-(length:--kl-k1) even:border-s-kl-seam nth-[n+3]:border-t-(length:--kl-k1) nth-[n+3]:border-t-kl-seam",
);

type InspectorFactsProps = Omit<PartProps<"dl", InspectorPartState>, "children"> & {
  items: { label: string; value: React.ReactNode }[];
};

/** Key/value cells, two-up. */
function InspectorFacts({ items, render, className, style, ...props }: InspectorFactsProps): React.ReactElement {
  const own = {
    "data-slot": "inspector-facts",
    className: resolveClassName(facts, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: items.map((it) => (
      <div key={it.label} data-slot="inspector-fact" className={fact}>
        <dt className="kl-code">{it.label}</dt>
        <dd className="m-0 font-(--kl-weight-strong) wrap-anywhere">{it.value}</dd>
      </div>
    )),
  };
  return useRender({ defaultTagName: "dl", render, state: PART_STATE, props: mergeProps<"dl">(props, own) });
}

type InspectorBodyProps = Omit<React.ComponentProps<typeof ScrollArea>, "className" | "style"> & {
  className?: string | ((state: InspectorPartState) => string | undefined);
  style?: React.CSSProperties | ((state: InspectorPartState) => React.CSSProperties | undefined);
};

/** The inspector's scrolling body: a Keyline Scroll Area (bar on the inline-end edge, native scrolling). `className`
 * and `style` reach the scroll area itself; `contentClassName` lays out what it holds. */
function InspectorBody({ className, style, children, ...props }: InspectorBodyProps): React.ReactElement {
  return (
    <ScrollArea
      className={resolveClassName("min-h-0 flex-[1_1_auto]", className)(PART_STATE)}
      style={resolveStyle(undefined, style)(PART_STATE)}
      viewportClassName="overscroll-contain"
      {...props}
      data-slot="inspector-body"
    >
      {children}
    </ScrollArea>
  );
}

const section = "border-b-(length:--kl-k1) border-b-kl-seam px-3.5 pt-3 pb-3.5";

/** A labelled cell of the body. */
function InspectorSection({
  render,
  className,
  style,
  ...props
}: PartProps<"div", InspectorPartState>): React.ReactElement {
  const own = {
    "data-slot": "inspector-section",
    className: resolveClassName(section, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

/* two short sections sharing a row: the row owns the bottom keyline, the second section the seam between them */
const row = cn(
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b-(length:--kl-k1) border-b-kl-seam",
  "*:data-[slot=inspector-section]:border-b-0",
  "[&>[data-slot=inspector-section]+[data-slot=inspector-section]]:border-s-(length:--kl-k1)",
  "[&>[data-slot=inspector-section]+[data-slot=inspector-section]]:border-s-kl-seam",
);

/** Two sections side by side. */
function InspectorRow({
  render,
  className,
  style,
  ...props
}: PartProps<"div", InspectorPartState>): React.ReactElement {
  const own = {
    "data-slot": "inspector-row",
    className: resolveClassName(row, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

/* the action strip: cells sharing the frame's bottom keyline; a plain cell button is a centred, strong action */
const actions = cn(
  "kl-cells flex-none border-t-(length:--kl-k3) border-t-kl-line bg-kl-cell [:where(&>*)]:flex-1",
  "[:where(&)>button.kl-cell]:min-h-12 [:where(&)>button.kl-cell]:justify-center",
  "[:where(&)>button.kl-cell]:font-(--kl-weight-strong)",
);

function InspectorActions({
  render,
  className,
  style,
  ...props
}: PartProps<"div", InspectorPartState>): React.ReactElement {
  const own = {
    "data-slot": "inspector-actions",
    className: resolveClassName(actions, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

export {
  Inspector,
  InspectorHeader,
  InspectorFacts,
  InspectorBody,
  InspectorSection,
  InspectorRow,
  InspectorActions,
  type InspectorHeaderProps,
  type InspectorFactsProps,
  type InspectorBodyProps,
};
