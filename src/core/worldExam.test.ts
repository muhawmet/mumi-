import { describe, expect, it } from 'vitest';
import {
  EXAM_PROBES,
  EXAM_CAST_AGE,
  EXAM_HERO_TAGS,
  EXAM_ON_SCREEN_TEXT,
  buildExamBrief,
  examineWorld,
} from './worldExam';
import { DATA } from './pure';

const WORLDS = DATA.worlds as Array<{ id: string; group: string }>;

/** Bilinen-iyi taban: 103 gerçek kare verdi (archive/kutuphane-karne.ts GERCEK_KARE). */
const KNOWN_GOOD = 'pixar_3d_edu';

describe('worldExam — sınav setinin kimliği', () => {
  it('beş eksen ADLANDIRILMIŞ ve tek tek yoklanıyor', () => {
    expect(EXAM_PROBES).toHaveLength(5);
    expect(EXAM_PROBES.map((p) => p.id)).toEqual([
      'PHYSICS',
      'TEXT',
      'REF',
      'CAST',
      'START_FRAME',
    ]);
    // Her probe NE yokladığını söylemek zorunda: adsız bir sınav sorusu,
    // sonucu okuyanın tahmin etmesi demektir.
    for (const probe of EXAM_PROBES) {
      expect(probe.asks.length, `${probe.id} ne yokladığını söylemiyor`).toBeGreaterThan(20);
    }
  });

  it('KONTROLLÜ DENEY: iki dünyanın sınav brief\'i yalnız dünya-türevi alanlarda ayrışır', () => {
    // Sınavın bütün değeri buradadır. Sahne notları, konu, cast ve yazı sabit
    // kalmazsa iki dünya arasındaki fark dünyaya değil soruya yazılır.
    const a = buildExamBrief(KNOWN_GOOD);
    const b = buildExamBrief('ghibli_hayao');

    expect(a.projectTopic).toBe(b.projectTopic);
    expect(a.subject).toBe(b.subject);
    expect(a.sceneCount).toBe(b.sceneCount);
    expect(a.sceneCount).toBe(5);
    expect(a.castAge).toBe(b.castAge);
    expect(a.characterShare).toBe(b.characterShare);
    expect(a.heroTags).toEqual(b.heroTags);
    expect(JSON.stringify(a.recipeScenes)).toBe(JSON.stringify(b.recipeScenes));
    expect(JSON.stringify(a.deliveryDeclaration)).toBe(JSON.stringify(b.deliveryDeclaration));

    // Ayrışması GEREKEN alanlar (dünyanın kendi kimliği):
    expect(a.selectedWorldId).not.toBe(b.selectedWorldId);
  });

  it('enzim taşıyıcıları sınavın kendi girdisinde canlı', () => {
    const brief = buildExamBrief(KNOWN_GOOD);
    expect(brief.castAge).toBe(EXAM_CAST_AGE);
    expect(brief.heroTags).toEqual(EXAM_HERO_TAGS);
    expect(typeof brief.characterShare).toBe('number');
  });

  it('YAZI isteği SAHNE notundan taşınır — batch beyanı sınavı bloklardı', () => {
    // ÖLÇÜLDÜ (gerçek generateBatch, pixar_3d_edu): batch seviyesindeki
    // `deliveryDeclaration: {kind:'baked'}` metni BÜTÜN sahnelerden ister ve
    // taşımayan her sahneyi `DELIVERY_PROMISE_BROKEN` ile BLOCKED yapar. Sınavın
    // beş karesinden dördü bilerek temiz plakadır (fizik/ref/cast/start-frame) →
    // batch beyanı kullanılsaydı sınav kendi kendini bloklardı ve 46 dünyanın
    // hiçbiri ölçülemezdi. İstek bu yüzden doktor notu olarak taşınır.
    const brief = buildExamBrief(KNOWN_GOOD);
    expect(brief.deliveryDeclaration).toBeUndefined();

    const textScene = brief.recipeScenes?.find((s) => s.turkish_labels.includes(EXAM_ON_SCREEN_TEXT));
    expect(textScene, 'yazı eksenini yoklayan sahne yok').toBeTruthy();

    // ve yalnız O sahne metin istiyor — diğer dördü temiz plaka.
    const withText = (brief.recipeScenes ?? []).filter((s) => s.turkish_labels.length);
    expect(withText).toHaveLength(1);
  });
});

describe('worldExam — 46 dünyaya uygulanabilirlik', () => {
  it('hiçbir dünya sınavı ÇÖKERTMEZ', () => {
    // "Sınanmayan 45 dünya ürün değil iddia" (kalp nakli planı). Bir dünyanın
    // exception atması, sınavın o dünyada hiç sonuç veremediği anlamına gelir.
    const crashed: string[] = [];
    for (const world of WORLDS) {
      try {
        examineWorld(world.id);
      } catch (err) {
        crashed.push(`${world.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    expect(crashed, `sınav bu dünyalarda çöktü:\n${crashed.join('\n')}`).toEqual([]);
  });

  it('her rapor beş eksenin hepsi için hüküm taşır', () => {
    const report = examineWorld(KNOWN_GOOD);
    expect(report.axes).toHaveLength(5);
    expect(report.axes.map((a) => a.probe)).toEqual(EXAM_PROBES.map((p) => p.id));
    for (const axis of report.axes) {
      expect(axis.measure.length, `${axis.probe} ölçüm satırı boş`).toBeGreaterThan(0);
    }
  });

  it('bilinen-iyi dünya sınavdan GENERATED çıkar', () => {
    const report = examineWorld(KNOWN_GOOD);
    expect(report.status, `blockers: ${report.blockers.join(' · ')}`).toBe('GENERATED');
    expect(report.prompts).toHaveLength(5);
    for (const prompt of report.prompts) expect(prompt.length).toBeGreaterThan(200);
  });

  it('DETERMİNİZM: aynı dünya iki kez sınanınca aynı raporu verir', () => {
    // Sınav bir ölçü aletidir. İki koşumda oynayan bir alet, dünyalar arası
    // farkı ölçemez — farkın kaynağı aletin kendisi olur.
    const a = examineWorld(KNOWN_GOOD);
    const b = examineWorld(KNOWN_GOOD);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('worldExam — ürün sınırı', () => {
  it('sınav GÖRSEL KALİTE hükmü vermez', () => {
    // PROJECT_CONTRACT: "test yeşili görsel PASS değildir". Sınav yapısal
    // taşımayı ölçer; karenin güzel olup olmadığı Mami'nin gözünün işidir.
    const report = examineWorld(KNOWN_GOOD);
    const text = [report.verdict, ...report.axes.map((a) => `${a.measure} ${a.evidence.join(' ')}`)].join(' ');
    for (const forbidden of ['üretime hazır', 'production ready', 'kaliteli kare', 'güzel']) {
      expect(text.toLowerCase(), `sınav görsel hüküm veriyor: "${forbidden}"`).not.toContain(forbidden);
    }
    expect(report.verdict).toContain('kare hükmü');
  });

  it('sınav KARE üretmez — yalnız prompt ve ölçüm döndürür', () => {
    const report = examineWorld(KNOWN_GOOD);
    // Rapor yüzeyinde hiçbir görsel/binary alan yoktur.
    for (const key of ['image', 'png', 'frame', 'url', 'apiKey']) {
      expect(Object.keys(report)).not.toContain(key);
    }
  });
});
