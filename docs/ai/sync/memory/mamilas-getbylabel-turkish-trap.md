---
name: mamilas-getbylabel-turkish-trap
description: "e2e'de getByLabel Türkçe etiketlerde SESSİZCE tutmuyor — smartUpper 'ı'yı 'I' yapıyor; yazılıp koşturulmamış test kırık kalır"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b2550281-943e-4ee7-b587-f6783953546e
---

**`getByLabel('Sahne sayısı')` bu projede GÜVENİLMEZ.** `PanelKit.Field` etiketi `smartUpper`
ile basıyor → `Sahne sayısı` → `SAHNE SAYISI`. Türkçe `ı` büyürken `I` oluyor. Playwright
erişilebilir adı küçültünce `sahne sayisi` çıkıyor; aranan `sahne sayısı` ile **tutmuyor.**

UI alanlarını e2e'de **`data-testid`** ile ara. Kardeş alanlar zaten `aria-label` taşıyor
(`Palet`, `World`) — yeni alanda da aynı deyimi kullan.

**Why:** 2026-07-13'te `e2e/scene-count-lock.spec.ts` ağaçta commit'lenmemiş duruyordu ve
**5 testinin 4'ü kırmızıydı** — bir önceki oturum yazmış, **hiç koşturmamış.** Tek "geçen"
testi input'un label'ına değil, HINT cümlesindeki *"Sahne sayısını metin belirler"*e
tutunuyordu. Yani kapı, tuttuğunu sandığı şeyi tutmuyordu — [[mamilas-test-suite-is-hollow]]'un
e2e'deki kardeşi.

**How to apply:**
1. **Test yazdıysan KOŞTUR.** Yazılmış-koşturulmamış test, olmayan testten beterdir: yeşil
   sanılır. Commit'lenmemiş test dosyası gördüysen **önce koştur**, geçtiğini varsayma.
2. Yeni UI kapısında: `aria-label` + `data-testid` ver, `getByTestId` ile ara.
3. Düzeltmeyi **mutasyonla** doğrula — kusuru geri enjekte et, testin kırmızıya döndüğünü GÖR.
   (Bu turda yapıldı: `max={60}` + `disabled={false}` → 2 test kırmızı. Kapı olduğu kanıtlandı.)

Ayrıca: **aynı yasa iki ekranda yaşıyorsa iki ekranda da test edilir.** Sahne sayısı alanı
Dashboard + Director'da yaşıyordu; Dashboard kapatılmış, Director açık kalmıştı. Bu,
CLAUDE.md'deki *"yasanın birimi dosya değil ŞERİTTİR"* kuralının UI'daki hali.
