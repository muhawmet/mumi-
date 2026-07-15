# ALTIN PROMPT vs SİTE ÇIKTISI — gerçek ölçüm

- Tarih: 2026-07-14 · TASK 1B
- Altın prompt: Mami'nin çalışan hattından, **kare üretmiş** (ekran görüntüsüyle doğrulandı):
  `prompts/GOLDEN-01-pixar_3d_edu-mira-mutfak.txt`
- Site çıktısı: **gerçek `generateBatch`** (fixture değil), dokunulmamış worktree'den:
  `site-output/SITE-01-pixar_3d_edu.image-prompt.txt` (7635 karakter, `status=GENERATED`, `contractGate=PASS`)
  `site-output/SITE-02-product_brand_real-REAL-SOURCE.image-prompt.txt` (10034 karakter, `contractGate=PASS`)
  SITE-02 **Mami'nin gerçek termos source'unu** kullanır (buyer audit, `rawHash ba24888a`).

---

## 1. P0 — KANITLANDI. Kaynağın açık isteği ÜÇ KEZ İPTAL EDİLİYOR.

Mami'nin source'u aynen şunu diyor:

> *"Ekranda yalnızca ürün üzerindeki **'MAMILAS THERMO'** yazısı **baked-in** görünsün"*

Sitenin ürettiği gerçek prompt aynı source'u alıyor ve:

1. Hemen ardına yazıyor: `[SOURCE — do not render as on-screen text; narration only]`
2. Sonra: `Text/logo: **clean plate — this scene carries no on-screen text.** No floating text, no caption,
   no subtitle, no watermark, no added signage`
3. Negatife: `NO floating UI or overlay text`

**Sonuç:** Motor termosu **yazısız** çizer. Kaynağın tek somut görsel isteği yok edilir.
`contractGate = PASS`, `qa.imageScore = 100`. **Hiçbir kod bu ihlali ölçmüyor.**

### Altın prompt aynı işi NASIL yapıyor

```
== ON-SCREEN TEXT ==
DIEGETIC — baked into the frame as a real object, NOT an overlay/caption/subtitle.
Surface: two small wooden tags hanging from the family chore-chart on the kitchen wall.
Reads EXACTLY (Turkish, character-for-character): "ÇOCUK  /  KARDEŞ".
Letterform: warm hand-painted / routed serif letters on wood tags...
```

Kaynağın istediği baked-text bir **KİLİT** oluyor — negasyon değil.
**Bu, TASK 2'nin `DeliveryPromise` deseninin birebir kendisi. Mami zaten elle uyguluyor.**

---

## 2. Bant-bant fark

| Altın bant | Sitede var mı | Not |
|---|---|---|
| `== RENDER LOCK ==` | ✅ **VAR** — aynı fizik metni verbatim | Dünya DNA'sı sağlam. KARE-BULGULARI'nın "render lock sökülmeyecek" yasası korunuyor. |
| `== CAMERA & VANTAGE ==` | ✅ VAR | |
| `== PALETTE AS LIGHT ==` | ✅ VAR ("Palette physics") | Ham hex yok — palet ışığa çevriliyor. |
| `== REFERENCE DNA (subordinate) ==` | ✅ VAR ("Reference anchor, subordinate") | |
| `== DOMINANT ELEMENT ==` | ❌ **YOK** | Yerine: `Scene brief (Claude yazar): "…"` + `[DIRECTOR TASK — authored by Claude, not image content…]` → **motora verilen bir ajan görevi.** Motor "baskın öğe"yi hiç öğrenmiyor. |
| `== ON-SCREEN TEXT ==` (diegetic, tam string) | ❌ **YOK** | Yerine sabit `clean plate — no on-screen text`. Kaynak ne isterse istesin. |
| `== LANGUAGE LOCK ==` (Türkçe glif kilidi) | ❌ **YOK** | Sitede yalnız negatifte `NO English signage`. Ç/Ş/ğ/ı glif garantisi yok. |
| `== CAST LOCK ==` + kimlik `@`-handle | ⚠️ **YARIM** | Site: `Character lock: Aras` ve *"no invented face"*. Ama **kimlik referansı mekanizması yok**. |
| Magnific `@[uuid:mira:output]` kimlik tutamağı | ❌ **YOK** | Sitede `@[` ve `Magnific` → **sıfır eşleşme**. Kimlik kilidinin gerçek taşıyıcısı bu ve site onu hiç bilmiyor. |
| `== NEGATIVE ==` frame-specific + baseline | ⚠️ yalnız baseline | Altın prompt bu karede kırılgan olanı ayrıca yasaklıyor ("kardeşin yüzünü kameraya dönmesi", "Ç/Ş kaybı", "kimlik drift"). |

Ayrıca **biçim**: altın prompt `== BAŞLIK ==` bantlarına ayrılmış, boş satırlarla nefes alıyor.
Sitenin çıktısında **sıfır bant başlığı** var — 7 600–10 000 karakterlik tek nefeslik paragraf.

---

## 3. Bunun A/B için anlamı — plan düzeltmesi gerekiyor

Handoff ve skill "eski hat vs yeni hat" diyor ve **eski hat = sitenin bugünkü çıktısı** varsayıyor.
**Bu varsayım yanlış.** Ölçüm gösteriyor ki:

- Geçen kareler (KARE-BULGULARI'nın 4 ✅'i **ve** Mami'nin ekrandaki tutarlı üretimi)
  **ajan-yazımı prompt'tan** çıktı — yani altın bant yapısından.
- Sitenin `buildImagePrompt` çıktısı **hiçbir zaman kare üretmedi**. Kendi export'u da bunu söylüyor:
  *"prompts.image bir BRIEF'tir, bitmiş prompt DEĞİL"* (`commandExport.ts:277`).

**Doğru A/B şudur:**

| | |
|---|---|
| **Referans (bilinen-iyi)** | Ajan-yazımı altın prompt → Mami'nin gerçek karesi |
| **Aday** | TASK 4 sonrası sitenin ürettiği prompt → **aynı kararla** üretilmiş yeni kare |
| **Hüküm** | Mami, pikselleri yan yana görür. Aday referansa **eşit veya üstün değilse DUR.** |

Yani TASK 4'ün hedefi kozmetik değil: **site, altın bant yapısını üretecek hâle gelmeli.**
Altın prompt bir örnek değil — **şartname.**

---

## 4. Magnific — blocker #5 için gerçek veri

Kimlik kilidi `@[fcaaf2a1-…:mira:output]` ile taşınıyor: **Magnific @-handle**.
Skill'in "Magnific zorunlu" demesinin sebebi upscale değil — **kimlik referansı**.
`brain.ts:2396` ise "ara çözünürlük geçişi yoktur" diyor ve site handle kavramını hiç bilmiyor.

Bu artık üç yönlü bir belirsizlik değil; **ölçülmüş bir boşluk.**
Yine de **tek yasanın ne olacağı Mami'nin kararı** — TASK 6'da kapanır. Ajan kendi seçmez.

---

## 5. Hâlâ eksik olan tek şey

**Altın prompt'un ürettiği KARE (piksel).** Prompt elimizde, kare değil.
Mami o tek PNG'yi `artifacts/baseline-frames/` altına bırakınca TASK 1B'nin prompt+piksel çifti tamamlanır
ve A/B'nin referans ayağı kilitlenir.
