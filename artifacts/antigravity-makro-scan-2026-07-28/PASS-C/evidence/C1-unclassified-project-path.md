# C1 — Belirsiz Proje Sınıfında Seçim ve Akış Öncesi Önleme

## İncelenen Gerçek Yol
`src/core/pure.ts:983-1006` (`deriveProductionPath` & `resolveRecipeDefaults`).

## İnceleme ve Kanıt
1. **Mevcut Durum:** Mami "Gece Serumu" veya "Cilt Bakım Şişesi" gibi özel bir isimle proje açtığında `projectNameRegisterClaim` metinden bir kural çıkaramaz (`null` döner).
2. **Sessiz Adım:** `deriveProductionPath` hiçbir anahtar kelime bulamayınca line 987'de `return 'ANIMATION_EDU'` çalışır.
3. **Eksik Halk: Seçim Ne Zaman Yapılmalı?**
   - `resolveRecipeDefaults` fonksiyonu `pathId`'yi bulmak için `deriveProductionPath` çağırır.
   - Buradaki `defaultRef` (`path?.defaultRef`) ve `defaultPalette` (`path?.defaultPalette`) seçimleri `pathId` oluştuktan SONRA belirlenir.
   - Bu nedenle Mami'den seçim (Register: REAL | EDU | STY) `resolveRecipeDefaults` ve `buildCommandJSON` çağrılmadan ÖNCE, girdi (`BriefInput` / UI / Director Session) seviyesinde istenmelidir.

## Tasarlanan Güvenli Yön
- Proje sınıfı belirleme adımı `deriveProductionPath` içindeki `return 'ANIMATION_EDU'`'ya kalmamalıdır.
- İsim belirsizse (`projectNameRegisterClaim` == `null` ve `projectClass` belirtilmemişse), sistem `projectClass` varsayılanı atamadan önce `REGISTER_REQUIRED` bayrağı üretmeli ve Mami'ye `mamilas-director` veya UI üzerinden sınıf sordurtmalıdır.
