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

/**
 * Fails with every violation axe finds inside `container` (default: the whole document). Mount the part inside
 * a `<main>`: the `region` rule expects content inside a landmark, which is the consuming page's job.
 */
export async function expectNoAxeViolations(container: Element = document.body): Promise<void> {
  const { violations } = await axe.run(container, { resultTypes: ["violations"] });
  expect(violations, describeViolations(violations)).toHaveLength(0);
}
