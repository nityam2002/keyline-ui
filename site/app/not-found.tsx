import type { Metadata } from "next";
import Link from "next/link";
import "./keyline-trace.css";
import { CropMarks, Mark } from "@site/components/land";
import { SiteControls } from "@site/components/site-controls";
import { KeylineTrace, LostPath } from "@site/components/keyline-trace";

// a 404 is never indexed; said here too so the root layout's production "index" doesn't sit beside Next's noindex
export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

/* Sheet 404. The same printed sheet as sheet 1 (keyline frame, crop marks, title block), held to one screen. The
   head is one strip at every width: the mark (home) at the start, the site controls at the end, and below them the
   heading with the address that led here. The land is drawn, and one contour on it is the keyline home: trace it
   from 404 to Sheet 1 (components/keyline-trace). The way out without the game is in the title block. */
export default function NotFound() {
  return (
    <main id="main" className="s-sheet s-home s-lost">
      <CropMarks />
      <div className="s-frame">
        <header className="s-kt-head">
          <div className="s-kt-bar">
            <Link href="/" className="s-mark text-kl-ink">
              <Mark />
              Keyline UI
            </Link>
            <SiteControls />
          </div>
          <h1 className="s-title">Off the map.</h1>
          <LostPath />
        </header>
        <KeylineTrace />
      </div>
    </main>
  );
}
