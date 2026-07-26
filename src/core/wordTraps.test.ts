import { describe, it, expect } from 'vitest';
import { DATA, generateBatch } from './pure';

/**
 * Motorun renk adı değil ÇİÇEK olarak çizdiği kelimeler.
 *
 * Ölçüt tek ve dar: kelime, renk adından çok BİTKİ olarak biliniyor mu? Gerçek
 * kare kanıtı iki tanede var — safran (force-glow safran çiçeğine döndü) ve
 * lotus (halat ortasında lotus çıktı). Kalanları aynı sınıftaki çiçek adları
 * olduğu için ekliyoruz; liste gerçek çıktıyla büyür, tahminle değil.
 *
 * BİLEREK DIŞARIDA: honey · cream · olive · peach · plum · wine · sage · tomato.
 * Bunlar 9 paletin bias'ında geçiyor (ölçüldü) ama gündelik RENK sözcüğü — ve
 * "warm honey bounce" pixar dünyasının kendi ışık dilidir. Kanıtsız çeviri
 * kütüphanenin iyi yazılmış yerini bozar. Ayrıca `iris` ve `violet` dışarıda:
 * biri göz anatomisi (pixar "painted iris depth"), öteki çekirdek renk adı
 * (`hexToLightWords` kendisi üretiyor).
 */
const OBJE_RENK_RE = /\b(?:saffron|lotus|marigold|jasmine|lavender|hibiscus|peony|orchid|tulip|poppy)\b/gi;

/**
 * KELİME TUZAKLARI — gerçek karelerde ölçülmüş motor hataları, prompt yolunda kilitli.
 *
 * Bu dosya kod kokusu taraması değildir. Her madde, teslim edilmiş bir videonun
 * revize dosyasında YAZILI bir hatadır ve gerçek `generateBatch` çıktısıyla
 * yeniden üretilmiştir:
 *
 *   `agents/COMMAND-INBOX/Biten/6. Sınıf Kuvvetlerin Güç Birliği/Bileşke Kuvvet_REVİZE-TUR2.txt`
 *   → bölüm başlığı: "B) ÇİÇEK OLMUŞ GLOW'LAR" (halat ortasında lotus, turuncu çiçek)
 *   `.../Bileşke Kuvvet_REVİZE-PROMPTLAR.txt`
 *   → "force-glow safran çiçeği olarak çıkmış", "ten rengi yeşil/gri"
 *
 * Yasa: motor bir kelimeyi RENK adı olarak değil NESNE olarak okuyabiliyorsa, o
 * kelime prompt'a girmez. Palet fiziksel ışık dili konuşur (Palette Translation
 * Law); bitki/baharat adı ışık değildir.
 *
 * Yapılandırma üretimden birebir alınmıştır — üç bitmiş videonun üçünde de
 * world=pixar_3d_edu · palette=vibrant_edu · refs=[pixar_dimensional,
 * pixar_emotional_staging, soul] · nano_banana_2 + kling_3.
 */

const URETIM = {
  projectTopic: 'Kuvvet ve Kuvvetin Ölçülmesi',
  projectClass: 'ders',
  sceneCount: 4,
  selectedWorldId: 'pixar_3d_edu',
  selectedPropId: 'none',
  selectedRefIds: ['pixar_dimensional', 'pixar_emotional_staging', 'soul'],
  selectedPaletteId: 'vibrant_edu',
  selectedMusicId: '',
  imageModel: 'nano_banana_2',
  videoModel: 'kling_3',
} as const;

function uretimPromptlari(cast: string): string[] {
  const r = generateBatch({ ...URETIM, cast } as never) as {
    status: string; scenes: { imagePrompt: string }[]; contractGate?: unknown;
  };
  expect(r.status, `generateBatch BLOCKED: ${JSON.stringify(r.contractGate)}`).toBe('GENERATED');
  expect(r.scenes.length).toBeGreaterThan(0);
  return r.scenes.map((s) => s.imagePrompt);
}

function uretimBrief(cast: string): string {
  const r = generateBatch({ ...URETIM, cast } as never) as { status: string; agentBrief?: string };
  expect(r.status).toBe('GENERATED');
  return r.agentBrief || '';
}

describe('kelime tuzağı — palet bitki/baharat adı taşımaz', () => {
  // ÖLÇÜM (2026-07-26, gerçek generateBatch): vibrant_edu'nun bias'ı prompt'a
  // "saffron" kelimesini sahne başına İKİ kez sokuyordu — bir kez renk listesinde
  // ("Navy, saffron-yellow, tomato-red, board-white"), bir kez fizik cümlesinde
  // ("Broad saffron key lands flat and even"). vibrant_edu üretime giren TEK
  // palet; yani teslim edilmiş 103 karenin tamamı bu kelimeyle üretildi.
  it('saffron prompt yoluna giremez — NB2 safran ÇİÇEĞİ çiziyor', () => {
    for (const cast of ['', '11-12 yaş 5. sınıf öğrencisi Mira, kısa siyah saç']) {
      for (const [i, p] of uretimPromptlari(cast).entries()) {
        expect(p, `sahne ${i + 1} (cast="${cast}") saffron taşıyor`).not.toMatch(/saffron/i);
      }
    }
  });

  // Aynı sınıf: motorun nesne olarak çizebileceği her bitki/baharat/çiçek adı.
  // "lavender wash", "saffron key", "sage green" bir ışık davranışı değil, bir
  // NESNEDİR — NB2 bunları kareye nesne olarak koyuyor (lotus/çiçek bulgusu).
  // Tek palet değil, SEÇİLEBİLİR HER PALET taranır: vibrant_edu bugün üretime
  // giren tek palet, ama V2'nin işi kütüphanenin tamamını üretime hazırlamak.
  it('seçilebilir HİÇBİR palet prompt\'a nesne-renk adı sokmaz', () => {
    const kirli: string[] = [];
    for (const pal of DATA.palettes) {
      const r = generateBatch({ ...URETIM, cast: '', selectedPaletteId: pal.id } as never) as {
        status: string; scenes: { imagePrompt: string }[];
      };
      if (r.status !== 'GENERATED') continue;
      const fizik = (r.scenes[0].imagePrompt.match(/Palette physics:([^]*?)(?:Texture rule:|Negative:)/) || ['', ''])[1];
      const hits = fizik.match(OBJE_RENK_RE) || [];
      if (hits.length) kirli.push(`${pal.id}: ${Array.from(new Set(hits.map((h) => h.toLowerCase()))).join(', ')}`);
    }
    expect(kirli, `nesne-renk adı taşıyan paletler:\n  ${kirli.join('\n  ')}`).toEqual([]);
  });
});

describe('kelime tuzağı — palet renk listesi hex okumasını tekrar etmez', () => {
  // Prompt hex'ten türeyen fiziksel okumayı ZATEN yazıyor ("shadows read as deep
  // cool blue, midtones read as vivid warm amber…"), sonra bias'ın ham renk-adı
  // lead'ini ikinci kez basıyordu. İkinci liste yeni bilgi taşımıyor, yalnız
  // motora çevrilmemiş renk adları (ve saffron) sokuyor.
  it('bias renk-adı lead\'i prompt\'a girmez — fizik cümlesi kalır', () => {
    for (const p of uretimPromptlari('')) {
      expect(p).not.toMatch(/Navy,\s*saffron-yellow/i);
      // Fizik cümlesi KORUNUR — bu bir bilgi kaybı testi değil, tekrar testi.
      expect(p).toMatch(/palette character:/i);
    }
  });
});

describe('boş cast — ajan paketine boş alan basılmaz', () => {
  // `location` bu korumayı ZATEN almış ("Boşken satır basılmaz" — brain.ts:2503,
  // gerekçesi yorumda: "Mami 'İstanbul, sınıf' yazıyor, brief hiç mekân görmüyor,
  // ajan mekânı UYDURUYORDU"). `cast` aynı listede, bir satır yukarıda, korumasız:
  // boş cast'te brief "- **Cast:** " diye boş bir alan basıyor ve `primePacket`
  // head'i "Cast: " ile bitiyor. Boş alan bir bilgi değil, bir davettir — ajan
  // orayı doldurur. Üç bitmiş videonun ÜÇÜNDE de site tarafında cast boştu
  // (@mira/@efe tag'lerini ajan yazdı), yani bu satır her üretimde boş basıldı.
  it('cast boşken brief boş "Cast:" alanı basmaz', () => {
    const brief = uretimBrief('');
    expect(brief).not.toMatch(/-\s\*\*Cast:\*\*\s*$/m);
  });

  // İkinci yüzey: `primePacket` head'i de aynı alanı koşulsuz basıyor. Tek yüzeyi
  // düzeltip ötekini bırakmak drift üretir — iki yüzey tek yasayı taşır.
  it('cast boşken ajan paketi head\'i boş "Cast:" satırı basmaz', () => {
    const r = generateBatch({ ...URETIM, cast: '' } as never) as {
      agentPackets?: Record<string, string>;
    };
    for (const [ad, paket] of Object.entries(r.agentPackets || {})) {
      expect(paket, `${ad} paketi boş Cast satırı taşıyor`).not.toMatch(/^Cast:\s*$/m);
    }
  });

  it('cast doluyken brief cast\'i AYNEN taşır', () => {
    const cast = '11-12 yaş 5. sınıf öğrencisi Mira, kısa siyah saç';
    expect(uretimBrief(cast)).toContain(`- **Cast:** ${cast}`);
  });
});

describe('kelime tuzağı — castless prompt cilde "sheen" yazmaz', () => {
  // ÖLÇÜM: cast DOLU prompt "SSS" yazıyor (doğru terim) ve "sheen" yalnız ahşap/
  // lastik malzemesinde geçiyor (×2, meşru). Cast BOŞ olunca `scrubHumanTokens`
  // her `SSS`'i "subsurface-style sheen"e çeviriyor ve sayı ×8'e çıkıyor —
  // "subsurface-style sheen surface" bir IMPERATIVE olarak basılıyor. Mami'nin
  // "sheen → plastik cilt" bulgusunun kaynağı dünya verisi değil, BU çeviri.
  it('SSS çevirisi "sheen" üretmez — translucency yazar', () => {
    for (const [i, p] of uretimPromptlari('').entries()) {
      expect(p, `sahne ${i + 1}`).not.toMatch(/subsurface-style sheen/i);
    }
  });

  it('dünyanın kendi malzeme dili korunur — ahşap/lastik sheen\'i meşrudur', () => {
    // Karşı-test: fix aşırıya kaçıp dünyanın malzeme yasasını silmemeli.
    const dolu = uretimPromptlari('11-12 yaş 5. sınıf öğrencisi Mira, kısa siyah saç');
    expect(dolu[0]).toMatch(/satin-varnish sheen/i);
  });
});
