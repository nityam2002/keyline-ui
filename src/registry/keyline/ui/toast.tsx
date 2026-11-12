"use client";

import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { scopeProps, useDomDirection, useKeylineScope, useMergedRef } from "../lib/keyline-scope";
import { dataAttrs, resolveClassName } from "../lib/keyline-render";

/**
 * Wrap the app once. Up to `limit` (3) messages stay at once, newest in front; older ones wait behind it as a
 * stack and come forward as the newer ones close. Pass `toastManager={toaster}` (from
 * `createToaster()`) to raise messages from outside React too.
 */
function ToastProvider({ timeout = 6000, limit = 3, ...props }: Toast.Provider.Props): React.ReactElement {
  return <Toast.Provider timeout={timeout} limit={limit} {...props} />;
}

/** Keyline's kinds. Base UI's own `success` and `error` (what its promise tracking sets) draw as done and failed. */
type ToastKind = "done" | "failed" | "info" | "warning" | "loading";

type Notify = {
  title: React.ReactNode;
  /** A second line: what happened to what, or what to do next. Announced with the title. */
  description?: React.ReactNode;
  /**
   * done (default) · failed (red ! cell, announced urgently) · info · warning (attention glyph on the ink toast;
   * red stays for failure) · loading (the pending segment on the bottom keyline; it stays until updated or dismissed)
   */
  type?: ToastKind;
  /** One action cell (Undo, Retry, Open). It closes the toast after it runs. */
  action?: { label: string; onClick: () => void };
  /** ms; 0 keeps the toast until it is dismissed. Loading toasts never time out. */
  timeout?: number;
};

type Track<T> = {
  loading: string | Notify;
  done: string | Notify | ((value: T) => string | Notify);
  failed: string | Notify | ((error: unknown) => string | Notify);
};

type Manager = Pick<ReturnType<typeof Toast.createToastManager>, "add" | "close" | "update" | "promise">;

const toOptions = ({ title, description, type = "done", action, timeout }: Notify) => ({
  title,
  description,
  type,
  ...(type === "loading" ? { timeout: 0 } : timeout !== undefined ? { timeout } : null),
  priority: (type === "failed" ? "high" : "low") as "high" | "low",
  // the toast list closes the toast after any action runs
  actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
});
const resolve = <V,>(o: string | Notify | ((v: V) => string | Notify), v: V, type: ToastKind) => {
  const r = typeof o === "function" ? o(v) : o;
  return toOptions(typeof r === "string" ? { title: r, type } : { type, ...r });
};

/** The calls Keyline adds over a Base UI toast manager: the same functions inside and outside React. */
function bind(m: Manager) {
  /** `notify({ title, description, type, action })`; returns the toast's id. */
  const notify = (n: Notify): string => m.add(toOptions(n));
  return {
    notify,
    /**
     * Tracks a promise in one toast: loading (the pending segment) → done or failed, in place, without a second
     * message. Returns the promise, which still rejects when it fails. Base UI's manager.promise underneath.
     */
    promise: <T,>(p: Promise<T>, t: Track<T>): Promise<T> =>
      m.promise(p, {
        loading: resolve(t.loading, undefined, "loading"),
        // Base UI marks these success and error; the list draws them as done and failed
        success: (v: T) => resolve(t.done, v, "done"),
        error: (e: unknown) => resolve(t.failed, e, "failed"),
      }),
    /** Changes a toast in place (its title, kind, action), e.g. a loading toast you resolve yourself. */
    update: (id: string, n: Partial<Notify>) => {
      const o = toOptions({ title: undefined, ...n });
      // every update restarts the drain (it is keyed on updateKey), so it always names a timeout, which makes
      // Base UI restart the timer with it: the bar and the dismissal stay in step
      m.update(id, (prev) => ({
        ...("title" in n ? { title: o.title } : null),
        ...("description" in n ? { description: o.description } : null),
        // leaving loading restores the provider's timeout unless one is given
        ...("type" in n
          ? { type: o.type, priority: o.priority, timeout: n.type === "loading" ? 0 : n.timeout }
          : { timeout: "timeout" in n ? n.timeout : prev.timeout }),
        ...("action" in n ? { actionProps: o.actionProps } : null),
      }));
    },
    /** Closes one toast, or every toast without an id. */
    dismiss: (id?: string) => m.close(id),
  };
}

/**
 * A toast manager that works outside React: a data layer, a websocket handler, a router guard.
 *
 *   export const toaster = createToaster()
 *   <ToastProvider toastManager={toaster}>…<ToastDock /></ToastProvider>
 *   toaster.notify({ title: "Manifest sent" })
 *
 * It is Base UI's `Toast.createToastManager()` with Keyline's calls added.
 */
function createToaster() {
  const m = Toast.createToastManager();
  // Keyline's promise and update take Keyline's options and call Base UI's underneath: bound to a copy of the
  // manager's own methods, so replacing them on the manager does not make them call themselves
  return Object.assign(m, bind({ ...m }));
}

/** `notify({ title, type, action })`. The action closes the toast after it runs. */
function useToast() {
  const m = Toast.useToastManager();
  return React.useCallback((n: Notify) => m.add(toOptions(n)), [m]);
}

/** notify, promise, update and dismiss for the nearest ToastProvider. */
function useToaster() {
  const m = Toast.useToastManager();
  return React.useMemo(() => bind(m), [m]);
}

/* ------------------------------------------------------------------ *
 * VIEWPORT
 * Two placements. DOCKED renders the viewport INSIDE a host cell (e.g. the table pager), so a message never covers
 * data. FLOATING is the fallback for pages without a dock, at the bottom inline-end corner. The toasts read the
 * placement from the viewport they are in.
 * ------------------------------------------------------------------ */

type Placement = "dock" | "floating";
type Swipe = "up" | "down" | "left" | "right";
/** The viewport a toast is in: how it is drawn, and which way it swipes away (toward the inline end; a floating
 * toast also down). */
const ViewportContext = React.createContext<{ placement: Placement; swipe: Swipe[] }>({
  placement: "dock",
  swipe: ["right"],
});

/* --kl-ts-move: how long a toast takes to change place in the stack. Transitions, never keyframes: toasts arrive in
   bursts, and a transition retargets from wherever the toast is instead of restarting. */
const viewportVariants = cva(
  cn(
    "outline-0 [--kl-ts-ease:cubic-bezier(0.22,1,0.36,1)] [--kl-ts-gap:8px] [--kl-ts-move:320ms] [--kl-ts-peek:8px]",
    "in-data-[kl-motion=reduce]:[--kl-ts-move:0ms] motion-reduce:[--kl-ts-move:0ms]",
  ),
  {
    variants: {
      placement: {
        dock: "relative flex min-w-0 items-stretch empty:pointer-events-none",
        // in a portal, the outermost element: it carries Keyline's type and ink (design.md, rule 8)
        floating: cn(
          "fixed end-4 bottom-4 z-(--kl-z-toast) w-[min(440px,calc(100vw-32px))]",
          "font-(family-name:--kl-font) text-(length:--kl-fs)/[1.4] text-kl-ink tabular-nums antialiased",
        ),
      },
    },
  },
);

/** Base UI pauses toast timers while the window is blurred; the drain follows that (it drained to empty on
 * a background window while the toast stayed, so the countdown lied about the time left). */
function useWindowBlurred() {
  const [blurred, setBlurred] = React.useState(false);
  React.useEffect(() => {
    const on = () => setBlurred(true);
    const off = () => setBlurred(false);
    addEventListener("blur", on);
    addEventListener("focus", off);
    return () => {
      removeEventListener("blur", on);
      removeEventListener("focus", off);
    };
  }, []);
  return blurred;
}

type ToastViewportProps = React.ComponentProps<typeof Toast.Viewport> & {
  /** dock (default): in flow, inside a host cell · floating: fixed at the bottom inline-end corner, in a portal. */
  placement?: Placement;
  /** Floating only: where the portal renders (defaults to <body>). */
  container?: Toast.Portal.Props["container"];
  /** Floating only: props for Base UI's Toast.Portal. */
  portalProps?: Omit<Toast.Portal.Props, "container" | "children">;
};

function DockViewport({ className, ref: refProp, ...props }: Omit<ToastViewportProps, "placement" | "container">) {
  const paused = useWindowBlurred();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [dir] = useDomDirection(ref);
  const setRef = useMergedRef(ref, refProp);
  const value = React.useMemo(
    () => ({ placement: "dock" as const, swipe: [dir === "rtl" ? "left" : "right"] as Swipe[] }),
    [dir],
  );
  return (
    <ViewportContext.Provider value={value}>
      <Toast.Viewport
        ref={setRef}
        data-kl-paused={paused || undefined}
        {...dataAttrs({ placement: "dock" })}
        className={resolveClassName(cn(viewportVariants({ placement: "dock" })), className)}
        {...props}
        data-slot="toast-viewport"
      />
    </ViewportContext.Provider>
  );
}

function FloatingViewport({ className, container, portalProps, ...props }: Omit<ToastViewportProps, "placement">) {
  const [marker, scope] = useKeylineScope(true, container);
  const paused = useWindowBlurred();
  const value = React.useMemo(
    () => ({ placement: "floating" as const, swipe: ["down", scope.dir === "rtl" ? "left" : "right"] as Swipe[] }),
    [scope.dir],
  );
  return (
    <ViewportContext.Provider value={value}>
      {marker}
      <Toast.Portal container={container} {...portalProps}>
        {/* carries the configuration of the place it is written, without a box of its own */}
        <div {...scopeProps(scope, { className: "contents" })}>
          <Toast.Viewport
            data-kl-paused={paused || undefined}
            {...dataAttrs({ placement: "floating" })}
            className={resolveClassName(cn(viewportVariants({ placement: "floating" })), className)}
            {...props}
            data-slot="toast-viewport"
          />
        </div>
      </Toast.Portal>
    </ViewportContext.Provider>
  );
}

/**
 * Where toasts show: Base UI's Viewport (the F6 landmark; hover and keyboard focus expand it and pause the timers).
 * `placement="floating"` adds Base UI's Portal and carries the configuration of the place it is written. Give it
 * ToastRoot children, or use ToastDock / ToastFloating, which render the manager's toasts.
 */
function ToastViewport({ placement = "dock", ...props }: ToastViewportProps): React.ReactElement {
  return placement === "floating" ? <FloatingViewport {...props} /> : <DockViewport {...props} />;
}

/* ------------------------------------------------------------------ *
 * TOAST
 * The stack, on Base UI's own stacking: it numbers the toasts (--toast-index), measures them (--toast-height,
 * --toast-offset-y, the viewport's --toast-frontmost-height), expands the viewport on hover and keyboard focus
 * (data-expanded, timers paused), and tracks swipes (--toast-swipe-movement-*). Keyline marks which toast is in
 * front (data-kl-front) and which wait behind it (data-kl-behind); the classes draw the rest.
 * ------------------------------------------------------------------ */

const KIND: Record<string, ToastKind> = { success: "done", error: "failed" };
const kindOf = (t: { type?: string | undefined }): ToastKind => KIND[t.type ?? ""] ?? (t.type as ToastKind) ?? "done";

const rootVariants = cva(
  cn(
    "group/toast relative flex min-w-0 flex-1 bg-kl-inverse text-kl-on-inverse",
    // the swipe follows the pointer 1:1 (no transition while held); a released swipe that falls short springs back
    "[--kl-ts-x:var(--toast-swipe-movement-x,0px)] [--kl-ts-y:var(--toast-swipe-movement-y,0px)]",
    "data-swiping:duration-0! data-swiping:select-none",
    "data-limited:pointer-events-none data-limited:invisible data-limited:opacity-0",
    "data-kl-behind:not-data-expanded:*:pointer-events-none data-kl-behind:not-data-expanded:*:opacity-0",
  ),
  {
    variants: {
      placement: {
        /*
         * Collapsed, nothing leaves the cell (a dock never covers the rows above it): the front toast is in flow and
         * its +n cell counts the waiting ones. Expanded, they unfold upward from the dock's top keyline as one column
         * of ink cells on shared seams, newest nearest the dock, like any surface docked to its owner. The dock clips
         * its toasts (the wipe), so a focused toast's ring is drawn inside it.
         */
        dock: cn(
          "[transform:translateX(var(--kl-ts-x))] [clip-path:inset(0)]",
          "[transition:clip-path_var(--kl-t-unfold)_var(--kl-ease-out),transform_var(--kl-ts-move)_var(--kl-ts-ease),opacity_var(--kl-t-unfold)_linear]",
          "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-current focus-visible:outline-solid",
          "[&:is([data-starting-style],[data-ending-style])]:[clip-path:inset(0_100%_0_0)]",
          "kl-rtl:[&:is([data-starting-style],[data-ending-style])]:[clip-path:inset(0_0_0_100%)]",
          "data-ending-style:duration-(--kl-t-fold)",
          // a swiped toast leaves in the swipe's direction, unclipped (one attribute more than the RTL wipe above)
          "data-ending-style:data-swipe-direction:[&:is([data-swipe-direction=right],[data-swipe-direction=left])]:opacity-0",
          "data-ending-style:data-swipe-direction:[&:is([data-swipe-direction=right],[data-swipe-direction=left])]:[clip-path:inset(0)]",
          "not-data-kl-front:absolute not-data-kl-front:inset-x-0 not-data-kl-front:bottom-0 not-data-kl-front:h-(--toast-height,auto)",
          "not-data-kl-front:border-b-(length:--kl-k1) not-data-kl-front:border-b-kl-on-inverse",
          "not-data-kl-front:[transform:translate(var(--kl-ts-x),calc(-1*var(--toast-offset-y,0px)))]",
          "data-kl-behind:not-data-expanded:invisible data-kl-behind:not-data-expanded:opacity-0",
          "data-kl-behind:not-data-expanded:[transform:translateY(0)] data-kl-behind:data-expanded:z-3",
          "forced-colors:border forced-colors:border-[CanvasText]",
        ),
        /*
         * Collapsed: the newest toast in front, an ink 2px frame. Older ones wait behind it as paper cards with an ink
         * frame, as tall as the front one, each lifted by --kl-ts-peek and inset 8px a side, so their top keylines
         * step up behind it: a count you can see, with no scaling (a scaled 2px keyline blurs) and no shadow.
         * Expanded (hover or keyboard focus, Base UI): every card turns into its toast and the stack fans out into a
         * column, --kl-ts-gap apart, newest at the bottom. In from below and out the same way; a swiped toast leaves
         * in the swipe's direction.
         */
        floating: cn(
          "absolute inset-x-[calc(var(--kl-ts-i)*8px)] bottom-0 z-[calc(10-var(--kl-ts-i))] box-border [--kl-ts-i:var(--toast-index,0)]",
          "h-(--toast-frontmost-height,auto) border-(length:--kl-k2) border-kl-inverse",
          "[transform:translate(var(--kl-ts-x),calc(var(--kl-ts-y)-var(--kl-ts-i)*var(--kl-ts-peek)))]",
          "[transition:transform_var(--kl-ts-move)_var(--kl-ts-ease),inset-inline_var(--kl-ts-move)_var(--kl-ts-ease),height_var(--kl-ts-move)_var(--kl-ts-ease),background-color_var(--kl-t-unfold)_linear,border-color_var(--kl-t-unfold)_linear,opacity_var(--kl-ts-move)_linear]",
          "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-out) focus-visible:outline-kl-focus focus-visible:outline-solid",
          // the front toast keeps its own height (it is what was measured as the frontmost)
          "data-kl-front:not-data-expanded:h-auto",
          "data-kl-behind:not-data-expanded:border-kl-line data-kl-behind:not-data-expanded:bg-kl-cell",
          "forced-colors:data-kl-behind:not-data-expanded:border-[CanvasText]",
          "data-expanded:inset-x-0 data-expanded:h-(--toast-height,auto)",
          "[&[data-expanded]:not([data-starting-style],[data-ending-style])]:[transform:translate(var(--kl-ts-x),calc(var(--kl-ts-y)-var(--toast-offset-y,0px)-var(--kl-ts-i)*var(--kl-ts-gap)))]",
          // the gap between fanned-out toasts still counts as the stack: the pointer crossing it keeps it open
          "data-expanded:after:absolute data-expanded:after:inset-x-0 data-expanded:after:top-full data-expanded:after:h-[calc(var(--kl-ts-gap)+2px)]",
          "[&:is([data-starting-style],[data-ending-style])]:[transform:translate(var(--kl-ts-x),calc(100%+16px))]",
          "data-ending-style:opacity-0",
          "data-ending-style:data-[swipe-direction=right]:[transform:translate(calc(var(--kl-ts-x)+100%+16px),var(--kl-ts-y))]",
          "data-ending-style:data-[swipe-direction=left]:[transform:translate(calc(var(--kl-ts-x)-100%-16px),var(--kl-ts-y))]",
          "data-ending-style:data-[swipe-direction=down]:[transform:translate(var(--kl-ts-x),calc(var(--kl-ts-y)+100%+16px))]",
        ),
      },
    },
  },
);

type ToastRootProps = React.ComponentProps<typeof Toast.Root>;

/**
 * One message: Base UI's Toast.Root, drawn for the viewport it is in. It marks its kind (data-kind: done, failed,
 * info, warning, loading), whether it is in front (data-kl-front) and whether it waits behind the front one
 * (data-kl-behind). It swipes away toward the inline end (a floating one also down) unless `swipeDirection` says
 * otherwise.
 */
function ToastRoot({ toast, className, swipeDirection, ...props }: ToastRootProps): React.ReactElement {
  const { placement, swipe } = React.useContext(ViewportContext);
  const m = Toast.useToastManager();
  // the front is the newest one on screen
  const front = m.toasts.find((t) => t.transitionStatus !== "ending" && !t.limited)?.id;
  const isFront = toast.id === front;
  const behind = !isFront && toast.transitionStatus !== "ending" && !toast.limited;
  return (
    <Toast.Root
      toast={toast}
      swipeDirection={swipeDirection ?? swipe}
      data-kind={kindOf(toast)}
      data-kl-front={isFront || undefined}
      data-kl-behind={behind || undefined}
      {...dataAttrs({ placement })}
      className={resolveClassName(cn(rootVariants({ placement })), className)}
      {...props}
      data-slot="toast-root"
    />
  );
}

function ToastTitle({ className, ...props }: Toast.Title.Props): React.ReactElement {
  return (
    <Toast.Title
      className={resolveClassName(
        "m-0 text-(length:--kl-text-body)/[1.3] font-(--kl-weight-strong) wrap-anywhere",
        className,
      )}
      {...props}
      data-slot="toast-title"
    />
  );
}

function ToastDescription({ className, ...props }: Toast.Description.Props): React.ReactElement {
  return (
    <Toast.Description
      className={resolveClassName("m-0 text-(length:--kl-text-label)/[1.35] font-normal wrap-anywhere", className)}
      {...props}
      data-slot="toast-description"
    />
  );
}

/* a button on the ink toast: its ring takes the toast's text colour, inside the cell */
const ring =
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-current focus-visible:outline-solid";

/** The action cell (Undo, Retry): paper on the ink toast, yellow on hover. A cell sets no border: the row of cells
 * draws the divider before it. */
function ToastAction({ className, ...props }: Toast.Action.Props): React.ReactElement {
  return (
    <Toast.Action
      className={resolveClassName(
        cn(
          "flex-none cursor-pointer bg-kl-cell px-3.5 font-(family-name:--kl-font) font-(--kl-weight-display) text-kl-ink",
          "hover:bg-kl-yellow hover:text-kl-on-yellow",
          ring,
        ),
        className,
      )}
      {...props}
      data-slot="toast-action"
    />
  );
}

/** The dismiss cell. It shows only an icon, so it needs a name. */
function ToastClose({
  className,
  children,
  ...props
}: Toast.Close.Props & { "aria-label": string }): React.ReactElement {
  return (
    <Toast.Close
      className={resolveClassName(
        cn(
          "grid w-10 flex-none cursor-pointer place-items-center bg-transparent text-inherit",
          "hover:bg-kl-on-inverse hover:text-kl-inverse",
          ring,
        ),
        className,
      )}
      {...props}
      data-slot="toast-close"
    >
      {children ?? (
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          aria-hidden
        >
          <path d="m4.5 4.5 7 7m0-7-7 7" />
        </svg>
      )}
    </Toast.Close>
  );
}

function Sig({ kind }: { kind: ToastKind }) {
  if (kind === "failed") return <>!</>;
  if (kind === "info") return <>i</>;
  if (kind === "warning") return <span className="kl-glyph" data-kind="attention" />;
  if (kind === "loading") return null;
  return (
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
  );
}

/* the countdown drains the bottom keyline; it pauses exactly when Base UI's timers do: the stack expanded (hover,
   keyboard focus), or the window losing focus (data-kl-paused). A pointer press inside does not pause the timer, so
   it does not pause the drain. */
const drain = cn(
  "absolute inset-x-0 bottom-0 h-[3px] origin-left bg-kl-yellow text-inherit kl-rtl:origin-right",
  "animate-[kl-drain_var(--kl-toast-t,6000ms)_linear_forwards]",
  "in-data-expanded:[animation-play-state:paused] in-data-kl-paused:[animation-play-state:paused]",
  "in-data-[kl-motion=reduce]:transform-none in-data-[kl-motion=reduce]:animate-none motion-reduce:animate-none",
  "forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none",
);

/** The manager's toasts, each composed from the parts: signal cell, title and description, the +n count, the action
 * and dismiss cells, and the countdown or the pending segment on the bottom keyline. */
function ToastList({ timeout }: { timeout: number }) {
  const m = Toast.useToastManager();
  const live = m.toasts.filter((t) => t.transitionStatus !== "ending");
  // the front is the newest one on screen; the count includes those over the limit (they come back in turn)
  const front = live.find((t) => !t.limited)?.id;
  return m.toasts.map((t) => {
    const kind = kindOf(t);
    const lasts = kind !== "loading" && t.timeout !== 0;
    return (
      <ToastRoot key={t.id} toast={t} style={{ "--kl-toast-t": `${t.timeout ?? timeout}ms` } as React.CSSProperties}>
        {/* a plain container, not Toast.Content: that part re-measures the root inside its own ResizeObserver, with
            flushSync, on the frame after it mounts; a toast arrives on the frame its host is re-laying out (the bulk
            bar, the pager), and that commit mid-delivery is a loop error in WebKit. The root measures itself on arrival */}
        {/* the toast's colour, not the ink the foundation gives a Keyline element with no Keyline ancestor (the root
            carries no kl- class) */}
        <div
          data-slot="toast-cells"
          className="kl-cells min-w-0 flex-1 text-inherit transition-opacity duration-(--kl-t-unfold) ease-linear [&>:not(:first-child)]:border-s-kl-on-inverse"
        >
          <span
            data-slot="toast-signal"
            className="grid w-10 flex-none place-items-center font-(--kl-weight-display) group-data-[kind=failed]/toast:bg-kl-red group-data-[kind=failed]/toast:text-kl-on-red"
            aria-hidden
          >
            <Sig kind={kind} />
          </span>
          <span data-slot="toast-text" className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-1.5">
            <ToastTitle />
            {t.description ? <ToastDescription /> : null}
          </span>
          {/* how many wait behind the front one, in the Code voice: the docked stack shows no peek (it never covers the
              rows above); expanded, every message is in view, so the cell leaves */}
          {t.id === front && live.length > 1 ? (
            <span
              data-slot="toast-more"
              className="kl-code grid min-w-10 flex-none place-items-center px-2 text-(length:--kl-text-meta) text-inherit group-data-expanded/toast:hidden"
            >
              <bdi dir="ltr" aria-hidden>
                +{live.length - 1}
              </bdi>
              <span className="kl-sr">{`${live.length - 1} more`}</span>
            </span>
          ) : null}
          {t.actionProps ? <ToastAction onClick={() => m.close(t.id)} /> : null}
          <ToastClose aria-label="Dismiss" />
        </div>
        {/* …but only on arrival, so a toast updated in place (a promise: loading → done with a description) kept
            its first height, and the expanded stack sized it from that stale --toast-height and clipped it. Once a
            toast has been updated, a hidden Toast.Content re-measures it: on mount, in the update's own commit, and
            on each later update through its MutationObserver (updateKey is its text) */}
        {t.updateKey ? <Toast.Content hidden>{t.updateKey}</Toast.Content> : null}
        {/* loading: the pending segment runs on the bottom keyline, and the signal cell stays empty (pending is a
            segment, never a spinner) */}
        {kind === "loading" ? (
          <span data-slot="toast-pending" className="kl-pending [--kl-bw:3px]" aria-hidden />
        ) : lasts ? (
          <span key={t.updateKey} data-slot="toast-drain" className={drain} aria-hidden />
        ) : null}
      </ToastRoot>
    );
  });
}

type ListViewportProps = Omit<ToastViewportProps, "placement" | "children"> & {
  /** The countdown's length for a toast that names no timeout: the provider's `timeout` (default 6000). */
  timeout?: number;
};

/**
 * DOCKED feedback: the viewport inside a host cell (e.g. the table pager), rendering the manager's toasts. The front
 * message fills the cell and counts the ones waiting (+2); hovering or focusing the dock unfolds them upward on shared
 * seams. The undo countdown drains the bottom keyline and pauses with the timers. Swipe toward the inline end to
 * dismiss.
 */
function ToastDock({ timeout = 6000, ...props }: ListViewportProps): React.ReactElement {
  return (
    <ToastViewport placement="dock" {...props}>
      <ToastList timeout={timeout} />
    </ToastViewport>
  );
}

/**
 * Floating fallback for pages without a dock, at the bottom inline-end corner. The newest message is in front
 * (an ink 2px frame); older ones wait behind it as paper cards whose top keylines peek above it. Hover or
 * keyboard focus fans the stack out into a column and pauses every timer. Swipe down or toward the inline end
 * to dismiss.
 */
function ToastFloating({ timeout = 6000, ...props }: ListViewportProps): React.ReactElement {
  return (
    <ToastViewport placement="floating" {...props}>
      <ToastList timeout={timeout} />
    </ToastViewport>
  );
}

export {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastDock,
  ToastFloating,
  useToast,
  useToaster,
  createToaster,
  type Notify,
  type ToastKind,
};
