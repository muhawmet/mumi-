# C2 — Uçtan Uca Zincir Analizi: Sessiz Sınıflama Koruması

## Zincir İncelemesi
`input (BriefInput)` → `defaults (resolveRecipeDefaults)` → `world guard (worldExam/fakeSunGate)` → `command (buildCommandJSON)` → `runner (mamilas-command.mjs)` → `receipt (authorityReceipt)`.

## Tehlike Analizi (Sessiz Sınıflama Nerede Gerçekleşiyor?)
1. **Input Katmanı:** `projectName` "Gece Serumu", `projectClass` verilmemiş.
2. **Defaults Katmanı:** `resolveRecipeDefaults` çağrılır → `deriveProductionPath` -> `'ANIMATION_EDU'` seçer.
3. **World Guard Katmanı:** World `product_macro_tabletop` (REAL bir dünya) seçilmiş olsa bile `productionPath` `'ANIMATION_EDU'` olduğundan register `'EDU'` okunur (`registerOf('ANIMATION_EDU')`). `worldExam` veya `fakeSunGate` bu çelişkiyi sessizce yutar veya EDU profiliyle sınar (`worldExam.ts:51`).
4. **Command Export Katmanı:** `buildCommandJSON` `locks.productionPath = 'ANIMATION_EDU'` yazar. `projectNameRegisterClaim("Gece Serumu")` `null` döndüğü için `PROJECT_NAME_CLASS_MISMATCH` KAPISI ÖTMEDİ! (Çünkü ad açıkça "reklam" veya "eğitim" demiyor).
5. **Runner Katmanı:** Runner JSON'daki `ANIMATION_EDU` değerini geçerli kabul edip EDU batch'i başlatır.
6. **Receipt Katmanı:** Receipt `REGISTER: EDU` olarak başarıyla mühürlenir.

## Sonuç
Sistem baştan sona **SESSİZCE HATA YAPAR** ve tüm kapılar YEŞİL basar. 

## Çözüm Şartı
Proje adı belirsiz olduğunda `deriveProductionPath`'in varsayılan olarak EDU seçmesi Engellenmelidir. `projectNameRegisterClaim` == `null` ise, açık `projectClass` belirtilmedikçe JSON export Bloke Olmalıdır (`UNCLASSIFIED_REGISTER_LOCK`).
