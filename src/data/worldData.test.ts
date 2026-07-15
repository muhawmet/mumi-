import { describe, it, expect } from 'vitest';
import { DATA } from '../core/pure';
import { ARC_MAP, detectArc, GROUP_COLOR, IP_ICONIC } from './worldData';

// worldData.ts — component gövdelerinden çıkarılan world-lookup verisinin
// bütünlük testleri. Davranış testi değil; verinin DATA ile hizasını korur.

describe('worldData — world lookup verisi bütünlüğü', () => {
  const worldIds = new Set(DATA.worlds.map((w) => w.id));
  const worldGroups = new Set(DATA.worlds.map((w) => w.group));

  it('ARC_MAP anahtarları DATA.worlds id kümesinin alt kümesi (öksüz arc-world yok)', () => {
    const orphans = Object.keys(ARC_MAP).filter((k) => !worldIds.has(k));
    expect(orphans, `ARC_MAP'te DATA.worlds'te olmayan id'ler: ${orphans.join(', ')}`).toEqual([]);
  });

  it("ARC_MAP her world için en az bir arc girdisi taşır ve girdiler regex+label+sub içerir", () => {
    for (const [worldId, arcs] of Object.entries(ARC_MAP)) {
      expect(arcs.length, `${worldId} arc listesi boş`).toBeGreaterThan(0);
      for (const arc of arcs) {
        expect(arc.re, `${worldId} arc regex eksik`).toBeInstanceOf(RegExp);
        expect(arc.label.trim().length, `${worldId} arc label boş`).toBeGreaterThan(0);
        expect(arc.sub.trim().length, `${worldId} arc sub boş`).toBeGreaterThan(0);
      }
    }
  });

  it('GROUP_COLOR anahtarları DATA.worlds group kümesinin alt kümesi', () => {
    const orphans = Object.keys(GROUP_COLOR).filter((g) => !worldGroups.has(g));
    expect(orphans, `GROUP_COLOR'da DATA'da olmayan gruplar: ${orphans.join(', ')}`).toEqual([]);
  });

  it("GROUP_COLOR tüm DATA gruplarını kapsar (UI'da renksiz grup kalmaz)", () => {
    const uncovered = [...worldGroups].filter((g) => !(g in GROUP_COLOR));
    expect(uncovered, `GROUP_COLOR'da rengi olmayan gruplar: ${uncovered.join(', ')}`).toEqual([]);
  });

  it('GROUP_COLOR değerleri geçerli 6-haneli hex (UI stili — prompt yoluna gitmez)', () => {
    for (const [group, color] of Object.entries(GROUP_COLOR)) {
      expect(color, `${group} rengi hex değil: ${color}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('detectArc: kaynak metinden arc yakalar, boş/alakasız kaynakta null döner', () => {
    expect(detectArc('one_piece_toei', 'Elbaf devlerinin fiyort köyü')).toEqual({
      label: 'Elbaf arc',
      sub: 'Norse giant grammar active',
    });
    expect(detectArc('one_piece_toei', '')).toBeNull();
    expect(detectArc('one_piece_toei', 'sıradan bir pazar sahnesi')).toBeNull();
    expect(detectArc('bilinmeyen_world', 'Elbaf')).toBeNull();
  });

  it('IP_ICONIC: DATA-dışı anahtarlar yalnız bilinen 3 legacy id (bilinçli ölü anahtar, allowlist)', () => {
    const LEGACY_ALLOWLIST = new Set([
      'one_piece_grand_line',
      'demon_slayer_taisho',
      'jjk_cursed_domain',
    ]);
    const unexpectedOrphans = Object.keys(IP_ICONIC).filter(
      (k) => !worldIds.has(k) && !LEGACY_ALLOWLIST.has(k),
    );
    expect(
      unexpectedOrphans,
      `IP_ICONIC'te allowlist dışı öksüz id'ler: ${unexpectedOrphans.join(', ')}`,
    ).toEqual([]);
  });

  it('IP_ICONIC değerleri geçerli RGB tuple listeleri (0–255)', () => {
    for (const [worldId, tuples] of Object.entries(IP_ICONIC)) {
      expect(tuples.length, `${worldId} ikonik renk listesi boş`).toBeGreaterThan(0);
      for (const t of tuples) {
        expect(t, `${worldId} tuple 3 kanal değil: [${t.join(',')}]`).toHaveLength(3);
        for (const ch of t) {
          expect(ch, `${worldId} kanal aralık dışı: ${ch}`).toBeGreaterThanOrEqual(0);
          expect(ch, `${worldId} kanal aralık dışı: ${ch}`).toBeLessThanOrEqual(255);
        }
      }
    }
  });
});
