import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { AUTHORITY_HIERARCHY } from './brain';

const REPO = resolve(process.cwd());
const read = (rel: string) => readFileSync(resolve(REPO, rel), 'utf8');
const RUNNERS = ['agents/runner.mjs', 'agents/production/runner.mjs'];
const KITS = ['agents', 'agents/production'];
const RETIRED_KICKS = [
  'agents/production/kick/claude-tr.md',
  'agents/production/RUN_MOTION_AGENT.md',
];
// 2026-07-16 temizliği (Mami: "çöpleri sil, tertemiz teslim et"): eski hat dokümanları
// repodan tamamen kaldırıldı. Tombstone bile bırakılmadı — olmayan dosya canlanamaz.
// Bu kilit geri sızmayı kırmızıya bağlar; eski zekâ mac-hatti-2026-07-16 branch'inde yaşar.
const PURGED_LEGACY = [
  'agents/kick', 'agents/claude', 'agents/gpt', 'agents/knowledge', 'agents/done', 'agents/images',
  'agents/GLOBAL_BRAIN.md', 'agents/AGENT_BRAIN_V2_ADDENDUM.md', 'agents/project.json',
  'agents/RUN_MOTION_AGENT.md',
];
const ADAPTERS = ['agents/adapters/claude.md', 'agents/adapters/codex.md'];
const ROLES = [
  'agents/roles/image-author.md',
  'agents/roles/image-jury.md',
  'agents/roles/frame-jury.md',
  'agents/roles/motion-author.md',
  'agents/roles/motion-jury.md',
];

const TIER_KEYS: Array<[RegExp, string]> = [
  [/\b(material|materyal)\b/i, 'MATERIAL'],
  [/render\s*lock|\bworld\b/i, 'WORLD'],
  [/\bpath\b/i, 'PATH'],
  [/\b(source|kaynak)\b/i, 'SOURCE'],
  [/\b(approved|onaylı)\b/i, 'APPROVED'],
  [/mandate/i, 'MANDATE'],
  [/\bdna\b/i, 'REFDNA'],
  [/\b(palette|palet)\b/i, 'PALETTE'],
];

function tiersOf(chain: string): string[] {
  return chain.split('>').map((token) => token.replace(/[*`.]/g, '').trim()).filter(Boolean).map((token) => {
    for (const [pattern, key] of TIER_KEYS) if (pattern.test(token)) return key;
    return `UNKNOWN(${token})`;
  });
}

describe('canonical product contracts stay bound to code', () => {
  test('authority hierarchy keeps its eight canonical tiers', () => {
    expect(tiersOf(AUTHORITY_HIERARCHY)).toEqual([
      'PATH', 'WORLD', 'MATERIAL', 'SOURCE', 'APPROVED', 'MANDATE', 'REFDNA', 'PALETTE',
    ]);
  });

  // Eski "worked prompt hex" ve "engine-window doc aynası" testlerinin nesneleri
  // (GLOBAL_BRAIN, 02_IMAGE_*, kick/*) 2026-07-16 temizliğinde silindi. Engine-window
  // gerçeği artık TEK kanondan yaşar: src/core/engine.ts ENGINE_USABLE — doc aynası yok.
  // ENGINE_USABLE'ın kendisi engine.test.ts + docsContract'ın diğer kilitleriyle korunur.
  test.each(PURGED_LEGACY)('%s stays deleted — legacy path cannot creep back', (rel) => {
    expect(existsSync(resolve(REPO, rel)), `${rel} repoya geri sızmış`).toBe(false);
  });
});

describe('one hashed protocol owns every decision law', () => {
  const protocol = read('agents/PROTOCOL.md');

  test('protocol defines the bounded author/jury lifecycle and verdict vocabulary', () => {
    expect(protocol).toContain('bir author → bir bağımsız jury');
    expect(protocol).toContain('PASS | REJECT | FACT_REQUIRED');
    expect(protocol).toContain('en fazla bir author revision');
    expect(protocol).toContain('Mami `APPROVE`');
  });

  test('protocol assigns deterministic concerns to code, not roles', () => {
    for (const rule of ['Palette translation', 'IP firewall', 'schema/hash/stale', 'engine math']) {
      expect(protocol).toContain(rule);
    }
  });

  test.each(ADAPTERS)('%s is provider I/O only and defers to PROTOCOL', (rel) => {
    const adapter = read(rel);
    expect(adapter).toMatch(/PROTOCOL\.md/);
    expect(adapter).not.toContain('PASS | REJECT | FACT_REQUIRED');
    expect(adapter).not.toContain('Authority Hierarchy');
  });

  test.each(ROLES)('%s exists as one bounded role', (rel) => {
    const role = read(rel);
    expect(role.length).toBeGreaterThan(80);
    expect(role).toMatch(/PROTOCOL\.md/);
  });

  test.each(RETIRED_KICKS)('%s cannot revive the giant-agent path', (rel) => {
    const retired = read(rel);
    expect(retired).toMatch(/DEPRECATED|ÇALIŞTIRILAMAZ|NON-RUNNABLE/);
    expect(retired).not.toMatch(/credit|kredi|--print|claude --print/i);
  });
});

describe('runner is a thin cross-platform command launcher', () => {
  test.each(RUNNERS)('%s selects a command without silently resolving ambiguity', (rel) => {
    const runner = read(rel);
    expect(runner).toContain('commandCandidates');
    expect(runner).toMatch(/candidates\.length === 1/);
    expect(runner).toContain('--file');
    expect(runner).toContain('Geçersiz seçim');
  });

  test.each(RUNNERS)('%s delegates validation and lifecycle to the canonical command', (rel) => {
    const runner = read(rel);
    expect(runner).toContain("'scripts', 'mamilas-command.mjs'");
    expect(runner).toContain("'agents', 'PROTOCOL.md'");
    expect(runner).not.toMatch(/production\.frameGate|KICK_DIR|\.mamilas_kick/);
  });

  test.each(RUNNERS)('%s isolates each named project and command revision', (rel) => {
    const runner = read(rel);
    expect(runner).toContain('Proje adı:');
    expect(runner).toContain('MAMILAS-PROJELER');
    expect(runner).toContain("'runs', runId");
    expect(runner).toContain('mamilas.local-project.v1');
  });

  test.each(RUNNERS)('%s exposes only interactive Claude/Codex provider selection', (rel) => {
    const runner = read(rel);
    expect(runner).toContain("['claude', 'codex']");
    expect(runner).not.toMatch(/antigravity|Higgsfield|credits|kredi/i);
  });

  test('both kits carry a byte-identical runner', () => {
    const [main, production] = RUNNERS.map(read);
    expect(production).toBe(main);
  });
});

describe('Windows and macOS launchers remain thin and equivalent', () => {
  test.each(KITS)('%s ships both launchers', (kit) => {
    expect(() => read(`${kit}/MOTION-CALISTIR.command`)).not.toThrow();
    expect(() => read(`${kit}/MOTION-CALISTIR.bat`)).not.toThrow();
  });

  test.each(KITS)('%s Windows launcher starts beside itself and preserves errors', (kit) => {
    const bat = read(`${kit}/MOTION-CALISTIR.bat`);
    expect(bat).toMatch(/cd \/d "%~dp0"/);
    expect(bat).toMatch(/node runner\.mjs/);
    expect(bat).toMatch(/pause/);
    expect(bat.includes('\r\n')).toBe(true);
  });

  test.each(KITS)('%s macOS launcher calls the same runner beside itself', (kit) => {
    const command = read(`${kit}/MOTION-CALISTIR.command`);
    expect(command).toMatch(/^#!\/bin\/zsh/);
    expect(command).toMatch(/cd "\$\(dirname "\$0"\)"/);
    expect(command).toMatch(/node runner\.mjs/);
  });

  test.each(KITS.flatMap((kit) => [`${kit}/MOTION-CALISTIR.command`, `${kit}/MOTION-CALISTIR.bat`]))(
    '%s carries no decision law',
    (rel) => {
      const launcher = read(rel);
      expect(launcher.split('\n').length).toBeLessThan(20);
      expect(launcher).not.toMatch(/FRAME GATE|FACT REQUIRED|Kling|PROTOCOL/);
    },
  );
});
