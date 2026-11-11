# Releasing Keyline

Keyline is published by deploying the documentation site: `site/public/r/` is served at `/r/{name}.json`, and that
is what the shadcn CLI downloads when someone adds a Keyline component. There is no npm package. The hosted registry is always
the latest deployed version, so deploy the site only from a release commit.

## First release only

The site's origin is `https://keyline-ui.dev`, set as `"homepage"` in `package.json`. The registry catalog and
the site's install commands read it, and `npm test` fails unless every install command in `README.md` and
`docs/usage.md` uses it. If the origin ever changes, change all three together.

1. Add `"repository"` to `package.json` once the GitHub repository exists.
2. Point the domain at the site's host and serve the site over HTTPS at that origin (the CLI fetches
   `https://keyline-ui.dev/r/{name}.json`).
3. Verify the domain in Google Search Console and submit `https://keyline-ui.dev/sitemap.xml`.

## Every release

1. Set `"version"` in `package.json` and note user-visible changes in the release notes.
2. Rebuild and check, on a clean checkout:

   ```sh
   npm ci
   npm run registry:build      # site/public/r must not change; if it does, commit it
   npm run check
   npm run test:consumer
   ```

3. Commit, tag `v<version>`, push, and let CI pass.
4. Deploy the site from that commit. Any Next.js host works: build with `npm run site:build` and serve with
   `npm run site:start` (or the platform's equivalent for `next build site`). The site must serve `site/public`
   at the root.
   Build it with `KEYLINE_SITE_ENV=production` (Vercel's production deployments set `VERCEL_ENV` instead): only
   that build may be indexed by search engines and lists its sitemap. Every other build sends `noindex`
   (`site/lib/seo.ts`).
5. Check the published registry, not the local one:

   ```sh
   curl -fsS https://keyline-ui.dev/r/registry.json | head -c 200
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
