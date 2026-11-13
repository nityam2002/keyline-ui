import { CodeBlock } from "./code-block";
import { exampleSource } from "@site/lib/source";
import { installCommand } from "@site/lib/registry";

/**
 * An example's Code panel. Every example is a registry:block: the command installs it into the project, and the
 * source shown is the built item's file, what the preview renders and what the command writes.
 */
export function ExampleCode({ file, label }: { file: string; label: string }) {
  return (
    <>
      <CodeBlock
        code={installCommand(file.replace(/\.tsx$/, ""))}
        lang="bash"
        copyLabel={`${label.replace(/ code$/, "")} install`}
      />
      <CodeBlock code={exampleSource(file)} lang="tsx" copyLabel={label} tall />
    </>
  );
}
