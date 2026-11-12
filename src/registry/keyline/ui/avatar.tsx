"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";
type AvatarStatus = "normal" | "waiting" | "attention" | "done" | "none";

/**
 * Initials for a name: the first grapheme of the first word and of the last word ("Nora van der Berg" →
 * "NB"), one grapheme for a single word or a script without word spaces ("李小龍" → "李"). Grapheme-aware,
 * so "Ægir Øster" → "ÆØ" and combining marks stay whole. Emails and handles use the part before "@".
 */
function avatarInitials(name: string | null | undefined): string {
  const clean = ((name ?? "").split("@")[0] ?? "")
    .replace(/[_.\-+]+/g, " ")
    .replace(/[^\p{L}\p{N}\p{M}\s]/gu, "")
    .trim();
  if (!clean) return "";
  const words = clean.split(/\s+/u);
  const seg =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
      : null;
  const first = (w: string) =>
    seg ? (seg.segment(w)[Symbol.iterator]().next().value?.segment ?? "") : (Array.from(w)[0] ?? "");
  // a script written without spaces (Han, Kana, Hangul, Thai…) gives one grapheme: two would be two words' worth
  if (
    words.length === 1 ||
    /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}]/u.test(clean)
  )
    return first(words[0] ?? "").toLocaleUpperCase();
  return (first(words[0] ?? "") + first(words.at(-1) ?? "")).toLocaleUpperCase();
}

const STATUS_TEXT: Record<AvatarStatus, string> = {
  normal: "active",
  waiting: "away",
  attention: "needs attention",
  done: "done",
  none: "offline",
};

type AvatarProps = Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children"> & {
  /** The person or organisation. Names the avatar (role="img") and gives the initials. */
  name: string;
  /** Photo or logo. While it loads, and if it fails, the initials show: never a broken image. */
  src?: string;
  /** Overrides the initials, e.g. a two-letter org code or a 16px glyph. */
  fallback?: React.ReactNode;
  /** sm 24 · md 32 (default; a list row) · lg 40 · xl 56 (a profile header). Ignored with layout="cell". */
  size?: AvatarSize;
  /** control: its own 1px keyline. cell: a square filling the width of a square-ish cell of an enclosing
   *  frame (a hover card's header); it draws no edge. In a list row use a control avatar in the media cell. */
  layout?: "control" | "cell";
  /** Status on the avatar's floor: its bottom keyline becomes a signal line, never drawn over the face.
   *  Each kind has its own line shape (active solid, away dashed, attention red with a red frame, done
   *  double, offline none and a grayscale photo), so it survives grayscale and forced colours. Its words
   *  join the accessible name. */
  status?: AvatarStatus;
  /** Words for the status (default by kind: active, away, needs attention, done, offline). */
  statusLabel?: string;
  /** The name is already printed beside the avatar (a list row, a header): hide it from assistive
   *  technology so the name isn't read twice. */
  decorative?: boolean;
  /** Base UI: wait this long before showing the initials, so a fast image never flashes them. Default 0. */
  fallbackDelay?: number;
  imageProps?: Omit<React.ComponentProps<typeof AvatarPrimitive.Image>, "src">;
};

/**
 * A person or organisation as a square cell (Base UI Avatar). The photo fills the cell; while it loads or
 * after it fails, the initials hold the cell in the UI voice. There is no radius in the language, so an
 * avatar is never a circle; with the cut off or on it is the same square (an avatar is a cell, never cut).
 */
function Avatar({
  name,
  src,
  fallback,
  size = "md",
  layout = "control",
  status,
  statusLabel,
  decorative,
  fallbackDelay,
  imageProps,
  className,
  ...props
}: AvatarProps) {
  const label = status ? `${name}, ${statusLabel ?? STATUS_TEXT[status]}` : name;
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={layout === "cell" ? undefined : size}
      data-kl-layout={layout}
      data-status={status}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn("kl-avatar", className)}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt=""
          {...imageProps}
          className={cn("kl-avatar-img", imageProps?.className as string)}
        />
      ) : null}
      <AvatarPrimitive.Fallback delay={src ? fallbackDelay : undefined} className="kl-avatar-fb" aria-hidden>
        {fallback ?? avatarInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

type AvatarGroupProps = React.ComponentProps<"div"> & {
  /** Names the group, e.g. "Assignees". The visible names and the hidden count are read after it. */
  label: string;
  /** Show at most this many cells; the rest fold into a count cell (+N) that takes the last place. */
  max?: number;
  /** Everyone in the group, when more exist than the children passed (a server count). */
  total?: number;
  size?: AvatarSize;
  /** Words for the count cell. Default (n) => `${n} more`. */
  countLabel?: (hidden: number) => string;
};

/**
 * Several avatars as cells of one keyline frame, sharing seams (C1: related parts touch). Not a stack of
 * overlapping circles: every face stays whole. With `max`, the overflow becomes one count cell. For a
 * count that opens the full list, leave out `max` and compose AvatarGroupCount with a PopoverTrigger.
 */
function AvatarGroup({
  label,
  max,
  total,
  size = "md",
  countLabel = (n) => `${n} more`,
  className,
  children,
  ...props
}: AvatarGroupProps) {
  const all = React.Children.toArray(children).filter(React.isValidElement);
  const count = Math.max(total ?? all.length, all.length);
  const fits = max == null || count <= max;
  const shown = fits ? all : all.slice(0, Math.max(0, max - 1));
  const hidden = count - shown.length;
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="avatar-group"
      data-size={size}
      className={cn("kl-avatar-group", className)}
      {...props}
    >
      {shown}
      {hidden > 0 ? <AvatarGroupCount count={hidden} label={countLabel(hidden)} /> : null}
    </div>
  );
}

type AvatarGroupCountProps = useRender.ComponentProps<"span"> & {
  /** How many are not shown. */ count: number;
  label?: string;
};

/** The overflow cell (+N), tabular. Pass `render={<button type="button" />}` (or put it in a trigger's
 *  `render`) when pressing it should show everyone. */
function AvatarGroupCount({ count, label, render, className, ref, ...props }: AvatarGroupCountProps) {
  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: {
      "data-slot": "avatar-group-count",
      role: render ? undefined : "img",
      "aria-label": label ?? `${count} more`,
      className: cn("kl-avatar-count", render && "kl-key", className),
      children: <span aria-hidden>+{count}</span>,
      ...props,
    },
  });
}

export { Avatar, AvatarGroup, AvatarGroupCount, avatarInitials, type AvatarProps, type AvatarSize, type AvatarStatus };
