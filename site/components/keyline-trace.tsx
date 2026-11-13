"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/keyline/ui/button";
import { cn } from "@/lib/utils";
import { ACTION_BUTTONS } from "@site/lib/action-buttons";
import { Progress } from "@/components/keyline/ui/progress";
import { createTracer, f64, isIndex, nth, splineFlat, TENTHS, type Bump } from "@site/lib/contours";
import { Mark } from "@site/components/land";
import { PrimaryLink } from "@site/components/primary-link";
import { useSiteCommand } from "@site/components/site-command";

/* Sheet 404's game: follow the keyline home. The sheet's land (contours.ts) is drawn whole, reshaped a little each
   run by a few added hills, and one stretch of one contour is set as the keyline: hashed blue, from the 404 marker
   (where you are) to Sheet 1. Press the marker, hold, and trace the line without leaving its band. Reach Sheet 1 and
   the next line is longer and its band narrower; stray or let go and the same line waits for another try. */

const AREA = { x0: -230, y0: -230, x1: 1630, y1: 830 }; // the traced grid, less a margin (contours.ts G)
const STEP = 14; // field units between a contour's points (contours.ts SPACING)

type Pt = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number; upp: number };
type Run = {
  level: number;
  pts: Float64Array; // the keyline's points, flat, from the 404 marker to Sheet 1
  n: number;
  cum: Float64Array; // distance along the line to each point
  tol: number; // the band's half-width, in field units
  line: string;
  land: { plain: string; index: string };
};
type Phase = "ready" | "tracing" | "won" | "lost";
type End = { pct: number; ms: number; at?: Pt; why?: "off" | "release"; best?: boolean };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** one field unit per pixel on a wide sheet, more on a phone so a few hills still fit */
function boxFor(wpx: number, hpx: number): Box {
  let upp = Math.max(1, 460 / Math.min(wpx, hpx));
  upp = Math.min(upp, (AREA.x1 - AREA.x0) / wpx, (AREA.y1 - AREA.y0) / hpx);
  const w = wpx * upp,
    h = hpx * upp;
  return { x: clamp(700 - w / 2, AREA.x0, AREA.x1 - w), y: clamp(300 - h / 2, AREA.y0, AREA.y1 - h), w, h, upp };
}

/** each level: a longer line, a narrower band */
const bandPx = (level: number) => Math.max(10, 26 - 3 * (level - 1));
const lengthPx = (level: number) => 420 + 170 * (level - 1);

let tracer: ReturnType<typeof createTracer> | null = null;

function makeRun(box: Box, topSafe: number, level: number): Run {
  const r = Math.random,
    u = box.upp;
  const bumps: Bump[] = Array.from({ length: 4 }, () => {
    const a = r() * Math.PI;
    return {
      x: box.x + r() * box.w,
      y: box.y + r() * box.h,
      h: 50 + r() * 110,
      c: Math.cos(a),
      s: Math.sin(a),
      ra: 60 + r() * 90,
      rb: 45 + r() * 50,
    };
  });
  tracer ??= createTracer();
  const traced = tracer(bumps);
  const plain: string[] = [],
    index: string[] = [];
  for (const t of traced) (isIndex(t.level) ? index : plain).push(splineFlat(t.pts, t.pts.length / 2, t.closed));

  // stretches of contour that stay in open sight: inside the board, clear of the heading and the edges
  const m = 44 * u;
  const inside = (x: number, y: number) =>
    x > box.x + m && x < box.x + box.w - m && y > box.y + Math.max(topSafe, m) && y < box.y + box.h - m;
  const stretches: Pt[][] = [];
  for (const t of traced) {
    const n = t.pts.length / 2;
    const p = (k: number): Pt => ({ x: f64(t.pts, 2 * (k % n)), y: f64(t.pts, 2 * (k % n) + 1) });
    // a closed line is walked from a point outside, so no stretch is cut in two at its seam
    let s0 = 0;
    if (t.closed)
      for (let k = 0; k < n; k++)
        if (!inside(p(k).x, p(k).y)) {
          s0 = k;
          break;
        }
    let cur: Pt[] = [];
    for (let k = 0; k < (t.closed ? n + 1 : n); k++) {
      const q = p(s0 + k);
      if (inside(q.x, q.y)) cur.push(q);
      else if (cur.length) {
        stretches.push(cur);
        cur = [];
      }
    }
    if (cur.length) stretches.push(cur);
  }

  let want = lengthPx(level) * u;
  for (let tries = 0; tries < 8; tries++, want *= 0.85) {
    const picks: Pt[][] = [];
    for (const s of stretches) {
      const need = Math.ceil(want / STEP);
      if (s.length <= need) continue;
      for (let k = 0; k < 4; k++) {
        const a = Math.floor(r() * (s.length - need)),
          part = s.slice(a, a + need + 1);
        const first = nth(part, 0),
          last = nth(part, part.length - 1);
        const ends = Math.hypot(first.x - last.x, first.y - last.y);
        if (ends > 0.4 * want) picks.push(part);
      }
    }
    if (!picks.length) continue;
    // later levels take the twistiest of a few
    const turn = (q: Pt[]) => {
      let t = 0;
      for (let k = 2; k < q.length; k++) {
        const q0 = nth(q, k - 2),
          q1 = nth(q, k - 1),
          q2 = nth(q, k);
        const a1 = Math.atan2(q1.y - q0.y, q1.x - q0.x),
          a2 = Math.atan2(q2.y - q1.y, q2.x - q1.x);
        t += Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1)));
      }
      return t;
    };
    const few = Array.from({ length: Math.min(picks.length, 1 + 2 * (level - 1)) }, () =>
      nth(picks, Math.floor(r() * picks.length)),
    );
    let line = few.reduce((b, q) => (turn(q) > turn(b) ? q : b));
    // the line runs left to right more often than not: the way a reader's eye goes home
    if (r() < 0.7 && nth(line, 0).x > nth(line, line.length - 1).x) line = [...line].reverse();
    const pts = Float64Array.from(line.flatMap((q) => [q.x, q.y])),
      n = line.length;
    const cum = new Float64Array(n);
    for (let k = 1; k < n; k++) {
      const a = nth(line, k - 1),
        b = nth(line, k);
      cum[k] = f64(cum, k - 1) + Math.hypot(b.x - a.x, b.y - a.y);
    }
    return {
      level,
      pts,
      n,
      cum,
      tol: bandPx(level) * u,
      line: splineFlat(pts, n, false),
      land: { plain: plain.join(""), index: index.join("") },
    };
  }
  // no stretch long enough in sight (a very small board): a fresh land will have one
  return makeRun(box, topSafe, level);
}

/** the nearest point of the line to p, looking only a little behind and ahead of how far the trace has got, so a
 * loop of the line that passes close by cannot be used as a shortcut */
function nearest(run: Run, p: Pt, from: number, ahead: number) {
  let best = { at: from, d: Infinity };
  for (let k = Math.max(0, Math.floor(from) - 2); k < Math.min(run.n - 1, Math.floor(from) + ahead); k++) {
    const ax = f64(run.pts, 2 * k),
      ay = f64(run.pts, 2 * k + 1),
      bx = f64(run.pts, 2 * k + 2),
      by = f64(run.pts, 2 * k + 3);
    const dx = bx - ax,
      dy = by - ay,
      l2 = dx * dx + dy * dy;
    const t = l2 ? clamp(((p.x - ax) * dx + (p.y - ay) * dy) / l2, 0, 1) : 0;
    const d = Math.hypot(p.x - (ax + t * dx), p.y - (ay + t * dy));
    if (d < best.d) best = { at: k + t, d };
  }
  return best;
}
const pointAt = (run: Run, at: number): Pt => {
  const k = Math.min(run.n - 2, Math.floor(at)),
    t = at - k;
  const ax = f64(run.pts, 2 * k),
    ay = f64(run.pts, 2 * k + 1);
  return { x: ax + t * (f64(run.pts, 2 * k + 2) - ax), y: ay + t * (f64(run.pts, 2 * k + 3) - ay) };
};
const lengthAt = (run: Run, at: number) => {
  const k = Math.min(run.n - 2, Math.floor(at));
  const c = f64(run.cum, k);
  return c + (at - k) * (f64(run.cum, k + 1) - c);
};

type Record = { level: number; times: { [level: number]: number } };
const KEY = "kl-keyline-trace";
function readRecord(): Record {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (v && typeof v.level === "number") return v;
  } catch {}
  return { level: 0, times: {} };
}
const secs = (ms: number) => (ms / 1000).toFixed(1);

export function KeylineTrace() {
  const path = usePathname();
  const openSearch = useSiteCommand();
  const boardRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const primaryRef = React.useRef<HTMLButtonElement>(null);
  const topSafe = React.useRef(0);

  const [box, setBox] = React.useState<Box | null>(null);
  const [level, setLevel] = React.useState(1);
  const [run, setRun] = React.useState<Run | null>(null);
  const [phase, setPhase] = React.useState<Phase>("ready");
  const [at, setAt] = React.useState(0); // how far along the line the trace has got (a point index, fractional)
  const [hand, setHand] = React.useState<Pt | null>(null);
  const [end, setEnd] = React.useState<End | null>(null);
  const [now, setNow] = React.useState(0);
  const [nudge, setNudge] = React.useState(0); // a press away from the marker: the marker calls attention to itself
  const [record, setRecord] = React.useState<Record>({ level: 0, times: {} });
  const started = React.useRef(0);
  const atRef = React.useRef(0);
  const phaseRef = React.useRef<Phase>("ready");
  phaseRef.current = phase;
  const runRef = React.useRef<Run | null>(null);
  runRef.current = run;

  React.useEffect(() => setRecord(readRecord()), []);

  // the board's size decides how much land it shows. A new size lays out a new line, except mid-trace.
  React.useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    let last = "";
    const measure = () => {
      const rc = el.getBoundingClientRect();
      if (rc.width < 10 || rc.height < 10 || phaseRef.current === "tracing") return;
      const sig = `${Math.round(rc.width)}x${Math.round(rc.height)}`;
      if (sig === last) return;
      last = sig;
      const title = el.parentElement?.querySelector(".s-title")?.getBoundingClientRect();
      const next = boxFor(rc.width, rc.height);
      topSafe.current = title ? Math.max(0, title.bottom - rc.top + 28) * next.upp : 0;
      setBox(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  React.useEffect(() => {
    if (!box) return;
    // a line that still lies in sight stays (a font settling or a toolbar sliding away must not take it); only a
    // board that no longer shows it lays out a new one. The level is read, not depended on: newLine sets both.
    const m = 24 * box.upp;
    const fits = (r: Run) => {
      for (let k = 0; k < r.n; k++) {
        const x = f64(r.pts, 2 * k),
          y = f64(r.pts, 2 * k + 1);
        if (x < box.x + m || x > box.x + box.w - m || y < box.y + topSafe.current - m || y > box.y + box.h - m)
          return false;
      }
      return Math.abs(r.tol - bandPx(r.level) * box.upp) < 0.5;
    };
    if (runRef.current && fits(runRef.current)) return;
    setRun(makeRun(box, topSafe.current, level));
    setPhase("ready");
    setAt(0);
    setEnd(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  React.useEffect(() => {
    if (phase !== "tracing") return;
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, [phase]);
  React.useEffect(() => {
    if (phase === "won" || phase === "lost") primaryRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const newLine = (lv: number) => {
    if (!box) return;
    setLevel(lv);
    setRun(makeRun(box, topSafe.current, lv));
    setPhase("ready");
    setAt(0);
    setEnd(null);
  };
  const retry = () => {
    setPhase("ready");
    setAt(0);
    setEnd(null);
  };

  const toField = (cx: number, cy: number): Pt | null => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(cx, cy).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };
  const pct = (a: number) => (run ? Math.round((100 * lengthAt(run, a)) / f64(run.cum, run.n - 1)) : 0);

  const finish = (won: boolean, a: number, extra: Partial<End> = {}) => {
    if (!run) return;
    const ms = performance.now() - started.current;
    let best = false;
    if (won) {
      const prev = record.times[run.level];
      best = !prev || ms < prev;
      const next: Record = {
        level: Math.max(record.level, run.level),
        times: { ...record.times, [run.level]: prev && !best ? prev : ms },
      };
      setRecord(next);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
    }
    setEnd({ pct: won ? 100 : pct(a), ms, best, ...extra });
    phaseRef.current = won ? "won" : "lost";
    setPhase(phaseRef.current);
  };

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!run || phase !== "ready") return;
    const p = toField(e.clientX, e.clientY);
    if (!p) return;
    const s = pointAt(run, 0);
    if (Math.hypot(p.x - s.x, p.y - s.y) > run.tol * 1.8 + 8 * (box?.upp ?? 1)) {
      setNudge((n) => n + 1);
      return;
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    started.current = performance.now();
    setNow(started.current);
    atRef.current = 0;
    setAt(0);
    setHand(p);
    // moves can arrive before the next render: the handlers read the phase from here
    phaseRef.current = "tracing";
    setPhase("tracing");
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!run || phaseRef.current !== "tracing") return;
    const evs = e.nativeEvent.getCoalescedEvents?.() ?? [];
    const ahead = Math.ceil((3 * run.tol) / STEP) + 3;
    for (const ev of evs.length ? evs : [e.nativeEvent]) {
      const p = toField(ev.clientX, ev.clientY);
      if (!p) continue;
      const near = nearest(run, p, atRef.current, ahead);
      if (near.d > run.tol) {
        setHand(p);
        setAt(atRef.current);
        finish(false, atRef.current, { at: p, why: "off" });
        return;
      }
      atRef.current = Math.max(atRef.current, near.at);
      if (f64(run.cum, run.n - 1) - lengthAt(run, atRef.current) < run.tol * 0.6) {
        atRef.current = run.n - 1;
        setAt(atRef.current);
        setHand(null);
        finish(true, atRef.current);
        return;
      }
      setHand(p);
    }
    setAt(atRef.current);
  };
  const onUp = () => {
    if (phaseRef.current !== "tracing") return;
    finish(false, atRef.current, { why: "release" });
  };

  const u = box?.upp ?? 1;
  const start = run ? pointAt(run, 0) : null;
  const goal = run ? pointAt(run, run.n - 1) : null;
  let trail = "";
  if (run && at > 0) {
    trail = `M${run.pts[0]} ${run.pts[1]}`;
    for (let k = 1; k <= Math.min(run.n - 1, Math.floor(at)); k++) trail += `L${run.pts[2 * k]} ${run.pts[2 * k + 1]}`;
    const tip = pointAt(run, at);
    trail += `L${tip.x} ${tip.y}`;
  }
  const tip = run && at > 0 ? pointAt(run, at) : null;
  // the result plate sits on the side of the board the line is not on, so the line and the miss stay in view
  let plateAt: React.CSSProperties | undefined;
  if (run && box) {
    let cx = 0,
      cy = 0;
    for (let k = 0; k < run.n; k++) {
      cx += f64(run.pts, 2 * k);
      cy += f64(run.pts, 2 * k + 1);
    }
    const fx = (cx / run.n - box.x) / box.w,
      fy = (cy / run.n - box.y) / box.h;
    const top = topSafe.current / box.h;
    plateAt =
      box.w / box.upp > 760
        ? { left: fx < 0.5 ? "74%" : "26%", top: `${(100 * (1 + top)) / 2}%` }
        : fy < 0.55 + top / 2
          ? { left: "50%", top: "auto", bottom: 16, translate: "-50% 0" }
          : { left: "50%", top: `${100 * top}%`, translate: "-50% 0" };
  }
  const bestTime = record.times[level];
  const elapsed = phase === "tracing" ? now - started.current : (end?.ms ?? 0);
  const progress = phase === "ready" ? 0 : phase === "won" ? 100 : phase === "lost" ? (end?.pct ?? 0) : pct(at);

  let detail: string;
  if (phase === "ready")
    detail =
      level === 1
        ? "Press and hold 404, then trace the blue line to Sheet 1."
        : `A longer line, a narrower band.${bestTime ? ` Best ${secs(bestTime)} s.` : ""}`;
  else if (phase === "tracing") detail = `${secs(elapsed)} s`;
  else if (phase === "won") detail = `Home in ${secs(end!.ms)} s.${end?.best ? " Your best on this level." : ""}`;
  else
    detail = end?.why === "release" ? "You let go. Hold until Sheet 1." : "You left the band. Same line, another try.";

  return (
    <>
      <div ref={boardRef} className="s-kt-board" data-phase={phase}>
        <p className="sr-only">
          A tracing game for a pointer: press the 404 marker and follow the blue line to Sheet 1. The links below lead
          home without it.
        </p>
        {box && run && (
          <svg
            ref={svgRef}
            viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
            aria-hidden="true"
            focusable="false"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onLostPointerCapture={onUp}
          >
            <g transform={`scale(${1 / TENTHS})`}>
              <path className="s-contour" d={run.land.plain} />
              <path className="s-contour s-index" d={run.land.index} />
            </g>
            <g key={`${run.line.length}-${run.level}`} className="s-kt-run">
              <path
                className="s-kt-band"
                d={run.line}
                style={{ strokeWidth: 2 * bandPx(run.level) }}
                transform={`scale(${1 / TENTHS})`}
              />
              <path className="s-kt-line" d={run.line} transform={`scale(${1 / TENTHS})`} />
              {trail && <path className="s-kt-trail" d={trail} />}
              {phase === "lost" && end?.at && tip && (
                <g className="s-kt-miss">
                  <path d={`M${tip.x} ${tip.y}L${end.at.x} ${end.at.y}`} />
                  <path
                    d={`M${end.at.x - 6 * u} ${end.at.y - 6 * u}l${12 * u} ${12 * u}m0 ${-12 * u}l${-12 * u} ${12 * u}`}
                  />
                </g>
              )}
              {goal && (
                <g className="s-kt-goal" transform={`translate(${goal.x} ${goal.y}) scale(${u})`}>
                  <rect x={-9} y={-9} width={18} height={18} />
                  <text x={16} y={4}>
                    Sheet 1
                  </text>
                </g>
              )}
              {start && (
                <g className="s-kt-start" transform={`translate(${start.x} ${start.y}) scale(${u})`}>
                  {phase === "ready" && (
                    <circle key={nudge} className="s-kt-call" r={20} data-nudge={nudge > 0 || undefined} />
                  )}
                  <g transform="translate(-11 -11)">
                    <rect className="s-mark-plate" x="0" y="0" width="14" height="14" />
                    <path className="s-mark-frame" d="M3 3h19v19H3zM6 6v13h13V6z" fillRule="evenodd" />
                  </g>
                  <text x={-18} y={4} textAnchor="end">
                    404
                  </text>
                </g>
              )}
              {phase === "tracing" && hand && <circle className="s-kt-hand" cx={hand.x} cy={hand.y} r={5 * u} />}
            </g>
          </svg>
        )}

        {(phase === "won" || phase === "lost") && end && (
          <div className="s-kt-plate" data-tone={phase} role="status" style={plateAt}>
            <p className="s-kt-word">
              {phase === "won" ? "Home." : end.why === "release" ? "Let go." : "Off the line."}
            </p>
            <p className="s-kt-sub">
              {phase === "won" ? (
                <>
                  Level {run?.level} in {secs(end.ms)} s{end.best ? ", your best" : ""}. Level {(run?.level ?? 1) + 1}{" "}
                  is longer and narrower.
                </>
              ) : (
                <>
                  {end.pct}% of the way on level {run?.level}.
                </>
              )}
            </p>
            <div className={cn("s-kt-acts", ACTION_BUTTONS)}>
              {phase === "won" ? (
                <Button ref={primaryRef} variant="primary" onClick={() => newLine((run?.level ?? 1) + 1)}>
                  Next line
                </Button>
              ) : (
                <Button ref={primaryRef} variant="primary" onClick={retry}>
                  Try again
                </Button>
              )}
              <Button nativeButton={false} render={<Link href="/" />}>
                Go to sheet 1
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="s-block s-kt-block">
        <div className="s-tb-id">
          <Link href="/" className="s-mark text-kl-ink">
            <Mark />
            Keyline UI
          </Link>
          <p className="m-0 min-w-0 text-[14px]/[1.45] text-kl-ink-2">
            Nothing lives at <code className="font-kl-mono text-[13px] break-all text-kl-ink">{path}</code>. Search the
            docs, or go back to the homepage.
          </p>
        </div>
        <div className="s-kt-status">
          <Progress
            className="**:data-[slot=progress-label]:font-bold"
            label={
              <>
                Level {level}
                {record.level > 0 ? <span className="s-kt-best"> · best level {record.level}</span> : null}
              </>
            }
            value={progress}
            failed={phase === "lost"}
            failedText="Off the line"
            detail={detail}
          />
        </div>
        <div className={cn("s-tb-act s-kt-act **:data-[slot=button]:justify-center", ACTION_BUTTONS)}>
          <PrimaryLink href="/">Back to the homepage</PrimaryLink>
          <Button onClick={openSearch} className="items-center gap-2">
            <Search size={16} aria-hidden="true" />
            Search
          </Button>
        </div>
      </footer>
    </>
  );
}
