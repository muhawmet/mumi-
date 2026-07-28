# PASS-D — Karşı-Jüri Kararları (v4)

## 1. C-1 Bulgusu ("Gece Serumu" Belirsiz İsim EDU Fallback'i)
- **İlk İddia (Pass C):** `deriveProductionPath` varsayılan olarak EDU döndüğü için Mami seveceği reklam projesini açtığında sistem kazaen EDU üretir.
- **Pass D Gerçek Probe İncelemesi:** `useStudioStore.ts:750` varsayılan state'inde `projectClass: 'ANIMATION_EDU'` olarak başlar. Mami UI veya Director üzerinden dünya/path değiştirdiğinde `setField('projectClass', value)` anında `resolveRecipeDefaults` çağırarak doğru REAL ref ve paletlerini yükler. Üstelik `projectNameRegisterClaim` "Gece Serumu Reklamı" gibi açık bir ad gördüğünde `projectNameClassMismatch` kapısı `commandRuntime.test.ts` seviyesinde uyuşmazlığı yakalayıp runner'ı bloke eder!
- **Jüri Kararı:** `REJECTED` (Canlı UI Akışında Hata Yoktur). `pure.ts:987` bir saf helper güvenlik ağı olarak kalmalıdır.

## 2. C-3 / B6 Bulgusu (`memory-sync --adopt`)
- **İlk İddia (Pass C):** `memory-sync.mjs` tek yönlüdür, repo düzenlemelerini canlıya yazmak için `--adopt` acilen koda eklenmelidir.
- **Pass D İncelemesi:** `node scripts/memory-sync.mjs --check` %100 YEŞİL'dir. Mami tarafından bildirilmiş canlı bir hafıza kaybı hatası yoktur. `--adopt` eklenmesi acil bir bug değil, gelecek yetenek adayıdır.
- **Jüri Kararı:** `CAPABILITY_CANDIDATE` (Canlı Backlog'dan çıkarılmıştır).

## 3. C-2 Bulgusu ("Motion Hattı Sorunsuz Çalışıyor")
- **Pass D İncelemesi:** Görsel klip (`.mp4`) izlenmeden metin düzeyinde motion `.txt` üretilmesi motion hattının çalıştığına kanıt sayılamaz.
- **Jüri Kararı:** `UNPROVEN` (Statüsü korunmuştur, kod müdahalesi gerektirmez).
