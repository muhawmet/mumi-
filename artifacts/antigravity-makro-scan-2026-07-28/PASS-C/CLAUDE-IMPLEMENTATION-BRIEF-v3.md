# CLAUDE IMPLEMENTATION BRIEF — PASS C

Bu belge, Pass C derinleştirmesi sonucunda netleşen 2 adet teknik mimari görevi içerir.

---

### TASK-1 — Unclassified Register Guard & Director Dialog
- **CURRENT Kanıtı:** `src/core/pure.ts:987` (`return 'ANIMATION_EDU';`). Proje ismi belirsiz olduğunda `deriveProductionPath` varsayılan olarak EDU seçer ve `resolveRecipeDefaults` `pathId = 'ANIMATION_EDU'` olarak referans/palet doldurur.
- **Mimari Akış Şartı:** Seçim `input → defaults → world guard → command → runner → receipt` hattında sessiz sınıflama yaratmamalıdır.
- **Kök Neden:** `projectNameRegisterClaim` `null` döndüğünde ve `projectClass` belirtilmediğinde sistemin varsayılan ataması.
- **Korunacak Yetenek:** Açık reklam/eğitim anahtar kelimelerinin (`REAL`, `COMMERCIAL`, `EDU` vb.) otomatik doğru sınıflanması.
- **Dokunulmayacak Alan:** `SURGERY_DATA.json` dünya tanımları.
- **Yapılacak En Küçük Mimari Operasyon:**
  1. `deriveProductionPath` fonksiyonunda fallback dönüşünü `'UNKNOWN'` yapmak.
  2. `resolveRecipeDefaults` ve `buildCommandJSON` çağrısından ÖNCE: Proje adı belirsiz ve `projectClass` tanımsızsa, `mamilas-director` / UI katmanında Mami'ye sorma / durdurma bayrağı (`UNCLASSIFIED_REGISTER_LOCK`) üretmek.
  3. Mami register seçimi yapmadan Command Export'un sessizce EDU yazmasını engellemek.
- **Kabul Testleri:** `npx vitest run src/core/pure.test.ts` & `npx vitest run src/core/commandExport.test.ts`
- **Gerçek Production Probe:** `deriveProductionPath("Gece Serumu")` çağrısının `UNKNOWN` dönmesi ve `buildCommandJSON` aşamasında Mami seçimi olmadan EDU yazılmaması.
- **Mami Kararı Gerekiyor mu:** Evet.

---

### TASK-2 — Interactive Safe Memory-Sync (--adopt & Diff Safety)
- **CURRENT Kanıtı:** `scripts/memory-sync.mjs`. Repo'daki `.md` değişiklikleri canlı `~/.claude/` tarafından ezilmektedir.
- **Mimari Akış Şartı:** Körleme ezme YASAKTIR. Preview, Diff, Açık İnsan Onayı ve Overwrite koruması zorunludur.
- **Kök Neden:** `memory-sync.mjs` betiğinde tek yönlü ayna zorlaması.
- **Korunacak Yetenek:** Canlıdan silinen dosyaların repo `archive/` dizinine güvenli taşınması.
- **Dokunulmayacak Alan:** `docs/ai/sync/memory/archive/` yapısı.
- **Yapılacak En Küçük Mimari Operasyon:**
  1. `memory-sync.mjs` betiğine `--adopt` bayrağı eklemek.
  2. `--adopt` çalıştırıldığında:
     - Repo ve canlı hafıza arasındaki farkları terminalde `diff` olarak listelemek (Preview).
     - Kullanıcıdan açık etkileşimli onay (`Y/N`) istemek.
     - Onay verilirse canlı dosyayı ezmeden önce `backup/` altına tarihli kopyasını almak.
     - `MEMORY.md` başlık belgesini ezmek yerine birleştirmek (merge).
- **Kabul Testleri:** `node scripts/memory-sync.mjs --check`
- **Gerçek Production Probe:** `node scripts/memory-sync.mjs --adopt` komutunun diff basarak onay istemesi.
- **Mami Kararı Gerekiyor mu:** Evet.
