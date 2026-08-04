import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
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
      topic: 'genel', // konu etiketi yazılmamış eski satır — 2026-08-04 konusal tavan
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

  // ═══ KONUSAL TAVAN (2026-08-04) ═════════════════════════════════════════════
  // Ölçüm: bankadaki 7 dersin 7'si TEK projeden ve TEK konudan (yüzeydeki Türkçe yazı);
  // bekleyen 107 aday 16 projeden. Eski tavan `slice(-20)` KONUMSALDI — yani banka
  // dolduğunda hayatta kalanı DEĞER değil YAZILMA SIRASI belirliyordu. Sonuç: son
  // projenin takıntısı bankayı tek başına doldurabilir, tek başına duran bir motion
  // dersi hiç görülmeden düşer. Aşağıdaki ilk test ESKİ KODDA DÜŞER — kapının
  // kırmızı yanabildiğinin kanıtı budur.

  it('KIRMIZI KANITI: 25 yazı dersi arasındaki TEK motion dersi tavanda hayatta kalır', () => {
    // Eski `slice(-20)`: motion dersi en başta olduğu için ilk düşenlerden olurdu.
    const satirlar = [
      '- motion dersi — kaynak: Destek · 2026-08-01 · Mami onayı · konu: motion',
      ...Array.from({ length: 25 }, (_, i) =>
        `- yazı dersi ${i} — kaynak: Birlikte · 2026-07-31 · Mami onayı · konu: yazı`),
    ].join('\n');
    const hepsi = parseApprovedLessons(satirlar);

    // (1) ESKİ DAVRANIŞIN KUSURU ÖLÇÜLÜYOR — bu satır olmadan "onardım" iddiası sözde kalır.
    // Konumsal tavan motion dersini düşürüyordu; kapının kırmızı yanabildiğinin kanıtı budur.
    expect(hepsi.slice(-20).some((l) => l.topic === 'motion'),
      'konumsal tavan motion dersini DÜŞÜRÜRDÜ — kusur buydu').toBe(false);

    // (2) YENİ DAVRANIŞ onu kurtarıyor.
    const slice = approvedLessonsSlice(hepsi);
    expect(slice.length).toBe(20);
    expect(slice.some((l) => l.topic === 'motion'), 'tek motion dersi düşmemeli').toBe(true);
    // ve yazı dersleri arasından EN YENİLERİ değil — hepsi aynı tarihte; sayı korunuyor
    expect(slice.filter((l) => l.topic === 'yazı')).toHaveLength(19);
  });

  it('GERİYE UYUM: konu etiketi olmayan eski satırlar aynen parse olur (topic = genel)', () => {
    const eski = '- eski ders — kaynak: P · 2026-07-16 · Mami onayı';
    const [l] = parseApprovedLessons(eski);
    expect(l.lesson).toBe('eski ders');
    expect(l.topic).toBe('genel');
  });

  it('EŞDEĞERLİK: tek konu varsa davranış eski slice(-20) ile birebir aynı', () => {
    const md = Array.from({ length: 30 }, (_, i) =>
      `- ders ${i} — kaynak: P${i} · 2026-07-16 · Mami onayı`).join('\n');
    const hepsi = parseApprovedLessons(md);
    expect(approvedLessonsSlice(hepsi)).toEqual(hepsi.slice(-20));
  });

  it('konu etiketi büyük/küçük harf ve boşluktan bağımsız normalize olur', () => {
    const md = '- d — kaynak: P · 2026-07-16 · Mami onayı · konu:   IŞIK  ';
    expect(parseApprovedLessons(md)[0].topic).toBe('ışık');
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
      // 2026-08-04 konusal tavan — parite YENİ davranışta da ölçülmeli, yoksa ikizler
      // eski girdilerde eş görünüp gerçek bankada ayrışır (bu depoda 8 kez ölçülen sınıf).
      '- konulu ders — kaynak: P · 2026-07-16 · Mami onayı · konu: ışık',
      '- KONU normalize — kaynak: P · 2026-07-16 · Mami onayı · konu:  IŞIK  ',
      [
        '- motion tek — kaynak: D · 2026-08-01 · Mami onayı · konu: motion',
        ...Array.from({ length: 25 }, (_, i) => `- yazı ${i} — kaynak: B · 2026-07-31 · Mami onayı · konu: yazı`),
      ].join('\n'),
      // karışık: etiketli + etiketsiz aynı dosyada
      [
        '- etiketsiz — kaynak: P · 2026-07-16 · Mami onayı',
        '- etiketli — kaynak: P · 2026-07-16 · Mami onayı · konu: motion',
      ].join('\n'),
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

  // 2026-07-29: `parseApprovedLessons` format-dışı satırı SESSİZCE atlıyor ("banka opsiyonel").
  // Sessizlik doğru varsayılan, ama gerçek dosyada TEHLİKE: Mami 12 dersi onaylar, taşıyan ajan
  // em-dash yerine tire ya da `·` yerine `-` yazar → banka boş kalır ve KİMSE fark etmez.
  // Öğrenme halkasının tam da bu noktada koptuğu ölçüldü (APPROVED.md bugün 0 ders taşıyor).
  // Bu test sessiz kaybı DUVARA çevirir: gerçek dosyadaki her ders-görünümlü satır parse EDİLMELİ.
  it('gerçek APPROVED.md: ders görünümlü hiçbir satır sessizce düşmez', async () => {
    const { readFileSync } = await import('node:fs');
    const path = fileURLToPath(new URL('../../agents/lessons/APPROVED.md', import.meta.url));
    const md = readFileSync(decodeURIComponent(path), 'utf8');

    // Ders ADAYI olan satırlar: "- " ile başlayan ve "kaynak:" geçen liste satırları.
    // Biçim örneğinin kendisi ``` bloğunda ve `<...>` placeholder taşıyor — o örnek sayılmaz.
    const dersGorunumlu = md.split('\n')
      .map((l) => l.trim())
      .filter((l) => /^-\s+/.test(l) && /kaynak:/i.test(l) && !/[<>]/.test(l));

    const parsed = parseApprovedLessons(md);
    const dusen = dersGorunumlu.length - parsed.length;

    expect(dusen, dersGorunumlu.length
      ? `APPROVED.md'de ${dusen} satır ders gibi duruyor ama PARSE EDİLMİYOR — sessizce düşüyor. `
        + `Biçim: "- <ders> — kaynak: <proje> · YYYY-AA-GG · Mami onayı" (em-dash — ve orta nokta ·). `
        + `Düşen satırlar:\n` + dersGorunumlu.filter((l) => !parseApprovedLessons(l).length).join('\n')
      : 'banka boş — normal').toBe(0);
  });
});
