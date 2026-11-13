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
      { id: "item-names", label: "Item names" },
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

      <h3 id="item-names">Item names</h3>
      <p>
        Items are added by the names in the registry index, <a href="/r/registry.json">/r/registry.json</a>: for example{" "}
        <code>select</code>, <code>date-picker</code>, <code>scroll-area</code>, <code>toolbar</code> and{" "}
        <code>app-shell</code>. A few names install other items: <code>sidebar</code> installs <code>app-shell</code>{" "}
        and <code>nav</code>, and <code>alert-dialog</code> installs <code>dialog</code>, which exports{" "}
        <code>AlertDialog</code>.
      </p>

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
          <strong>Files.</strong> Components land in <code>components/keyline/</code> (inside <code>src/</code> if you
          use one), apart from shadcn&apos;s <code>components/ui/</code>. Import them through your alias:{" "}
          <code>@/components/keyline/ui/button</code>.
        </li>
        <li>
          <strong>Dependencies.</strong> Base UI, the fonts and any wrapped library (<code>recharts</code> for Chart)
          come along at the version Keyline is tested with. npm saves exact pins as <code>^</code> ranges; set{" "}
          <code>save-exact</code> to hold them.
        </li>
        <li>
          <strong>CSS.</strong> The theme, <code>@keyline-ui/keyline</code>, adds the <code>--kl-*</code> tokens and{" "}
          <code>kl-</code> utilities to your stylesheet once. Components bring no CSS of their own.
        </li>
        <li>
          <strong>Fonts.</strong> Atkinson Hyperlegible Next and Mono, as npm packages bundled with your app.
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
        edited. Components add no CSS of their own (they are styled with Tailwind utilities in their source), so
        re-adding one replaces only its files. Re-adding the theme (<code>@keyline-ui/keyline</code>) or a block updates
        its tokens and rules in your stylesheet in place, and adds any that are new.
      </p>

      <h2 id="removing">Removing</h2>
      <p>
        Delete the component&apos;s files from <code>components/keyline/</code>. A component adds no CSS, so its files
        are all there is; for a block, also delete the rules it added to your stylesheet. Remove any packages you no
        longer use. For configuration, theming and the composition rules, start with{" "}
        <Link href="/docs/theming">Theming</Link> and <Link href="/docs/composition">Composition</Link>.
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
