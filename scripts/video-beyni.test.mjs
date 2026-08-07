// VİDEO BEYNİ — KIRMIZI FIXTURE'LAR.
//
// Bu dosyanın varlık sebebi tek bir ölçüm: bu repoda dokuz kez görülen ana kusur,
// doğrulayıcının ölçemediğini "ölçtüm" diye geçirmesi (`edit-plan.mjs` 54 motion başlığı olan
// klasörde "0 klip" dedi; `current-work.mjs` 54 klip diskteyken "klip eksik (0 < 54)" dedi).
// Bir duvarın gerçekten duvar olduğu ancak TERSİ denenerek bilinir.
//
// Bu yüzden her koşulun hem KIRMIZI'sı hem de YEŞİL'i var. Yalnız kırmızıyı test etmek
// "hiçbir şeyi geçirmeyen kapı"yı da geçirirdi — o bir duvar değil, sökülecek bir engeldir.

import { describe, expect, it } from 'vitest';
import {
  CANARY_TAVANI,
  beyinBlogu,
  degerAyristir,
  frontmatterAyristir,
  harcamaAraciMi,
  harcamaKarari,
  kelimeSay,
  kesitCek,
  topluAracMi,
} from './video-beyni.mjs';

const IMAGE = 'mcp__magnific__images_generate';
const BATCH = 'mcp__claude_ai_Higgsfield__generate_image_batch';

/** Her şeyi geçen sağlıklı bir beyin — testler bundan SAPARAK kırmızıyı üretir. */
const saglam = (uzer = {}) => ({
  ok: true,
  yol: '/x/CLAUDE.md',
  meta: {
    proje: 'Deneme',
    kaynak: 'kaynak.docx',
    dunya: ['orkestra', 'nöron'],
    canary: 'GECTI',
    butce: { onayli: 4200, birim: 75 },
    uretim_yetkisi: 'ana-oturum',
    ...uzer,
  },
  govde: '',
});

const sayimTamam = { ok: true, toplam: 11, dokum: [{ kelime: 'orkestra', adet: 4 }, { kelime: 'nöron', adet: 7 }] };

describe('harcama aracı ayrımı — filtre kapının kendisinde', () => {
  it('Magnific ve Higgsfield üretim çağrılarını harcama sayar', () => {
    expect(harcamaAraciMi(IMAGE)).toBe(true);
    expect(harcamaAraciMi('mcp__claude_ai_Higgsfield__generate_video')).toBe(true);
    expect(harcamaAraciMi('mcp__magnific__video_generate')).toBe(true);
    expect(harcamaAraciMi('mcp__magnific__images_upscale')).toBe(true);
  });

  it('salt-okur çağrıları ve başka sunucuları harcama SAYMAZ', () => {
    // Bunlar bloke edilirse kapı gündelik işi kilitler ve sökülür.
    expect(harcamaAraciMi('mcp__magnific__account_balance')).toBe(false);
    expect(harcamaAraciMi('mcp__magnific__creations_list')).toBe(false);
    expect(harcamaAraciMi('mcp__magnific__simulate_cost')).toBe(false);
    expect(harcamaAraciMi('mcp__claude_ai_Higgsfield__show_generations')).toBe(false);
    expect(harcamaAraciMi('mcp__claude_ai_Gmail__create_draft')).toBe(false);
    expect(harcamaAraciMi('Bash')).toBe(false);
  });

  it('toplu araç ayrı tanınır — batch tanım gereği canary değildir', () => {
    expect(topluAracMi(BATCH)).toBe(true);
    expect(topluAracMi('mcp__magnific__spaces_run')).toBe(true);
    expect(topluAracMi(IMAGE)).toBe(false);
  });
});

describe('KIRMIZI — kapı gerçekten duruyor mu', () => {
  it('ajan üretim çağırırsa REDDEDER (Mami: "MCP sadece sende")', () => {
    const k = harcamaKarari({ toolName: IMAGE, agentId: 'abe7d08', beyin: saglam(), sayim: sayimTamam, sayac: 0 });
    expect(k.izin).toBe(false);
    expect(k.kod).toBe('AJAN');
  });

  it('beyin yoksa REDDEDER', () => {
    const k = harcamaKarari({ toolName: IMAGE, beyin: { ok: false, sebep: 'BEYIN-YOK', mesaj: 'yok' }, sayim: null });
    expect(k.izin).toBe(false);
    expect(k.kod).toBe('BEYIN-YOK');
  });

  it('DÜNKÜ FELAKET: beyan edilen dünya kaynakta 0 kez geçiyorsa REDDEDER', () => {
    // 2026-08-07 · kaynak docx'te `mutfak` 0 kez geçerken 56 karelik mutfak dünyası kuruldu.
    const sayim = { ok: true, toplam: 0, dokum: [{ kelime: 'mutfak', adet: 0 }, { kelime: 'soba', adet: 0 }] };
    const k = harcamaKarari({ toolName: IMAGE, beyin: saglam({ dunya: ['mutfak', 'soba'] }), sayim, sayac: 0 });
    expect(k.izin).toBe(false);
    expect(k.kod).toBe('DUNYA-KAYNAKTA-YOK');
    expect(k.mesaj).toContain('mutfak 0');
  });

  it('canary onaylanmadan TOPLU üretim açılmaz', () => {
    const k = harcamaKarari({ toolName: BATCH, beyin: saglam({ canary: 'BEKLIYOR' }), sayim: sayimTamam, sayac: 0 });
    expect(k.izin).toBe(false);
    expect(k.kod).toBe('CANARY-TOPLU');
  });

  it('canary onaylanmadan tavanı aşan tek çağrı da açılmaz', () => {
    const k = harcamaKarari({ toolName: IMAGE, beyin: saglam({ canary: 'BEKLIYOR' }), sayim: sayimTamam, sayac: CANARY_TAVANI });
    expect(k.izin).toBe(false);
    expect(k.kod).toBe('CANARY-TAVAN');
  });

  it('onaylanan rakam aşılıyorsa REDDEDER ("rakam söylenir ve aşılmaz")', () => {
    // 4200 / 75 = 56 çağrı. 56'ncı geçer, 57'nci geçmez.
    const k = harcamaKarari({ toolName: IMAGE, beyin: saglam(), sayim: sayimTamam, sayac: 56 });
    expect(k.izin).toBe(false);
    expect(k.kod).toBe('BUTCE');
  });

  it('beyinde `dunya:` beyanı yoksa REDDEDER — sayım yapılamayan dünya kilitli sayılmaz', () => {
    const k = harcamaKarari({ toolName: IMAGE, beyin: saglam({ dunya: [] }), sayim: { ok: false, sebep: 'DUNYA-BEYAN-YOK' } });
    expect(k.izin).toBe(false);
    expect(k.kod).toBe('DUNYA-BEYAN-YOK');
  });
});

describe('YEŞİL — kapı yalancı duvar değil', () => {
  it('beyin tam + dünya kaynakta + canary GEÇTİ + bütçe içinde → AÇAR', () => {
    const k = harcamaKarari({ toolName: IMAGE, beyin: saglam(), sayim: sayimTamam, sayac: 10 });
    expect(k.izin).toBe(true);
    expect(k.kod).toBe('ACIK');
  });

  it('canary BEKLİYOR iken tavanın altındaki tekil çağrı GEÇER — canary basılabilmeli', () => {
    const k = harcamaKarari({ toolName: IMAGE, beyin: saglam({ canary: 'BEKLIYOR' }), sayim: sayimTamam, sayac: 1 });
    expect(k.izin).toBe(true);
  });

  it('harcama olmayan çağrı beyin hiç yokken bile geçer — kapı gündelik işi kilitlemez', () => {
    const k = harcamaKarari({ toolName: 'mcp__magnific__account_balance', beyin: { ok: false, sebep: 'BEYIN-YOK' } });
    expect(k.izin).toBe(true);
    expect(k.kod).toBe('HARCAMA-DEGIL');
  });

  it('ana oturumun çağrısı (agentId yok) geçer', () => {
    const k = harcamaKarari({ toolName: IMAGE, agentId: null, beyin: saglam(), sayim: sayimTamam, sayac: 0 });
    expect(k.izin).toBe(true);
  });
});

describe('frontmatter ayrıştırıcı — yeni bağımlılık yok, gramer küçük', () => {
  it('liste, nesne ve düz değeri okur', () => {
    const { meta, govde } = frontmatterAyristir(
      '---\nproje: Deneme\ndunya: [orkestra, nöron]\nbutce: { onayli: 4200, birim: 75 }\n---\ngövde\n',
    );
    expect(meta.proje).toBe('Deneme');
    expect(meta.dunya).toEqual(['orkestra', 'nöron']);
    expect(meta.butce).toEqual({ onayli: 4200, birim: 75 });
    expect(govde.trim()).toBe('gövde');
  });

  it('satır sonu yorumunu değere karıştırmaz', () => {
    expect(degerAyristir('GECTI   # GECTI | BEKLIYOR')).toBe('GECTI   # GECTI | BEKLIYOR');
    const { meta } = frontmatterAyristir('---\ncanary: GECTI   # GECTI | BEKLIYOR\n---\n');
    expect(meta.canary).toBe('GECTI');
  });

  it('frontmatter yoksa null döner — sessizce boş nesne UYDURMAZ', () => {
    expect(frontmatterAyristir('# başlık\n').meta).toBeNull();
  });

  it('CRLF ile de çalışır (ORTAM YASASI: Windows birincil)', () => {
    const { meta } = frontmatterAyristir('---\r\nproje: X\r\ndunya: [a]\r\n---\r\ngövde');
    expect(meta.proje).toBe('X');
    expect(meta.dunya).toEqual(['a']);
  });
});

describe('kelime sayımı — Türkçe ekler kökü gizlememeli', () => {
  it('ek almış hâlleri sayar', () => {
    expect(kelimeSay('Dev bir orkestra, orkestranın şefi, ORKESTRAYI', 'orkestra')).toBe(3);
  });

  it('Türkçe büyük/küçük harf farkını yutar', () => {
    expect(kelimeSay('NÖRON ve nöronların', 'nöron')).toBe(2);
  });

  it('ünsüz yumuşamasını yakalar — gerçek kaynakta ölçüldü', () => {
    // Kaynak "sıcak bir çaydanlığa dokundurup" diyor; alt dizge araması bunu kaçırıyordu.
    expect(kelimeSay('elini sıcak bir çaydanlığa dokundurup çeker', 'çaydanlık')).toBe(1);
    expect(kelimeSay('kitabı okudu', 'kitap')).toBe(1);
    expect(kelimeSay('ağacın dalı', 'ağaç')).toBe(1);
    // Yumuşamamış hâli de aynı anda sayılır, çift saymadan.
    expect(kelimeSay('çaydanlık ve çaydanlığa', 'çaydanlık')).toBe(2);
  });

  it('geçmeyen kelimeye 0 der — ve 0 bu sistemde KIRMIZI demektir', () => {
    expect(kelimeSay('konser salonu, nöron, lunapark', 'mutfak')).toBe(0);
  });
});

describe('oturum bloğu — boş sonuç "temiz" değil KIRMIZI', () => {
  it('beyin yoksa sessiz kalmaz, kapının kapalı olduğunu söyler', () => {
    const satir = beyinBlogu({ ok: false, sebep: 'BEYIN-YOK', mesaj: 'yok' }, null).join('\n');
    expect(satir).toContain('BEYİN YOK');
    expect(satir).toContain('KAPALI');
  });

  it('dünya sayımını dökümüyle basar — sayı görünmezse kimse bakmaz', () => {
    const satir = beyinBlogu(saglam(), sayimTamam, { sayac: 3 }).join('\n');
    expect(satir).toContain('orkestra 4');
    expect(satir).toContain('nöron 7');
    expect(satir).toContain('GECTI');
  });

  it('sayım başarısızsa bloğu yeşil göstermez', () => {
    const satir = beyinBlogu(saglam(), { ok: false, sebep: 'KAYNAK-YOK' }, {}).join('\n');
    expect(satir).toContain('🔴');
    expect(satir).toContain('KAPALI');
  });

  it('Mami kararlarını tavanla basar — açılış duvara dönmesin', () => {
    const beyin = saglam();
    beyin.govde = '## MAMİ KARARLARI\n- a\n- b\n- c\n- d\n- e\n- f\n\n## BU VİDEODA ÖĞRENİLENLER\n- x\n';
    const satir = beyinBlogu(beyin, sayimTamam, {});
    expect(satir.filter((l) => /^\s{4}- /.test(l)).length).toBeLessThanOrEqual(8);
    expect(satir.join('\n')).toContain('- x');
  });
});

describe('kesitCek', () => {
  it('başlık yoksa boş döner', () => {
    expect(kesitCek('## BAŞKA\n- a\n', 'MAMİ KARARLARI')).toEqual([]);
  });

  it('bir sonraki başlıkta durur', () => {
    expect(kesitCek('## MAMİ KARARLARI\n- a\n## SONRAKİ\n- b\n', 'MAMİ KARARLARI')).toEqual(['- a']);
  });
});
