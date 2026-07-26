import { describe, expect, it } from 'vitest';
import { dnaDirectives, registerOf, resolveLightAuthority, resolveLightAuthorityReceipt } from './brain';
import { DATA } from './pure';

/**
 * OTORİTE MAKBUZU (KALP-G1d, 2026-07-26)
 *
 * Ölçülen kusur: `AUTHORITY_HIERARCHY` bir liste sabitidir, çözücü değil. Gerçek çatışma
 * çözümü noktasal kapılarda yaşıyor ve `resolveLightAuthority` bunların en net olanı — dünya
 * ışık yasası kazandığında ref DNA'nın çelişen cümlelerini DÜŞÜRÜYOR. Ama yalnız kazananı
 * döndürüyordu: kaybeden cümle hiçbir yere yazılmıyordu.
 *
 * Tutarsızlık kanıtı: ref bastırması için deterministik kayıt VAR (`SUPPRESSED_WORLD_MISMATCH`).
 * Sistem bir eksende makbuz tutuyor, diğerinde tutmuyordu.
 *
 * Bu testler iki şeyi birlikte kilitler:
 *   1) makbuz düşen cümleyi VERBATIM tutar (kayıp görünür olur),
 *   2) `light` çıktısı eski davranışla BYTE-EŞİT kalır (motor prompt'u kaymaz).
 */

const world = (id: string) => {
  const w = DATA.worlds.find((item) => item.id === id);
  expect(w, `dünya yok: ${id}`).toBeTruthy();
  return w!;
};

describe('ışık otoritesi makbuzu — kaybeden görünür olur', () => {
  it('düz-ışık dünyası yönlü cümleyi düşürür ve düşeni VERBATIM kaydeder', () => {
    // ukiyo_e_print sınıfı düz dünya: "printed colour fields", yönlü ışık simülasyonu yok.
    const flat = DATA.worlds.find((w) => /ukiyo|woodblock|motion_design_flat|low_poly/i.test(w.id))
      ?? world('ukiyo_e_print');
    const dna = dnaDirectives(DATA.refs.slice(0, 3), registerOf('ANIMATION_STYLIZED'));
    const receipt = resolveLightAuthorityReceipt(dna.light, flat);

    // Kural adı, kazanan ve kayıp birlikte okunabilir olmalı — biri eksikse makbuz eksik.
    expect(receipt.winner).toBe('WORLD_LIGHT_LAW');
    // Boşta geçmesin: ÖLÇÜLDÜ — bu dünya sınıfı gerçekten iki yönlü cümle düşürüyor.
    expect(receipt.dropped.length, 'düz dünyada hiçbir yönlü cümle düşmedi — çözücü çalışmıyor').toBeGreaterThan(0);
    expect(receipt.rule).toBe('FLAT_WORLD_DROPS_DIRECTIONAL');
    // Düşen cümle kırpılmadan durur: "hangi cümle gitti" sorusu bir daha araştırılmaz.
    for (const clause of receipt.dropped) {
      expect(clause.trim().length).toBeGreaterThan(0);
      expect(dna.light).toContain(clause);
      // Ve gerçekten düşmüş olmalı — kazanan metinde bulunmasın.
      expect(receipt.light).not.toContain(clause);
    }
  });

  /**
   * ASIL YASA — sessiz ezilme yasağı.
   *
   * Ölçüm (2026-07-26, gerçek `dnaDirectives` çıktısı): 46 dünyanın **31'inde** ref DNA'nın
   * en az bir ışık cümlesi düşüyor. Hepsi bugüne kadar kayıtsızdı. Bu test tek şeyi garanti
   * eder ve kural olarak kalıcıdır: **çözücü bir şeyi değiştirdiyse, neyi düşürdüğünü
   * söylemek zorunda.** Yeni bir otorite kapısı eklenirse ve makbuz bırakmazsa bu test kırar.
   */
  it('ışık metni değiştiyse makbuz MUTLAKA kaybı listeler — 46 dünyada sessiz ezilme yok', () => {
    const dna = dnaDirectives(DATA.refs.slice(0, 4), registerOf('ANIMATION_STYLIZED'));
    let changed = 0;
    for (const w of DATA.worlds) {
      const r = resolveLightAuthorityReceipt(dna.light, w);
      if (r.light === dna.light) continue;
      changed += 1;
      expect(r.dropped.length, `${w.id}: ışık metni değişti ama makbuz boş — sessiz ezilme`).toBeGreaterThan(0);
      expect(r.rule, `${w.id}: kayıp var ama kural adı yok`).not.toBe('NONE');
      expect(r.winner, `${w.id}: dünya kazandı ama makbuz REF_DNA diyor`).toBe('WORLD_LIGHT_LAW');
    }
    // Ölçülen taban: bu sayı düşerse çözücü zayıflamış ya da dünya verisi değişmiş demektir.
    expect(changed, 'hiçbir dünyada ezilme ölçülmedi — kurulum bozuk').toBeGreaterThanOrEqual(20);
  });

  /**
   * BU TESTİN POLİTİKASI DEĞİŞTİ (KALP-G1e, aynı gün).
   *
   * İlk yazımı — birkaç saat önce, eski davranışa karşı — "uyumlu dünyada kimse ezilmez"
   * diyordu: `dropped` boş, `winner: REF_DNA`, `light` aynen korunur. Sonra Mami gerçek
   * karelerden bir kusur bildirdi: *"Fotolara baksan hep sahte bi ışık geliyor güneşten,
   * odada bile."* Ölçüm doğruladı — dünya yasası ile ref DNA aynı anahtar ışığı ayrı ayrı
   * söyleyince motor sekiz kez aynı emri duyuyor ve odaya pencere uyduruyor.
   *
   * Yeni yasa: **anlaşma tekilleştirir, çoğaltmaz.** Dünya kendi kaynağını zaten
   * adlandırıyorsa ref DNA'nın kaynak-adlandıran cümlesi fazlalıktır ve düşer; kaynağın
   * kendisi kaybolmaz, çünkü dünya yasası onu söylüyor. Değer/kontrast grameri korunur.
   *
   * Test silinmedi: gerçek-kare hükmü test yeşilini ezer (PROJECT_CONTRACT), o yüzden
   * politika güncellendi ve gerekçesi burada durdu.
   */
  it('dünya kendi kaynağını adlandırıyorsa ref DNA\'nın kaynak cümlesi TEKİLLEŞİR', () => {
    const agreeing = world('pixar_3d_edu');
    const dna = dnaDirectives(DATA.refs.slice(0, 3), registerOf('ANIMATION_EDU'));
    const receipt = resolveLightAuthorityReceipt(dna.light, agreeing);
    expect(receipt.rule).toBe('WORLD_AGREES_DEDUPED');
    expect(receipt.winner).toBe('WORLD_LIGHT_LAW');
    // Düşen cümle kaynağı adlandıran cümledir; makbuzda verbatim durur.
    expect(receipt.dropped.length).toBeGreaterThan(0);
    expect(receipt.dropped.join(' ')).toMatch(/named source/i);
    // Kaynak kaybolmadı: dünya ışık yasası onu zaten söylüyor.
    expect(String(agreeing.light_law)).toMatch(/window sun|desk lamp|motivated key/i);
    // Ref'in ışık DAVRANIŞI (değer/kontrast) korunur — düşen yalnız kaynak dayatması.
    expect(receipt.light).toMatch(/value separation|shadow shapes/i);
  });

  it('makbuzun `light` alanı eski çözücüyle BYTE-EŞİT — motor prompt kaymaz', () => {
    const register = registerOf('ANIMATION_STYLIZED');
    const dna = dnaDirectives(DATA.refs.slice(0, 4), register);
    // 46 dünyanın hepsinde parite: makbuz eklemek prompt'u değiştirmiş olamaz.
    for (const w of DATA.worlds) {
      expect(resolveLightAuthorityReceipt(dna.light, w).light, `parite kırık: ${w.id}`)
        .toBe(resolveLightAuthority(dna.light, w));
    }
  });

  it('ışık yasası olmayan dünyada ref DNA tek otorite, makbuz bunu söyler', () => {
    const lawless = DATA.worlds.find((w) => !String(w.light_law || '').trim());
    if (!lawless) return; // Her dünyanın yasası varsa kural zaten ihlal edilemez.
    const dna = dnaDirectives(DATA.refs.slice(0, 2), registerOf('ANIMATION_STYLIZED'));
    const receipt = resolveLightAuthorityReceipt(dna.light, lawless);
    expect(receipt.rule).toBe('NO_WORLD_LAW');
    expect(receipt.winner).toBe('REF_DNA');
    expect(receipt.dropped).toEqual([]);
  });
});
