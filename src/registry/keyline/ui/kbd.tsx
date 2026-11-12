import * as React from "react";

import { cn } from "@/lib/utils";

type KbdProps = React.ComponentProps<"kbd"> & {
  /** Words for a symbol key ("Command" for ⌘, "Shift" for ⇧): the glyph shows, the words are read. */
  label?: string;
};

/**
 * A key, in the Code voice. A small key cell: a 1px keyline with a 2px floor, the key's lip.
 * Used in prose and help text, and by Command, Menu and Tooltip for their shortcuts.
 */
function Kbd({ label, className, children, ...props }: KbdProps) {
  return (
    <kbd data-slot="kbd" className={cn("kl-kbd", className)} {...props}>
      {label ? (
        <>
          <span aria-hidden>{children}</span>
          <span className="kl-sr">{label}</span>
        </>
      ) : (
        children
      )}
    </kbd>
  );
}

type KbdGroupProps = React.ComponentProps<"kbd"> & {
  /** Read between keys (the seam shows it): "+" for a chord, "then" for a sequence. */
  separator?: string;
};

/**
 * Keys pressed together (or in order) as cells of one key frame on shared seams (C1), nested <kbd> as
 * HTML specifies for a combination. The separator is read, not drawn: the seam is the join.
 */
function KbdGroup({ separator = "+", className, children, ...props }: KbdGroupProps) {
  const keys = React.Children.toArray(children);
  return (
    <kbd data-slot="kbd-group" className={cn("kl-kbd-group", className)} {...props}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <span className="kl-sr"> {separator} </span> : null}
          {k}
        </React.Fragment>
      ))}
    </kbd>
  );
}

export { Kbd, KbdGroup, type KbdProps, type KbdGroupProps };
