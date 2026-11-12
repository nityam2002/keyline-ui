"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

/** Whether an Item sits in an ItemList: only there is it a list item. */
const InList = React.createContext(false);

/**
 * A list of rows on shared keylines: settings, members, files, integrations. As a standalone region it is
 * a 3px frame; with layout="cell" it is the body of an enclosing frame (a Panel body with `flush`).
 */
function ItemList({
  className,
  layout = "control",
  ...props
}: React.ComponentProps<"div"> & { layout?: "control" | "cell" }) {
  return (
    <InList.Provider value={true}>
      <div
        role="list"
        data-slot="item-list"
        data-kl-layout={layout}
        className={cn("kl-frame kl-rows kl-item-list", className)}
        {...props}
      />
    </InList.Provider>
  );
}

type ItemProps = useRender.ComponentProps<"div"> & {
  /** Marks the row as the current location (master–detail): its leading cell floods with the commit signal. */
  current?: boolean;
};

/**
 * One row: media/code cell · content · meta · actions. Pass `render={<a href="…" />}` or
 * `render={<button />}` to make the whole row the interactive element; props, refs and handlers merge
 * through Base UI's useRender, as in every Base UI part.
 */
function Item({ render, className, current, ...props }: ItemProps) {
  const interactive = !!render;
  const inList = React.useContext(InList);
  const row = useRender({
    defaultTagName: "div",
    render,
    props: {
      role: inList && !interactive ? "listitem" : undefined,
      "data-slot": "item",
      "data-current": current ? "" : undefined,
      "aria-current": current && interactive ? "page" : undefined,
      "data-interactive": interactive ? "" : undefined,
      className: cn("kl-item", interactive && "kl-key", className),
      ...props,
    },
  });
  // a button or link keeps its own role, so in a list it sits inside a list item: a list holds only list items
  return inList && interactive ? (
    <div role="listitem" data-slot="item-row" className="kl-item-row">
      {row}
    </div>
  ) : (
    row
  );
}

/** Leading cell: a 16px icon, an initial, or a code of up to four mono characters (ERP, DHL). Square and
 *  fixed, so the content seam lines up down the list; floods when the row is current. Longer values
 *  (times, IDs) belong in ItemMeta or the description, never here. */
function ItemMedia({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="item-media" className={cn("kl-item-media", className)} {...props} />;
}

function ItemContent({
  title,
  description,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "title"> & { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <span data-slot="item-content" className={cn("kl-item-content", className)} {...props}>
      <span className="kl-item-title">{title}</span>
      {description ? <span className="kl-item-desc">{description}</span> : null}
      {children}
    </span>
  );
}

/** Trailing value in the Code voice (a size, a date, a count). Tabular, right-aligned. */
function ItemMeta({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="item-meta" className={cn("kl-item-meta kl-code", className)} {...props} />;
}

/** Trailing controls. Cells (Button layout="cell") share the row's keylines; a Switch or Badge sits centred. */
function ItemActions({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="item-actions" className={cn("kl-cells kl-item-actions", className)} {...props} />;
}

export { ItemList, Item, ItemMedia, ItemContent, ItemMeta, ItemActions };
