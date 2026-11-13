import Link from "next/link";
import { CodeBlock } from "./code-block";
import { installCommand, sourceUrl } from "@site/lib/registry";

/** A page's Installation block: the shadcn command for its registry item, checked against the registry (site/public/r/registry.json) at build.
 *  The add step only works once @keyline-ui is mapped (the shadcn CLI does not know the name on its own), so the
 *  block says so where the reader copies the command, not only on the installation page. */
export function InstallCommand({ item }: { item: string }) {
  const source = sourceUrl(item);
  return (
    <>
      <CodeBlock
        code={installCommand(item)}
        lang="bash"
        copyLabel="install command"
        after="Run it in the folder that holds your components.json, once the @keyline-ui registry is mapped (see Installation)."
      />
      <p className="s-small">
        Run it where your <code>components.json</code> is. The first time, map the <code>@keyline-ui</code> registry:
        one command, in <Link href="/docs/installation">Installation</Link>.
        {source ? (
          <>
            {" "}
            The file it adds is on <a href={source}>GitHub</a>.
          </>
        ) : null}
      </p>
    </>
  );
}
