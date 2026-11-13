import { DocsShell } from "@site/components/docs-shell";
import { CropMarks } from "@site/components/land";

/**
 * The sheet and Keyline's AppShell for every docs page (the guides and each component). It is a layout, not part of each page, so it
 * stays mounted across navigation: the index keeps its scroll, and the Nav's band stretches from the page
 * left to the page chosen instead of being drawn anew on a fresh Nav.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="s-sheet s-docsheet">
      <a
        href="#main"
        className="absolute start-2 top-2 z-10 -translate-y-[200%] border-2 border-kl-line bg-kl-cell px-3.5 py-2.5 text-[14px] font-bold text-kl-ink no-underline focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <CropMarks />
      <DocsShell>{children}</DocsShell>
    </div>
  );
}
