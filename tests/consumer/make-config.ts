// Writes the registry item the playground's "Download keyline-config.json" produces, for a configuration
// given as JSON (same normalisation as the playground). Usage:
//   node --import ./tests/resolve-ts.ts tests/consumer/make-config.ts '<config json>' out.json
import { writeFileSync } from "node:fs";
import {
  configToRegistryItem,
  normalizeConfig,
  encodeConfig,
  attributesSnippet,
} from "../../src/registry/keyline/lib/keyline-config.ts";
const cfg = normalizeConfig(JSON.parse(process.argv[2] ?? "{}"));
writeFileSync(process.argv[3] ?? "keyline-config.json", JSON.stringify(configToRegistryItem(cfg), null, 2) + "\n");
console.log(JSON.stringify({ pg: encodeConfig(cfg), attrs: attributesSnippet(cfg) }));
