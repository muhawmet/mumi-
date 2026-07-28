# CLAUDE IMPLEMENTATION BRIEF — PASS B

Bu belge, Antigravity Pass B sonucunda doğrulanmış ve kanıtlanmış `CURRENT` bulgular için Claude/Codex'e devredilecek onarım talimatlarını içerir.

---

### TASK-1 — Unclassified Project Fallback: EDU Fallback'ini UNKNOWN Yapma
- **CURRENT Kanıtı:** `src/core/pure.ts:987` (`return 'ANIMATION_EDU';`). "Gece Serumu" ismi girildiğinde `deriveProductionPath` varsayılan olarak `ANIMATION_EDU` dönüyor ve `registerOf` bunu `EDU` olarak okuyor.
- **Kök Neden:** Catch-all dalının regex eşleşmesi olmadığında sessizce `ANIMATION_EDU` dönmesi.
- **Korunacak Yetenek:** `REAL`, `COMMERCIAL`, `PRODUCT`, `AUTOMOTIVE`, `STYLIZED`, `EDU` açık anahtar kelimelerinin doğru eşleşmesi.
- **Dokunulmayacak Alan:** `SURGERY_DATA.json` dünya ID tanımları ve `registerOf` regex yapısı.
- **En Küçük Mimari Operasyon:** `deriveProductionPath` fonksiyonunun fallback dönüşünü `'UNKNOWN'` yapmak. `resolveRecipeDefaults` ve `pure.ts` içinde `UNKNOWN` durumunu işleyip UI/Command export katmanında Mami'ye açık register seçimi/uyarısı bağlamak.
- **Kabul Testleri:** `npx vitest run src/core/pure.test.ts`
- **Gerçek Production Probe:** `deriveProductionPath("Gece Serumu")` çağrısının `UNKNOWN` dönmesi ve açık `REAL` projesi ("Ultra Real Commercial") için `ULTRAREAL_COMMERCIAL` dönmeye devam etmesi.
- **Mami Kararı Gerekiyor mu:** Evet (Mami kabul ettiğinde uygulanır).

---

### TASK-2 — Memory Sync: `--adopt` Argümanı (Repo → Canlı Push)
- **CURRENT Kanıtı:** `scripts/memory-sync.mjs:46-48`. Script yalnız canlı `~/.claude/` dizinini okuyp repo'ya çekiyor, repo'daki düzeltmeyi canlıya aktaracak ters yönlü bayrak yok.
- **Kök Neden:** `memory-sync.mjs` içinde `--adopt` (repo → canlı) modunun bulunmaması.
- **Korunacak Yetenek:** Canlıdan düşen dosyaların repo'dan silinmeyip `archive/`'e taşınması mantığı.
- **Dokunulmayacak Alan:** `docs/ai/sync/memory/archive/` yapısı.
- **En Küçük Mimari Operasyon:** `scripts/memory-sync.mjs` dosyasına `--adopt` seçeneği eklemek. `--adopt` verildiğinde `docs/ai/sync/memory/*.md` dosyalarını canlı `~/.claude/projects/<slug>/memory` klasörüne kopyalamak.
- **Kabul Testleri:** `node scripts/memory-sync.mjs --check`
- **Gerçek Production Probe:** `node scripts/memory-sync.mjs --adopt` komutunun sorunsuz çalışması.
- **Mami Kararı Gerekiyor mu:** Hayır (Mekanik araç opsiyonu).
