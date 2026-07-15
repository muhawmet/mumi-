/**
 * T2 — REÇETENİN HER KARARI BRIEF'E ULAŞIYOR MU?
 *
 * Mami sitede reçeteyi kurar (doktor). Reçetedeki bir karar `final_brief.md` /
 * `project.json` metnine ulaşmıyorsa o karar SESSİZCE ÖLÜR: Mami seçim yaptığını
 * sanır, hiçbir şey olmaz. Kanıtlı emsal: `brandKitLock` (alanı vardı, prompt'a
 * hiç bağlanmamıştı).
 *
 * Bu dosya `RecipeStep.tsx`'teki HER `setField` hedefini kilitler. Test fixture'a
 * değil GERÇEK `generateBatch` çıktısına bakar: kararı A değerine, sonra B değerine
 * set eder ve brief METNİNİN değişmesini şart koşar. Yeni bir reçete alanı eklenip
 * kabloya bağlanmazsa buradaki testi kırmış olur.
 *
 * RecipeStep.tsx setField hedefleri (SAYILDI, 9 alan / 14 yaprak karar):
 *   selectedWorldId · selectedPropId · selectedPaletteId · selectedRefIds · timeLight
 *   · cast · subject · location
 *   · recipeScenes[] → vo · event · director_note · motion_seed · turkish_labels · avoid
 */
import { describe, expect, it } from 'vitest';
import { DATA, generateBatch, resolveRecipeDefaults, type BriefInput } from './pure';
import { buildProductionExport } from './productionExport';
import { ingestSource, sourceIntegrity } from './source';

const RAW = 'Su buharlaşır. Bulut olur. Yağmur yağar.';
const BEATS = ingestSource(RAW);
const REPORT = sourceIntegrity(RAW, BEATS);
const DEFAULTS = resolveRecipeDefaults('ANIMATION_EDU', 'clay');

function base(): BriefInput {
  return {
    rawSource: RAW,
    sourceBeats: BEATS,
    projectTopic: 'Su Döngüsü',
    projectClass: 'ANIMATION_EDU',
    sceneCount: 3,
    cast: '',
    selectedWorldId: 'clay',
    selectedPropId: 'none',
    selectedRefIds: DEFAULTS.selectedRefIds,
    selectedPaletteId: DEFAULTS.selectedPaletteId,
    selectedMusicId: '',
    imageModel: 'nano_banana_2',
    videoModel: 'kling_3',
    timeLight: '',
  };
}

/** Ajana giden HER ŞEY: brief (final_brief.md kaynağı) + sahne prompt'ları. */
function briefText(patch: Partial<BriefInput>): string {
  const result = generateBatch({ ...base(), ...patch });
  if (result.status !== 'GENERATED') {
    throw new Error(`generateBatch BLOCKED: ${JSON.stringify(result.contractGate)}`);
  }
  return [
    result.agentBrief ?? '',
    ...result.scenes.map((s) => `${s.imagePrompt}\n${s.motionPrompt}\n${s.voiceOver}`),
  ].join('\n');
}

/** Bir kararın A→B değişimi ajana giden metni GERÇEKTEN değiştiriyor mu? */
function decisionIsLive(a: Partial<BriefInput>, b: Partial<BriefInput>): boolean {
  return briefText(a) !== briefText(b);
}

describe('T2 — reçete kararı → brief kablosu (ölü karar avı)', () => {
  it('selectedWorldId brief metnini değiştirir', () => {
    expect(decisionIsLive({ selectedWorldId: 'clay' }, { selectedWorldId: 'ukiyo_e_print' })).toBe(true);
  });

  it('selectedPropId (materyal) brief metnini değiştirir', () => {
    expect(decisionIsLive({ selectedPropId: 'none' }, { selectedPropId: 'clay' })).toBe(true);
  });

  it('selectedPaletteId brief metnini değiştirir — ve ham hex sızdırmaz', () => {
    const noir = DATA.palettes.find((p) => p.id !== 'native_world');
    expect(noir).toBeTruthy();
    expect(decisionIsLive({ selectedPaletteId: 'native_world' }, { selectedPaletteId: noir!.id })).toBe(true);
    // Palet Translation Law: palet fiziksel ışık dili olarak geçer, #RRGGBB olarak DEĞİL.
    expect(briefText({ selectedPaletteId: noir!.id })).not.toMatch(/#[0-9a-fA-F]{6}\b/);
  });

  it('selectedRefIds brief metnini değiştirir', () => {
    expect(DEFAULTS.selectedRefIds.length).toBeGreaterThan(0);
    expect(decisionIsLive({ selectedRefIds: [] }, { selectedRefIds: DEFAULTS.selectedRefIds })).toBe(true);
  });

  it('timeLight (register ışık rejimi) brief metnini değiştirir', () => {
    expect(decisionIsLive({ timeLight: '' }, { timeLight: 'night' })).toBe(true);
  });

  it('cast brief metnine birebir ulaşır', () => {
    expect(briefText({ cast: '@defne, orta yaşlı bir esnaf' })).toContain('@defne, orta yaşlı bir esnaf');
  });
});

describe("T2 — reçetenin kesik kabloları (ölü bulundu, bağlandı)", () => {
  // ÖLÜYDÜ: generateBatch yalnız Dashboard'un projectTopic'ini okuyordu; reçetenin
  // "Subject / Konu" alanı (recipeReadiness'in ZORUNLU tuttuğu alan) brief'e hiç gelmiyordu.
  it('subject → brief §1 Project satırını EZER (Dashboard projectTopic taban kalır)', () => {
    const withSubject = briefText({ projectTopic: 'Dashboard Konusu', subject: 'Reçete Konusu' });
    expect(withSubject).toContain('- **Project:** Reçete Konusu');
    expect(withSubject).not.toContain('- **Project:** Dashboard Konusu');
    // Boş subject tabanı ezmez.
    expect(briefText({ projectTopic: 'Dashboard Konusu', subject: '   ' }))
      .toContain('- **Project:** Dashboard Konusu');
    expect(decisionIsLive({ subject: 'A konusu' }, { subject: 'B konusu' })).toBe(true);
  });

  // ÖLÜYDÜ: BriefInput'ta location alanı YOKTU. Mami "İstanbul, sınıf" yazıyor, ajan mekânı uyduruyordu.
  it('location → brief §1 Location satırına ulaşır; boşken satır hiç basılmaz', () => {
    const withLoc = briefText({ location: 'İstanbul, bir ilkokul sınıfı' });
    expect(withLoc).toContain('- **Location:** İstanbul, bir ilkokul sınıfı');
    expect(briefText({ location: '' })).not.toContain('- **Location:**');
    expect(decisionIsLive({ location: '' }, { location: 'Kapadokya' })).toBe(true);
  });

  // ÖLÜYDÜ: recipeScenes yalnızca indirilen recipe.md'de yaşıyordu — final_brief.md /
  // project.json onu HİÇ görmüyordu. Mami VO/yön/avoid yazıyor, üretim onları bilmiyordu.
  const note = (patch: Partial<{ vo: string; event: string; director_note: string; motion_seed: string; turkish_labels: string[]; avoid: string[] }>) => ([{
    id: 1, vo: '', event: '', director_note: '', motion_seed: '', turkish_labels: [], avoid: [], ...patch,
  }]);

  it('recipeScenes[].vo brief metnine birebir ulaşır', () => {
    expect(briefText({ recipeScenes: note({ vo: 'Su ısındıkça yükselir.' }) })).toContain('Su ısındıkça yükselir.');
  });

  it('recipeScenes[].event brief metnine birebir ulaşır', () => {
    expect(briefText({ recipeScenes: note({ event: 'buharlaşma anı' }) })).toContain('buharlaşma anı');
  });

  it('recipeScenes[].director_note brief metnine birebir ulaşır', () => {
    expect(briefText({ recipeScenes: note({ director_note: 'tek motive key, tencere merkezde' }) }))
      .toContain('tek motive key, tencere merkezde');
  });

  it('recipeScenes[].motion_seed brief metnine ulaşır — ama TALİMAT değil NİYET olarak (FRAME-AWARE)', () => {
    const text = briefText({ recipeScenes: note({ motion_seed: 'buhar yukarı sarmalı' }) });
    expect(text).toContain('buhar yukarı sarmalı');
    expect(text).toMatch(/Motion seed \(i2v niyeti — kare onaylanana kadar TALİMAT DEĞİL, niyet\)/u);
  });

  it('recipeScenes[].turkish_labels brief metnine BAKED (diegetik) etiket olarak ulaşır', () => {
    const text = briefText({ recipeScenes: note({ turkish_labels: ['BUHARLAŞMA', 'YOĞUŞMA'] }) });
    expect(text).toContain('BUHARLAŞMA · YOĞUŞMA');
    // On-screen text yasası: metin kareye gömülür ya da hiç olmaz — asla "sonra caption eklersin".
    expect(text).toMatch(/on a real surface, never a caption/u);
  });

  it('recipeScenes[].avoid brief metnine birebir ulaşır', () => {
    expect(briefText({ recipeScenes: note({ avoid: ['insan yüzü', 'metafor'] }) }))
      .toContain('insan yüzü; metafor');
  });

  it('tamamen boş sahne notu brief\'e HİÇ bölüm basmaz (notsuz brief byte-eşit kalır)', () => {
    const empty = briefText({ recipeScenes: note({}) });
    expect(empty).not.toContain("Doctor's Recipe Notes");
    expect(empty).toBe(briefText({ recipeScenes: [] }));
  });

  it("doktorun notu DIRECTOR MANDATE seviyesinde durur — source ve render lock'un ALTINDA", () => {
    const text = briefText({ recipeScenes: note({ director_note: 'x' }) });
    expect(text).toMatch(/DIRECTOR MANDATE level: below the source beat and the render lock, ABOVE reference DNA and palette/u);
  });
});

describe('T2 — project.json (export) reçeteyi taşır', () => {
  function pkg(patch: Partial<BriefInput> & { subject?: string; location?: string }) {
    const input = { ...base(), ...patch };
    const generated = generateBatch(input);
    expect(generated.status).toBe('GENERATED');
    return buildProductionExport({
      selectedProjectId: DATA.projects[0].id,
      projectTopic: input.projectTopic,
      projectClass: input.projectClass,
      sceneCount: input.sceneCount,
      cast: input.cast ?? '',
      selectedWorldId: input.selectedWorldId,
      selectedPropId: input.selectedPropId,
      selectedRefIds: input.selectedRefIds,
      selectedPaletteId: input.selectedPaletteId,
      selectedMusicId: '',
      imageModel: input.imageModel,
      videoModel: input.videoModel,
      brandKitLock: '',
      mood: '', cameraEnergy: '', timeLight: input.timeLight ?? '', transition: '', musicVibe: '',
      pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: '',
      rawSource: RAW, sourceBeats: BEATS, sourceReport: REPORT,
      beatMode: 'Dengeli' as const, workingMode: 'Standart' as const,
      beatKeeps: {}, beatAnalysis: null,
      scenes: generated.scenes as never,
      agentBrief: generated.agentBrief ?? '',
      agentPackets: generated.agentPackets ?? null,
      subject: patch.subject,
      location: patch.location,
    });
  }

  it('locks.topic reçetenin subject\'ini taşır (project.json ile final_brief.md aynı işten bahseder)', () => {
    const p = pkg({ projectTopic: 'Dashboard Konusu', subject: 'Reçete Konusu' });
    expect(p.locks.topic).toBe('Reçete Konusu');
    expect(p.agentBrief).toContain('- **Project:** Reçete Konusu');
  });

  it('locks.location reçetenin lokasyonunu taşır', () => {
    expect(pkg({ location: 'İstanbul, bir ilkokul sınıfı' }).locks.location).toBe('İstanbul, bir ilkokul sınıfı');
    expect(pkg({}).locks.location).toBe('');
  });

  it('agentBrief (→ final_brief.md) doktorun sahne notlarını taşır', () => {
    const p = pkg({
      recipeScenes: [{ id: 1, vo: 'Su ısınır.', event: 'buharlaşma', director_note: 'tencere merkezde', motion_seed: 'buhar sarmalı', turkish_labels: ['BUHARLAŞMA'], avoid: ['insan yüzü'] }],
    });
    expect(p.agentBrief).toContain('Su ısınır.');
    expect(p.agentBrief).toContain('tencere merkezde');
    expect(p.agentBrief).toContain('insan yüzü');
  });
});
