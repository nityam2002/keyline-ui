import Link from "next/link"
import type { TocGroup } from "./page-toc"
import { DocToc } from "./doc-toc"
import { sheet } from "@site/lib/catalog"

/** A neighbour in the title block; on a phone the two share the row and wrap their label under "Previous"/"Next". */
const LINK =
  "flex items-center px-5 text-[14px] font-bold text-kl-ink no-underline transition-[background-color] duration-150 ease-out hover:bg-kl-paper motion-reduce:transition-none focus-visible:outline-offset-[-4px] max-[521px]:flex-1 max-[521px]:basis-0 max-[521px]:flex-wrap max-[521px]:content-center max-[521px]:gap-y-0.5 max-[521px]:px-3.5 max-[521px]:py-2"

/**
 * One component page's content, inside the docs layout's sheet and AppShell: the page, its index (sent to
 * the shell's aside), and the title block at the foot: the sheet's number in the set, and the neighbouring
 * written pages.
 */
export function DocPage({ name, toc, children }: { name: string; toc: TocGroup[]; children: React.ReactNode }) {
  const s = sheet(name)
  return (
    <>
      <DocToc toc={toc} />
      {children}
      <footer className="-mx-(--s-read-px) mt-auto flex min-h-12 max-w-none items-stretch border-t-3 border-kl-line bg-kl-cell [&>*+*]:border-s [&>*+*]:border-kl-seam">
        <span className="m-0 flex items-center px-5 max-[521px]:hidden font-kl-mono text-[12px] text-kl-ink-3">
          Sheet {s.n} of {s.of}
        </span>
        {s.prev ? (
          <Link href={s.prev.href!} rel="prev" className={LINK}>
            <span className="me-2 font-kl-mono text-[12px] font-normal text-kl-ink-3 max-[521px]:basis-full">Previous</span>
            {s.prev.name}
          </Link>
        ) : (
          <Link href="/" className={LINK}>
            Keyline UI home
          </Link>
        )}
        {s.next ? (
          <Link href={s.next.href!} rel="next" className={`${LINK} ms-auto max-[521px]:justify-end`}>
            <span className="me-2 font-kl-mono text-[12px] font-normal text-kl-ink-3 max-[521px]:basis-full max-[521px]:text-end">Next</span>
            {s.next.name}
          </Link>
        ) : null}
      </footer>
    </>
  )
}
