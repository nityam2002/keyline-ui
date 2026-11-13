// The shape of a registry item's metadata (src/registry/keyline/**/<name>.meta.ts): a shadcn registry item as
// authored here, before scripts/registry/build.ts fills in what it derives. Not shipped.
import type { RegistryItem } from "shadcn/schema";

type Without<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type Dependencies = {
  /** npm packages, unversioned: the build pins a package package.json pins exactly. */
  dependencies?: string[];
  /** `@keyline-ui/<name>` for Keyline items, `utils` for shadcn's. */
  registryDependencies?: string[];
};

export type KeylineItem = Without<
  RegistryItem,
  "$schema" | "css" | "cssVars" | "dependencies" | "registryDependencies"
> &
  Dependencies & {
    /** The CSS file the build converts into the item's `css` (and, with `theme`, its `cssVars`). */
    cssFile?: string;
    /** `:root`, `.dark` and `@theme` in cssFile become cssVars; `.light` mirrors `:root`. */
    theme?: true;
    /**
     * Dependencies the build cannot see in the item's source (it reads imports and the kl-* classes the source
     * uses). Each needs its reason beside it. They are part of `dependencies` / `registryDependencies` too: the
     * build fails when those differ from what it derives plus these.
     */
    requires?: Dependencies;
    /** When a consumer should reach for this item, one or two sentences; shown on its docs page. Not shipped: the build strips it. */
    whenToUse?: string;
  };
