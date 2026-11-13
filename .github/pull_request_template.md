## What changes

<!-- One change, and why. Link the issue. Say what a reviewer should look at; for a visible change, add before and after captures (pnpm capture). -->

## Checks

CI runs each of these as a job, and the `ci` check passes only when every one passed. Run the ones your change touches before pushing; `pnpm check` runs most of them in one go.

- [ ] **Static**: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test:types`
- [ ] **Unit**: `pnpm test`, `pnpm versions:check`, `pnpm changelog:check`
- [ ] **Parts**: `pnpm test:parts` (Chromium, Firefox, WebKit)
- [ ] **Page specs**: `pnpm test:browser` (Chrome, Firefox, WebKit, then the timing tests)
- [ ] **CSS order**: `pnpm test:css-order`
- [ ] **Registry**: `pnpm registry:build` with `site/public/r/` and `registry.json` committed, `pnpm exec shadcn registry validate`, `pnpm registry:verify`
- [ ] **Site and demo builds**: `pnpm build`, `pnpm site:build`
- [ ] **Consumer installs**: `pnpm test:consumer`, when the change affects what an item installs
- [ ] **Visual parity** (advisory): `pnpm test:visual --base main`, when the change must not alter the look

## Release

- [ ] Every item whose shipped files changed is bumped, with a `changelog[]` entry in its meta (`breaking: true` and the migration fields for a breaking change), and `pnpm changelog` re-run
- [ ] Docs updated (`site/`, `docs/`) if behaviour or API changed
- [ ] I checked this change against `REVIEW.md`
