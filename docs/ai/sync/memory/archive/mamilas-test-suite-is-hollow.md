---
name: mamilas-test-suite-is-hollow
description: "1857 testin %68'i hiçbir gerçek kusuru reddetmiyor — üç sert yasanın (paket prompt içeriği, on-screen text, otorite hiyerarşisi) arkasında SIFIR kapı var. Mutasyon testiyle ölçüldü."
metadata: 
  node_type: memory
  type: project
  originSessionId: 0d283b47-46f4-4bb3-8c25-3ddceed928b5
---

**2026-07-12'de ölçüldü.** Test isimleri okunmadı — üretim koduna **18 gerçek kusur enjekte edildi**,
her birinde tüm süit koşuldu, kaç testin kırmızıya döndüğü sayıldı, sonra geri alındı.

## Sayı: 1852 testin **592'si (%32)** en az bir gerçek kusuru reddetti. **1260'ı (%68) hiçbir şeyi reddetmedi.**

## ☠️ ÜÇ SERT YASANIN ARKASINDA SIFIR KAPI VAR

| mutasyon | sonuç |
|---|---|
| Paketin `prompts.image` alanı **40 karaktere kırpıldı** (ajanın okuduğu alan!) | **1852/1852 YEŞİL** |
| Paketteki **on-screen text yasası TERSİNE çevrildi** (*"Add on-screen text in post"*) | **1852/1852 YEŞİL** |
| **`AUTHORITY_HIERARCHY` sırası bozuldu** (Material > World) | zincir testleri **0 kırmızı** — sadece `docsContract` (metin eşleşmesi) yakaladı |

**Otorite testinin rezaleti:** `faz1_triple.test.ts:148` ve `chain.test.ts:152` şunu yapıyor:
`const top = AUTHORITY_HIERARCHY[0]` — ama o bir **STRING**, dizi değil. `[0]` = **`'P'` harfi.**
Assertion fiilen: `expect(brief).toContain('p')`. **Türkçe brief'te 'p' harfi geçtiği sürece yeşil.**

## 🔴 TELİF FIREWALL'U KENDİ KENDİNİ SORGULUYOR

`expect(containsWorkTitle(pos)).toBe(false)` — **sızıntı var mı diye SIZINTIYI ENGELLEYEN FONKSİYONA soruyor.**
Firewall komple kapatıldı → zincir testleri **0 kırmızı.**
**Kapı dört kez açıldı; beşinci açılışı bu süit GÖREMEZ.**

## 🔴 `brain.test.ts` — 308 test, dünyası `{}`

Süitin en büyük ikinci dosyası prompt'ları `FW_CTX = { world: {} }` ile kuruyor — **boş dünya objesiyle.**
`buildImagePrompt`'tan render lock tamamen silindi (ürünün varlık sebebi) → tüm süitte **19/1852** kırmızı.

## ✅ GÜÇLÜ OLANLAR

- **Palet Translation Law** — 241 kırmızı. Süitin en iyi korunan yasası.
- **Frame gate** — 52 + 47 kırmızı.
- **Sahne sayısı kilidi** — 49 kırmızı.
- **`runnerGate.test.ts`** — **repodaki en iyi dosya.** Gerçek `runner.mjs`'i temp klasörde **KOŞAR**,
  sahte paket kurar, **exit code** okur. Tek o, bir şeyi *koşturup reddettirdiği için* kapı olduğunu kanıtlıyor.

## 🐛 CANLI BUG

`src/pages/Director/DirectorStep.tsx:326` → `Math.min(60, …)` ama motor `SCENE_COUNT_MAX_WITHOUT_SOURCE = 20`.
**"Sessiz kırpma" hastalığı Dashboard'da kapatılmış, Director'da AÇIK.** 40 yazan 20 alıyor, haberi yok.

## YASA

> **Her yasa `runnerGate` muamelesini hak ediyor: paketi kur, GERÇEK TÜKETİCİYE ver, HAYIR demesini izle.**
> Builder'ın kaynağına bakan test aynadır. [[mamilas-simulation-loop]]
