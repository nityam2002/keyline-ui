"use client";

import * as React from "react"
import { Toast } from "@base-ui/react/toast"

import { cn } from "@/lib/utils"
import { scopeProps, useDomDirection, useKeylineScope, useMergedRef } from "../lib/keyline-scope"

/**
 * Wrap the app once. Up to `limit` (3) messages stay at once, newest in front; older ones wait behind it as a
 * stack and come forward as the newer ones close. Pass `toastManager={toaster}` (from
 * `createToaster()`) to raise messages from outside React too.
 */
function ToastProvider({ timeout = 6000, limit = 3, ...props }: React.ComponentProps<typeof Toast.Provider>) {
  return <Toast.Provider timeout={timeout} limit={limit} {...props} />
}

/** Keyline's kinds. Base UI's own `success` and `error` (what its promise tracking sets) draw as done and failed. */
type ToastKind = "done" | "failed" | "info" | "warning" | "loading"

type Notify = {
  title: React.ReactNode
  /** A second line: what happened to what, or what to do next. Announced with the title. */
  description?: React.ReactNode
  /**
   * done (default) · failed (red ! cell, announced urgently) · info · warning (attention glyph on the ink toast;
   * red stays for failure) · loading (the pending segment on the bottom keyline; it stays until updated or dismissed)
   */
  type?: ToastKind
  /** One action cell (Undo, Retry, Open). It closes the toast after it runs. */
  action?: { label: string; onClick: () => void }
  /** ms; 0 keeps the toast until it is dismissed. Loading toasts never time out. */
  timeout?: number
}

type Track<T> = {
  loading: string | Notify
  done: string | Notify | ((value: T) => string | Notify)
  failed: string | Notify | ((error: unknown) => string | Notify)
}

type Manager = Pick<ReturnType<typeof Toast.createToastManager>, "add" | "close" | "update" | "promise">

const toOptions = ({ title, description, type = "done", action, timeout }: Notify) => ({
  title,
  description,
  type,
  ...(type === "loading" ? { timeout: 0 } : timeout !== undefined ? { timeout } : null),
  priority: (type === "failed" ? "high" : "low") as "high" | "low",
  // the toast list closes the toast after any action runs
  actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
})
const resolve = <V,>(o: string | Notify | ((v: V) => string | Notify), v: V, type: ToastKind) => {
  const r = typeof o === "function" ? o(v) : o
  return toOptions(typeof r === "string" ? { title: r, type } : { type, ...r })
}

/** The calls Keyline adds over a Base UI toast manager: the same functions inside and outside React. */
function bind(m: Manager) {
  /** `notify({ title, description, type, action })`; returns the toast's id. */
  const notify = (n: Notify): string => m.add(toOptions(n))
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
      const o = toOptions({ title: undefined, ...n })
      // every update restarts the drain (it is keyed on updateKey), so it always names a timeout, which makes
      // Base UI restart the timer with it: the bar and the dismissal stay in step
      m.update(id, (prev) => ({
        ...("title" in n ? { title: o.title } : null),
        ...("description" in n ? { description: o.description } : null),
        // leaving loading restores the provider's timeout unless one is given
        ...("type" in n ? { type: o.type, priority: o.priority, timeout: n.type === "loading" ? 0 : n.timeout } : { timeout: "timeout" in n ? n.timeout : prev.timeout }),
        ...("action" in n ? { actionProps: o.actionProps } : null),
      }))
    },
    /** Closes one toast, or every toast without an id. */
    dismiss: (id?: string) => m.close(id),
  }
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
  const m = Toast.createToastManager()
  // Keyline's promise and update take Keyline's options and call Base UI's underneath: bound to a copy of the
  // manager's own methods, so replacing them on the manager does not make them call themselves
  return Object.assign(m, bind({ ...m }))
}

/** `notify({ title, type, action })`. The action closes the toast after it runs. */
function useToast() {
  const m = Toast.useToastManager()
  return React.useCallback((n: Notify) => m.add(toOptions(n)), [m])
}

/** notify, promise, update and dismiss for the nearest ToastProvider. */
function useToaster() {
  const m = Toast.useToastManager()
  return React.useMemo(() => bind(m), [m])
}

const KIND: Record<string, ToastKind> = { success: "done", error: "failed" }

function Sig({ kind }: { kind: ToastKind }) {
  if (kind === "failed") return <>!</>
  if (kind === "info") return <>i</>
  if (kind === "warning") return <span className="kl-glyph" data-kind="attention" />
  if (kind === "loading") return null
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square">
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  )
}

/**
 * The stack, on Base UI's own stacking: it numbers the toasts (--toast-index), measures them
 * (--toast-height, --toast-offset-y, the viewport's --toast-frontmost-height), expands the viewport on hover
 * and keyboard focus (data-expanded, timers paused), and tracks swipes (--toast-swipe-movement-*). Keyline only
 * marks which toast is in front and how many wait behind it; the CSS draws the rest.
 */
function ToastList({ timeout, swipe }: { timeout: number; swipe: ("up" | "down" | "left" | "right")[] }) {
  const m = Toast.useToastManager()
  const live = m.toasts.filter((t) => t.transitionStatus !== "ending")
  // the front is the newest one on screen; the count includes those over the limit (they come back in turn)
  const front = live.find((t) => !t.limited)?.id
  return m.toasts.map((t) => {
    const kind = KIND[t.type ?? ""] ?? (t.type as ToastKind) ?? "done"
    const lasts = kind !== "loading" && t.timeout !== 0
    const isFront = t.id === front
    const behind = !isFront && t.transitionStatus !== "ending" && !t.limited
    return (
      <Toast.Root
        key={t.id}
        toast={t}
        swipeDirection={swipe}
        className="kl-toast"
        style={{ "--kl-toast-t": `${t.timeout ?? timeout}ms` } as React.CSSProperties}
        data-kind={kind}
        data-kl-front={isFront || undefined}
        data-kl-behind={behind || undefined}
      >
        {/* a plain container, not Toast.Content: that part re-measures the root inside its own ResizeObserver, with
            flushSync, on the frame after it mounts; a toast arrives on the frame its host is re-laying out (the bulk
            bar, the pager), and that commit mid-delivery is a loop error in WebKit. The root measures itself on arrival */}
        <div className="kl-cells kl-toast-cells">
          <span className="kl-toast-sig" aria-hidden>
            <Sig kind={kind} />
          </span>
          <span className="kl-toast-text">
            <Toast.Title className="kl-toast-title" />
            {t.description ? <Toast.Description className="kl-toast-desc" /> : null}
          </span>
          {/* how many wait behind the front one: the docked stack shows no peek (it never covers the rows above) */}
          {isFront && live.length > 1 ? (
            <span className="kl-code kl-toast-more">
              <bdi dir="ltr" aria-hidden>+{live.length - 1}</bdi>
              <span className="kl-sr">{`${live.length - 1} more`}</span>
            </span>
          ) : null}
          {t.actionProps ? <Toast.Action className="kl-toast-action" onClick={() => m.close(t.id)} /> : null}
          <Toast.Close className="kl-toast-x" aria-label="Dismiss">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
              <path d="m4.5 4.5 7 7m0-7-7 7" />
            </svg>
          </Toast.Close>
        </div>
        {/* …but only on arrival, so a toast updated in place (a promise: loading → done with a description) kept
            its first height, and the expanded stack sized it from that stale --toast-height and clipped it. Once a
            toast has been updated, a hidden Toast.Content re-measures it: on mount, in the update's own commit, and
            on each later update through its MutationObserver (updateKey is its text) */}
        {t.updateKey ? <Toast.Content className="kl-toast-measure" hidden>{t.updateKey}</Toast.Content> : null}
        {kind === "loading" ? <span className="kl-pending kl-toast-pending" aria-hidden /> : lasts ? <span key={t.updateKey} className="kl-toast-drain" aria-hidden /> : null}
      </Toast.Root>
    )
  })
}

/** Base UI pauses toast timers while the window is blurred; the drain follows that (it drained to empty on
 * a background window while the toast stayed, so the countdown lied about the time left). */
function useWindowBlurred() {
  const [blurred, setBlurred] = React.useState(false)
  React.useEffect(() => {
    const on = () => setBlurred(true)
    const off = () => setBlurred(false)
    addEventListener("blur", on)
    addEventListener("focus", off)
    return () => {
      removeEventListener("blur", on)
      removeEventListener("focus", off)
    }
  }, [])
  return blurred
}

/**
 * DOCKED feedback: renders the viewport INSIDE a host cell (e.g. the table pager), so a message never
 * covers data. The front message fills the cell and counts the ones waiting (+2); hovering or focusing the
 * dock unfolds them upward on shared seams. The undo countdown drains the bottom keyline and pauses with
 * the timers. Swipe toward the inline end to dismiss.
 */
function ToastDock({ className, timeout = 6000, ref: refProp, ...props }: React.ComponentProps<typeof Toast.Viewport> & { timeout?: number }) {
  const paused = useWindowBlurred()
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [dir] = useDomDirection(ref)
  const setRef = useMergedRef(ref, refProp)
  return (
    <Toast.Viewport ref={setRef} data-slot="toast-dock" data-kl-paused={paused || undefined} className={cn("kl-toast-dock", className)} {...props}>
      <ToastList timeout={timeout} swipe={[dir === "rtl" ? "left" : "right"]} />
    </Toast.Viewport>
  )
}

/**
 * Floating fallback for pages without a dock, at the bottom inline-end corner. The newest message is in front
 * (an ink 2px frame); older ones wait behind it as paper cards whose top keylines peek above it. Hover or
 * keyboard focus fans the stack out into a column and pauses every timer. Swipe down or toward the inline end
 * to dismiss.
 */
function ToastFloating({ className, timeout = 6000, ...props }: React.ComponentProps<typeof Toast.Viewport> & { timeout?: number }) {
  const [marker, scope] = useKeylineScope()
  const paused = useWindowBlurred()
  return (
    <>
      {marker}
      <Toast.Portal>
        <div {...scopeProps(scope)}>
          <Toast.Viewport data-slot="toast-floating" data-kl-paused={paused || undefined} className={cn("kl-toast-floating", className)} {...props}>
            <ToastList timeout={timeout} swipe={["down", scope.dir === "rtl" ? "left" : "right"]} />
          </Toast.Viewport>
        </div>
      </Toast.Portal>
    </>
  )
}

export { ToastProvider, ToastDock, ToastFloating, useToast, useToaster, createToaster, type Notify, type ToastKind }
