import { codeToHtml } from "shiki";

/**
 * Server-side highlighting with Shiki's GitHub themes, both at once: every token carries `--shiki-light` and
 * `--shiki-dark`, and CodeBlock picks one by the site's theme class, so code follows a theme switch without
 * re-highlighting. The block's background is the page's own surface, not the theme's.
 */
export function highlight(code: string, lang: "tsx" | "bash" | "json" | "css" | "text") {
  return codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "github-light-default", dark: "github-dark-default" },
    defaultColor: false,
    // The scroll viewport is already a keyboard stop.
    tabindex: false,
    transformers: [
      {
        pre(node) {
          this.addClassToHast(
            node,
            "m-0 py-4 ps-[18px] pe-[88px] font-kl-mono text-[13.5px]/[1.65] [tab-size:2] max-[721px]:ps-3.5 max-[721px]:text-[12.5px]",
          );
          if (lang === "bash") this.addClassToHast(node, "before:text-kl-ink-3 before:content-['$_']");
        },
      },
    ],
  });
}
