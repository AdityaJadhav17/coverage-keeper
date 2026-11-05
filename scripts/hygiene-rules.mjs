// Tool config files that must never be tracked. Case-insensitive: Windows and macOS
// file systems are, so "claude.md" is the same file as "CLAUDE.md" there.
const FORBIDDEN = [
  /(^|\/)CLAUDE\.md$/,
  /(^|\/)AGENTS\.md$/,
  /(^|\/)GEMINI\.md$/,
  /(^|\/)SKILL\.md$/,
  /(^|\/)\.claude\//,
  /(^|\/)\.cursor\//,
  /(^|\/)\.cursorrules$/,
  /(^|\/)\.windsurf\//,
  /(^|\/)\.aider/,
  /(^|\/)\.mcp\.json$/,
  /(^|\/)\.copilot\//,
  /(^|\/)skills\//,
].map((re) => new RegExp(re.source, "i"));

export const isForbiddenPath = (path) => FORBIDDEN.some((re) => re.test(path));
