---
name: mamilas-uc-katman-hukmu
description: "2026-07-31 denetimi — kalite kararı üç katmanda verilir, emek en zayıf katmana gidiyor; Kling 45 kelime ister, biz 260 yazıyoruz"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3a570c66-5bb4-4fd7-95e0-2754582958c2
  modified: 2026-07-31T06:48:51.397Z
---

**13 kollu denetimin hükmü (2026-07-31).** Ham raporlar repoda:
`artifacts/denetim-2026-07-31/` — sıfırdan araştırma YAPMA, önce oraya bak.

## Kalite kararı ÜÇ KATMANDA verilir; emek en zayıfına gidiyor

**Katman 1 — SAHNE TASARIMI.** İyi ve kötü projeyi ayıran şey burası, prompt zanaatı değil.
Kayıtlı red oranları: Sabit Sürat %18 · Kütle %29 · Güç Birliği %52 · **Eşeyli %58** ·
Birlikte Daha Güçlüyüz %67 · Değerler %74. İyi olanda kare başına **1-2 odaklı figür**,
isimli özne, somut fiziksel eylem, yazı **nesneye kazınmış**, kamera mikro. Kötü olanda
kalabalık, gövdesiz kollar, soyut parıltı (çiçeğe dönüşüyor), sahte müsamere pozu, arka
planda uydurma tabela. Ölçüm: **yana kayan 5 klibin 5'inde arka planda yapay figür doğdu.**

**Katman 2 — KONTROL.** 139 revizenin en büyük kategorisi **inandırıcılık: 45 madde (%32)** —
kare teknik olarak sağlam ama durum yalan. Mekanizma tek cümle: **VO'nun fiilini yapan bir
gövde karede yok.** Bu zevk değil, kontrol edilebilir değişmez. Kimse koşmuyor.

**Katman 3 — KELİME.** 861 satırlık `PROMPT-YASASI.md` burada. En az etkili katman, en çok
emek orada — ve Kling için **zararlı**.

## Öğrenememenin sebebi: ders yanlış katmana yazılıyor
Emilen üç ders (STYLE tavanı, kırmızı çizgiler, Türkçe hero imlası) katman 2'ye — **ölçene** —
yazıldığı için tuttu. Düzyazı kalan beş ders ertesi gün tekrarladı: motion tempo dersi
**29 Tem** yazıldı, **30 Tem** 54 klibin 54'ünde tekrar etti. Bkz. [[mamilas-bul-sec-onar]].

## KLING 3.0 — resmi kılavuz bizi çürütüyor
> *"Yüklediğin görsel kimlik/ışık/arka plan için tek doğruluk kaynağıdır. **Görselde zaten
> görünen şeyleri yeniden tarif etme** — model o öğeleri yeniden üretir, kimlik kayması ve
> bozulma doğar. Prompt yalnızca aksiyon ve kameraya odaklanmalı."* · **Uzunluk: 60 kelime
> altı, tercihen 25-45.**

Biz 210-260 yazıyoruz. Topluluk: 70 kelime üstünde dikkat dağılıyor, **arka plan figürleri
donuyor**; uzun kısıtlama cümleleri hareket vektörlerini çakıştırıp **kilitlenme ve ani
sıçrama** üretiyor — Mami'nin *"ruh yok, aptalca ani hareketler"* şikâyetinin birebir tarifi.
**Niyet + ağırlık + duygu** ("straining under the massive weight, trembling knees") eklem
tarifinden kat kat iyi. SINANMADI: 45 kelime vs 260 kelime, K11'de tek klip cevap verir.

Pratik: **yazma sahnesi Kling'de üretilmez** (geniş çekilir, yazı Premiere'de maskelenir) ·
**nesne el değiştirme tek klipte olmaz** (başlangıç+bitiş karesi kullanılır) · kalabalık
fiziksel aksiyonda **Veo 3.1 ve Hailuo Kling'i geçiyor**.

## Sistem gerçekleri (doğrulandı)
- `src/core/` 11.853 satır, **%58'i yalnız testlerden erişiliyor**; `brain.ts`/`engine.ts`/
  `lessonBank.ts` **canlı ama baypas** — üretim onları import etmiyor.
- `SURGERY_DATA.json` `render_law` **36 bileşen**, `dunya-kilidi.mjs` 90 kelime bütçesine
  **11'ini seçip 25'ini atıyor**; sonra ajan bir kez daha uyarlıyor → **üç aşamalı sapma**.
- `memory/` 40 dosya (~90 KB) **hiç otomatik yüklenmiyor**; 861 satırlık yasa da öyle. Read-back
  güvenilirlik sırası: bloklayan hook ~%100 · CLAUDE.md/rules ~%90 · MEMORY.md ~%75 ·
  MCP hafıza sunucusu ~%30 · **pasif not dosyası ~%5 ← bizim yerimiz.**
- Kapılar dişsiz: `hasat-gate.mjs` üç çıkışta da `exit(0)` · `gate.sh` push edilmemiş commit'i
  ve sync hatasını görüp geçiriyor · `prompt-lint.mjs` **hiçbir hook'a/kapıya bağlı değil**.
- Yasa kendiyle çelişiyor: 619 *"değişim gövdede olmaz"* vs 628 *"gövdeyi dondurmak kusurdur"* —
  dokuz satır arayla. `@handle` "tarif etme" vs "yaş/etnisite yaz". Motion 114 vs 210-260 kelime.
- `docsContract.test.ts` **10 skill'in yalnız 2'sinin içeriğini** karşılaştırıyor.
- 21 öksüz script — yalnız dokümanlarda adı geçiyor.
- 13 projenin **yalnız 6'sında** revize kaydı var; kalanların red oranı ölçülemiyor.

## AGY kullanımı
Ultra paket, Mami'nin usage'ından gitmiyor — **bol bol kullan**, ama HÜKÜM verdirme.
Bugün 5 iddiadan 1'i abartı, 2 satır numarası yanlış, Part B kaynaksız çıktı.
Bölüşüm: **AGY bulur → Claude grep'le doğrular → Claude onarır.** `--mode plan` salt-okur.
Deep Think YOK; en üst model `gemini-3.1-pro-high`. Codex `--sandbox read-only` ikinci göz.

Bkz. [[mamilas-agy-video-gozu]] · [[mamilas-aktif-uretim-durumu]] · [[mamilas-makro-kurali]]
