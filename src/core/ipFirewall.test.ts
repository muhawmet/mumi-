import { describe, expect, it } from 'vitest';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import IP_FIREWALL from '../../agents/ipFirewall.json';
import { COMMERCIAL_BRAND_RE } from './brain';
import { PROTECTED_IP_SOURCE, WORK_TITLE_SOURCE, protectedTermsIn } from './proof';

// ============================================================================
// HARD-FIX 2026-07-16 — rapor madde 16/17. IP/brand firewall TEK KANON
// (agents/ipFirewall.json); TS yüzeyi (proof.ts/brain.ts) ve agent runtime
// (mamilas-command.mjs firewallHitsIn) aynı dosyadan okur. Bu testler:
// (a) kanon paritesini, (b) runtime'da FINAL agent prompt'una karşı NEGATİF
// probe'ları kilitler — hash-valid + jury-PASS sızıntı mekanik kapıdan geçemez.
// ============================================================================

async function runnerModule() {
  return import(pathToFileURL(resolve('scripts/mamilas-command.mjs')).href);
}

describe('kanon paritesi — iki yüzey aynı dosyadan okur', () => {
  it('TS exportlari ipFirewall.json kanonuyla birebir', () => {
    expect(PROTECTED_IP_SOURCE).toBe(IP_FIREWALL.protectedIpSource);
    expect(WORK_TITLE_SOURCE).toBe(IP_FIREWALL.workTitleSource);
    expect(COMMERCIAL_BRAND_RE.source).toBe(`\\b(?:${IP_FIREWALL.commercialBrandSource})\\b`);
  });

  it.each([
    'Naruto koşar ve kayaya tırmanır',            // korumalı karakter
    "Naruto'nun pelerini rüzgarda",                 // Türkçe ek — apostroflu
    'Gokunun enerji dalgası',                       // Türkçe ek — apostrofsuz
    'a heroic figure like harry potter at dawn',    // batı franchise
    'the Batmobile parked in rain',                 // franchise nesnesi
  ])('fonksiyonel parite — her iki yüzey de yakalar: %s', async (text) => {
    const { firewallHitsIn } = await runnerModule();
    expect(protectedTermsIn(text).length, `proof.ts kaçırdı: ${text}`).toBeGreaterThan(0);
    expect(firewallHitsIn(text).length, `runner kaçırdı: ${text}`).toBeGreaterThan(0);
  });

  it.each([
    'Robin yeleği giymiş esnaf tezgah başında',     // muaf jenerik (Türkçe okuma)
    'powder mavisi gömlekli kadın',
    'Sakura ağacı altında oturan yaşlı adam',
    'Bleach ile temizlik yapan kadın',
    'a shared endeavor across the team',
  ])('fonksiyonel parite — her iki yüzey de GEÇİRİR (yanlış-pozitif yok): %s', async (text) => {
    const { firewallHitsIn } = await runnerModule();
    expect(protectedTermsIn(text), `proof.ts yanlış blokladı: ${text}`).toEqual([]);
    expect(firewallHitsIn(text), `runner yanlış blokladı: ${text}`).toEqual([]);
  });
});

describe('runtime negatif probe — hash-valid artifact sızıntıyla mühürlenemez', () => {
  it('image_author final promptunda korumalı kimlik → validateRoleContent kırmızı', async () => {
    const runner = await runnerModule();
    const prompt = 'A young ninja exactly like Naruto sprints across the rooftop at dawn.';
    const problems = runProbe(runner, 'image_author', prompt);
    expect(problems.join(' ')).toMatch(/IP firewall/);
    expect(problems.join(' ')).toMatch(/naruto/);
  });

  it('image_author final promptunda ticari marka → kırmızı', async () => {
    const runner = await runnerModule();
    const prompt = 'The Apple logo gleams on the laptop lid under a single key light.';
    const problems = runProbe(runner, 'image_author', prompt);
    expect(problems.join(' ')).toMatch(/IP firewall/);
    expect(problems.join(' ')).toMatch(/apple/);
  });

  it('motion_author final promptunda eser adı (Spider-Verse) → kırmızı', async () => {
    const runner = await runnerModule();
    const prompt = 'Camera pushes in with Spider-Verse frame-cadence energy as the figure leaps.';
    const problems = runProbe(runner, 'motion_author', prompt);
    expect(problems.join(' ')).toMatch(/IP firewall/);
  });

  it('temiz zanaat promptu firewall problemi ÜRETMEZ', async () => {
    const runner = await runnerModule();
    const prompt = 'A weathered fisherman grips the mooring rope at the pier edge; one motivated key light from the low sun; 35mm.';
    const problems = runProbe(runner, 'image_author', prompt);
    expect(problems.filter((p: string) => p.includes('IP firewall'))).toEqual([]);
  });
});

// ============================================================================
// M2 (2026-07-18) — PROMPT SURGEON runtime negatif probe. Kök: mjs validateRoleContent
// jüri PASS'i (ayrı artifact) + boş-olmayan evidence gördü mü kabul ediyordu; author
// prompt'un ölçülebilir bir rejectIf (AI-slop) taşıyıp taşımadığına BAKMIYORDU →
// `verdict:'PASS', evidence:['ok']` bir slop-prompt'u aklayabiliyordu. Fix: author
// artifact'i prompt'u SURGEON'dan geçer; slop tetiklenirse artifact kırmızı, jüri PASS
// onu kurtaramaz. agentProtocol.ts verifyAgentArtifact ile FONKSİYONEL PARİTE.
// ============================================================================
describe('runtime negatif probe — jüri PASS ölçülebilir slop\'u aklayamaz (mjs)', () => {
  it('image_author final promptunda AI-slop → validateRoleContent kırmızı', async () => {
    const runner = await runnerModule();
    const prompt = 'A thermos, masterpiece, ultra-detailed, trending on artstation, 8k.';
    const problems = runProbe(runner, 'image_author', prompt);
    expect(problems.join(' ')).toMatch(/AI-slop \(surgeon\)/);
    expect(problems.join(' ')).toMatch(/masterpiece/);
  });

  it('motion_author gövdesinde slop → kırmızı; NEGATIVE prohibition satırı muaf', async () => {
    const runner = await runnerModule();
    const dirty = runProbe(runner, 'motion_author', 'Thermos rotates, cinematic lighting, breathtaking.');
    expect(dirty.join(' ')).toMatch(/AI-slop \(surgeon\)/);
    const clean = runProbe(runner, 'motion_author', 'Thermos rotates slowly.\nNEGATIVE: masterpiece, cinematic lighting, 8k');
    expect(clean.filter((p: string) => p.includes('AI-slop'))).toEqual([]);
  });

  it('temiz zanaat promptu slop problemi ÜRETMEZ', async () => {
    const runner = await runnerModule();
    const prompt = 'A weathered fisherman grips the mooring rope; one motivated key light from the low sun; 35mm.';
    const problems = runProbe(runner, 'image_author', prompt);
    expect(problems.filter((p: string) => p.includes('AI-slop'))).toEqual([]);
  });
});

// ============================================================================
// P1/P2 (2026-07-19) — directorBrief / brandKitLock runtime firewall paritesi.
// Site validateBriefCompatibility bu iki serbest-metin alanını korumalı IP/eser/hex
// için tarar; runtime ikizi (freeTextLeaksIn, validateCommand'e bağlı) AYNI taramayı
// yapar AMA ticari-marka'yı taramaz (brandKitLock = müşterinin kendi markası).
// Yeni regex yok — mevcut kanonik ipFirewall primitifleri (FW_TERM_RES/FW_WORK_TITLE_RE).
// ============================================================================
describe('runtime free-text firewall — directorBrief/brandKitLock IP+hex paritesi (mjs)', () => {
  it('korumalı KARAKTER (bare/TR-suffix) yakalanır', async () => {
    const { freeTextLeaksIn } = await runnerModule();
    expect(freeTextLeaksIn("Naruto'nun tarzında olsun").length).toBeGreaterThan(0);
    expect(freeTextLeaksIn('Goku enerjisi').length).toBeGreaterThan(0);
  });

  it('ESER adı (work title) yakalanır', async () => {
    const { freeTextLeaksIn } = await runnerModule();
    expect(freeTextLeaksIn('Spider-Verse tarzında').length).toBeGreaterThan(0);
  });

  it('ham hex 3/4/6/8-hane yakalanır (site ile parite)', async () => {
    const { freeTextLeaksIn } = await runnerModule();
    expect(freeTextLeaksIn('gölge #F0A')).toContain('#F0A');
    expect(freeTextLeaksIn('aksan #FF00AA')).toContain('#FF00AA');
    expect(freeTextLeaksIn('aksan #FF00AAFF')).toContain('#FF00AAFF');
  });

  it('müşterinin KENDİ markası (ticari marka) bloklanmaz — brandKitLock muafiyeti korunur', async () => {
    const { freeTextLeaksIn } = await runnerModule();
    // Ticari marka (FW_BRAND_RE) bu taramaya girmez — site asimetrisiyle birebir.
    expect(freeTextLeaksIn('Marka logosu sağ altta, kurumsal lacivert')).toEqual([]);
    expect(freeTextLeaksIn('el işi ahşap tezgah, powder mavisi')).toEqual([]);
  });

  it('validateCommand: leaky directorBrief taşıyan command REDDEDİLİR', async () => {
    const runner = await runnerModule();
    // Minimal command iskeleti: yalnız directorBrief sızıntısının validateCommand'de
    // problem üretip üretmediğini ölçer (diğer alan hataları beklenir, firewall satırı
    // spesifik arandığı için sahte yeşil imkânsız).
    const command = {
      baseDecision: { creativeControls: { directorBrief: 'Spider-Verse tarzında, gölgeler #F0A' }, locks: {} },
      scenes: [],
      lifecycle: {},
    };
    const result = await runner.validateCommand(command);
    const problems: string[] = result.problems ?? result;
    expect(problems.join(' ')).toMatch(/directorBrief IP\/hex sızıntısı/);
    expect(problems.join(' ')).toMatch(/spider-verse/i);
  });
});

// validateRoleContent'i minimum geçerli iskeletle sürer — yalnız firewall'un
// problems dizisine yazıp yazmadığını ölçer (diğer alan hataları beklenir ve filtrelenmez;
// firewall satırı spesifik arandığı için sahte yeşil imkânsız).
function runProbe(runner: any, role: string, prompt: string): string[] {
  const { sha256 } = runner;
  const content = role === 'image_author'
    ? {
        prompt, promptHash: sha256(prompt),
        interpretation: { dominantSubject: 'x', singleEvent: 'y', frozenInstant: 'z' },
        directiveReceipts: [], appliedLocks: ['world'], suppressedContext: [], risks: [],
      }
    : { prompt, promptHash: sha256(prompt), inventory: ['figure'], risks: [], frameHash: 'f'.repeat(64) };
  const command = {
    scenes: [{ id: 1 }],
    lifecycle: { mamiDirectives: [] },
  };
  const artifact = { role, sceneId: 1, content };
  return runner.__testValidateRoleContent(artifact, command);
}
