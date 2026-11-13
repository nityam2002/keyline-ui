import { highlight } from "@site/lib/highlight";
import { CopyButton } from "./copy-button";
import { CodeScroll } from "./code-scroll";
import { OriginFill } from "./origin-fill";
import { ORIGIN_SENTINEL, ORIGIN_SLOT } from "@site/lib/registry";

/**
 * Highlighted on the server; the Copy button copies the exact source string. A one-line command is a field with
 * Copy as its attached end cell; a longer block keeps Copy over its top end. `tall` caps the height (it scrolls).
 * Code that names this site through ORIGIN_SLOT gets the page's origin filled in by the browser.
 */
export async function CodeBlock({
  code,
  lang,
  copyLabel,
  after,
  tall,
}: {
  code: string;
  lang: "tsx" | "bash" | "json" | "css" | "text";
  copyLabel: string;
  after?: string;
  tall?: boolean;
}) {
  const filled = code.includes(ORIGIN_SLOT);
  const html = await highlight(filled ? code.replaceAll(ORIGIN_SLOT, ORIGIN_SENTINEL) : code, lang);
  const single = !code.trimEnd().includes("\n");
  return (
    <div
      className="s-cb group/code relative mt-4 min-w-0 border-2 border-kl-line-soft bg-kl-cell in-[.s-demo-code]:mt-0 in-[.s-demo-code]:border-0 data-[single]:grid data-[single]:grid-cols-[minmax(0,1fr)_auto] [&_.shiki]:text-(--shiki-light) in-[.dark]:[&_.shiki]:text-(--shiki-dark) [&_.shiki_span]:text-(--shiki-light) in-[.dark]:[&_.shiki_span]:text-(--shiki-dark) data-[single]:[&_pre]:ps-[calc(18px+2ch)] data-[single]:[&_pre]:pe-4 data-[single]:[&_pre]:-indent-[2ch] data-[single]:[&_pre]:[overflow-wrap:anywhere] data-[single]:[&_pre]:whitespace-pre-wrap max-[721px]:data-[single]:[&_pre]:ps-[calc(0.875rem+2ch)] [.s-cb+&]:mt-3"
      data-single={single ? "" : undefined}
      data-tall={tall ? "" : undefined}
    >
      {filled ? (
        <OriginFill
          html={html}
          code={code}
          sentinel={ORIGIN_SENTINEL}
          slot={ORIGIN_SLOT}
          label={copyLabel.charAt(0).toUpperCase() + copyLabel.slice(1)}
          copyLabel={copyLabel}
          after={after}
          tall={tall}
          cell={single}
        />
      ) : (
        <>
          <CodeScroll html={html} label={copyLabel.charAt(0).toUpperCase() + copyLabel.slice(1)} tall={tall} />
          <CopyButton text={code} label={copyLabel} after={after} cell={single} />
        </>
      )}
    </div>
  );
}
