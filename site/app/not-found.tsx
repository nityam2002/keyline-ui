import type { Metadata } from "next";
import "./keyline-trace.css";
import { CropMarks } from "@site/components/land";
import { SiteControls } from "@site/components/site-controls";
import { KeylineTrace } from "@site/components/keyline-trace";

// a 404 is never indexed; said here too so the root layout's production "index" doesn't sit beside Next's noindex
export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

/* Sheet 404. The same printed sheet as sheet 1 (keyline frame, crop marks, title block), held to one screen. The
   land is drawn, and one contour on it is the keyline home: trace it from 404 to Sheet 1 (components/keyline-trace).
   The way out without the game (sheet 1, search) is in the title block from the first frame. */
export default function NotFound() {
  return (
    <main id="main" className="s-sheet s-home s-lost">
      <CropMarks />
      <div className="s-frame">
        <h1 className="s-title">Off the map.</h1>
        <SiteControls className="s-site-ctl" />
        <KeylineTrace />
      </div>
    </main>
  );
}
