"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

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

const AttachmentContext = React.createContext<{ state: State; progress?: number; titleId: string; mark: Mark }>({
  state: "done",
  titleId: "",
  mark: null,
});

type AttachmentProps = React.ComponentProps<"div"> & {
  state?: State;
  /** 0–100 while uploading; on error, where it stopped. */
  progress?: number;
  /** default: one row. compact: a smaller row for a composer. tile: media above the name (thumbnails). */
  size?: "default" | "compact" | "tile";
  /** control (default): its own frame. cell: a cell of the Bubble it sits in. */
  layout?: "control" | "cell";
};

const DONE_MS = 900;

function Attachment({
  state = "done",
  progress,
  size = "default",
  layout = "control",
  className,
  children,
  ...props
}: AttachmentProps) {
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
  const mark: Mark = state === "error" ? "error" : flash ? "done" : null;
  const pct = Math.max(0, Math.min(100, progress ?? 0));
  const bar = state === "uploading" || state === "error" || flash;
  return (
    <AttachmentContext.Provider value={{ state, progress, titleId, mark }}>
      <div
        data-slot="attachment"
        data-status={state}
        data-size={size}
        data-kl-layout={layout}
        data-mark={mark ?? undefined}
        aria-busy={state === "uploading" || state === "processing" || undefined}
        className={cn("kl-ctl kl-att", className)}
        {...props}
      >
        {children}
        {bar ? (
          <span
            className="kl-att-bar"
            role={state === "uploading" ? "progressbar" : undefined}
            aria-labelledby={state === "uploading" ? titleId : undefined}
            aria-valuemin={state === "uploading" ? 0 : undefined}
            aria-valuemax={state === "uploading" ? 100 : undefined}
            aria-valuenow={state === "uploading" && progress != null ? Math.round(pct) : undefined}
            aria-hidden={state === "uploading" ? undefined : true}
          >
            <span style={{ transform: `scaleX(${flash ? 1 : pct / 100})` }} />
          </span>
        ) : null}
        {state === "processing" ? <span className="kl-pending" aria-hidden /> : null}
      </div>
    </AttachmentContext.Provider>
  );
}

/** The media cell: a 16px glyph, or an <img> (a thumbnail; give it alt="" when the name says what it is). It is also
 *  where the outcome lands: it floods red with ! on failure, and yellow with a tick when an upload completes. */
function AttachmentMedia({ className, children, ...props }: React.ComponentProps<"div">) {
  const { mark } = React.useContext(AttachmentContext);
  // keep the last mark's glyph while the flood retracts
  const last = React.useRef<Exclude<Mark, null>>("done");
  if (mark) last.current = mark;
  return (
    <div data-slot="attachment-media" className={cn("kl-att-media", className)} {...props}>
      {children}
      <span className="kl-att-mark" data-kind={last.current} aria-hidden>
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
    </div>
  );
}

function AttachmentContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="attachment-content" className={cn("kl-att-body", className)} {...props} />;
}

/** The file name; a long name keeps its extension in view (end-truncation would hide it). Its direction
 *  follows its own text (a Latin name stays "CMR.pdf" in an RTL page). */
function AttachmentTitle({ className, children, ...props }: React.ComponentProps<"span">) {
  const { titleId } = React.useContext(AttachmentContext);
  const text = typeof children === "string" ? children : null;
  const dot = text ? text.lastIndexOf(".") : -1;
  return (
    <span
      id={titleId}
      dir="auto"
      data-slot="attachment-title"
      className={cn("kl-att-title", className)}
      title={text ?? undefined}
      {...props}
    >
      {text && dot > 0 && text.length - dot <= 6 ? (
        <>
          <span className="kl-att-stem">{text.slice(0, dot)}</span>
          <span className="kl-att-ext">{text.slice(dot)}</span>
        </>
      ) : (
        <span className="kl-att-stem">{children}</span>
      )}
    </span>
  );
}

/** Size and type in the Code voice; while uploading it adds the percentage, on error it is the reason (announced).
 *  It never widens the frame: the name sets the width, and a long reason wraps. */
function AttachmentDescription({ className, children, ...props }: React.ComponentProps<"span">) {
  const { state, progress } = React.useContext(AttachmentContext);
  return (
    <span
      data-slot="attachment-description"
      role={state === "error" ? "alert" : undefined}
      className={cn("kl-att-desc", className)}
      {...props}
    >
      {/* the words take their own direction; the line keeps the row's, so it starts on the row's start edge */}
      <bdi>
        {children}
        {state === "uploading" && progress != null ? (
          <span className="kl-att-pct"> · {Math.round(progress)}%</span>
        ) : null}
        {state === "processing" ? <span className="kl-att-pct"> · Processing</span> : null}
      </bdi>
    </span>
  );
}

/** The action cell(s), each a square key on a seam (cancel, retry, open, remove). Name each button. Keep one
 *  action in every state of a sent file, so the frame keeps its width while the action changes. */
function AttachmentActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="attachment-actions" className={cn("kl-cells kl-att-actions", className)} {...props} />;
}

function AttachmentAction({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { "aria-label": string }) {
  return (
    <button type={type} data-slot="attachment-action" className={cn("kl-key kl-att-action", className)} {...props} />
  );
}

/** Makes the whole frame open the file: an overlay button or link (render={<a href=…/>}) under the actions. Name it. */
function AttachmentTrigger({ className, render, type, ...props }: useRender.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      { type: render ? type : (type ?? "button"), className: cn("kl-att-trigger", className) },
      props,
    ),
  });
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
