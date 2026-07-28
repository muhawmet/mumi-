# PASS-D — D2 Memory Authority Probe

## Mevcut Durum İncelemesi
- `node scripts/memory-sync.mjs --check` çalıştırıldığında çıktı: `✅ hafıza aynası güncel.`
- Workspace üzerinde canlı `~/.claude/` hafızası ile `docs/ai/sync/memory/` kopyaları %100 senkronizedir.
- Mami tarafından "Repo'da bir hafıza dosyasını değiştirdim, bunu canlıya aktaramıyorum" şeklinde bildirilen somut bir kayıp veya canlı hata mevcut değildir.

## Statü Güncellemesi
- `memory-sync --adopt` fikri canlı hatta yaşanan bir `CURRENT` bug değildir.
- Bu talep, ileride gerekebilecek bir `CAPABILITY_CANDIDATE` (Gelecek Yetenek Adayı) niteliğindedir.
- Canlıda kırık bir davranış olmadığı için Claude/Codex için acil kod yazma backlog'una sokulamaz.

## Gelecekteki Güvenli Tasarım Sözleşmesi (Gerektiğinde Kullanılmak Üzere)
- Mami ileride repo üzerinden hafıza aktarmak isterse, eklenecek `--adopt` mekanizması:
  1. Varsayılan olarak yalnızca **dry-run** ve **line-by-line diff** gösterir.
  2. Yalnızca açık `--adopt --yes` parametreleri birlikte verildiğinde canlıya yazar.
  3. Canlıdaki dosyayı ezmeden önce `~/.claude/projects/<slug>/memory/backup/` altına zaman damgalı kopyalar.
  4. `MEMORY.md` başlık belgesini otomatik birleştirmez (merge etmez); çakışma varsa işlemi durdurup Mami'ye diff basar.

## Karar
B6 maddesi `CURRENT bug` statüsünden `CAPABILITY_CANDIDATE` statüsüne geçirilmiş ve implementasyon brief'inden çıkarılmıştır.
