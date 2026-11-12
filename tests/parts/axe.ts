// axe-core over a rendered part. Only violations fail; axe's "incomplete" results (a contrast it cannot compute
// over an image, say) are not failures.
import axe from "axe-core";
import { expect } from "vitest";

function describeViolations(violations: axe.Result[]): string {
  return violations
    .map(
      (v) =>
        `${v.id} (${v.impact ?? "no impact"}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`,
    )
    .join("\n");
}

/* Excluding the guards keeps axe from judging them, not from counting them as children of their parent. Base UI
   renders them where the popup's portal is written, so a menubar's menus put them inside the menubar, where (in
   WebKit, as role="button") they fail aria-required-children. A violation whose only disallowed children are guards
   is Base UI's, not the part's. */
function guardsOnly(v: axe.Result): boolean {
  return (
    v.id === "aria-required-children" &&
    v.nodes.every((n) => {
      const el = document.querySelector(String(n.target[0]));
      const buttons = el ? [...el.querySelectorAll(":scope > [role=button]")] : [];
      return (
        (n.failureSummary ?? "").trim().endsWith("not allowed: [role=button]") &&
        buttons.length > 0 &&
        buttons.every((b) => b.hasAttribute("data-base-ui-focus-guard"))
      );
    })
  );
}

/**
 * Fails with every violation axe finds inside `container` (default: the whole document). Mount the part inside
 * a `<main>`: the `region` rule expects content inside a landmark, which is the consuming page's job. `exclude`
 * leaves out elements whose markup is Base UI's in the state being judged (say why at the call).
 */
export async function expectNoAxeViolations(
  container: Element = document.body,
  exclude: Element[] = [],
): Promise<void> {
  // Base UI's focus guards (around an open popup's portal) are its own: in Safari they carry role="button", so
  // VoiceOver can reach them, without a name. They are not the part's markup, so axe does not judge them.
  const { violations } = await axe.run(
    { include: [container], exclude: ["[data-base-ui-focus-guard]", ...exclude] },
    { resultTypes: ["violations"] },
  );
  const judged = violations.filter((v) => !guardsOnly(v));
  expect(judged, describeViolations(judged)).toHaveLength(0);
}
