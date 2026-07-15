---
paths:
  - "agents/**"
  - "scripts/**"
  - "*.bat"
  - "*.command"
  - ".codex/**"
  - ".claude/skills/**"
  - ".agents/skills/**"
---

# Launcher / runner / adapter parity

- `agents/PROTOCOL.md` is the only agent decision law and is content-hashed into commands.
- `scripts/mamilas-command.mjs` validates schema/hash/gates/artifacts and opens one on-demand role.
- Both byte-identical `agents/**/runner.mjs` files only select a command/provider and delegate.
- `.command` and `.bat` files remain thin launchers; preserve Windows/macOS together.
- Claude/Codex adapters describe only provider I/O and must not copy protocol laws.
- Legacy production JSON, kick prompts, one-shot print pipes and provider rituals are non-runnable.
- Do not create a second lifecycle runner, platform-specific law copy, agent loop or automatic generation path.

The executable locks live in `docsContract.test.ts`, `runnerGate.test.ts`,
`commandRuntime.test.ts` and `agentProtocol.test.ts`. Update both `.agents/skills/` and
`.claude/skills/` copies together.
