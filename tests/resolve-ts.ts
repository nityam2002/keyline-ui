// Resolve extensionless relative imports to .ts/.tsx, the way a bundler and an installed app do. Registry
// source imports its siblings without an extension (`../theme/tokens`), because the files are copied into
// apps that do not allow .ts extensions in imports; Node's own resolver needs the extension.
// Loaded with `node --import ./tests/resolve-ts.ts` (pnpm test).
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, next) {
    if (!/^\.\.?\//.test(specifier) || /\.[cm]?[jt]sx?$|\.json$|\.css$/.test(specifier))
      return next(specifier, context);
    for (const ext of [".ts", ".tsx"])
      try {
        return next(specifier + ext, context);
      } catch {}
    return next(specifier, context);
  },
});
