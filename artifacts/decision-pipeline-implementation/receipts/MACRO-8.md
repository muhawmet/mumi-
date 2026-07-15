# MACRO 8 — Kullanılabilirlik doğrulaması + dürüst rapor

**Tarih:** 2026-07-15 · **Uygulayıcı:** Claude Opus 4.8 · **Plan:** MACRO 8

## Durum: **implementation complete / visual validation pending**

Manual World Studio dönüşümünün (MACRO 1-7) kodu tamamlandı ve uçtan uca çalışır durumda.
Görsel kalite hükmü (gerçek frame) Mami'nin manuel eylemidir — plan gereği tek dış kapı.
Bu kapı gelmeden `production ready` DENMEZ.

## Çalıştırılan doğrulama (gerçek çıktı)

| Kapı | Komut | Sonuç |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | **0 hata** |
| Birim/sözleşme | `rtk proxy npx vitest run` (filtresiz) | **1926 geçti / 0 kaldı (64 dosya)** |
| Build | `npm run build` | **OK** |
| E2E | `npx playwright test` | **15/15 PASS** |
| Launcher sözleşmesi | `docsContract.test.ts` | **97/97** (byte-parity + ince-kabuk kilidi) |

## Tarayıcıda uçtan uca (Macro 3-5) — gerçek akış

Playwright ile gerçek tarayıcıda sürüklendi ve screenshot'landı:
- **Macro 3:** Timeline'da sahne detayında "AJAN FINAL PROMPT · SHOT ONAYI" — ajan prompt geri-alım.
- **Macro 4:** shot onayı + ProductionPulse tek canonical readiness ("N shot onay bekliyor" /
  "READY"); Preview "Onay 0/5 onaylı" (sahte PASS gitti); Disco persona ekranda YOK.
- **Macro 5:** "GERÇEK FRAME · MOTION KAPISI"; frame yükle → APPROVE → "▶ MOTION BRIEF AÇIK"
  (frame gate gerçek piksel hash'iyle açıldı).

## E2E'de düzeltilen davranış-kaymaları (test silme YOK — davranışa uyarlandı)

- `scene-smoke.spec.ts` + `aquarium.spec.ts`: ThoughtDock (konuşan-karakter Disco katmanı, MACRO 4'te
  kaldırıldı) doğrulayan `thought-badge/toast/dock` assertion'ları, aquarium'un gerçek işine
  (chrome gizle/göster) ve sidebar navigasyonuna uyarlandı. Test sayısı düşmedi; iddia korundu.
- `smoke.spec.ts`: MACRO 4/5/6 assertion'ları eklendi (shot paneli, readiness, frame gate, pack
  düğmeleri) — mevcut çalışan akışın içine.

## Bilinen artıklar (dürüst rapor)

- **ThoughtDock/InnerVoicePanel/innerVoices.ts ölü ama silinmedi:** `thoughtQueue.test.ts` (queue
  mantığı, ~45 test) onlara bağlı; test silmek yasak. Bileşenler artık hiçbir yerden MOUNT
  edilmiyor (AppLayout'tan çıkarıldı) — build'e/ekrana etkisi yok. Silme, testlerin de birlikte
  ele alındığı ayrı bir temizlik turu ister.
- **UI'da "closeout indir" düğmesi yok:** `buildCloseout` çekirdek fonksiyonu hazır; project pack
  export zaten kanıt zincirini taşıyor. Düğme kolay eklenir, MACRO 8 dışı.
- **Gerçek frame üretimi Mami'de:** repoda gerçek üretilmiş frame yok; frame gate boyut ölçümü
  tarayıcıda `Image` ile çalışır (Node/test'te 0×0, hash yine gerçek).

## Codex audit

Plan "kod bitince tek bağımsız Codex audit" diyor. Bu, Mami'nin tetiklediği/faturalanan bir
eylemdir (bağımsız gözle kök-neden avı). Kod tamamlandı ve yukarıdaki kapılarla kanıtlandı;
audit Mami'nin kararına bırakıldı — ara audit döngüsü açılmadı (sözleşme gereği).

## Sonuç

7 macro (MACRO 1-7) teslim edildi, her biri gerçek çıktı + testle kanıtlı. Sistem Mami'nin elle
kullanacağı Manual World Studio olarak çalışıyor: regex/otomasyon yok, world fiziği ajana taşınıyor,
site prompt yazmıyor, Mami shot onaylıyor, onaylı gerçek frame olmadan motion açılmıyor, proje
taşınabilir. **implementation complete / visual validation pending** — gerçek frame Mami'nin
manuel hükmünü bekliyor.
