# Releasing Keyline

Keyline is published by deploying the documentation site: `site/public/r/` is served at `/r/{name}.json`, and that
is what the shadcn CLI downloads when someone adds a Keyline component. There is no npm package. The hosted registry is always
the latest deployed version, so deploy the site only from a release commit.

## First release only

The site's origin is `https://keyline-ui.dev`, set as `"homepage"` in `package.json`. The registry catalog and
the site's install commands read it, and `pnpm test` fails unless every install command in `README.md` and
`docs/usage.md` uses it. If the origin ever changes, change all three together.

1. Add `"repository"` to `package.json` once the GitHub repository exists.
2. Point the domain at the site's host and serve the site over HTTPS at that origin (the CLI fetches
   `https://keyline-ui.dev/r/{name}.json`).
3. Verify the domain in Google Search Console and submit `https://keyline-ui.dev/sitemap.xml`.

## What a release is

Each item is versioned on its own (semver, in its `.meta.ts`), so a release is not a separate step. A release is:

1. **A bump.** Every change to what an item installs raises that item's `version`; a breaking change raises its
   major. `pnpm versions:check` fails on a shipped change without one (`scripts/registry/versions.ts`, against
   `versions.lock.json`).
2. **A changelog entry.** The bump's entry goes at the top of the item's `changelog[]`. A breaking one follows the
   template in [CONTRIBUTING](../.github/CONTRIBUTING.md#versions-and-breaking-changes): what changed, the diff,
   the diff for a locally modified copy and an agent prompt. `pnpm changelog` generates `CHANGELOG.md` and the
   site's `/docs/changelog` from those entries, and `pnpm changelog:check` fails when they drift.
3. **A merge.** Merging to `main` and deploying the site publishes it: the new item JSON and `/r/versions.json`,
   which lists every item's version, file hash and history.

Tags are cut by the release workflow from the merged versions; nobody tags by hand.

Removing or renaming anything public (an export, a `data-slot`, a `data-*` attribute, a CSS custom property) fails
`tests/registry/surface.test.ts` unless the item's new entry is breaking. A removed item stays for one more minor
release as a tombstone that points at its replacement, and its name is never reused (see CONTRIBUTING).

## Every deploy

1. Rebuild and check, on a clean checkout:

   ```sh
   pnpm install --frozen-lockfile
   pnpm registry:build      # site/public/r must not change; if it does, commit it
   pnpm check
   pnpm test:consumer
   ```

2. Merge to `main` and let CI pass; the release workflow cuts the tag.
3. Deploy the site from that commit. Any Next.js host works: build with `pnpm site:build` and serve with
   `pnpm site:start` (or the platform's equivalent for `next build site`). The site must serve `site/public`
   at the root.
   Build it with `KEYLINE_SITE_ENV=production` (Vercel's production deployments set `VERCEL_ENV` instead): only
   that build may be indexed by search engines and lists its sitemap. Every other build sends `noindex`
   (`site/lib/seo.ts`).
4. Check the published registry, not the local one:

   ```sh
   curl -fsS https://keyline-ui.dev/r/registry.json | head -c 200
   curl -fsS https://keyline-ui.dev/r/versions.json | head -c 200
   KEYLINE_REGISTRY='https://keyline-ui.dev/r/{name}.json' bash tests/consumer/next.sh "$(mktemp -d)"
   ```

   The second command is the Next.js consumer check, installing from the public site.

## Optional: the shadcn registry directory

Listing `@keyline-ui` in shadcn's registry directory lets the CLI map the namespace itself, so users can skip the
`registry add` step. Keep `registry add` in the docs until the listing is merged.

The namespace is `@keyline-ui` because `@keyline` is already listed (Keyline Icons), and the directory's validator
(`pnpm validate:registries` in shadcn-ui/ui) rejects a duplicate namespace. As checked on 2026-11-11, a listing needs:

- the repository public and open source (`github.com/nityam2002/keyline-ui`, MIT);
- the release live on HTTPS, with `https://keyline-ui.dev/r/registry.json` and every `/r/<item>.json` answering;
- an entry in `apps/v4/registry/directory.json`: `name`, `homepage`, `url` (with `{name}`), `description`, `logo`
  (an inline SVG string) and optionally `author`, no other keys; then `pnpm validate:registries` and a pull request.

Re-read https://ui.shadcn.com/docs/registry/registry-index before submitting; once merged, shadcn monitors the
registry's availability.
