# Releasing Keyline

Keyline is published by deploying the documentation site: `site/public/r/` is served at `/r/{name}.json`, and that
is what the shadcn CLI downloads when someone adds a Keyline component. There is no npm package. The hosted registry is always
the latest deployed version, and the host deploys main on every push, so everything merged to main is released.

## First release only

The site's origin is `https://keyline-ui.dev`, set as `"homepage"` in `package.json`. The registry catalog and
the site's install commands read it, and `pnpm test` fails unless every install command in `README.md` and
`docs/usage.md` uses it. If the origin ever changes, change all three together.

1. Add `"repository"` to `package.json` once the GitHub repository exists.
2. Point the domain at the site's host and serve the site over HTTPS at that origin (the CLI fetches
   `https://keyline-ui.dev/r/{name}.json`).
3. Verify the domain in Google Search Console and submit `https://keyline-ui.dev/sitemap.xml`.
4. In the repository's settings, add a branch rule (ruleset) for main that requires the status check `ci` and
   nothing else; the jobs it gathers change, the check's name does not. Enable Renovate for the repository.
5. For the opt-in agent review (`.github/workflows/review.yml`), add the `ANTHROPIC_API_KEY` repository secret
   and install the Claude GitHub App. Without them the workflow fails only when a maintainer asks for a review.

## Every release

A release is a merge to main. Before merging, the pull request must pass CI's `ci` check
([CONTRIBUTING, "Continuous integration"](../.github/CONTRIBUTING.md#continuous-integration)), which includes the
consumer installs, and every item whose shipped files changed must be bumped with a changelog entry.

After the merge, `.github/workflows/release.yml` runs on the push to main:

1. **Deploy.** The host's Git integration deploys main (Vercel, building with `pnpm site:build`; the site must
   serve `site/public` at the root). Production deployments set `VERCEL_ENV=production`, or
   `KEYLINE_SITE_ENV=production` on another host: only that build may be indexed by search engines and lists its
   sitemap. Every other build, previews included, sends `noindex` (`site/lib/seo.ts`).
2. **Verify.** `node scripts/registry/verify-hosted.ts --wait 1200` fetches every file in `site/public/r` from
   `https://keyline-ui.dev/r/` (the index, `versions.json` and every item) and fails unless each one equals the
   commit's file. It re-checks for up to 20 minutes while the deploy goes live. A red run means production does
   not serve what main holds: look at the host's deployment for that commit.
3. **Tag.** When `versions.lock.json` differs from the last `v*` tag, and the `ci` check passed on the commit, the
   workflow cuts an annotated tag `v<commit date>-<short sha>` whose message records the lock's blob, then checks
   that the tag points at the commit and names its lock. Tags are never cut by hand.

To check production by hand, or after redeploying on the host:

```sh
node scripts/registry/verify-hosted.ts
KEYLINE_REGISTRY='https://keyline-ui.dev/r/{name}.json' bash tests/consumer/next.sh "$(mktemp -d)"
```

The second command is the Next.js consumer check, installing from the public site. To rerun the whole workflow,
use **Run workflow** on `release.yml` in the Actions tab, on main.

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
