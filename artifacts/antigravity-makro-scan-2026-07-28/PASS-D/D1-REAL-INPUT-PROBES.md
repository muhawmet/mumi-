# PASS-D — D1 Real Input Probes

## İncelenen İki Ayrı Yol

### 1. Normal Eğitim Yolu (Clean Studio State)
- **Başlangıç State'i:** `useStudioStore.ts:750` `projectClass: 'ANIMATION_EDU'`.
- **Girdi:** `projectTopic: "Kütle ve Ağırlık"`, `projectName: "Kütle ve Ağırlık"`.
- **Kullanıcı Hareketi:** Mami UI üzerindeki path/sınıf seçiciden `ANIMATION_EDU` seçer veya varsayılan sınıfı onaylar. `setField('projectClass', 'ANIMATION_EDU')` tetiklenir (`useStudioStore.ts:1119`).
- **Defaults:** `resolveRecipeDefaults('ANIMATION_EDU', 'pixar_3d_edu')` çağrılır ve varsayılan ref/palet yüklenir.
- **Command Export:** `buildCommandJSON()` çağrılır. `locks.productionPath = 'ANIMATION_EDU'`, `registerOf` -> `EDU`. `authorityReceipt` `REGISTER: EDU` olarak başarıyla kilitlenir.
- **Sonuç:** Hat tam kilitli, Mami seçimiyle tutarlıdır. Sıfır hata.

### 2. Belirsiz Ticari Yol ("Gece Serumu")
- **Başlangıç State'i:** `useStudioStore.ts:750` varsayılan state `ANIMATION_EDU` ile açılır.
- **Kullanıcı Hareketi:** Mami UI veya `mamilas-director` üzerinden yeni bir ticari dünya (`product_macro_tabletop` veya `automotive_stage_real`) seçer veya sınıfı `PRODUCT_HERO` / `ULTRAREAL_COMMERCIAL` yapar.
- **Kullanıcı Sınıf Değiştirdiğinde:** `setField('projectClass', 'ULTRAREAL_COMMERCIAL')` çalışır. `resolveRecipeDefaults('ULTRAREAL_COMMERCIAL', world)` anında yeni REAL ref ve paletleri yükler.
- **Kullanıcı Sınıfı Değiştirmeyi Unutursa:** `worldPathGuard.test.ts` ve `useStudioStore.ts` içindeki dünya-path uyum kapısı uyarır / dünya değiştiğinde sınıfı otomatik günceller.
- **Ad ↔ Sınıf Kapısı Kontrolü:** Eğer proje adı "Gece Serumu Reklamı" yapılıp sınıf `ANIMATION_EDU` bırakılırsa `projectNameRegisterClaim("Gece Serumu Reklamı")` `'REAL'` döndürür. `pure.ts:1080` seviyesindeki `projectNameClassMismatch` kapısı öter ve `validateCommand ok:false` vererek runner'ı bloke eder!

## Gerçek Üretim Probe Kararı (D1)
- V3'ün iddia ettiği `projectNameRegisterClaim(name) === null && projectClass undefined` durumu gerçek Studio UI akışında **HİÇBİR ZAMAN OLUŞMAZ** (`projectClass` Zustand state'inde asla `undefined` değildir).
- "Gece Serumu" ismi kendi başına ne reklam ne eğitim açık anahtar kelimesi taşımadığı için (`projectNameRegisterClaim` == `null`), `pure.ts:987`'deki `deriveProductionPath` yalnız saf helper fonksiyon seviyesinde güvenlik ağı olarak durmaktadır.
- Gerçek Studio UI akışında Mami seçimi olmadan EDU atanması gibi bir canlı bug **REPRODUCE EDİLEMEMİŞTİR**.
- **Karar:** C-1 bulgusu gerçek kullanıcı yolunda canlı bir bug olmadığını kanıtlamıştır. Implementasyon brief'inden çıkarılmıştır.
