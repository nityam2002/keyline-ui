/**
 * The homepage's install strip: the one command. No component is picked out; `<name>` is any item. `@keyline-ui`
 * is listed in shadcn's registry directory, so the CLI resolves the name without a mapping step.
 */
export function HomeInstall({ add }: { add: string }) {
  return (
    <div className="flex min-w-0 items-stretch border-2 border-kl-line bg-kl-paper" data-testid="home-install">
      <code className="flex min-w-0 flex-1 items-center px-2.5 py-[9px] font-kl-mono text-[12px]/[1.5] [overflow-wrap:anywhere]">
        {add}
      </code>
    </div>
  );
}
