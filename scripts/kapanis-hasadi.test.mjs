// KAPANIŞ HASADI — davranış kilitleri.
//
// Her test ÖLÇÜLMÜŞ bir kusura bağlıdır; hiçbiri "kodu tekrar eden" test değildir.
// Kusurların kaynağı: 2026-07-29 hasat denetimi (10 bulgu, hepsi diskteki çıktıyla kanıtlı).
//
// NOT: `src/core/` DONUK — bu dosya bilerek `scripts/` altında. Faz yasası (icraat) üretim
// sırasında çekirdeğe dokunmayı yasaklar; vitest varsayılan include `**/*.test.?(c|m)[jt]s`
// bu dosyayı zaten yakalar.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  foldTr,
  slugify,
  pickPromptSources,
  pickRevizeSources,
  pickCommandSource,
  candidateSourceNames,
  frameKey,
  PARSER_VERSION,
} from './lib/harvest-sources.mjs';
import { parseMeta, renderMeta, projectId, emptyMeta } from './lib/harvest-meta.mjs';
import { harvest, render, computeRatio, parseRevize } from './kapanis-hasadi.mjs';

// ---------------------------------------------------------------------------
// T1 · MOTION dosyası revize kaynağı SAYILMAZ
// Kanıt: eski desen `revize.*\.(txt|md)` → `REVIZE-VE-MOTION.md` (267 satır MOTION) seçildi,
// gerçek `revize.txt` (70 satır) hiç okunmadı → rapora "revize oranı 388%" yazıldı.
// ---------------------------------------------------------------------------
describe('T1 · revize kaynağı: MOTION belgesi elenir', () => {
  it('revize.txt seçilir, REVIZE-VE-MOTION.md gerekçesiyle elenir', () => {
    const r = pickRevizeSources(['revize.txt', 'REVIZE-VE-MOTION.md'], null);
    expect(r.parts).toEqual(['revize.txt']);
    expect(r.excluded.map((e) => e.file)).toEqual(['REVIZE-VE-MOTION.md']);
    expect(r.excluded[0].why).toMatch(/motion/i);
  });
});

// ---------------------------------------------------------------------------
// T2 · ÇOK TURLU revize: tek `find` ile ilkine indirgenmez
// Kanıt: Bileşke'de TUR1 (19 blok) + TUR2 (33 blok) var; tek turluk bakış TUR1'i başarılı
// sanıyordu, gerçekte TUR1'in %63'ü geri döndü.
// AYRICA: bu test spec'in ilk deny-listesini de kilitler — o liste `promptlar` jetonunu
// içeriyordu ve `_REVİZE-PROMPTLAR.txt`'yi (TUR1) eleyecekti.
// ---------------------------------------------------------------------------
describe('T2 · çok turlu revize', () => {
  it('iki tur da parça olarak döner, sıra deterministik', () => {
    const r = pickRevizeSources(
      ['Bileşke Kuvvet_REVİZE-TUR2.txt', 'Bileşke Kuvvet_REVİZE-PROMPTLAR.txt'], null);
    expect(r.parts).toHaveLength(2);
    expect(r.parts[0]).toMatch(/PROMPTLAR/);
    expect(r.parts[1]).toMatch(/TUR2/);
  });
});

// ---------------------------------------------------------------------------
// T3 · ORTAM VARSAYIMI TESTLE ÇİVİLENİR: 'İ'.toLowerCase() bir harf DEĞİL
// ---------------------------------------------------------------------------
describe('T3 · Türkçe katlama', () => {
  it("'İ'.toLowerCase() iki kod noktası verir — foldTr vermez", () => {
    expect('İ'.toLowerCase()).not.toBe('i');
    expect('İ'.toLowerCase().length).toBe(2); // i + U+0307
    expect(foldTr('İ')).toBe('i');
    expect(foldTr('REVİZE')).toBe('revize');
    expect(foldTr('REVIZE')).toBe('revize');
    expect(foldTr('Şığüöç')).toBe('siguoc');
  });
});

// ---------------------------------------------------------------------------
// T4 · slugify: `Kuvvet MİRA` → `kuvvet-mira`
// Kanıt: eski slugify `kuvvet-mi-ra` yazdı (diskte: HASAT-kuvvet-mi-ra.md).
// ---------------------------------------------------------------------------
describe('T4 · slugify', () => {
  it('MİRA tek parça kalır', () => {
    expect(slugify('Kuvvet MİRA')).toBe('kuvvet-mira');
  });
});

// ---------------------------------------------------------------------------
// T5 · SLUG ÇAKIŞIYOR — bu yüzden `--check` slug'a değil `project.id`'ye bakar
// ---------------------------------------------------------------------------
describe('T5 · slug çakışması', () => {
  it('tireli ve tiresiz klasör adı AYNI slug verir', () => {
    expect(slugify('6. Sınıf Kuvvetlerin Güç Birliği'))
      .toBe(slugify('6. Sınıf - Kuvvetlerin Güç Birliği'));
  });
  it('projectId ise ayırır — indeks bu yüzden id ile tutulur', () => {
    expect(projectId('6. Sınıf Kuvvetlerin Güç Birliği'))
      .not.toBe(projectId('6. Sınıf - Kuvvetlerin Güç Birliği'));
  });
  it('projectId NFC/NFD farkını YUTAR (aynı klasör, farklı gösterim)', () => {
    expect(projectId('Kuvvet MİRA'.normalize('NFD'))).toBe(projectId('Kuvvet MİRA'.normalize('NFC')));
  });
});

// ---------------------------------------------------------------------------
// T6 · NFD ad: zip/SMB/Windows üzerinden gelen klasör NFD verebilir
// ---------------------------------------------------------------------------
describe('T6 · NFD dosya adı', () => {
  it('NFD yazılmış REVİZE adı yine bulunur', () => {
    const nfd = 'Bileşke Kuvvet_REVİZE-TUR2.txt'.normalize('NFD');
    expect(nfd).not.toBe('Bileşke Kuvvet_REVİZE-TUR2.txt'); // gerçekten NFD
    const r = pickRevizeSources([nfd], null);
    expect(r.parts).toEqual([nfd]);
  });
  it('NFD prompt adı da bulunur', () => {
    const nfd = 'Kütle ve Ağırlık_PROMPTLAR.txt'.normalize('NFD');
    expect(pickPromptSources([nfd], null).parts).toEqual([nfd]);
  });
});

// ---------------------------------------------------------------------------
// T7 · İKİ ADAY FINAL PROMPT: seçim readdir sırasına BIRAKILMAZ
// Kanıt: aynı klasörde .txt (48 kare/10 eksikli) ve .md (58 kare/58 eksikli).
// ---------------------------------------------------------------------------
describe('T7 · belirsiz prompt kaynağı', () => {
  it('aday üretmez, AÇIK HATA verir', () => {
    const r = pickPromptSources(['x_PROMPTLAR.md', 'x_PROMPTLAR.txt'], null);
    expect(r.parts).toEqual([]);
    expect(r.error).toBe('PROMPT_AMBIGUOUS');
    expect(r.candidates).toEqual(['x_PROMPTLAR.md', 'x_PROMPTLAR.txt']);
  });
  it('manifest belirsizliği kapatır', () => {
    const r = pickPromptSources(['x_PROMPTLAR.md', 'x_PROMPTLAR.txt'], { promptParts: ['x_PROMPTLAR.txt'] });
    expect(r.via).toBe('manifest');
    expect(r.parts).toEqual(['x_PROMPTLAR.txt']);
  });
  it('eski_command_53k.json command adayı DEĞİLDİR', () => {
    const r = pickCommandSource(['eski_command_53k.json', 'X_mamilas_command.json'], null);
    expect(r.file).toBe('X_mamilas_command.json');
  });
});

// ---------------------------------------------------------------------------
// T8 · INVARIANT: %100'ü geçen oran ASLA yazılmaz
// Kanıt: revised=31 / total=8 → "388%" yazıldı ve altına 6 ders satırı dizildi.
// ---------------------------------------------------------------------------
describe('T8 · kare evreni invariantı', () => {
  it('revisedUnique > frameTotal → oran null + FRAME_UNIVERSE_MISMATCH', () => {
    const r = computeRatio({ frameTotal: 8, frameTotalSource: 'prompt-parts', revisedUnique: 11 });
    expect(r.ratio).toBeNull();
    expect(r.fatal).toBe(true);
    expect(r.errors[0]).toMatch(/^FRAME_UNIVERSE_MISMATCH/);
  });
  it('frameTotal yoksa oran hesaplanmaz', () => {
    const r = computeRatio({ frameTotal: null, frameTotalSource: null, revisedUnique: 5 });
    expect(r.ratio).toBeNull();
    expect(r.errors[0]).toMatch(/^RATIO_UNCOMPUTABLE/);
  });
  it('normal durumda oran 0..1', () => {
    expect(computeRatio({ frameTotal: 35, frameTotalSource: 'manifest', revisedUnique: 11 }).ratio)
      .toBeCloseTo(11 / 35);
  });
});

// ---------------------------------------------------------------------------
// T9 · metadata round-trip
// ---------------------------------------------------------------------------
describe('T9 · mamilas.harvest.v1 round-trip', () => {
  it('render → parse aynı JSON', () => {
    const m = emptyMeta();
    m.parserVersion = PARSER_VERSION;
    m.project = { dir: 'Kuvvet MİRA', id: projectId('Kuvvet MİRA') };
    m.errors = ['PROMPT_MISSING: yok'];
    m.status = 'ERROR';
    const back = parseMeta(renderMeta(m) + '# başlık\n');
    expect(back).toEqual(m);
  });
  it('metadatasız markdown null döner (LEGACY) — sessizce TEMİZ sayılmaz', () => {
    expect(parseMeta('# KAPANIŞ HASADI — eski\n\nhiç metadata yok\n')).toBeNull();
  });
  it('CRLF ile yazılmış metadata da okunur', () => {
    const m = emptyMeta();
    m.parserVersion = PARSER_VERSION;
    expect(parseMeta(renderMeta(m).replace(/\n/g, '\r\n'))).toEqual(m);
  });
});

// ---------------------------------------------------------------------------
// T10 · CRLF: satır sonu blok sayısını değiştirmez
// ---------------------------------------------------------------------------
describe('T10 · CRLF revize metni', () => {
  const LF = '### 2.png\nyaz\n\n### 8.png\nyaz\n\n--- SORUNSUZ (revize YOK) ---\n1 3 4\n';
  it('LF ve CRLF aynı blok sayısını verir', () => {
    expect(parseRevize(LF)).toHaveLength(2);
    expect(parseRevize(LF.replace(/\n/g, '\r\n'))).toHaveLength(2);
  });
  it('frameKey "33.png (ek)" ile "33.png"yi AYNI kare sayar', () => {
    expect(frameKey('33.png (ek)')).toBe(frameKey('33.png'));
    expect(frameKey('8.png   (sahne HOŞ — sadece tam öğretmen eksik)')).toBe('8');
  });
});

// ---------------------------------------------------------------------------
// T11 · UÇTAN UCA: Türkçe adlı + BOŞLUKLU klasör, NFD dosya adı, gerçek disk
// Ortam yasası: "yazdım" çalışıyor demek değildir — seçici gerçek readdir üzerinden sınanır.
// ---------------------------------------------------------------------------
describe('T11 · gerçek diskte Türkçe/boşluklu/NFD', () => {
  let root; let proj;
  const FRAME = (k) => [
    `K0${k} | "beat" | yazı: "TEST"`,
    '50mm lens at f/4, @mira sits. Warm matte skin, low specular, never tinted green or grey.',
    'Three things are alive: a, b, c. Depth in three layers — x, y, z.',
    'Every object rests in contact with its surface and casts a soft contact shadow.',
    'STYLE: Full 3D CGI feature-animation render.',
    'TEXT: "TEST" — Turkish plaque.',
    'NEGATIVE: no English text.',
    '', '-----', '',
  ].join('\n');

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'hasat-'));
    proj = join(root, '6. Sınıf - Şığüöç İĞİ Denemesi');
    mkdirSync(proj, { recursive: true });
    writeFileSync(join(proj, 'Şığüöç_PROMPTLAR.txt'), FRAME(1) + FRAME(2), 'utf8');
    // NFD adlı revize dosyası + CRLF gövde
    writeFileSync(
      join(proj, 'Şığüöç_REVİZE-PROMPTLAR.txt'.normalize('NFD')),
      '### 1.png\r\nchange the sign on the wall\r\n\r\n### 2.png\r\nthe glow is a flower with petals\r\n',
      'utf8');
    // ELENMESİ GEREKEN — adında revize geçiyor ama MOTION belgesi
    writeFileSync(join(proj, 'REVIZE-VE-MOTION.md'), '### 1.png\r\ncamera pushes in\r\n', 'utf8');
    writeFileSync(join(proj, '.DS_Store'), 'çöp', 'utf8');
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('doğru kaynakları seçer, MOTION belgesini eler, oran %100\'ü geçmez', () => {
    const h = harvest(proj);
    expect(h.promptSel.parts).toHaveLength(1);
    expect(h.rounds).toHaveLength(1);
    expect(h.rounds[0].file).toMatch(/REV/);
    expect(h.revizeSel.excluded.map((e) => e.file)).toContain('REVIZE-VE-MOTION.md');
    expect(h.lint.total).toBe(2);
    expect(h.uniqueFrames.size).toBe(2);
    expect(h.ratio).toBe(1);           // 2/2 — sınırda, ama aşmıyor
    expect(h.meta.status).toBe('OK');  // command yok = bilgi, ERROR değil
    expect(h.files).not.toContain('.DS_Store');
  });

  it('render çıktısı metadata taşır ve %100 üstü yüzde İÇERMEZ', () => {
    const md = render(harvest(proj));
    const meta = parseMeta(md);
    expect(meta?.schema).toBe('mamilas.harvest.v1');
    expect(meta.project.dir).toBe('6. Sınıf - Şığüöç İĞİ Denemesi');
    expect(meta.parserVersion).toBe(PARSER_VERSION);
    for (const m of md.matchAll(/(\d+)%/g)) expect(Number(m[1])).toBeLessThanOrEqual(100);
  });

  it('candidateSourceNames adayları toplar (STALE_N ölçümünün girdisi)', () => {
    const names = candidateSourceNames(['a_PROMPTLAR.txt', 'revize.txt', 'X_mamilas_command.json', 'not.docx']);
    expect(names.sort()).toEqual(['X_mamilas_command.json', 'a_PROMPTLAR.txt', 'revize.txt']);
  });
});

// ---------------------------------------------------------------------------
// T12 · GERÇEK PROJELER — regresyon çıpası. Sayılar 2026-07-29'da diskten ölçüldü.
// Kaynak dosya değişirse bu test kırılır; kırılması DOĞRUDUR (hasat bayatladı demektir).
// ---------------------------------------------------------------------------
describe('T12 · diskteki gerçek projeler', () => {
  const BITEN = new URL('../agents/COMMAND-INBOX/Biten/', import.meta.url).pathname;

  it('Kütle: manifest 35 kare, 11 blok / 11 kare, oran %31 (eski hasat %388 yazıyordu)', () => {
    const h = harvest(join(BITEN, '5. Sınıf - Kütle ve Ağırlık'));
    expect(h.frameTotal).toBe(35);
    expect(h.frameTotalSource).toBe('manifest');
    expect(h.revs).toHaveLength(11);
    expect(h.uniqueFrames.size).toBe(11);
    expect(Math.round(h.ratio * 100)).toBe(31);
    expect(h.revizeSel.excluded.map((e) => e.file)).toContain('REVIZE-VE-MOTION.md');
  });

  it('Bileşke: 2 tur okunur, 12 kare geri döndü, tur devri %63', () => {
    const h = harvest(join(BITEN, '6. Sınıf - Kuvvetlerin Güç Birliği'));
    expect(h.rounds).toHaveLength(2);
    expect(h.multiRound.repeatedFrames).toEqual(['2', '8', '9', '12', '14', '15', '18', '19', '21', '25', '34', '35']);
    expect(Math.round(h.multiRound.carryOverRate * 100)).toBe(63);
    expect(h.uniqueFrames.size).toBe(34);
    expect(h.frameTotal).toBe(52);
  });

  it('Sürtünme: revize dosyası YOK → "tur yapılmadı" YANLIŞ ÇIKARIMI yazılmaz', () => {
    const h = harvest(join(BITEN, '5. Sürtünme'));
    expect(h.rounds).toHaveLength(0);
    expect(h.meta.status).toBe('OK');
    const md = render(h);
    expect(md).not.toMatch(/hiç yapılmadığı anlamına gelir/);
    expect(md).toMatch(/İki olasılık ayrılamıyor/);
  });

  it('Kuvvet ve Kuvvetin Ölçülmesi: iki final aday → ERROR, ders adayı ÜRETİLMEZ', () => {
    const h = harvest(join(BITEN, 'Kuvvet ve Kuvvetin Ölçülmesi'));
    expect(h.meta.status).toBe('ERROR');
    expect(h.errors.some((e) => e.startsWith('PROMPT_AMBIGUOUS'))).toBe(true);
    expect(render(h)).toMatch(/Ders adayı üretilmedi|hangisi final belli değil/);
  });
});
