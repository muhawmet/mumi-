# C3 — Memory-Sync ve Güvenli Overwrite Protokolü

## --adopt Gerçekten Gerekiyor mu?
Evet, ancak **körleme bir `copy` komutu olarak DEĞİL**.
Gerekçe: Mami veya geliştirici repo'daki `docs/ai/sync/memory/*.md` belgesini düzenlediğinde, bir sonraki `memory-sync.mjs` koşumu canlı `~/.claude/` altındaki eski dosyayı repo üzerine yazıp yapılan repo değişikliğini imha etmekte veya arşive sürmektedir (`memory-sync.mjs:88`).

## Güvenli --adopt Şartları (Kazaen Ezme Koruması)
Eğer bir `--adopt` veya repo → canlı senkronizasyonu eklenecekse, şu 4 emniyet kilidi OLMADAN çalıştırılamaz:

1. **Preview & Diff Gösterimi:** `--adopt` bayrağı verildiğinde script önce canlı ve repo farklarını (line-by-line diff) terminale basmalı, sessizce dosyayı değiştirmemelidir.
2. **Açık İnsan Onayı (Interactive Prompt):** `--adopt` yalnız `--yes` veya etkileşimli onay (`Y/N`) alındığında canlı dizine kopyalama yapmalıdır.
3. **Yedekleme Koruması (Backup Before Overwrite):** Canlıdaki dosya ezilmeden önce `~/.claude/projects/<slug>/memory/backup/` altına tarih damgalı kopyası alınmalıdır.
4. **MEMORY.md İndeks Koruması:** `MEMORY.md` başlık ve indeks dosyası asla körleme ezilmemeli, birleştirilmelidir (merge).
