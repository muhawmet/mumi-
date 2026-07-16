import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// scripts/agents-sync.mjs is plain Node ESM; Vitest resolves it fine from here.
// eslint-disable-next-line import/no-relative-packages
import { checkAgents, GENERATED_BANNER_PREFIX } from '../../scripts/agents-sync.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('canonical agent surface (M1 — tek kaynak → iki yüzey)', () => {
  it('generated .claude/.codex files are byte-identical to a fresh sync', () => {
    const { drift } = checkAgents();
    // drift dolu ise: agents:sync koşulmamış veya biri generated dosyayı elle değiştirmiş
    expect(drift).toEqual([]);
  });

  it('every generated file carries the GENERATED banner + protocol hash', () => {
    const { files } = checkAgents();
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      expect(f.hasBanner, `${f.path} banner taşımıyor`).toBe(true);
      expect(f.protocolHash, `${f.path} protocolHash taşımıyor`).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(GENERATED_BANNER_PREFIX).toContain('GENERATED');
  });

  it('manifest covers every mamilas-* file on both surfaces (no orphan hand-written authority)', () => {
    const { orphans } = checkAgents();
    // .claude/agents/mamilas-*.md ve .codex/agents/mamilas-*.toml içinde
    // manifest'in üretmediği (elle yazılmış) dosya kalmamalı — KUSUR-B
    expect(orphans).toEqual([]);
  });

  // Sol P2 bulgusu: checkAgents'ı oracle yapan test builder'ın kendi sabitini ölçer.
  // Aşağısı builder'dan BAĞIMSIZ okur: manifest + kanon + yüzey dosyalarını doğrudan diskten.
  it('independent: manifest carries the 6 studio agents and each canonical source exists', () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'agents/manifest.json'), 'utf8'));
    expect(manifest.studioAgents).toHaveLength(6);
    for (const entry of manifest.studioAgents) {
      const body = readFileSync(join(ROOT, entry.source), 'utf8');
      expect(body.trim().length, `${entry.source} boş`).toBeGreaterThan(100);
    }
  });

  it('independent: both surfaces decode back to the exact canonical body (lossless round-trip)', () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'agents/manifest.json'), 'utf8'));
    for (const entry of manifest.studioAgents) {
      const canon = readFileSync(join(ROOT, entry.source), 'utf8').trimEnd();

      const md = readFileSync(join(ROOT, `.claude/agents/${entry.name}.md`), 'utf8');
      const mdMatch = md.match(/^<!-- GENERATED[^\n]*-->\n---\n[\s\S]*?\n---\n\n([\s\S]*)\n$/);
      expect(mdMatch, `${entry.name}.md biçimi bozuk`).toBeTruthy();
      expect(mdMatch![1]).toBe(canon);

      const toml = readFileSync(join(ROOT, `.codex/agents/${entry.name}.toml`), 'utf8');
      const tMatch = toml.match(/developer_instructions = """\n([\s\S]*)\n"""\n$/);
      expect(tMatch, `${entry.name}.toml biçimi bozuk`).toBeTruthy();
      // TOML basic string decode: kaçışlı backslash'ı geri çöz
      const decoded = tMatch![1].replaceAll('\\\\', '\\');
      expect(decoded).toBe(canon);
      // TOML güvenliği: gövdede kaçışsız kalan tehlikeli dizi olmamalı
      expect(tMatch![1].includes('"""')).toBe(false);
    }
  });
});
