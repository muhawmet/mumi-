# V2 — REF SEÇİMİ ÇALIŞMIYORDU (2026-07-26)

## Tek cümle

**Referans seçmek kareyi neredeyse hiç değiştirmiyordu**, çünkü ref'in prompt'a bastığı
kanal satırları ref'in ANLAMINDAN değil, 7-katman formatının İSKELETİNDEN doğuyordu.

## Yetenek hükmü

Ref, kütüphanenin en önemli seçicisidir: dünya "hangi evren", ref "o evrende hangi ses".
`dnaDirectives` her ref paketini dört kanala çevirir (camera · light · staging · motion +
texture) ve bu kanallar `buildImagePrompt`'ta **karar** olarak motora gider:
`Staging: …` · `Light: …` · `Texture rule: …`.

Ölçüm: bu eşleşmelerin büyük kısmı kazaydı. Kütüphane genelinde **471 kural ateşliyordu,
73'ü 60+ karakterlik köprüyle.** Yani Mami reçetede ref değiştirdiğinde çoğu zaman aynı
kanal metnini alıyordu — seçim gerçek bir seçim değildi.

## Üç kök sebep (hepsi yöntemde, kalıplarda değil)

1. **Format başlıkları eşleştiriciyi besliyordu.** Her ref DNA'sı zorunlu olarak
   `Signature light:` · `Texture/render:` · `Composition+motion:` taşır. `Signature`
   içindeki `nature` bir "rüzgâr/organik hareket" kuralını **41/46 dünyada** ateşliyordu;
   `Composition` başlığı staging kuralını, `Texture` başlığı texture kuralını.
2. **`.*` referans sınırını aşıyordu.** Ürün masası paketinde bir kural **1635 karakterlik**
   köprüyle eşleşti — "Hero" birinci ref'in adında, "silhouette" ikinci ref'in DNA'sında —
   ve şişe çekimine ATLET sahneleme dili bastı ("effort legible in body form").
3. **Eşleşmeler kelime ortasında oluyordu.** `fall`→`falloff` (25/46 dünya),
   `wind`→`window` (18/46), `action`→`refraction`. Optiğin en yaygın iki kelimesi.

Bu sınıf daha önce **üç kez tek tek yamandı** (`brain-data.ts` yorumları: "KÖK (T5 FIX-1)",
"(T5 FIX-5)", "FINAL (whole-branch)"). Her seferinde bir kalıp düzeltildi, yöntem değil.

## Yapılan (yöntem düzeltmesi, TDD)

`dnaDirectives` artık:
- 7-katman **başlıklarını eşleştirmeden önce düşürür** (format ≠ içerik),
- her ref'i **ayrı** ve **cümle cümle** eşler (köprü kurulamaz),
- bir eşleşmenin **kelime sınırında** başlayıp bitmesini şart koşar — 40 kalıbı tek tek
  düzeltmek yerine tek genel kural.

Gerçek çıktı, aynı ürün paketinde:

| | ÖNCE | SONRA |
|---|---|---|
| Staging | `performance axis: … effort legible in body form` (atlet) | `tabletop liquid-hero grammar: a single pour frozen at the instant surface tension breaks, backlight through the liquid body, real caustics` (ref'in kendi DNA'sı) |

## Yol boyunca açığa çıkan iki gizli kusur

**Boş sıfat yasağı ref ADLARINI atlıyordu.** Kanal boşalınca devreye giren fallback
metni prompt'a giriyor ve `cinedna_handheld`ın adı "**Cinematic** Observational Handheld".
Yani motora pozitif emir olarak "cinematic" yazılıyordu. Kusur görünmüyordu çünkü kanallar
yanlış-ateşlemeyle doluyordu ve fallback hiç çalışmıyordu. `scrubEmptyAdjectives` (aynı
gerekçeyle palet adlarına zaten uygulanan yasa) kanala da bağlandı.

**Bir test kusurun kendisiyle geçiyordu.** `brain.test.ts`'in doku-ailesi fixture'ı
altdizge arıyordu ve ilk eşleşen ref'teki tek "brush" **airbrush**'ın içindeydi. Fixture
kelime sınırına çekildi; iddia aynen korundu.

## Kapı

`npx tsc --noEmit` → **0** · `rtk proxy npx vitest run` → **2078/2078 (82 dosya)** ·
`npm run build` → **OK**. Taban 2062 → **+16 test** (8 `wordTraps` + 8 `dnaWiring`),
**silinen test yok**. 14 test kırılmıştı; 12'si fallback boş-sıfat sızıntısıydı (kod
düzeltildi), 2'si kazayı kilitliyordu (biri fixture düzeltmesi, biri kütüphanenin kendi
terimini kurala eklemek — `value-tension`, `arcane_zaun_dna`'nın adında geçiyor).

## Aynı turda: kütüphane genişlemesi başladı (reklam önceliği)

`automotive_hero_real` — araba reklamı, Mami'nin para kazandığı iş — kütüphanede **tek imza
ref'i olmadan** duruyordu (dünya yasası mükemmel: "gövde bir aynadır", "ışık ortamdır",
"yol bir karakterdir"; ama içinde seçilebilecek hiçbir ses yoktu). Üç ses yazıldı:

- `auto_reflection_travel` — hareket eden yansıma: kamera gövdeye paralel, sabit mesafede;
  hareketin tek sebebi yansımayı yürütmek.
- `auto_flagged_darkfield` — showroom karanlık zemin: çatı boyunca uzatılmış tek yumuşak
  kaynak, iki yanda siyah flag'ler siluети oyuyor; boyaya asla key yok.
- `auto_night_practical` — gece pratikleri: hiç ünite ışığı yok; sokak lambası, tabela,
  aracın kendi lamba imzası ve ıslak asfalt ikinci kaynak olarak çalışıyor.

Ref sayısı 130 → 133; üç ayrı test kilidi bilerek yükseltildi (yasa: "ekleyince yükselt,
asla düşürme"). Gerçek `generateBatch` ile doğrulandı: kanal satırları artık ref'lerin
kendi grameriyle konuşuyor.

**Tarif yazarken öğrenilen:** kablolama dürüstleştiği için artık tarifteki KELİME SEÇİMİ
doğrudan kanalı belirliyor. Yeni gece ref'i "street" kelimesi yüzünden araba reklamına
"belgesel el kamerası" emri aldırdı — ölçüldü: `street` geçen 6 ref'in 4'ü belgesel değil
(akira'nın sodyum sokak havuzları, ghost_shell'in ıslak sokak yansımaları, verse_miles'ın
sokak-neonu). Sokak bir MEKÂNDIR, çekim yöntemi değil: token kuraldan söküldü. Gerçek
belgesel ref'leri `handheld|documentary|observational` ile zaten yakalanıyor.

## Değişen dosyalar

- `src/core/brain.ts` — `dnaDirectives` eşleştirme yöntemi + fallback boş-sıfat temizliği
- `src/core/brain-data.ts` — `value[- ]tension` gerçek terimi (köprüyle ateşleyen kural)
- `src/core/brain.test.ts` — doku fixture'ı kelime sınırına çekildi
- `src/core/dnaWiring.test.ts` — YENİ, 8 test (aşırı-düzeltme koruması dahil)
