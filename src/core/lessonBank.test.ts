import { describe, it, expect } from 'vitest';
import { buildCloseout, buildProjectPack } from './projectPack';
import { parseApprovedLessons, approvedLessonsSlice } from './lessonBank';

/**
 * BRAIN M7 — Biten projelerden öğrenme: Mami-onaylı ders bankası.
 *
 * Mami: "Eski işlerinden öğrenmesi sistemi tanrı seviyesine çıkarır."
 * buildCloseout OBSERVATION dersleri topluyor ama hiçbir beyne GERİ AKMIYORDU (ölü arşiv).
 * Döngü: closeout → lessonCandidates (ADAY, otomatik promote YOK) → Mami APPROVE ederse
 * agents/lessons/APPROVED.md → CONTEXT.json approvedLessons slice'ı (kısa, curated —
 * 300KB dump değil) → sonraki projelerin author'ları okur; çelişkide Mami direktifi kazanır.
 */

function samplePack() {
  // Asgari geçerli state — buildProjectPack store şeklini bekler; testte sade sahte state.
  const state: any = {
    projectTopic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', sceneCount: 1, cast: '',
    selectedWorldId: 'clay', selectedPropId: 'native_world', selectedRefIds: [],
    selectedPaletteId: '', selectedMusicId: '', imageModel: 'nano_banana_2', videoModel: 'kling_3',
    brandKitLock: '', mood: '', cameraEnergy: '', timeLight: '', transition: '', musicVibe: '',
    pov: '', signature: '', leitmotif: '', tempoCurve: '', directorBrief: '', rawSource: '',
    sourceBeats: [], sourceReport: null, beatMode: 'AUTO', workingMode: 'MANUAL', beatKeeps: {},
    beatAnalysis: null, scenes: [], agentBrief: '', agentPackets: null, shotApprovals: {},
    subject: '', location: '', recipeScenes: [], osTextMode: 'AUTO', voSyncMode: 'FREE',
    liveMamiDirectives: [], vault: [],
  };
  return buildProjectPack(state);
}

describe('closeout → lessonCandidates (otomatik promote YOK)', () => {
  it('closeout yapılandırılmış lessonCandidates üretir; hepsi CANDIDATE statülü', () => {
    const closeout = buildCloseout(samplePack(), 'mamilas-x', 'mamilas-x');
    expect(Array.isArray(closeout.lessonCandidates)).toBe(true);
    expect(closeout.lessonCandidates.length).toBeGreaterThan(0);
    for (const cand of closeout.lessonCandidates) {
      expect(cand).toHaveProperty('lesson');
      expect(cand).toHaveProperty('sourceProject');
      expect(cand.status).toBe('CANDIDATE'); // otomatik yasalaşma YOK
    }
  });
});

describe('APPROVED.md parse — yalnız Mami-onaylı dersler', () => {
  it('markdown ders satırlarını (ders + kaynak + tarih) parse eder; format-dışı satırı atlar', () => {
    const md = [
      '# MAMILAS — Mami-onaylı ders bankası',
      '',
      '- one_piece tipi dünyalarda figür-cel/arka-plan-boya ayrımını promptta AÇIK yaz — kaynak: X projesi · 2026-07-14 · Mami onayı',
      'serbest metin satırı (ders değil)',
      '- Kling motion promptunda halat/ip gibi ince nesneleri fragile-element negatifine yaz — kaynak: Y projesi · 2026-07-15 · Mami onayı',
    ].join('\n');
    const lessons = parseApprovedLessons(md);
    expect(lessons).toHaveLength(2);
    expect(lessons[0]).toEqual({
      lesson: 'one_piece tipi dünyalarda figür-cel/arka-plan-boya ayrımını promptta AÇIK yaz',
      sourceProject: 'X projesi',
      date: '2026-07-14',
      status: 'APPROVED',
    });
  });

  it('boş/başlık-yalnız dosya boş dizi verir (banka opsiyonel — yoksa akış durmaz)', () => {
    expect(parseApprovedLessons('')).toEqual([]);
    expect(parseApprovedLessons('# başlık\n\naçıklama')).toEqual([]);
  });
});

describe('approvedLessons context slice — kısa, curated, tavanlı', () => {
  it('slice yalnız APPROVED dersleri taşır ve 20 ile tavanlıdır (context ekonomisi)', () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      `- ders ${i} — kaynak: P${i} · 2026-07-16 · Mami onayı`).join('\n');
    const slice = approvedLessonsSlice(parseApprovedLessons(many));
    expect(slice.length).toBeLessThanOrEqual(20);
    expect(slice.every((l) => l.status === 'APPROVED')).toBe(true);
  });

  it('parser FONKSİYONEL PARİTE: TS ve runner parser\'ı aynı girdilerde byte-eş çıktı verir', async () => {
    // Sol P1: imza/cap smoke-test'i drift'i geçirebilir — iki parser GERÇEKTEN çalıştırılıp
    // çıktıları karşılaştırılır (adversarial girdiler dahil).
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const { pathToFileURL } = require('node:url');
    const { resolve } = require('node:path');
    const runner = await import(pathToFileURL(resolve('scripts/mamilas-command.mjs')).href);
    expect(runner.__testParseApprovedLessons, 'runner parser export etmeli').toBeTruthy();
    const tsParse = (md: string) => approvedLessonsSlice(parseApprovedLessons(md));
    const cases = [
      '',
      '# başlık yalnız',
      '- düzgün ders — kaynak: P · 2026-07-16 · Mami onayı',
      '- eksik tarih ders — kaynak: P · Mami onayı',                       // format-dışı → atlanır
      '- unicode — ders · tire—li — kaynak: Ü Projesi · 2026-01-02 · Mami onayı',
      '-boşluksuz ders — kaynak: P · 2026-07-16 · Mami onayı',             // "- " yok → atlanır
      Array.from({ length: 30 }, (_, i) => `- ders ${i} — kaynak: P${i} · 2026-07-16 · Mami onayı`).join('\n'), // cap 20
      '- sondaki boşluk — kaynak: P · 2026-07-16 · Mami onayı   ',
    ];
    for (const md of cases) {
      expect(JSON.stringify(runner.__testParseApprovedLessons(md)), md.slice(0, 40))
        .toBe(JSON.stringify(tsParse(md)));
    }
  });

  it('HASH sınırı: ders bankası değişse de sceneContextHash değişmez (command stale olmaz)', async () => {
    // buildImageAuthorContext lessons OKUMAZ → aynı command iki çağrıda aynı context'i verir;
    // canonicalHash da aynı kalır. Banka runner'ın hash-DIŞI sessionContext katmanında.
    const { buildImageAuthorContext } = await import('./agentProtocol');
    const { canonicalHash } = await import('./contract');
    const command: any = {
      commandId: 'mamilas-test',
      baseDecision: { locks: {}, engine: { imageModel: 'nano_banana_2' }, mode: 'M' },
      lifecycle: { protocol: { version: 'v', contentHash: 'h' }, storyboardHash: 's', mamiDirectives: [] },
      scenes: [{ id: 1, phaseName: 'Intro', durationSec: 3, architecture: {}, sceneBrief: 'x', prompts: {}, handoff: {} }],
      worldPacket: null,
    };
    const h1 = canonicalHash(buildImageAuthorContext(command, 1));
    const h2 = canonicalHash(buildImageAuthorContext(command, 1));
    expect(h1).toBe(h2);
    expect(JSON.stringify(buildImageAuthorContext(command, 1))).not.toContain('approvedLessons');
  });

  it('KRİTİK sınır: dersler sceneContextHash\'e GİRMEZ — hash\'lenen context lessons taşımaz', async () => {
    // Dersler atölye hafızası, karar değil: buildImageAuthorContext'e (hash'e giren
    // katman) eklenirse banka her büyüdüğünde TÜM command'ler stale olur. Doğru yer
    // runner'ın launch-anı sessionContext'i (hash-dışı, artifactContract katmanı) —
    // commandRuntime testi CONTEXT.json.approvedLessons'ı ölçer.
    const { buildImageAuthorContext } = await import('./agentProtocol');
    const command: any = {
      commandId: 'mamilas-test',
      baseDecision: { locks: {}, engine: { imageModel: 'nano_banana_2' }, mode: 'M' },
      lifecycle: { protocol: { version: 'v', contentHash: 'h' }, storyboardHash: 's', mamiDirectives: [] },
      scenes: [{ id: 1, phaseName: 'Intro', durationSec: 3, architecture: {}, sceneBrief: 'x', prompts: {}, handoff: {} }],
      worldPacket: null,
    };
    const ctx = buildImageAuthorContext(command, 1);
    expect('approvedLessons' in ctx).toBe(false);
    expect((buildImageAuthorContext as any).length).toBe(2); // üçüncü lessons parametresi YOK
  });
});
