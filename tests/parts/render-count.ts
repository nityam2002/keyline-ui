// Counts renders per component across commits, through React's devtools hook. Import this module before
// anything that loads react-dom: the renderer reads the hook once, when it loads.
//
//   const renders = countRenders()
//   ...interact...
//   expect(renders.count("TableRow")).toBe(1)

interface Fiber {
  tag: number;
  type: { displayName?: string; name?: string; render?: { name?: string } } | null;
  flags: number;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
}

const FUNCTION_COMPONENT = 0;
const FORWARD_REF = 11;
const SIMPLE_MEMO_COMPONENT = 15;
const PERFORMED_WORK = 1;

const counts = new Map<string, number>();
let injected = false;

function componentName(fiber: Fiber): string | null {
  if (fiber.tag !== FUNCTION_COMPONENT && fiber.tag !== FORWARD_REF && fiber.tag !== SIMPLE_MEMO_COMPONENT) return null;
  const type = fiber.type;
  return type?.displayName ?? type?.name ?? type?.render?.name ?? null;
}

function countCommit(fiber: Fiber | null): void {
  for (let node = fiber; node !== null; node = node.sibling) {
    const name = componentName(node);
    if (name && node.flags & PERFORMED_WORK) counts.set(name, (counts.get(name) ?? 0) + 1);
    // a bailed-out subtree keeps its previous fibers, and their flags are stale
    if (node.alternate === null || node.child !== node.alternate.child) countCommit(node.child);
  }
}

type DevtoolsHook = Record<string, unknown>;
const scope = globalThis as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: DevtoolsHook };
const hook: DevtoolsHook = {
  supportsFiber: true,
  renderers: new Map(),
  inject: () => {
    injected = true;
    return 1;
  },
  checkDCE: () => {},
  onScheduleFiberRoot: () => {},
  onCommitFiberUnmount: () => {},
  onPostCommitFiberRoot: () => {},
  onCommitFiberRoot: (_id: number, root: { current: Fiber }) => {
    countCommit(root.current);
  },
};
scope.__REACT_DEVTOOLS_GLOBAL_HOOK__ ??= hook;

export interface RenderCount {
  count(name: string): number;
  reset(): void;
  snapshot(): Record<string, number>;
}

/** Starts counting from zero. Throws when react-dom loaded before this module, so no count would be real. */
export function countRenders(): RenderCount {
  if (scope.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== hook) {
    throw new Error("render-count: another devtools hook is installed; import this module before react-dom");
  }
  if (!injected)
    throw new Error("render-count: react-dom did not inject into the hook; import this module before react-dom");
  counts.clear();
  return {
    count: (name) => counts.get(name) ?? 0,
    reset: () => counts.clear(),
    snapshot: () => Object.fromEntries(counts),
  };
}
