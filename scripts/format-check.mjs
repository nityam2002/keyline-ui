// The .editorconfig rules, checked: LF line endings, a final newline, no trailing whitespace (Markdown excepted,
// where two spaces are a line break) and space indentation. Files are git's tracked and unignored ones; generated
// registry output and the lockfile are skipped.
//
//   npm run test:format
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((f) => /\.(ts|tsx|mjs|js|css|json|md|yml|yaml|sh|html)$/.test(f) && !f.startsWith("site/public/r/") && f !== "package-lock.json")
const problems = []
for (const f of files) {
  let src
  try { src = readFileSync(f, "utf8") } catch { continue } // deleted in the working tree
  if (src.includes("\r")) problems.push(`${f}: CRLF line endings`)
  if (src.length && !src.endsWith("\n")) problems.push(`${f}: no final newline`)
  src.split("\n").forEach((line, i) => {
    if (!f.endsWith(".md") && /[ \t]+$/.test(line)) problems.push(`${f}:${i + 1}: trailing whitespace`)
    if (/^\t/.test(line)) problems.push(`${f}:${i + 1}: tab indentation`)
  })
}
for (const p of problems) console.error(p)
console.log(`format: ${files.length} files, ${problems.length} problems`)
process.exitCode = problems.length ? 1 : 0
