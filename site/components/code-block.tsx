import { highlight } from "@site/lib/highlight";
import { CopyButton } from "./copy-button";
import { CodeScroll } from "./code-scroll";
import { OriginFill } from "./origin-fill";
import { ORIGIN_SENTINEL, ORIGIN_SLOT } from "@site/lib/registry";

/**
 * Highlighted on the server; the Copy button copies the exact source string. `tall` caps the height (it scrolls).
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
      className="s-cb group/code relative mt-4 min-w-0 border-2 border-kl-line-soft bg-kl-cell [--s-cb-top:initial] in-[.s-demo-code]:mt-0 in-[.s-demo-code]:border-0 data-[single]:has-[[data-has-overflow-x]]:[--s-cb-top:calc(50%-6px)] [&_.shiki]:text-(--shiki-light) in-[.dark]:[&_.shiki]:text-(--shiki-dark) [&_.shiki_span]:text-(--shiki-light) in-[.dark]:[&_.shiki_span]:text-(--shiki-dark) [.s-cb+&]:mt-3"
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
        />
      ) : (
        <>
          <CodeScroll html={html} label={copyLabel.charAt(0).toUpperCase() + copyLabel.slice(1)} tall={tall} />
          <CopyButton text={code} label={copyLabel} after={after} />
        </>
      )}
    </div>
  );
}
