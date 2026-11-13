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

/**
 * What a breaking entry must give someone who already copied the item (coss's template). The note says what
 * changed; the re-add command is generated from the item's name.
 */
export type Migration = {
  /** Before/after code for a project that uses the item: a unified diff against `@/components/keyline/…`. */
  diff: string;
  /** The smallest diff for someone who keeps a locally modified copy and will not re-add it. */
  modified: string;
  /** A prompt an agent can follow: the steps, what not to do, and how to check the result (visually too). */
  prompt: string;
};

/** One line of an item's history. scripts/changelog.ts turns these into CHANGELOG.md and the site's changelog. */
export type ChangelogEntry = {
  /** The item's version this entry ships in (semver). */
  version: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** What changed, for someone using the item. */
  note: string;
} & ({ breaking?: false } | { breaking: true; migration: Migration });

/**
 * Release fields. scripts/registry/versions.ts hashes everything the item installs and fails when that changes
 * without a bump, a version goes backwards, or a bump has no changelog entry. They are not part of the built item:
 * the build publishes them in r/versions.json.
 */
type Release = {
  /** Semver. Bump it whenever anything the item installs changes; a breaking change bumps the major. */
  version: string;
  /** The date of the latest changelog entry (ISO, YYYY-MM-DD). */
  updated: string;
  /** Newest first; the first entry is for `version`. */
  changelog: ChangelogEntry[];
  /**
   * A tombstone: the item was removed and this names its replacement. Its file re-exports from the replacement (or
   * throws a pointer error), so a project that still adds it by name keeps working for one more minor release.
   */
  deprecated?: string;
};

export type KeylineItem = Without<
  RegistryItem,
  "$schema" | "css" | "cssVars" | "dependencies" | "registryDependencies"
> &
  Dependencies &
  Release & {
    /** The CSS file the build converts into the item's `css` (and, with `theme`, its `cssVars`). Theme and block
     *  items only: a ui item draws with utilities, and the build fails if one names a CSS file. */
    cssFile?: string;
    /** `:root`, `.dark` and `@theme` in cssFile become cssVars; `.light` mirrors `:root`. */
    theme?: true;
    /**
     * Dependencies the build cannot see in the item's source (it reads its imports). Each needs its reason beside it. They are part of `dependencies` / `registryDependencies` too: the
     * build fails when those differ from what it derives plus these.
     */
    requires?: Dependencies;
    /** When a consumer should reach for this item, one or two sentences; shown on its docs page. Not shipped: the build strips it. */
    whenToUse?: string;
  };
