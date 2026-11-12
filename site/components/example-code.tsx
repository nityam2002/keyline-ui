import { CodeBlock } from "./code-block";
import { exampleSource } from "@site/lib/source";

/** The exact source of a site example: what the preview renders is what the reader copies. */
export function ExampleCode({ file, label }: { file: string; label: string }) {
  return <CodeBlock code={exampleSource(file)} lang="tsx" copyLabel={label} tall />;
}
