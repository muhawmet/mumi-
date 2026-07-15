import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PHASE0_VIDEO, directorDefaultSets } from './presets';
import SURGERY_DATA from '../core/SURGERY_DATA.json';
import { CAM_OPTS, LEIT_OPTS, LIGHT_OPTS, MOOD_OPTS, MUS_OPTS, POV_OPTS, SIG_OPTS, TEMPO_OPTS, TRANS_OPTS } from '../core/pure';
import { presetWithDefaults } from '../store/useStudioStore';

describe('Presets to Surgery Data Mapping', () => {
  it('contains only video archetypes — DESIGN path is retired', () => {
    expect(PHASE0_VIDEO.length).toBeGreaterThanOrEqual(8);
    const src = fs.readFileSync(path.join(__dirname, 'presets.ts'), 'utf8');
    expect(src).not.toMatch(/PHASE0_DESIGN/);
  });

  // Preset'ler ESKİ dünya sözlüğüyle yazılmıştı ("product_macro_tabletop", "clay",
  // "commercial_studio"...). Dünya kütüphanesi yenilenince preset'ler güncellenmedi;
  // normalizeWorldId onları LEGACY haritasından sessizce kurtardı. Kurtarış zararsız
  // değildi: her reklam niyetini üç FİLM dünyasına (fincher/chivo/deakins) eziyordu.
  // Preset artık gerçek dünyanın adını SÖYLER — takma ad haritası yalnız eski KAYITLI
  // projeler için var, yeni reçete için değil. Böylece çürüme sessiz kalamaz.
  it('names real worlds and palettes — no legacy aliases in the recipe itself', () => {
    const src = fs.readFileSync(path.join(__dirname, 'presets.ts'), 'utf8');
    const worldIds = new Set(SURGERY_DATA.worlds.map((w: any) => w.id));
    const paletteIds = new Set(SURGERY_DATA.palettes.map((p: any) => p.id));

    const usedWorlds = [...src.matchAll(/selectedWorldId: '([a-z0-9_]+)'/g)].map((m) => m[1]);
    const usedPalettes = [...src.matchAll(/selectedPaletteId: '([a-z0-9_]+)'/g)].map((m) => m[1]);

    expect([...new Set(usedWorlds)].filter((id) => !worldIds.has(id))).toEqual([]);
    expect([...new Set(usedPalettes)].filter((id) => !paletteIds.has(id))).toEqual([]);
  });

  // CLAUDE.md: "Reklam = film DEĞİL, kendi diliyle — fincher/chivo/deakins reklam için
  // KULLANILMAZ." Reklam için amaca özel altı COMMERCIAL_REAL dünyası yazıldı, ama hiçbir
  // preset onlara bağlanmamıştı: ürün reklamı Fincher'ın psikolojik gerilim diline,
  // kurumsal/kampanya ise belgesel el-kamerasına düşüyordu. Reklam niyeti reklam dünyası
  // ister — bu testin düşmesi, birinin reklamı yine filme bağladığı anlamına gelir.
  it('wires advertising presets to purpose-built COMMERCIAL_REAL worlds, never to film-director worlds', () => {
    const AD_PRESETS = ['product_brand', 'corp_public', 'event_campaign'];
    const FILM_WORLDS = ['fincher_precision', 'chivo_naturalist_handheld', 'deakins_naturalist'];

    for (const id of AD_PRESETS) {
      const preset = PHASE0_VIDEO.find((p) => p.id === id);
      expect(preset, `preset ${id} kayıp`).toBeTruthy();
      const worldId = presetWithDefaults(
        { projectClass: '', selectedWorldId: '' },
        { ...preset!.sets, ...directorDefaultSets(preset!) },
      ).selectedWorldId!;

      const world = SURGERY_DATA.worlds.find((w: any) => w.id === worldId) as any;
      expect(world, `${id} → ${worldId} diye bir dünya yok`).toBeTruthy();
      expect(world.group, `${id} reklam yolunda ama '${worldId}' reklam dünyası değil`).toBe('COMMERCIAL_REAL');
      expect(FILM_WORLDS).not.toContain(worldId);
    }
  });

  it('should have valid projectClass references in VIDEO presets', () => {
    const validPaths = SURGERY_DATA.paths.map((p: any) => p.id);

    PHASE0_VIDEO.forEach((preset) => {
      const pClass = preset.sets.projectClass;
      if (pClass) {
        expect(validPaths).toContain(pClass);
      }
    });
  });

  it('should not contain any overlapping IDs', () => {
    const ids = PHASE0_VIDEO.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('ships an adaptive director panel for every Phase 0 preset', () => {
    PHASE0_VIDEO.forEach((preset) => {
      expect(preset.directorPanel.thesis.length, preset.id).toBeGreaterThan(20);
      expect(preset.directorPanel.groups.length, preset.id).toBeGreaterThan(0);
      preset.directorPanel.groups.forEach((group) => {
        expect(group.choices.length, `${preset.id}:${group.id}`).toBeGreaterThan(0);
        expect(group.choices.some((choice) => choice.id === group.defaultChoiceId), `${preset.id}:${group.id}`).toBe(true);
      });
    });
  });

  it('uses valid world, palette, reference and director option ids in presets and panel choices', () => {
    const validWorlds = new Set(SURGERY_DATA.worlds.map((item: any) => item.id));
    const validPalettes = new Set(SURGERY_DATA.palettes.map((item: any) => item.id));
    const validRefs = new Set(SURGERY_DATA.refs.map((item: any) => item.id));
    const optionSets = {
      mood: MOOD_OPTS,
      cameraEnergy: CAM_OPTS,
      timeLight: LIGHT_OPTS,
      transition: TRANS_OPTS,
      musicVibe: MUS_OPTS,
      pov: POV_OPTS,
      signature: SIG_OPTS,
      leitmotif: LEIT_OPTS,
      tempoCurve: TEMPO_OPTS,
    } as const;

    const assertSets = (label: string, sets: Record<string, any>) => {
      if (sets.selectedWorldId) expect(validWorlds.has(sets.selectedWorldId), `${label}:world:${sets.selectedWorldId}`).toBe(true);
      if (sets.selectedPaletteId) expect(validPalettes.has(sets.selectedPaletteId), `${label}:palette:${sets.selectedPaletteId}`).toBe(true);
      if (sets.selectedRefIds) {
        sets.selectedRefIds.forEach((id: string) => expect(validRefs.has(id), `${label}:ref:${id}`).toBe(true));
        expect(new Set(sets.selectedRefIds).size, `${label}:duplicate refs`).toBe(sets.selectedRefIds.length);
        expect(sets.selectedRefIds.length, `${label}:max refs`).toBeLessThanOrEqual(3);
      }
      Object.entries(optionSets).forEach(([field, options]) => {
        if (sets[field]) expect(Object.prototype.hasOwnProperty.call(options, sets[field]), `${label}:${field}:${sets[field]}`).toBe(true);
      });
    };

    PHASE0_VIDEO.forEach((preset) => {
      assertSets(preset.id, preset.sets);
      preset.directorPanel.groups.forEach((group) => {
        group.choices.forEach((choice) => assertSets(`${preset.id}:${group.id}:${choice.id}`, choice.sets));
      });
    });
  });
});

describe('normalizeSets merge integrity', () => {
  it('edu_explainer merge dünyayı ve refIds\'i korur', () => {
    const p = PHASE0_VIDEO.find((x) => x.id === 'edu_explainer')!;
    const merged = { ...p.sets, ...directorDefaultSets(p) };
    expect(merged.selectedWorldId).toBe('pixar_3d_edu');
    expect(merged.selectedRefIds).toEqual(['pixar_dimensional', 'arcane_clay_hybrid', 'kurzgesagt_clarity']);
  });

  it('hiçbir preset merge\'i undefined anahtar taşımaz ve selectedWorldId truthy olur', () => {
    PHASE0_VIDEO.forEach((p) => {
      const merged = { ...p.sets, ...directorDefaultSets(p) };
      const hasUndefined = Object.entries(merged).some(([, v]) => v === undefined);
      expect(hasUndefined, `${p.id} has undefined value`).toBe(false);
      expect(merged.selectedWorldId, `${p.id} selectedWorldId must be truthy`).toBeTruthy();
    });
  });

  it('store yolu ucuca: presetWithDefaults edu_explainer için dünya ve refIds\'i doğru uygular', () => {
    const p = PHASE0_VIDEO.find((x) => x.id === 'edu_explainer')!;
    const merged = { ...p.sets, ...directorDefaultSets(p) };
    const result = presetWithDefaults(
      { projectClass: 'ANIMATION_EDU', selectedWorldId: '' },
      merged,
    );
    expect(result.selectedWorldId).toBe('pixar_3d_edu');
    expect(result.selectedRefIds?.length).toBe(3);
  });
});
