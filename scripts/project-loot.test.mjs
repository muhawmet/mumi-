// FAZ 9 — PROJECT LOOT kilidi.
//
// Bu testler Faz 9 kararındaki **zorunlu test listesini** kod hâline getirir
// (`artifacts/iq-run/FAZ-9-KARAR-PROJECT-LOOT.md` → "Zorunlu testler").
// Kanıt ölçütü orada da yazılı: *"Yeşil test bitmişlik sayılmaz"* — bu yüzden testler
// halkanın DAVRANIŞINI kilitler (hüküm değişmedi mi, aday sessizce banka oldu mu),
// fonksiyonların var olduğunu değil.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const MOD = './project-loot.mjs';
const HASAT = './kapanis-hasadi.mjs';
const APPROVED = new URL('../agents/lessons/APPROVED.md', import.meta.url).pathname;

/** Geçerli bir kapanmış loot — `kapat` çıktısının aynısı, ölçüm kısmı sabitlenmiş. */
const seedLoot = (dir, over = {}) => {
  const loot = {
    version: 1,
    project: { id: 'TEST Projesi', path: 'tmp/TEST Projesi', closedAt: '2026-07-29T00:00:00.000Z' },
    status: 'interview-pending',
    subjectiveVerdict: { overall: null, layerVerdicts: null, recordedAt: null },
    objectiveMetrics: { status: 'OK', register: 'EDU', registerSource: 'override', lint: { total: 34, clean: 34, badCount: 0 }, kit: { missing: [], nameDrift: [] }, errors: [] },
    lessonCandidates: [],
    interview: { answered: [], skippedAt: null },
    ...over,
  };
  writeFileSync(join(dir, 'PROJECT-LOOT.json'), JSON.stringify(loot, null, 2), 'utf8');
  return loot;
};

const readLootFile = (dir) => JSON.parse(readFileSync(join(dir, 'PROJECT-LOOT.json'), 'utf8'));

let tmp;
beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), 'loot-')); });
afterEach(() => { rmSync(tmp, { recursive: true, force: true }); });

describe('PROJECT LOOT — kanonik kaynak', () => {
  it('güçlü start-frame + zayıf motion AYRI saklanır (katman bağımsız)', async () => {
    const { cmdCevap } = await import(MOD);
    seedLoot(tmp);
    cmdCevap(tmp, { katman: 'startFrame', metin: 'kareler harika olmuş' });
    cmdCevap(tmp, { katman: 'motion', metin: 'videolarda morphing var' });
    const lo = readLootFile(tmp);
    expect(lo.subjectiveVerdict.layerVerdicts.startFrame).toBe('kareler harika olmuş');
    expect(lo.subjectiveVerdict.layerVerdicts.motion).toBe('videolarda morphing var');
    // Katmanlar birbirine sızmaz: biri iyi diğeri kötü olabilir.
    expect(lo.subjectiveVerdict.layerVerdicts.ses).toBeUndefined();
    expect(lo.status).toBe('interview-partial');
  });

  it("Mami'nin metni DEĞİŞTİRİLMEZ — kırpılmaz, düzeltilmez, yeniden yazılmaz", async () => {
    const { cmdCevap } = await import(MOD);
    seedLoot(tmp);
    const ham = 'ya amına koydurma  her şeye takıldın   nasıl seri üreteceğim ben böyle?';
    cmdCevap(tmp, { katman: 'kurgu', metin: ham });
    expect(readLootFile(tmp).subjectiveVerdict.layerVerdicts.kurgu).toBe(ham);
  });

  it('boş / tek harflik cevaptan HÜKÜM ÜRETİLMEZ', async () => {
    const { cmdCevap } = await import(MOD);
    seedLoot(tmp);
    expect(() => cmdCevap(tmp, { katman: 'ses', metin: '   ' })).toThrow(/CEVAP_BOS/);
    expect(() => cmdCevap(tmp, { katman: 'ses', metin: 'ee' })).toThrow(/CEVAP_BOS/);
    expect(readLootFile(tmp).subjectiveVerdict.layerVerdicts).toBeNull();
  });

  it('geçersiz katmana hüküm yazılmaz (ders yanlış katmana uygulanmaz)', async () => {
    const { cmdCevap } = await import(MOD);
    seedLoot(tmp);
    expect(() => cmdCevap(tmp, { katman: 'renk', metin: 'palet soğuk' })).toThrow(/KATMAN_GECERSIZ/);
  });

  it('yarım röportaj KALDIĞI YERDEN devam eder', async () => {
    const { cmdCevap, cmdSor } = await import(MOD);
    seedLoot(tmp);
    cmdCevap(tmp, { katman: 'startFrame', metin: 'kareler iyi' });
    cmdCevap(tmp, { katman: 'ses', metin: 'ses temiz' });
    const log = cmdSor(tmp).log.join('\n');
    // Cevaplanmışları tekrar sormaz; sıradaki İLK boşluğu sorar.
    expect(log).toContain('motion');
    expect(log).not.toContain('startFrame');
    expect(log).toContain('3/5');
  });

  it('röportaj ATLANABİLİR — teknik loot yine yerinde, layerVerdicts null', async () => {
    const { cmdAtla } = await import(MOD);
    seedLoot(tmp);
    const { loot } = cmdAtla(tmp);
    expect(loot.status).toBe('interview-skipped');
    expect(loot.subjectiveVerdict.layerVerdicts).toBeNull();
    // Düzeltme 1'in bütün amacı bu: ölçüm KAYBOLMAZ.
    expect(loot.objectiveMetrics.lint.total).toBe(34);
    expect(loot.interview.skippedAt).toBeTruthy();
  });
});

describe('evidenceStrength — confidence YOK', () => {
  it('sayılabilir kanıt yoksa null döner (tahmin veri kılığına sokulmaz)', async () => {
    const { evidenceStrength } = await import(MOD);
    expect(evidenceStrength({})).toBeNull();
    expect(evidenceStrength({ frames: null, repeat: null, beforeAfter: false })).toBeNull();
  });

  it('yalnız üç sayılabilir alandan türer', async () => {
    const { evidenceStrength } = await import(MOD);
    const es = evidenceStrength({ frames: 13, repeat: 7, beforeAfter: true });
    expect(es).toEqual({ framesCovered: 13, repeatCount: 7, beforeAfter: true });
    expect(Object.keys(es)).not.toContain('confidence');
  });

  it('sayı olmayan kanıt AÇIK hata verir', async () => {
    const { evidenceStrength } = await import(MOD);
    expect(() => evidenceStrength({ frames: 'çok' })).toThrow(/EVIDENCE_INVALID/);
  });
});

describe('carry-forward — iki otorite seviyesi', () => {
  let bankYedek;
  beforeEach(() => { bankYedek = readFileSync(APPROVED, 'utf8'); });
  afterEach(() => { writeFileSync(APPROVED, bankYedek, 'utf8'); });

  it('Mami TAŞI demedikçe APPROVED.md DEĞİŞMEZ', async () => {
    const { cmdAday } = await import(MOD);
    seedLoot(tmp);
    cmdAday(tmp, { metin: 'kadraj kilidi cümlesi her @tag karesinde yazılır', kare: 13 });
    expect(readFileSync(APPROVED, 'utf8')).toBe(bankYedek);
    expect(readLootFile(tmp).lessonCandidates[0].carryForward).toBe(false);
  });

  it('TAŞI dendiğinde banka satırı SONA eklenir ve parse edilebilir biçimdedir', async () => {
    const { cmdAday, cmdTasi } = await import(MOD);
    seedLoot(tmp);
    cmdAday(tmp, { metin: 'insanlı kadrajda kamera eksende ve boom olur', kare: 13, repeat: 5 });
    cmdTasi(tmp, { adayId: 1 });
    const bank = readFileSync(APPROVED, 'utf8');
    const satirlar = bank.split('\n').filter((l) => /^-\s+/.test(l));
    const son = satirlar[satirlar.length - 1];
    // `src/core/lessonBank.ts` biçimi + `slice(-20)` konumsal: yeni ders SONDA olmalı.
    expect(son).toMatch(/^- .+ — kaynak: .+ · \d{4}-\d{2}-\d{2} · Mami onayı$/);
    expect(son).toContain('insanlı kadrajda kamera eksende');
    expect(readLootFile(tmp).lessonCandidates[0].carryForward).toBe(true);
    expect(readLootFile(tmp).lessonCandidates[0].approvedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('aynı ders İKİ KEZ eklenmez (ne aday ne banka)', async () => {
    const { cmdAday, cmdTasi } = await import(MOD);
    seedLoot(tmp);
    const ders = 'temas gölgesi örneği asla ayakkabıya yazılmaz';
    cmdAday(tmp, { metin: ders, kare: 13 });
    cmdAday(tmp, { metin: `  ${ders.toUpperCase()}!  ` }); // aynı ders, farklı yazım
    expect(readLootFile(tmp).lessonCandidates).toHaveLength(1);

    cmdTasi(tmp, { adayId: 1 });
    const bir = readFileSync(APPROVED, 'utf8').split('\n').filter((l) => l.includes('ayakkabıya')).length;
    cmdTasi(tmp, { adayId: 1 }); // ikinci taşıma
    const iki = readFileSync(APPROVED, 'utf8').split('\n').filter((l) => l.includes('ayakkabıya')).length;
    expect(bir).toBe(1);
    expect(iki).toBe(1);
  });

  it('olmayan adayı taşımak AÇIK hata verir', async () => {
    const { cmdTasi } = await import(MOD);
    seedLoot(tmp);
    expect(() => cmdTasi(tmp, { adayId: 99 })).toThrow(/ADAY_YOK/);
  });
});

describe('dayanıklılık', () => {
  it('PROJECT-LOOT olmayan eski proje KIRILMAZ', async () => {
    const { cmdGor } = await import(MOD);
    const r = cmdGor(tmp);
    expect(r.log.join(' ')).toMatch(/loot'suz|yok/);
    expect(existsSync(join(tmp, 'PROJECT-LOOT.json'))).toBe(false);
  });

  it('bozuk JSON SESSİZCE YUTULMAZ ve ÜSTÜNE YAZILMAZ', async () => {
    const { cmdGor, cmdCevap } = await import(MOD);
    const bozuk = '{bu json degil';
    writeFileSync(join(tmp, 'PROJECT-LOOT.json'), bozuk, 'utf8');
    expect(() => cmdGor(tmp)).toThrow(/LOOT_BROKEN/);
    expect(() => cmdCevap(tmp, { katman: 'motion', metin: 'bir hüküm' })).toThrow(/LOOT_BROKEN/);
    expect(readFileSync(join(tmp, 'PROJECT-LOOT.json'), 'utf8')).toBe(bozuk);
  });

  it('aynı proje İKİ KEZ kapatılınca hüküm ve adaylar KORUNUR', async () => {
    const { cmdKapat, cmdCevap, cmdAday } = await import(MOD);
    // Prompt dosyası yok → harvest ERROR verir; teknik loot YİNE yazılmalı.
    const { loot: ilk } = cmdKapat(tmp, { registerOverride: 'EDU' });
    expect(existsSync(join(tmp, 'PROJECT-LOOT.json'))).toBe(true);
    expect(ilk.objectiveMetrics.status).toBe('ERROR'); // ölçüm hatası saklanır, gizlenmez
    cmdCevap(tmp, { katman: 'motion', metin: 'morphing var' });
    cmdAday(tmp, { metin: 'el kavradığını klipte bırakmaz', kare: 13 });

    const { loot: ikinci } = cmdKapat(tmp, { registerOverride: 'EDU' });
    expect(ikinci.subjectiveVerdict.layerVerdicts.motion).toBe('morphing var');
    expect(ikinci.lessonCandidates).toHaveLength(1);
    expect(ikinci.project.reclosedAt).toBeTruthy();
    expect(ikinci.project.closedAt).toBe(ilk.project.closedAt); // ilk kapanış tarihi kaymaz
  });

  it('register override yalnız REAL|EDU|STY kabul eder, çöp değer AÇIK hata olur', async () => {
    const { harvest } = await import(HASAT);
    const h = harvest(tmp, { registerOverride: 'PIXAR' });
    expect(h.errors.some((e) => /REGISTER_OVERRIDE_INVALID/.test(e))).toBe(true);
  });
});

describe('HASAT = deterministik görünüm', () => {
  it('loot yoksa HASAT loot bölümü hiç açılmaz', async () => {
    const { renderLoot } = await import(HASAT);
    expect(renderLoot({ loot: null })).toEqual([]);
  });

  it("Mami'nin hükmü HASAT'a AYNEN basılır, aday/carry-forward ayrımı görünür", async () => {
    const { renderLoot } = await import(HASAT);
    const md = renderLoot({
      loot: {
        _file: 'PROJECT-LOOT.json',
        status: 'interview-partial',
        project: { closedAt: '2026-07-29T00:00:00.000Z' },
        subjectiveVerdict: { overall: null, layerVerdicts: { motion: 'videolarda morphing var' } },
        lessonCandidates: [
          { id: 1, text: 'taşınan ders', evidenceStrength: { framesCovered: 13, repeatCount: 7, beforeAfter: true }, carryForward: true, approvedAt: '2026-07-29' },
          { id: 2, text: 'taşınmayan ders', evidenceStrength: null, carryForward: false, approvedAt: null },
        ],
      },
    }).join('\n');
    expect(md).toContain('videolarda morphing var');
    expect(md).toContain('**EVET** (Mami dedi)');
    expect(md).toContain('hayır — yalnız aday');
    // Kanıtı olmayan aday "orta güven" diye uydurulmaz.
    expect(md).toContain('| — |');
  });

  it('bozuk loot HASAT içinde de KIRMIZI olur, boş görünmez', async () => {
    const { renderLoot } = await import(HASAT);
    const md = renderLoot({ loot: { _file: 'PROJECT-LOOT.json', parseError: 'Unexpected token' } }).join('\n');
    expect(md).toContain('OKUNAMADI');
    expect(md).toContain('ölçülemedi');
  });
});

describe('ortam — Windows/macOS birlikte', () => {
  it('script kabuk çağrısı, python3 ya da /tmp sabiti içermez', () => {
    // Yorum satırları çıkarılır: ortam yasasının KENDİSİ "python3 yok" yazıyor, o bir kullanım
    // değil. Kapı kodu ölçer, dokümantasyonu değil.
    const kod = readFileSync(new URL(MOD, import.meta.url).pathname, 'utf8')
      .split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    expect(kod).not.toMatch(/child_process|execSync|spawnSync/);
    expect(kod).not.toMatch(/python3?\b/);
    // `/tmp` sabiti yok; geçici yol gerekirse `os.tmpdir()` kullanılır.
    expect(kod).not.toMatch(/['"`]\/tmp\//);
  });

  it('proje adı NFC normalize edilir (macOS NFD ↔ Windows NFC tuzağı)', async () => {
    const { cmdKapat } = await import(MOD);
    const nfd = join(tmp, 'Bizi Bir Arada Tutan Değerler'); // ğ = g + combining breve
    mkdirSync(nfd, { recursive: true });
    const { loot } = cmdKapat(nfd, { registerOverride: 'EDU' });
    expect(loot.project.id.normalize('NFC')).toBe(loot.project.id);
  });
});
