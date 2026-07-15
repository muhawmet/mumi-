import { describe, it, expect } from 'vitest';
import { buildImagePrompt, paletteLightPrompt, scrubHumanTokens, stripTemporalForStill, type Concept } from './brain';
import { DATA, generateBatch, type BriefInput } from './pure';
import { autoGroupBeats } from './source';

/**
 * FAZ2 RE-JÜRİ DİKİŞ ONARIMI — önceki fix dalgalarının (Wave-2 R5 cast-gate +
 * R11 temporal-strip) GERÇEK ÇIKTIYA soktuğu mekanik dikişleri onarır.
 * Yeşil gate ≠ doğrulandı: her test GERÇEK generateBatch / buildImagePrompt
 * çıktısına bakar (fixture değil), dikişin GİTTİĞİNİ kanıtlar.
 */

interface Recipe { topic: string; projectClass: string; worldId: string; propId: string; refIds: string[]; paletteId: string; cast?: string; raw: string; }
const JURY: Record<string, Recipe> = {
  jjk: { topic: 'Lanet', projectClass: 'STYLIZED_PREMIUM', worldId: 'jjk_mappa', propId: 'none',
    refIds: ['jujutsu_dark_ritual'], paletteId: '',
    raw: 'Gece yarısı metro geçidinde lanetli enerji sise dönüşür. Büyücü avucunda enerji toplar. Karanlık lanet öne hamle yapar. Büyücü laneti dağıtır.' },
  edu: { topic: 'Su Döngüsü', projectClass: 'ANIMATION_EDU', worldId: 'pixar_3d_edu', propId: 'native_world',
    refIds: ['pixar_dimensional', 'pixar_emotional_staging'], paletteId: '',
    raw: 'Güneş okyanustaki suyu ısıtır ve su buharlaşır. Yükselen buhar bulutları oluşturur. Bulut doyunca yağmur düşer. Su okyanusa akar.' },
  watch: { topic: 'Saat lansmanı', projectClass: 'ULTRAREAL_COMMERCIAL', worldId: 'fincher_precision', propId: 'native_world',
    refIds: ['kubrick_one_point', 'severance_corporate_dread', 'luxury_watch_macro'], paletteId: 'desaturated_cinematic',
    raw: 'Karanlık stüdyoda ışık huzmesi çelik saat kasasında gezinir. Saniye ibresi ilerler. Kamera çarklara yaklaşır. Saat kadife zemine yerleşir.' },
  auto: { topic: 'Otomobil çöl', projectClass: 'AUTOMOTIVE_MOBILITY', worldId: 'deakins_naturalist', propId: 'native_world',
    refIds: ['automotive_commercial', 'breaking_bad_desert_pov', 'setup_goldenhour_auto'], paletteId: 'golden_dust_epic',
    raw: 'Şafak vakti çöl yolunda ısı dalgaları titreşir. Ufukta otomobil belirir. Kamera gövde hattı boyunca kayar. Otomobil tozu geride bırakır.' },
};
function batchImages(key: keyof typeof JURY): string[] {
  const r = JURY[key];
  const beats = autoGroupBeats(r.raw, 'Dengeli', 'kling_3');
  const res = generateBatch({
    rawSource: r.raw, sourceBeats: beats, projectTopic: r.topic, projectClass: r.projectClass,
    sceneCount: beats.length, cast: r.cast || '', selectedWorldId: r.worldId, selectedPropId: r.propId,
    selectedRefIds: r.refIds, selectedPaletteId: r.paletteId, selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3',
  } as BriefInput);
  if (res.status !== 'GENERATED') throw new Error('not generated: ' + key);
  return res.scenes.map((s: any) => s.imagePrompt);
}
function batchMotions(key: keyof typeof JURY): string[] {
  const r = JURY[key];
  const beats = autoGroupBeats(r.raw, 'Dengeli', 'kling_3');
  const res = generateBatch({
    rawSource: r.raw, sourceBeats: beats, projectTopic: r.topic, projectClass: r.projectClass,
    sceneCount: beats.length, cast: r.cast || '', selectedWorldId: r.worldId, selectedPropId: r.propId,
    selectedRefIds: r.refIds, selectedPaletteId: r.paletteId, selectedMusicId: '',
    imageModel: 'nano_banana_2', videoModel: 'kling_3',
  } as BriefInput);
  if (res.status !== 'GENERATED') throw new Error('not generated: ' + key);
  return res.scenes.map((s: any) => s.motionPrompt);
}

// ==================================================================================
// FIX-A [Critical] — R5 scrubHumanTokens: dejenere ikame + eyes/iris çelişki + sarkma
// ==================================================================================
describe('FIX-A — castless scrub: dejenere tekrar / eyes-iris çelişkisi / sarkma YOK', () => {
  it('watch: "micro-texture and micro-texture" dejenere tekrarı YOK', () => {
    for (const img of batchImages('watch')) {
      expect(img).not.toMatch(/micro-texture and micro-texture/i);
    }
  });
  it('watch: "X (X, …" parantez dejenere tekrarı YOK', () => {
    for (const img of batchImages('watch')) {
      // e.g. "surface material micro-texture (micro-texture, fine line)"
      expect(img).not.toMatch(/\b([\w-]+)\s+\(\1[,)]/i);
    }
  });
  // Castless bans an INVENTED IDENTITY, not a body: a beat that teaches a human behaviour
  // ("masayı temizlemek", "pencere önünde durmak") must still be able to SHOW it, with an
  // anonymous body. What may never leak is an anatomy RENDER ORDER from the world law
  // ("SSS on skin", "painted-in iris") — that is what these assertions guard, and they stay.
  it('edu castless: kimlik icadı yasak, davranış gösterilebilir — ama insan-uzvu (eyes/iris/the face/skin/beard) render emri sızmıyor', () => {
    for (const img of batchImages('edu')) {
      expect(img).toMatch(/No named or identifiable person in this frame/);
      expect(img).toMatch(/anonymous body/i);
      expect(img).not.toMatch(/\bon eyes\b/i);
      expect(img).not.toMatch(/\biris\b/i);
      expect(img).not.toMatch(/\bpainted-in iris\b/i);
      expect(img).not.toMatch(/\bthe face\b/i);
      expect(img).not.toMatch(/\bbeard\b/i);
      expect(img).not.toMatch(/\bskin\b/i);
    }
  });
  it('edu castless: "character surface material, not clay" sarkması YOK', () => {
    for (const img of batchImages('edu')) {
      expect(img).not.toMatch(/character (?:skin|surface material),\s*not clay/i);
    }
  });
  // WOUND-1 (2026-07-05 gece dönüş) — castless scrub prose'u makine-bozuğu okumamalı.
  it('castless: hantal "surface material" ikamesi YOK — sade "surface" kullanılır', () => {
    for (const img of [...batchImages('watch'), ...batchImages('auto'), ...batchImages('edu')]) {
      expect(img).not.toMatch(/surface material/i);
    }
  });
  it('castless: ışık-sıcaklık haritası "= <renk> skin/surface" saçmalığı YOK ("= <renk> cast" olur)', () => {
    for (const img of [...batchImages('watch'), ...batchImages('auto')]) {
      // "sodium = amber skin" / "sodium = amber surface material" fiziksel saçmalık
      expect(img).not.toMatch(/=\s*\w+\s+(?:skin|surface material|surface)\b/i);
    }
  });
  it('castless: öksüz cilt-yaşlanma fragmanı "(fine line)" YOK', () => {
    for (const img of [...batchImages('watch'), ...batchImages('auto')]) {
      expect(img).not.toMatch(/\(fine lines?\)/i);
    }
  });
  // Doğrudan birim: dejenere tekrar tekilleştirme + eyes/iris düşürme.
  it('scrubHumanTokens: "Skin holds pore and micro-texture" → tek "micro-texture" (X and X çökmez)', () => {
    const out = scrubHumanTokens('Skin holds pore and micro-texture at close-up.');
    expect(out).not.toMatch(/micro-texture and micro-texture/i);
    expect(out).toMatch(/holds micro-texture at close-up/i);
  });
  it('scrubHumanTokens: "Skin micro-texture (pore, beard shadow, fine line)" → parantez tekrarı çökmez, öksüz "(fine line)" DÜŞER', () => {
    const out = scrubHumanTokens('Skin micro-texture (pore, beard shadow, fine line) is present.');
    expect(out).not.toMatch(/\b([\w-]+)\s+\(\1[,)]/i);
    expect(out).not.toMatch(/\(fine lines?\)/i);
    expect(out).not.toMatch(/surface material/i);
    expect(out).toMatch(/surface micro-texture is present/i);
  });
  it('scrubHumanTokens: ışık-sıcaklık "sodium = amber skin" → "sodium = amber cast" (fizik doğru)', () => {
    const out = scrubHumanTokens('tone accurate to source temperature (sodium = amber skin, daylight = neutral skin, tungsten = warm skin).');
    expect(out).not.toMatch(/=\s*\w+\s+(?:skin|surface)/i);
    expect(out).toMatch(/sodium = amber cast/i);
  });
  it('scrubHumanTokens: "wet dual-point specular on eyes with painted-in iris depth, and X" → eyes/iris düşer, X kalır, öksüz "and" yok', () => {
    const out = scrubHumanTokens('subsurface scattering under sodium, wet dual-point specular on eyes with painted-in iris depth, and physically-motivated bounce fill.');
    expect(out).not.toMatch(/\beyes\b/i);
    expect(out).not.toMatch(/\biris\b/i);
    expect(out).toMatch(/physically-motivated bounce fill/i);
    expect(out).not.toMatch(/,\s*,/); // öksüz çift virgül yok
  });
});

// ==================================================================================
// WOUND-3 (2026-07-05 gece) — grade çelişkisi: world cool-shadow ↔ palet warm-shadow.
// Authority: World/Render Lock > Palette. Aynı promptta hem "cool shadows" (render law)
// hem "shadows read as warm burnt orange" (palet) = doğrudan hue çelişkisi. Render lock
// kazanır: palet gölge-terimi world grade'e devreder, mid/accent/highlight sıcaklığı kalır.
// ==================================================================================
describe('WOUND-3 — world cool-shadow ↔ palet warm-shadow uzlaştırma', () => {
  it('auto (deakins cool-shadow + golden_dust warm palet): palet SHADOW terimi warm hue TAŞIMAZ', () => {
    for (const img of batchImages('auto')) {
      expect(img).not.toMatch(/shadows read as[^,]*\b(?:warm|orange|amber|umber|burnt|gold(?:en)?|scorched)\b/i);
    }
  });
  it('auto: gölge world cool-shadow grade\'ine devreder (çelişki kalkar)', () => {
    for (const img of batchImages('auto')) {
      expect(img).toMatch(/shadows read as[^,]*cool-shadow grade/i);
    }
  });
  it('auto: palet mid/accent/highlight SICAKLIĞI korunur (kimlik kaybolmaz)', () => {
    const anyWarm = batchImages('auto').some((img) =>
      /(?:midtones|accents|highlights) read as[^,]*\b(?:warm|amber|umber|ivory|burnt|gold(?:en)?)\b/i.test(img));
    expect(anyWarm).toBe(true);
  });
  it('watch (fincher cool-shadow + desaturated zaten cool): yanlış-pozitif YOK, palet dokunulmaz', () => {
    for (const img of batchImages('watch')) {
      expect(img).not.toMatch(/cool-shadow grade/i);
      expect(img).toMatch(/shadows read as[^,]*cool blue/i);
    }
  });
});

// ==================================================================================
// WOUND-4+5 (2026-07-05 gece) — negatif-satır hijyeni: öksüz IP + teal-orange padding.
// #4: "NO 1917 trench" (yıl-lider film adı) + "NO RV lab" (kısa IP) negItemIsIP'i
// atlıyordu → jenerik firewall cümlesi zaten kapsıyor, öksüz IP-adı düşer.
// #5: teal-orange yakın-eşanlam ×3 padding (prefix-dedup yakalamıyor) → ilk/bilgilendirici
// tutulur, sonrakiler düşer.
// ==================================================================================
describe('WOUND-4+5 — negatif hijyeni: öksüz IP + teal-orange padding', () => {
  it('#4 auto: öksüz IP "1917 trench" / "RV lab" negatiften DÜŞER (jenerik cümle kapsıyor)', () => {
    for (const img of batchImages('auto')) {
      expect(img).not.toMatch(/1917 trench/i);
      expect(img).not.toMatch(/RV lab/i);
      // koruma kaybolmaz: jenerik franchise-firewall cümlesi durur
      expect(img).toMatch(/no recognizable franchise/i);
    }
  });
  it('#5 auto: teal-orange padding tekilleşir — bilgilendirici tutulur, tekrar düşer', () => {
    for (const img of batchImages('auto')) {
      expect(img).not.toMatch(/NO teal-orange Hollywood push/i);
      expect(img).not.toMatch(/NO teal-orange excess/i);
      // ilk/bilgilendirici teal-orange yasağı (cyan-shadow tail'li) korunur
      expect(img).toMatch(/teal-orange grade/i);
    }
  });
});

// ==================================================================================
// WOUND-6 — KAPSAM DIŞI (2026-07-05 gece kararı): EDU palet "hue çöküşü" jüri notu,
// pixar_3d_edu'nun KASITLI warm-key kimliğiyle çelişiyor. Palet bias + negative_lock
// AÇIKÇA "NO teal-orange Hollywood grade" diyor; render_law accent'i "warm saturated
// rim", cool komplementi shadow'daki cool-violet bounce olarak tanımlıyor. Cool/teal
// accent = palet-içi çelişki (WOUND-3'ün aynısı) → YAPILMADI. Warm-key içinde kalınca
// hue-ayrımı marjinal + tat kararı → Mami'ye fork bırakıldı (kimliği gevşetmek onun
// çağrısı). Önceki FIX-C testleri (accent warm, teal/green/acid DEĞİL) KORUNDU.
// ==================================================================================

// ==================================================================================
// WOUND-2 (2026-07-05 gece) — "sahne gömülü / TODO-ödevi" algısı. KEEP-render_law
// kararına saygı (kısaltma YOK, reorder YOK): doktrin (~450kl) bir STYLE SYSTEM
// signpost'uyla "HOW to render" diye çerçevelenir ve somut kareye işaret eder →
// image model doktrini stil-referansı, sahne brief'ini teslimat olarak ayırır.
// ==================================================================================
describe('WOUND-2 — STYLE SYSTEM signpost: doktrin HOW, sahne brief teslimat', () => {
  it('her register: prompt STYLE SYSTEM signpost ile açılır, doktrinden ÖNCE gelir', () => {
    for (const key of ['watch', 'auto', 'edu', 'jjk'] as const) {
      for (const img of batchImages(key)) {
        expect(img).toMatch(/STYLE SYSTEM/);
        // signpost, "Scene brief" anchor'ından ÖNCE (sahneyi işaret eder)
        expect(img.indexOf('STYLE SYSTEM')).toBeGreaterThanOrEqual(0);
        expect(img.indexOf('STYLE SYSTEM')).toBeLessThan(img.indexOf('Scene brief'));
      }
    }
  });
  it('KEEP-render_law: doktrin gövdesi hâlâ TAM (kısaltılmadı)', () => {
    const w = batchImages('watch')[0];
    expect(w).toMatch(/Photoreal cinematography in the David Fincher/);
    expect(w).toMatch(/obsessive geometric control/); // doktrin ortası duruyor
  });
});

// ==================================================================================
// WOUND-7 (2026-07-05 gece) — motion imzası i2v-routing (MİMARİ). world.motion_cadence
// (jjk ink-smear/12fps, spiderverse dual-cadence) still'den söküldü + agent-brief'e
// gidiyordu ama ASIL buildMotionPrompt'a HİÇ girmiyordu → STY register motion'ı
// tanımlayıcı fizikten yoksundu. Artık MOTION prompt'una route edilir; framing
// register-nötr (photoreal deakins kendi locked-off cadence'ini alır, smear UYDURULMAZ),
// engine timing üstünlüğü korunur (WOUND-3 dersi — çelişki yok).
// ==================================================================================
describe('WOUND-7 — world motion cadence i2v MOTION prompt\'una route edilir', () => {
  it('jjk (STY): MOTION world cadence imzasını taşır (ink-smear / 12fps)', () => {
    for (const m of batchMotions('jjk')) {
      expect(m).toMatch(/Motion cadence/i);
      expect(m).toMatch(/ink-smear|12fps/i);
    }
  });
  it('jjk: engine timing üstünlüğü korunur (final-hold engine law\'a devreder)', () => {
    for (const m of batchMotions('jjk')) {
      expect(m).toMatch(/engine law/i);
    }
  });
  it('auto (photoreal deakins): kendi cadence\'i (locked-off/dolly) gelir, smear/speed-line UYDURULMAZ', () => {
    for (const m of batchMotions('auto')) {
      expect(m).toMatch(/Motion cadence/i);
      expect(m).not.toMatch(/ink-smear|speed line/i);
    }
  });
});

// ==================================================================================
// FIX-B [Critical] — R11 stripTemporalForStill: render-lock cümle bütünlüğü
// ==================================================================================
describe('FIX-B — jjk temporal-strip: öksüz "This smear" + kopuk (N) numara-zinciri YOK', () => {
  function numberChain(img: string): number[] {
    // renderLock bloğundaki "(N) UPPER:" liste tokenlarını çıkar (metro/lens değil).
    return (img.match(/\((\d+)\)\s+[A-Z]/g) || []).map((m) => Number(m.match(/\d+/)![0]));
  }
  it('jjk: öksüz "This smear" referansı image promptta YOK', () => {
    for (const img of batchImages('jjk')) {
      expect(img).not.toMatch(/This smear/i);
    }
  });
  it('jjk: numaralı liste kesintisiz (1,2,3,… — 4 gap YOK)', () => {
    for (const img of batchImages('jjk')) {
      const chain = numberChain(img);
      expect(chain.length).toBeGreaterThan(0);
      for (let i = 0; i < chain.length; i++) expect(chain[i]).toBe(i + 1);
    }
  });
  it('jjk: MAPPA imzası anlamlı kalır (temporal ink-smear düşse de world identity mevcut)', () => {
    for (const img of batchImages('jjk')) {
      expect(img).toMatch(/MAPPA/);
      expect(img).not.toMatch(/ink-smear/i);
      expect(img).not.toMatch(/frames?\s+dissolve/i);
    }
  });
  // Doğrudan birim: numaralı orta-öğe temporal + bağlı takip cümlesi.
  it('stripTemporalForStill: numaralı temporal öğe düşünce takip "This…" cümlesi öksüz kalmaz + renumber', () => {
    const src = 'World opener frame. (1) A: alpha grammar. (2) B: beta grammar. '
      + '(3) LINE: rest line, but at peak it becomes an ink-smear frame where the drawing dissolves and resolves. '
      + 'This smear is the signature, not decoration. (4) C: gamma grammar. (5) D: delta grammar.';
    const out = stripTemporalForStill(src);
    expect(out).not.toMatch(/This smear/i);
    expect(out).not.toMatch(/ink-smear/i);
    const chain = (out.match(/\((\d+)\)\s+[A-Z]/g) || []).map((m) => Number(m.match(/\d+/)![0]));
    for (let i = 0; i < chain.length; i++) expect(chain[i]).toBe(i + 1);
    expect(out).toMatch(/gamma grammar/); // hayatta kalan öğeler korunur
  });
});

// ==================================================================================
// FIX-C [Important] — R3 EDU palette: mid+accent mono burnt-orange çöküşü kırık
// ==================================================================================
describe('FIX-C — pixar_3d_edu palet: midtones ≠ accents (mono burnt-orange tekrarı biter)', () => {
  const edu = DATA.worlds.find((w) => w.id === 'pixar_3d_edu');
  it('paletteLightPrompt: "midtones burnt orange, accents burnt orange" birebir tekrarı YOK', () => {
    const out = paletteLightPrompt(undefined, edu as any);
    // mid ve accent AYNI string okumamalı
    const m = out.match(/midtones read as ([^,]+), accents read as ([^,]+)/i);
    expect(m).toBeTruthy();
    expect(m![1].trim()).not.toBe(m![2].trim());
  });
  it('paletteLightPrompt: accent ayrık bir tona çekildi (amber), mono-warm çöküşü yok', () => {
    const out = paletteLightPrompt(undefined, edu as any);
    expect(out).toMatch(/accents read as [^,]*amber/i);
    // world warm-key doğası korunur (shadow cool, ama mid/accent/highlight warm)
    expect(out).toMatch(/midtones read as [^,]*warm/i);
    expect(out).not.toContain('a single'); // oneFamily mono-collapse yok
  });
  it('paletteLightPrompt: accent tonu yasak sınıflara (teal / green / acid) kaymaz — sadece warm-ayrık', () => {
    const out = paletteLightPrompt(undefined, edu as any);
    const accent = out.match(/accents read as ([^,]+)/i);
    expect(accent).toBeTruthy();
    // accent yalnız "NO teal-orange" negatifiyle uyumlu warm bir ton olmalı; teal/green/acid DEĞİL
    expect(accent![1]).not.toMatch(/teal|green|acid|cool/i);
    expect(accent![1]).toMatch(/warm/i);
  });
});

// ==================================================================================
// V3 TRIAGE (2026-07-10, wf_5358d0b7 Opus denetimi) — castless 'character' artıkları
// (F2/F5), 'surface texture on the surface' dejenerasyonu (F3), palet '., ' dikişi
// (F4), R9c teal-orange çifte-otorite (F1-luxury). Hepsi GERÇEK generateBatch çıktısı.
// ==================================================================================
describe('V3-A — castless prompt kişi-antesedanı taşımaz (character → subject)', () => {
  it('edu castless: "character at focal plane / character close-up / character surface" YOK, subject VAR', () => {
    for (const img of batchImages('edu')) {
      expect(img).not.toMatch(/character at focal plane/i);
      expect(img).not.toMatch(/character close-?up/i);
      expect(img).not.toMatch(/character (?:skin|surface)/i);
      expect(img).not.toMatch(/in character or environment/i);
      expect(img).toMatch(/subject at focal plane/i);
    }
  });
  it('auto castless: "for character isolation" YOK, subject isolation VAR', () => {
    for (const img of batchImages('auto')) {
      expect(img).not.toMatch(/character isolation/i);
      expect(img).toMatch(/subject isolation/i);
    }
  });
  it('nitelik-anlamlı character korunur: palette character etiketi bozulmaz', () => {
    for (const img of batchImages('watch')) {
      expect(img).toMatch(/palette character:/i);
      expect(img).not.toMatch(/palette subject:/i);
    }
  });
  it('edu castless: "surface texture on the surface" dejenere ikamesi YOK', () => {
    for (const img of batchImages('edu')) {
      expect(img).not.toMatch(/surface texture on the surface/i);
    }
  });
});

describe('V3-B — palet karakter cümlesi "., " dikişi taşımaz (biasCharacterClause chunk-içi nokta)', () => {
  it('4 register: hiçbir image promptta ". ," / ".," dikişi yok', () => {
    for (const key of ['jjk', 'edu', 'watch', 'auto'] as const) {
      for (const img of batchImages(key)) {
        expect(img, key).not.toMatch(/\.\s*,/);
      }
    }
  });
});

describe('V3-C — R9c: render lock pozitif teal-orange deklare ederse palet blanket negatifi düşer', () => {
  it('watch (fincher × desaturated_cinematic): PALET satırında blanket "NO teal-orange split" YOK; world kendi nitelikli excess-guard\'ını KORUR', () => {
    for (const img of batchImages('watch')) {
      expect(img).toMatch(/restrained teal-and-orange/i);
      // Palet fizik segmenti (çifte-otorite kaynağı) teal-orange taşımaz
      const seg = img.split(/Palette physics:/i)[1]?.split(/Render these/i)[0] ?? '';
      expect(seg).not.toMatch(/teal-orange/i);
      // Dünyanın KENDİ "excess" nitelikli guard'ı düşmez (öz-tutarlı, çelişki değil)
      expect(img).toMatch(/teal-orange split-tone excess/i);
    }
  });
  it('auto (deakins yalnız FORBID bağlamında teal-orange içerir): world kendi yasağını KORUR', () => {
    for (const img of batchImages('auto')) {
      // deakins render/negatif yasağı ("Hollywood teal-orange grade") düşmemeli
      expect(img).toMatch(/teal-orange/i);
    }
  });
});
