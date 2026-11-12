"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type AvatarSize = "sm" | "md" | "lg" | "xl";
type AvatarStatus = "normal" | "waiting" | "attention" | "done" | "none";
type AvatarLayout = "control" | "cell";

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

/* the inner keyline of an attention avatar that has no frame of its own: as a cell, or as a cell of a group */
const cellAttention = cn(
  "after:pointer-events-none after:absolute after:inset-0 after:content-['']",
  "after:border-(length:--kl-k1) after:border-kl-red forced-colors:after:border-[CanvasText]",
);
const groupCellAttention = cn(
  "*:data-[slot=avatar]:data-[status=attention]:after:pointer-events-none",
  "*:data-[slot=avatar]:data-[status=attention]:after:absolute",
  "*:data-[slot=avatar]:data-[status=attention]:after:inset-0",
  "*:data-[slot=avatar]:data-[status=attention]:after:content-['']",
  "*:data-[slot=avatar]:data-[status=attention]:after:border-(length:--kl-k1)",
  "*:data-[slot=avatar]:data-[status=attention]:after:border-kl-red",
  "forced-colors:*:data-[slot=avatar]:data-[status=attention]:after:border-[CanvasText]",
);

const STATUS_TEXT: Record<AvatarStatus, string> = {
  normal: "active",
  waiting: "away",
  attention: "needs attention",
  done: "done",
  none: "offline",
};

/* The avatar's name, for the initials AvatarFallback shows when it is given none. */
const NameContext = React.createContext<string>("");

/*
 * A person as a square cell: the photo fills it, the initials hold it while the photo loads or after it fails. A 1px
 * keyline of its own (an avatar is a token-sized thing, like a badge: k1, never cut); as a cell (layout="cell") it is
 * a square inside the cell it sits in. No radius anywhere: the square IS the character, and it does not change with
 * --kl-cut. Nothing is drawn over the face: status lives on the avatar's floor, as its bottom keyline.
 *
 * --kl-av (the square), --kl-av-fs (the initials) and --kl-av-st (the status floor) are set by plain classes, so a
 * container that sizes its avatars with a more specific rule wins: AvatarGroup (its own size) and Message's gutter.
 */
const avatarVariants = cva(
  [
    "group/avatar relative box-border inline-grid flex-none overflow-hidden align-middle select-none",
    "bg-kl-tint font-(family-name:--kl-font) text-kl-ink [--kl-av-st:3px] *:[grid-area:1/1]",
  ],
  {
    variants: {
      size: {
        sm: "[--kl-av-fs:10px] [--kl-av:24px]",
        md: "[--kl-av-fs:13px] [--kl-av:32px]",
        lg: "[--kl-av-fs:15px] [--kl-av:40px]",
        xl: "[--kl-av-fs:20px] [--kl-av-st:4px] [--kl-av:56px]",
      },
      layout: {
        control: "size-(--kl-av) border-(length:--kl-k1) border-kl-line forced-colors:border-[CanvasText]",
        // a square that fills the cell's width, centred in it, never a slab stretched to the row; no edge of its own
        cell: "aspect-square h-auto w-full self-center border-0 [--kl-av-fs:18px]",
      },
      /* the floor is a signal keyline, a line shape per kind as well as a colour (they survive grayscale and forced
         colours): active solid cobalt, away dashed, needs attention solid red with the whole frame red, done a double
         line, offline no line and the photo in grayscale */
      status: {
        normal: "border-b-(length:--kl-av-st) border-b-kl-cobalt",
        waiting: "border-b-(length:--kl-av-st) [border-bottom-style:dashed] border-b-kl-ink-2",
        attention: "border-b-(length:--kl-av-st) border-b-kl-red",
        done: "border-b-[length:max(var(--kl-av-st),3px)] [border-bottom-style:double] border-b-kl-ink",
        none: "border-b-(length:--kl-k1) border-b-kl-line",
      },
    },
    compoundVariants: [
      {
        status: ["normal", "waiting", "attention", "done", "none"],
        className: "forced-colors:border-b-[CanvasText]",
      },
      {
        layout: "control",
        status: "attention",
        className: "border-kl-red forced-colors:border-2 forced-colors:border-b-(length:--kl-av-st)",
      },
      // as a cell there is no own frame to turn red: an inner keyline draws it
      { layout: "cell", status: "attention", className: cellAttention },
      { layout: "cell", status: "none", className: "border-b-0" },
    ],
  },
);

type AvatarState = AvatarPrimitive.Root.State & {
  size: AvatarSize | undefined;
  layout: AvatarLayout;
  status: AvatarStatus | undefined;
};

type AvatarProps = Omit<AvatarPrimitive.Root.Props, "className" | "style"> & {
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
  layout?: AvatarLayout;
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
  imageProps?: Omit<AvatarImageProps, "src">;
  className?: string | ((state: AvatarState) => string | undefined);
  style?: React.CSSProperties | ((state: AvatarState) => React.CSSProperties | undefined);
};

/**
 * A person or organisation as a square cell (Base UI Avatar). The photo fills the cell; while it loads or
 * after it fails, the initials hold the cell in the UI voice. There is no radius in the language, so an
 * avatar is never a circle; with the cut off or on it is the same square (an avatar is a cell, never cut).
 *
 * Given `name` (and `src`), it renders its image and initials itself. Pass children (AvatarImage,
 * AvatarFallback) to compose them instead.
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
  style,
  children,
  ...props
}: AvatarProps): React.ReactElement {
  const label = status ? `${name}, ${statusLabel ?? STATUS_TEXT[status]}` : name;
  const ownSize = layout === "cell" ? undefined : size;
  const extra = { size: ownSize, layout, status };
  return (
    <NameContext.Provider value={name}>
      <AvatarPrimitive.Root
        {...dataAttrs({ size: ownSize, "kl-layout": layout, status })}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
        className={(state) =>
          resolveClassName(
            cn(avatarVariants({ size: ownSize ?? "md", layout, status })),
            className,
          )({
            ...state,
            ...extra,
          })
        }
        style={(state) => resolveStyle(undefined, style)({ ...state, ...extra })}
        {...props}
        data-slot="avatar"
      >
        {children ?? (
          <>
            {src ? <AvatarImage src={src} {...imageProps} /> : null}
            <AvatarFallback delay={src ? fallbackDelay : undefined}>{fallback}</AvatarFallback>
          </>
        )}
      </AvatarPrimitive.Root>
    </NameContext.Provider>
  );
}

/* the photo: portrait crops keep the face (upper third) in a square; it rises from the bottom keyline when it arrives
   late (Unfold); reduced motion (--kl-t-unfold: 0) makes it a cut */
const image = cn(
  "block size-full object-cover object-[50%_30%] [clip-path:inset(0)]",
  "[transition:clip-path_var(--kl-t-unfold)_var(--kl-ease-out),filter_var(--kl-t-unflood)_linear]",
  "data-starting-style:[clip-path:inset(100%_0_0_0)]",
  "group-data-[status=none]/avatar:[filter:grayscale(1)_contrast(0.9)]",
);

type AvatarImageProps = AvatarPrimitive.Image.Props;

/** The photo or logo (Base UI Avatar.Image). It shows once loaded; until then, or if it fails, the fallback holds
 * the cell. Decorative: the avatar carries the name. */
function AvatarImage({ className, ...props }: AvatarImageProps): React.ReactElement {
  return (
    <AvatarPrimitive.Image alt="" className={resolveClassName(image, className)} {...props} data-slot="avatar-image" />
  );
}

/* initials: the UI voice at strong weight, centred on the cap height (not the line box), so "MN" and "李" sit in the
   optical middle of the square */
const fallbackClass = cn(
  "grid size-full min-w-0 place-items-center",
  "text-(length:--kl-av-fs)/none font-(--kl-weight-strong) tracking-[0.02em] whitespace-nowrap tabular-nums",
  "[text-box:trim-both_cap_alphabetic] [&_svg]:size-[calc(var(--kl-av-fs)+4px)]",
  "group-data-[status=none]/avatar:text-kl-ink-3",
);

type AvatarFallbackProps = AvatarPrimitive.Fallback.Props;

/** What holds the cell while the image loads or after it fails (Base UI Avatar.Fallback): the avatar's initials
 * unless given children. Hidden from assistive technology: the avatar carries the name. */
function AvatarFallback({ className, children, ...props }: AvatarFallbackProps): React.ReactElement {
  const name = React.useContext(NameContext);
  return (
    <AvatarPrimitive.Fallback
      aria-hidden
      className={resolveClassName(fallbackClass, className)}
      {...props}
      data-slot="avatar-fallback"
    >
      {children ?? avatarInitials(name)}
    </AvatarPrimitive.Fallback>
  );
}

/*
 * GROUP: cells of one keyline frame on shared seams (C1). Every face stays whole. The frame owns the outer edge; each
 * later cell owns the seam before it. The group's size governs its cells: these rules key on the avatar's slot and
 * are more specific than the avatar's own size classes. A cell keeps its status floor (no rule here sets a floor
 * when the avatar has a status), and its seam turns red with it when it needs attention.
 */
const groupVariants = cva(
  [
    "inline-flex w-fit max-w-full items-stretch align-middle",
    "border-(length:--kl-k1) border-kl-line bg-kl-cell forced-colors:border-[CanvasText]",
    "*:data-[slot=avatar]:data-[size]:[--kl-av-fs:inherit] *:data-[slot=avatar]:data-[size]:[--kl-av:inherit]",
    "*:data-[slot=avatar]:size-[calc(var(--kl-av)-2*var(--kl-k1))]",
    "*:data-[slot=avatar]:border-e-0 *:data-[slot=avatar]:border-t-0",
    "*:data-[slot=avatar]:not-data-[status]:border-b-0 *:data-[slot=avatar]:data-[status=none]:border-b-0",
    "*:not-first:border-s-(length:--kl-k1) *:first:border-s-0",
    "*:not-first:not-data-[status=attention]:border-s-kl-seam",
    groupCellAttention,
  ],
  {
    variants: {
      size: {
        sm: "[--kl-av-fs:10px] [--kl-av:24px]",
        md: "[--kl-av-fs:13px] [--kl-av:32px]",
        lg: "[--kl-av-fs:15px] [--kl-av:40px]",
        xl: "[--kl-av-fs:20px] [--kl-av:56px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type AvatarGroupState = { size: AvatarSize };

type AvatarGroupProps = PartProps<"div", AvatarGroupState> & {
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
  render,
  className,
  style,
  children,
  ...props
}: AvatarGroupProps): React.ReactElement {
  const all = React.Children.toArray(children).filter(React.isValidElement);
  const count = Math.max(total ?? all.length, all.length);
  const fits = max == null || count <= max;
  const shown = fits ? all : all.slice(0, Math.max(0, max - 1));
  const hidden = count - shown.length;
  const state: AvatarGroupState = { size };
  const own = {
    ...dataAttrs({ size }),
    "data-slot": "avatar-group",
    className: resolveClassName(cn(groupVariants({ size })), className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        {shown}
        {hidden > 0 ? <AvatarGroupCount count={hidden} label={countLabel(hidden)} /> : null}
      </>
    ),
  };
  return useRender({
    defaultTagName: "div",
    render,
    state,
    props: mergeProps<"div">({ role: "group", "aria-label": label }, props, own),
  });
}

/* the overflow cell: tabular, "+10" keeps its sign first in RTL. As a button (render={<button />}) it presses. */
const count = cn(
  "box-border grid min-w-[calc(var(--kl-av)-2*var(--kl-k1))] flex-none place-items-center px-1.5",
  "bg-kl-cell font-(family-name:--kl-font) text-[length:var(--kl-av-fs,13px)]/none text-kl-ink",
  "font-(--kl-weight-strong) whitespace-nowrap tabular-nums [direction:ltr] [unicode-bidi:isolate]",
  "[button&]:m-0 [button&]:cursor-pointer [button&]:border-y-0 [button&]:border-e-0",
  "[button&]:not-data-popup-open:hover:bg-kl-tint [button&]:not-data-popup-open:active:bg-kl-press",
  "focus-visible:outline-offset-(--kl-ring-in) data-popup-open:bg-kl-inverse data-popup-open:text-kl-on-inverse",
);

type AvatarGroupCountState = { count: number };

type AvatarGroupCountProps = PartProps<"span", AvatarGroupCountState> & {
  /** How many are not shown. */
  count: number;
  label?: string;
};

/** The overflow cell (+N), tabular. Pass `render={<button type="button" />}` (or put it in a trigger's
 *  `render`) when pressing it should show everyone. */
function AvatarGroupCount({
  count: hidden,
  label,
  render,
  className,
  style,
  ...props
}: AvatarGroupCountProps): React.ReactElement {
  const state: AvatarGroupCountState = { count: hidden };
  const own = {
    "data-slot": "avatar-group-count",
    className: resolveClassName(cn(count, render && "kl-key"), className)(state),
    style: resolveStyle(undefined, style)(state),
    children: <span aria-hidden>+{hidden}</span>,
  };
  return useRender({
    defaultTagName: "span",
    render,
    state,
    props: mergeProps<"span">(
      { role: render ? undefined : "img", "aria-label": label ?? `${hidden} more` },
      props,
      own,
    ),
  });
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  avatarInitials,
  type AvatarProps,
  type AvatarImageProps,
  type AvatarFallbackProps,
  type AvatarGroupProps,
  type AvatarGroupCountProps,
  type AvatarSize,
  type AvatarStatus,
};
