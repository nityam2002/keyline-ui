// Conformance assertions a part fails today, keyed by component, then part, then assertion. Each listed
// assertion runs as an expected failure: the suite goes red when one starts passing, so this list can only
// shrink. Remove an entry in the change that fixes it. Assertion names are listed in conformance.tsx.
import type { Assertion } from "./conformance";

export const knownFailures: Record<string, Record<string, readonly Assertion[]>> = {};
