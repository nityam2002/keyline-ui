"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* A file as a frame of cells: media (an icon or a thumbnail), the name and its detail (size, progress, or the
   reason it failed), and an action cell (cancel, retry, open). Every state is the same object; the
   cells never change, only what is in them, so the name and the action stay put from upload to done.
   - idle: picked, not sent; the frame is line-soft until it goes;
   - uploading: the bottom keyline fills from the start with the working colour (a progressbar), the percentage
     in the detail;
   - processing: the pending segment runs along the bottom keyline (busy);
   - error: the bar stops where the upload stopped and turns red; the media cell floods red from that keyline
     with a ! (the reason in the detail, announced); a retry resumes the same bar;
   - done: arriving from an upload, the media cell floods yellow with a tick for 900ms (Signal: done), then the
     file's glyph returns.
   layout="cell" makes it a cell of a Bubble (a file sent in a message); the default draws its own control
   frame (a composer tray, a list of files). An AttachmentTrigger makes the whole frame open the file. */

type State = "idle" | "uploading" | "processing" | "error" | "done";
type Mark = "error" | "done" | null;
type Size = "default" | "compact" | "tile";
type Layout = "control" | "cell";

type Ctx = { state: State; progress?: number; titleId: string; mark: Mark; size: Size; layout: Layout };
const AttachmentContext = React.createContext<Ctx>({
  state: "done",
  titleId: "",
  mark: null,
  size: "default",
  layout: "control",
});

/* ------------------------------------------------------------------ *
 * CLASSES
 * The frame's own state (status, size, layout) is mirrored as data-status, data-size and data-kl-layout on the
 * root; the cells read it from context, so each cell's classes are chosen here and sit on the cell itself.
 * ------------------------------------------------------------------ */

/** What sits between cells but is not one: the bar, the pending segment and the overlay trigger. */
const frame = cn(
  "kl-ctl flex min-h-12 w-fit max-w-full min-w-0 items-stretch bg-kl-cell text-kl-ink",
  "[--kl-att-x:var(--kl-msg-x,var(--kl-inset))]",
  // seams between cells: zero specificity on the cell (:where), so the states and the tile layout restyle them
  "[&>:where(:not([data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger])+:not([data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger]))]:border-s-(length:--kl-k1)",
  "[&>:where(:not([data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger])+:not([data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger]))]:border-s-kl-line",
  "data-[status=error]:border-kl-red data-[status=idle]:border-kl-line-soft data-[status=idle]:*:border-kl-line-soft",
  // a file in a message: a cell of its bubble. It fills the bubble's width; seams in the bubble's seam tone, and a
  // failed one keeps them (the red ! cell and bar say it)
  "data-[kl-layout=cell]:w-auto data-[kl-layout=cell]:self-stretch data-[kl-layout=cell]:bg-transparent",
  "data-[kl-layout=cell]:data-[status=error]:border-kl-seam",
  "data-[kl-layout=cell]:[&>:where(:not([data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger])+:not([data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger]))]:border-s-kl-seam",
  // the whole frame opens the file: it tints under the pointer (a cell presses, on its bubble's tint) and presses
  "has-[>[data-slot=attachment-trigger]:hover:not(:active)]:bg-kl-tint",
  "data-[kl-layout=cell]:has-[>[data-slot=attachment-trigger]:hover]:bg-kl-press",
  "has-[>[data-slot=attachment-trigger]:active]:bg-kl-press",
  // compact: the composer row; tile: media above the name
  "data-[size=compact]:min-h-9",
  "data-[size=tile]:w-[136px] data-[size=tile]:flex-col",
  "data-[size=tile]:[&>:not(:first-child,[data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger],[data-slot=attachment-actions])]:border-s-0",
  "data-[size=tile]:[&>:not(:first-child,[data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger],[data-slot=attachment-actions])]:border-t-(length:--kl-k1)",
  "data-[size=tile]:[&>:not(:first-child,[data-slot=attachment-bar],.kl-pending,[data-slot=attachment-trigger],[data-slot=attachment-actions])]:border-t-kl-line",
);

/** PROGRESS: the bottom keyline fills (a scaled segment, so it runs on the compositor), inside the frame, so it reads
 *  as the line thickening. It keeps its length when the upload fails and turns red; a retry resumes it. */
const bar = "pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[3px] overflow-hidden";
const barFill = cn(
  "block h-full origin-left bg-kl-yellow forced-colors:bg-[Highlight] kl-rtl:origin-right",
  "[transition:transform_var(--kl-t-unfold)_var(--kl-ease-out),background-color_var(--kl-t-flood)_linear]",
);

/** the media cell; in a message its glyph starts on the text's leading edge */
const media = "relative grid w-11 flex-none place-items-center overflow-hidden text-kl-ink-2";
/* the 16px glyphs carry 3px of their own side bearing: the cell starts their ink, not their box, on the text edge */
const mediaCell = cn(
  "w-[calc(2*var(--kl-att-x)+10px)] justify-items-start ps-[calc(var(--kl-att-x)-3px)]",
  "[&>img]:ms-[calc(3px-var(--kl-att-x))] [&>img]:justify-self-stretch",
);
const mediaImg = "[&>img]:block [&>img]:size-full [&>img]:object-cover";

/** the outcome lands in the media cell, flooding up from the bottom keyline the bar ran along */
const mark = cn(
  "pointer-events-none absolute inset-0 grid place-items-center bg-kl-yellow text-[15px] font-(--kl-weight-display) text-kl-on-yellow",
  "[clip-path:circle(0px_at_50%_100%)] [transition:clip-path_var(--kl-t-unflood)_var(--kl-ease-in)]",
  "data-[kind=error]:bg-kl-red data-[kind=error]:text-kl-on-red",
  "forced-colors:[forced-color-adjust:none] forced-colors:not-data-[kind=error]:bg-[Mark] forced-colors:not-data-[kind=error]:text-[MarkText]",
);
const markOpen = "[clip-path:circle(150%_at_50%_100%)] [transition:clip-path_var(--kl-t-flood)_var(--kl-ease-out)]";

/* padding is physical, as the stylesheet had it: the extra 2px sits on the right in both directions */
const content =
  "grid min-w-[20ch] content-center justify-items-start gap-0.5 pt-1.5 pr-[calc(var(--kl-inset)+2px)] pb-[7px] pl-(--kl-inset)";

const title = "flex max-w-[min(100%,32ch)] min-w-0 text-[13px]/[1.25] font-(--kl-weight-strong)";

/** the detail never sets the width (the name does): a percentage or a reason cannot make the frame jump */
const description = cn(
  "min-w-0 justify-self-stretch overflow-hidden text-start text-ellipsis whitespace-nowrap [contain:inline-size]",
  "font-(family-name:--kl-font-mono) text-[11px]/[1.25] font-medium text-kl-ink-2 not-italic tabular-nums",
);

const actions = "relative z-2 flex-none";
const actionsTile = cn(
  "absolute end-0 top-0 bg-kl-raised",
  "border-s-(length:--kl-k1) border-b-(length:--kl-k1) border-s-kl-line border-b-kl-line",
);

const ring = "focus-visible:outline-(length:--kl-ring) focus-visible:outline-kl-focus focus-visible:outline-solid";
const action = cn(
  "kl-key box-border grid w-10 cursor-pointer appearance-none place-items-center bg-transparent p-0 text-kl-ink-2",
  "hover:bg-kl-tint hover:text-kl-ink",
  ring,
  "focus-visible:outline-offset-(--kl-ring-in)",
);

const trigger = cn(
  "absolute inset-0 z-1 cursor-pointer appearance-none bg-transparent p-0",
  ring,
  "focus-visible:outline-offset-(--kl-ring-out)",
);

/* ------------------------------------------------------------------ *
 * PARTS
 * ------------------------------------------------------------------ */

type AttachmentState = { state: State; size: Size; layout: Layout; mark: Mark };
type AttachmentPartState = Record<string, never>;
const PART_STATE: AttachmentPartState = {};

type AttachmentProps = PartProps<"div", AttachmentState> & {
  state?: State;
  /** 0–100 while uploading; on error, where it stopped. */
  progress?: number;
  /** default: one row. compact: a smaller row for a composer. tile: media above the name (thumbnails). */
  size?: Size;
  /** control (default): its own frame. cell: a cell of the Bubble it sits in. */
  layout?: Layout;
};

const DONE_MS = 900;

function Attachment({
  state = "done",
  progress,
  size = "default",
  layout = "control",
  render,
  className,
  style,
  children,
  ...props
}: AttachmentProps): React.ReactElement {
  const titleId = React.useId();
  // The done flash plays only when an upload lands, never for a file that was already there.
  const prev = React.useRef(state);
  const [flash, setFlash] = React.useState(false);
  React.useEffect(() => {
    const was = prev.current;
    prev.current = state;
    if (state === "done" && (was === "uploading" || was === "processing")) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), DONE_MS);
      return () => clearTimeout(t);
    }
    setFlash(false);
  }, [state]);
  const outcome: Mark = state === "error" ? "error" : flash ? "done" : null;
  const pct = Math.max(0, Math.min(100, progress ?? 0));
  const showBar = state === "uploading" || state === "error" || flash;
  const partState: AttachmentState = { state, size, layout, mark: outcome };
  const own = {
    "data-slot": "attachment",
    "data-status": state,
    "data-size": size,
    "data-kl-layout": layout,
    "data-mark": outcome ?? undefined,
    "aria-busy": state === "uploading" || state === "processing" || undefined,
    className: resolveClassName(frame, className)(partState),
    style: resolveStyle(undefined, style)(partState),
    children: (
      <>
        {children}
        {showBar ? (
          <span
            data-slot="attachment-bar"
            className={bar}
            role={state === "uploading" ? "progressbar" : undefined}
            aria-labelledby={state === "uploading" ? titleId : undefined}
            aria-valuemin={state === "uploading" ? 0 : undefined}
            aria-valuemax={state === "uploading" ? 100 : undefined}
            aria-valuenow={state === "uploading" && progress != null ? Math.round(pct) : undefined}
            aria-hidden={state === "uploading" ? undefined : true}
          >
            <span
              className={cn(barFill, state === "error" && "bg-kl-red")}
              style={{ transform: `scaleX(${flash ? 1 : pct / 100})` }}
            />
          </span>
        ) : null}
        {state === "processing" ? <span className="kl-pending [--kl-bw:3px]" aria-hidden /> : null}
      </>
    ),
  };
  const el = useRender({ defaultTagName: "div", render, state: partState, props: mergeProps<"div">(props, own) });
  return (
    <AttachmentContext.Provider value={{ state, progress, titleId, mark: outcome, size, layout }}>
      {el}
    </AttachmentContext.Provider>
  );
}

/** The media cell: a 16px glyph, or an <img> (a thumbnail; give it alt="" when the name says what it is). It is also
 *  where the outcome lands: it floods red with ! on failure, and yellow with a tick when an upload completes. */
function AttachmentMedia({
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"div", AttachmentPartState>): React.ReactElement {
  const { mark: outcome, state, size, layout } = React.useContext(AttachmentContext);
  // keep the last mark's glyph while the flood retracts
  const last = React.useRef<Exclude<Mark, null>>("done");
  if (outcome) last.current = outcome;
  const base = cn(
    media,
    layout === "cell" && mediaCell,
    mediaImg,
    (state === "uploading" || state === "processing") && "[&>img]:opacity-60",
    size === "compact" && "w-[34px]",
    size === "tile" && "aspect-[4/3] w-full",
  );
  const own = {
    "data-slot": "attachment-media",
    className: resolveClassName(base, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <>
        {children}
        <span
          data-slot="attachment-mark"
          className={cn(mark, outcome && markOpen)}
          data-kind={last.current}
          aria-hidden
        >
          {last.current === "error" ? (
            "!"
          ) : (
            <svg
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="square"
            >
              <path d="m3.5 8.5 3 3 6-7" />
            </svg>
          )}
        </span>
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

function AttachmentContent({
  render,
  className,
  style,
  ...props
}: PartProps<"div", AttachmentPartState>): React.ReactElement {
  const { size, layout } = React.useContext(AttachmentContext);
  const base = cn(content, layout === "cell" && "flex-auto", size === "compact" && "pt-[3px] pb-1");
  const own = {
    "data-slot": "attachment-content",
    className: resolveClassName(base, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

/** The file name; a long name keeps its extension in view (end-truncation would hide it). Its direction
 *  follows its own text (a Latin name stays "CMR.pdf" in an RTL page). */
function AttachmentTitle({
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"span", AttachmentPartState>): React.ReactElement {
  const { titleId } = React.useContext(AttachmentContext);
  const text = typeof children === "string" ? children : null;
  const dot = text ? text.lastIndexOf(".") : -1;
  // the id, dir and title are the part's defaults: a consumer's props come after them
  const defaults = { id: titleId, dir: "auto", title: text ?? undefined };
  const own = {
    "data-slot": "attachment-title",
    className: resolveClassName(title, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children:
      text && dot > 0 && text.length - dot <= 6 ? (
        <>
          <span data-slot="attachment-title-stem" className="min-w-0 truncate">
            {text.slice(0, dot)}
          </span>
          <span data-slot="attachment-title-extension" className="flex-none whitespace-nowrap">
            {text.slice(dot)}
          </span>
        </>
      ) : (
        <span data-slot="attachment-title-stem" className="min-w-0 truncate">
          {children}
        </span>
      ),
  };
  return useRender({
    defaultTagName: "span",
    render,
    state: PART_STATE,
    props: mergeProps<"span">(defaults, props, own),
  });
}

/** Size and type in the Code voice; while uploading it adds the percentage, on error it is the reason (announced).
 *  It never widens the frame: the name sets the width, and a long reason wraps. */
function AttachmentDescription({
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"span", AttachmentPartState>): React.ReactElement {
  const { state, progress } = React.useContext(AttachmentContext);
  const base = cn(description, state === "error" && "whitespace-normal text-kl-red-text");
  const own = {
    "data-slot": "attachment-description",
    role: state === "error" ? "alert" : undefined,
    className: resolveClassName(base, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      // the words take their own direction; the line keeps the row's, so it starts on the row's start edge
      <bdi>
        {children}
        {state === "uploading" && progress != null ? <span> · {Math.round(progress)}%</span> : null}
        {state === "processing" ? <span> · Processing</span> : null}
      </bdi>
    ),
  };
  return useRender({ defaultTagName: "span", render, state: PART_STATE, props: mergeProps<"span">(props, own) });
}

/** The action cell(s), each a square key on a seam (cancel, retry, open, remove). Name each button. Keep one
 *  action in every state of a sent file, so the frame keeps its width while the action changes. */
function AttachmentActions({
  render,
  className,
  style,
  ...props
}: PartProps<"div", AttachmentPartState>): React.ReactElement {
  const { size } = React.useContext(AttachmentContext);
  const own = {
    "data-slot": "attachment-actions",
    className: resolveClassName(cn("kl-cells", actions, size === "tile" && actionsTile), className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

function AttachmentAction({
  render,
  className,
  style,
  type,
  ...props
}: PartProps<"button", AttachmentPartState> & { "aria-label": string }): React.ReactElement {
  const { size, layout } = React.useContext(AttachmentContext);
  const base = cn(
    action,
    layout === "cell" && "hover:bg-kl-press",
    size === "compact" && "w-8",
    size === "tile" && "size-7",
  );
  const own = {
    "data-slot": "attachment-action",
    type: render ? type : (type ?? "button"),
    className: resolveClassName(base, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "button", render, state: PART_STATE, props: mergeProps<"button">(props, own) });
}

/** Makes the whole frame open the file: an overlay button or link (render={<a href=…/>}) under the actions. Name it. */
function AttachmentTrigger({
  render,
  className,
  style,
  type,
  ...props
}: PartProps<"button", AttachmentPartState>): React.ReactElement {
  const { layout } = React.useContext(AttachmentContext);
  const base = cn(trigger, layout === "cell" && "focus-visible:outline-offset-(--kl-ring-in)");
  const own = {
    "data-slot": "attachment-trigger",
    type: render ? type : (type ?? "button"),
    className: resolveClassName(base, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "button", render, state: PART_STATE, props: mergeProps<"button">(props, own) });
}

const Glyph = {
  file: "M4 1.5h5.5L12.5 4.5v10h-8.5zM9.5 1.5v3h3",
  image: "M2 3h12v10H2zM2 11l3.5-3.5 3 3 2-2L14 12M10.5 6.5h.01",
  close: "M4 4l8 8M12 4l-8 8",
  retry: "M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3",
  download: "M8 2v8.5M4.5 7l3.5 3.5L11.5 7M2.5 13.5h11",
};
function AttachmentGlyph({ name }: { name: keyof typeof Glyph }) {
  return (
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
      <path d={Glyph[name]} />
    </svg>
  );
}

export {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
  AttachmentGlyph,
};
