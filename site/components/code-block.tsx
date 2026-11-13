import { highlight } from "@site/lib/highlight";
import { CopyButton } from "./copy-button";
import { CodeScroll } from "./code-scroll";
import { OriginFill } from "./origin-fill";
import { ORIGIN_SENTINEL, ORIGIN_SLOT } from "@site/lib/registry";

/**
 * Highlighted on the server; the Copy button copies the exact source string. A one-line shell command wraps at its spaces
 * (a hanging indent under the prompt) rather than scrolling under Copy. Code that scrolls sideways keeps its lines;
 * its scrollbar is inset from the frame's edges, so it reads as a scrollbar, not a second border. `tall` caps the height (it scrolls).
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
      className="s-cb group/code relative mt-4 min-w-0 border-2 border-kl-line-soft bg-kl-cell [--s-cb-top:initial] in-[.s-demo-code]:mt-0 in-[.s-demo-code]:border-0 data-[single]:has-[[data-has-overflow-x]]:[--s-cb-top:calc(50%-6px)] [&_.shiki]:text-(--shiki-light) in-[.dark]:[&_.shiki]:text-(--shiki-dark) [&_.shiki_span]:text-(--shiki-light) in-[.dark]:[&_.shiki_span]:text-(--shiki-dark) not-data-[tall]:[&_[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:mx-[18px] not-data-[tall]:[&_[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:mb-1.5 max-[721px]:not-data-[tall]:[&_[data-slot=scroll-area-scrollbar][data-orientation=horizontal]]:mx-3.5 not-data-[tall]:has-[[data-has-overflow-x]]:[&_pre]:pb-2 data-[cmd]:[&_pre]:ps-[calc(18px+2ch)] data-[cmd]:[&_pre]:-indent-[2ch] data-[cmd]:[&_pre]:[overflow-wrap:break-word] data-[cmd]:[&_pre]:whitespace-pre-wrap max-[721px]:data-[cmd]:[&_pre]:ps-[calc(0.875rem+2ch)] [.s-cb+&]:mt-3 in-[.s-demo-code]:[.s-cb+&]:mt-0 in-[.s-demo-code]:[.s-cb+&]:border-t-(length:--kl-k1) in-[.s-demo-code]:[.s-cb+&]:border-t-kl-line-soft"
      data-single={single ? "" : undefined}
      data-cmd={single && lang === "bash" ? "" : undefined}
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
