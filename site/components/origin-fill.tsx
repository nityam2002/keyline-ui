"use client";

import * as React from "react";
import { CodeScroll } from "./code-scroll";
import { CopyButton } from "./copy-button";

const noop = () => () => {};
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * A code block whose command names this site (registry.ts ORIGIN_SLOT). The HTML was highlighted with
 * `sentinel` in the slot's place; the browser puts the page's own origin there, the server HTML the slot.
 */
export function OriginFill({
  html,
  code,
  sentinel,
  slot,
  label,
  copyLabel,
  after,
  tall,
}: {
  html: string;
  code: string;
  sentinel: string;
  slot: string;
  label: string;
  copyLabel: string;
  after?: string;
  tall?: boolean;
}) {
  const origin = React.useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => null,
  );
  return (
    <>
      <CodeScroll html={html.replaceAll(sentinel, escape(origin ?? slot))} label={label} tall={tall} />
      <CopyButton text={origin ? code.replaceAll(slot, origin) : code} label={copyLabel} after={after} />
    </>
  );
}
