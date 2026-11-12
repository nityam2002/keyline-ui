import { pageDescription } from "@site/lib/catalog";
import { pageMetadata } from "@site/lib/seo";
import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { DocPage } from "@site/components/doc-page";
import type { TocGroup } from "@site/components/page-toc";
import { installCommand, registryAddCommand } from "@site/lib/registry";

export const metadata = pageMetadata({
  title: "Installation",
  description: pageDescription("/docs/installation"),
  path: "/docs/installation",
});

const ADD = registryAddCommand();
const NEXT = "npx shadcn@latest init -t next";
const VITE = "npx shadcn@latest init -t vite";
const BUTTON = installCommand("button");
const MANY = installCommand("dialog", "select", "table");
const USE = `import { Button } from "@/components/keyline/ui/button"

export default function Page() {
  return <Button>Save</Button>
}`;
const MAPPED = `{
  "registries": {
    "@keyline-ui": "${ADD.split("@keyline-ui=")[1]}"
  }
}`;
const WHOLE_APP = installCommand("keyline-shadcn");
const NOT_FOUND = `Unknown registry "@keyline-ui". Make sure it is defined under "registries" in your components.json or package.json file.`;
const SKIPPED = `ℹ Skipped 1 registry: (already configured)
  - @keyline-ui`;
const OVERWRITE_UTILS = `? The file utils.ts already exists. Would you like to overwrite? › (y/N)`;
const UPDATE = `${installCommand("button")} --overwrite`;

const TOC: TocGroup[] = [
  {
    label: "Install",
    items: [
      { id: "new-project", label: "New project" },
      { id: "existing-project", label: "Existing project" },
      { id: "requirements", label: "Requirements" },
    ],
  },
  {
    label: "What you get",
    items: [
      { id: "what-installs", label: "What installing does" },
      { id: "your-app", label: "Your app and Keyline" },
      { id: "frameworks", label: "Next.js and Vite" },
    ],
  },
  {
    label: "Later",
    items: [
      { id: "updating", label: "Updating" },
      { id: "removing", label: "Removing" },
    ],
  },
  { label: "Help", items: [{ id: "troubleshooting", label: "Troubleshooting" }] },
];

export default function InstallationPage() {
  return (
    <DocPage name="Installation" toc={TOC}>
      <h1>Installation</h1>
      <p className="s-doc-lede">
        Keyline is a shadcn registry. The shadcn CLI copies each component&apos;s source into your project, with the
        components, styles and packages it needs, so the code is yours to read and change. Nothing to clone, build or
        host: you map the <code>@keyline-ui</code> registry once, then add components by name.
      </p>

      <h2 id="new-project">New project</h2>
      <p>Create a Next.js or Vite app set up for shadcn (pick either):</p>
      <CodeBlock code={NEXT} lang="bash" copyLabel="Next.js setup command" />
      <CodeBlock code={VITE} lang="bash" copyLabel="Vite setup command" />
      <p>
        In the new app&apos;s folder, map the Keyline registry. This writes one line to <code>components.json</code>:
      </p>
      <CodeBlock code={ADD} lang="bash" copyLabel="registry command" />
      <p>Add a component and use it:</p>
      <CodeBlock code={BUTTON} lang="bash" copyLabel="install command" />
      <CodeBlock code={USE} lang="tsx" copyLabel="usage" />

      <h2 id="existing-project">Existing shadcn project</h2>
      <p>
        In the folder that holds <code>components.json</code>, map the registry once, then add what you need. Each
        component page shows its command.
      </p>
      <CodeBlock code={ADD} lang="bash" copyLabel="registry command" />
      <CodeBlock code={MANY} lang="bash" copyLabel="install command" />
      <p>
        The first command adds this to <code>components.json</code>, which you can also write by hand:
      </p>
      <CodeBlock code={MAPPED} lang="json" copyLabel="registry mapping" />

      <h2 id="requirements">Requirements</h2>
      <ul>
        <li>React 19 and TypeScript.</li>
        <li>
          Tailwind CSS 4. Keyline&apos;s theme uses <code>@theme inline</code>, which Tailwind 3 does not have.
        </li>
        <li>
          A shadcn project: a <code>components.json</code> with any style and base, and the <code>cn()</code> helper at
          its
          <code> utils</code> alias. <code>shadcn init</code> sets both up.
        </li>
        <li>
          Network access to npm and to this site while you run the CLI. Nothing is fetched from this site at runtime.
        </li>
      </ul>

      <h2 id="what-installs">What installing does</h2>
      <ul>
        <li>
          <strong>Files</strong> go to <code>components/keyline/</code> (<code>ui</code>, <code>lib</code>, and{" "}
          <code>blocks</code> for a block), under <code>src/</code> when your project uses it, following your{" "}
          <code>components</code> alias. Import them as <code>@/components/keyline/ui/button</code>, with your own alias
          in place of <code>@</code>.
        </li>
        <li>
          <strong>Dependencies</strong> come along: the Keyline components a component is built from, Base UI, the
          fonts, and any library it wraps (for example <code>recharts</code> for Chart), at the version Keyline is
          tested with.
        </li>
        <li>
          <strong>CSS</strong> is merged into the stylesheet named in <code>components.json</code>: the theme&apos;s{" "}
          <code>--kl-*</code> tokens and each component&apos;s own <code>kl-</code> rules. Adding a component again
          updates its rules in place; it does not add a second copy.
        </li>
        <li>
          <strong>Fonts</strong> (Atkinson Hyperlegible Next and Mono) are npm packages imported from that stylesheet,
          so they are bundled with your app.
        </li>
      </ul>

      <h2 id="your-app">Your app and Keyline</h2>
      <p>
        Keyline&apos;s CSS only styles Keyline&apos;s own names (<code>--kl-*</code> tokens, <code>kl-</code> classes,{" "}
        <code>data-kl-*</code>
        attributes). Your shadcn components, <code>body</code>, fonts and tokens look the same as before, and
        Keyline&apos;s <code>Button</code> and shadcn&apos;s <code>Button</code> can sit on the same page. Dark mode
        follows a <code>.dark</code> class on an ancestor, as shadcn&apos;s own setups already set it.
      </p>
      <p>To give the whole app Keyline&apos;s look, stock shadcn components included, add the opt-in theme:</p>
      <CodeBlock code={WHOLE_APP} lang="bash" copyLabel="whole-app theme command" />

      <h2 id="frameworks">Next.js and Vite</h2>
      <p>
        Interactive components start with <code>&quot;use client&quot;;</code>, so a Next.js App Router server page can
        import and render them. Vite and other bundlers without React Server Components ignore the directive. Other
        frameworks the shadcn CLI supports work the same way when they meet the requirements above.
      </p>

      <h2 id="updating">Updating</h2>
      <p>
        Installed components are your code: nothing changes until you add them again. To take a newer version, re-add it
        with
        <code> --overwrite</code>. It replaces the component&apos;s files, so commit or keep your own edits first and
        compare afterwards.
      </p>
      <CodeBlock code={UPDATE} lang="bash" copyLabel="update command" />
      <p>
        Without <code>--overwrite</code>, the CLI skips files that are unchanged and asks before replacing one you
        edited. CSS rules that changed are updated in place; a rule Keyline removed or renamed stays in your stylesheet
        until you delete it.
      </p>

      <h2 id="removing">Removing</h2>
      <p>
        Delete the component&apos;s files from <code>components/keyline/</code>. The CLI does not remove CSS, so delete
        that component&apos;s
        <code> kl-</code> rules from your stylesheet as well, and any packages you no longer use. For configuration,
        theming and the composition rules, start with <Link href="/docs/theming">Theming</Link> and{" "}
        <Link href="/docs/composition">Composition</Link>.
      </p>

      <h2 id="troubleshooting">Troubleshooting</h2>
      <p>Each of these was reproduced with shadcn 4.23.</p>

      <h3 id="not-found">&ldquo;Unknown registry &quot;@keyline-ui&quot;&rdquo;</h3>
      <CodeBlock code={NOT_FOUND} lang="text" copyLabel="error" />
      <p>
        The project has no <code>@keyline-ui</code> mapping, and the CLI does not know the name on its own. Map the
        namespace first with the registry command under <a href="#existing-project">Existing shadcn project</a>, then
        add the item again.
      </p>

      <h3 id="already-configured">The registry command says &ldquo;already configured&rdquo;</h3>
      <CodeBlock code={SKIPPED} lang="text" copyLabel="message" />
      <p>
        <code>registry add</code> never replaces a mapping. If <code>@keyline-ui</code> already points somewhere else,
        the old address stays and items keep coming from it. Open <code>components.json</code> and set{" "}
        <code>registries[&quot;@keyline-ui&quot;]</code> to the address shown under{" "}
        <a href="#existing-project">Existing shadcn project</a>.
      </p>
      <p className="s-small">
        Keyline&apos;s items refer to each other as <code>@keyline-ui/&lt;name&gt;</code>, so the mapping needs that
        exact name.
      </p>

      <h3 id="no-project">&ldquo;Couldn&apos;t find tsconfig.json&rdquo;, or the mapping lands in package.json</h3>
      <p>
        The command ran outside a shadcn project. Run it in the folder that holds <code>components.json</code>, or
        create the project first with <code>shadcn init</code> (see <a href="#new-project">New project</a>). Run outside
        one, <code>registry add</code> writes the mapping to <code>package.json</code> instead.
      </p>

      <h3 id="utils">The CLI asks to overwrite utils.ts</h3>
      <CodeBlock code={OVERWRITE_UTILS} lang="text" copyLabel="prompt" />
      <p>
        Keyline&apos;s items depend on shadcn&apos;s <code>cn()</code> helper, and the CLI asks before replacing a{" "}
        <code>utils.ts</code> that differs from its copy. Answer No to keep yours; Keyline only needs it to export{" "}
        <code>cn()</code>.
      </p>
    </DocPage>
  );
}
