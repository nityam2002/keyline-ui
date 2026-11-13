"use client";

import * as React from "react";

const noop = () => () => {};

/**
 * The homepage's install strip: the two commands, in the order they work. No component is picked out; `<name>` is any item. `@keyline-ui` is not a name the shadcn CLI knows on
 * its own (it is not in shadcn's public directory), so the add step only works after the mapping.
 * `slot` stands for the site's origin when the build did not know it (registry.ts); the browser fills it in.
 */
export function HomeInstall({ map, add, slot }: { map: string; add: string; slot: string }) {
  const origin = React.useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => null,
  );
  const steps = [map.replaceAll(slot, origin ?? slot), add];
  return (
    <div className="flex min-w-0 items-stretch border-2 border-kl-line bg-kl-paper" data-testid="home-install">
      <ol className="m-0 min-w-0 flex-1 list-none p-0" aria-label="Install Keyline">
        {steps.map((code, i) => (
          <li key={i} className="flex min-w-0 items-stretch border-kl-seam not-first:border-t">
            <span
              className="flex w-8 shrink-0 items-center justify-center border-e border-kl-seam font-kl-mono text-[12px] text-kl-ink-3"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <code className="flex min-w-0 flex-1 items-center px-2.5 py-[9px] font-kl-mono text-[12px]/[1.5] [overflow-wrap:anywhere]">
              {code}
            </code>
          </li>
        ))}
      </ol>
    </div>
  );
}
