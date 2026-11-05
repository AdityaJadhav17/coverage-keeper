import { describe, expect, it } from "vitest";
import { isForbiddenPath } from "../../scripts/hygiene-rules.mjs";

// Windows and macOS file systems ignore case, so neither may the check (security audit I5).
describe("hygiene forbidden paths", () => {
  it.each([
    "CLAUDE.md",
    "claude.md",
    "docs/Claude.MD",
    ".claude/settings.json",
    ".Claude/settings.json",
    "AGENTS.md",
    "agents.md",
    "Skills/x/SKILL.md",
    ".MCP.json",
  ])("refuses %s", (path) => {
    expect(isForbiddenPath(path)).toBe(true);
  });

  it.each(["README.md", "src/lib/skills-list.ts", "docs/adr/0001-stack.md"])(
    "allows %s",
    (path) => {
      expect(isForbiddenPath(path)).toBe(false);
    },
  );
});
