import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A region: 3px frame, region cut. Header, body and footer are cells stacked on shared keylines.
 * Standalone panels sit one gutter apart. Inside a PanelGrid they become cells of ONE frame.
 */
function Panel({
  className,
  layout = "control",
  ...props
}: React.ComponentProps<"section"> & {
  /** cell: a cell of a PanelGrid (or any frame); no own border or cut. */ layout?: "control" | "cell";
}) {
  return (
    <section data-slot="panel" data-kl-layout={layout} className={cn("kl-frame kl-panel", className)} {...props} />
  );
}

/** Title (+ optional code and actions). The first header of a cut frame reserves the cut's room. */
function PanelHeader({
  title,
  code,
  description,
  actions,
  className,
  headingLevel = 2,
}: {
  title: React.ReactNode;
  code?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const H = `h${headingLevel}` as "h2";
  return (
    <header data-slot="panel-header" className={cn("kl-cells kl-panel-h", className)}>
      <div className="kl-panel-t">
        {code != null ? <span className="kl-code">{code}</span> : null}
        <H>{title}</H>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="kl-panel-x">{actions}</div> : null}
    </header>
  );
}

/** Padded content. Standalone controls (2px) live here, one gutter apart. */
function PanelBody({
  className,
  flush,
  ...props
}: React.ComponentProps<"div"> & {
  /** No padding: for rows, lists or tables that bring their own keylines. */ flush?: boolean;
}) {
  return (
    <div data-slot="panel-body" data-flush={flush || undefined} className={cn("kl-panel-b", className)} {...props} />
  );
}

/** A row of cells on the bottom keyline: use Button layout="cell" for actions, or text cells for status. */
function PanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel-footer" className={cn("kl-cells kl-panel-f", className)} {...props} />;
}

/**
 * Joins panels into one region frame: children are separated by 1px keylines that stay correct at any
 * wrap (the frame's line shows through a 1px gap), so a dashboard reads as one instrument, not a pile of cards.
 * Children should be <Panel layout="cell"> (or any element with a background).
 */
function PanelGrid({
  className,
  min = 240,
  style,
  ...props
}: React.ComponentProps<"div"> & { /** Minimum cell width in px before the grid wraps. */ min?: number }) {
  return (
    <div
      data-slot="panel-grid"
      className={cn("kl-frame kl-panel-grid", className)}
      style={{ "--kl-pg-min": `${min}px`, ...style } as React.CSSProperties}
      {...props}
    />
  );
}

export { Panel, PanelHeader, PanelBody, PanelFooter, PanelGrid };
