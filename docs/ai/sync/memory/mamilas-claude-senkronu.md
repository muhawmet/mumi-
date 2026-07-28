---
name: mamilas-claude-senkronu
description: "Claude'un aklı (~/.claude) repo dışındadır ve git onu taşımaz; claude-sync.mjs iki yönlü senkronlar, asla silmez, yön tahmin etmez."
metadata: 
  node_type: memory
  type: project
  originSessionId: fbff88be-4a01-42c5-8144-26fb9e4d6996
  modified: 2026-07-28T18:15:30.969Z
---

# Mac ↔ Windows: Claude'un aklı nasıl taşınıyor (2026-07-28'de kuruldu)

**Kök sebep:** git yalnız proje klasörünü taşır. Claude'u "Claude" yapan her şey — hafıza
dosyaları, kullanıcı skill'leri (`~/.claude/skills`), global `CLAUDE.md`/`RTK.md` — `~/.claude`
altında, repo'nun **dışında** yaşar. İki makinede iki ayrı `~/.claude` vardır. Mami bunu
kendisi fark etti: *"neden benim macimle windowsum senkron değil?"*

**Yeni yol: `node scripts/claude-sync.mjs`** (`--check` kapıda, `--dry-run` kuru koşu).
Üç yönlü karşılaştırır: canlı hash · repo hash · **taban**. Karar tablosu
`scripts/lib/sync-karar.mjs`'te saf fonksiyon (test edilebilsin diye ayrı).

🔴 **Taban MAKİNEYE özeldir: `~/.claude/.mamilas-sync-base.json` — repoya ASLA girmez.**
İlk hal onu `docs/ai/sync/manifest.json`'da tutuyordu; çelişkili denetim bunu çürüttü.
Git tabanı taşıyınca `base` "benim en son gördüğüm ortak nokta" olmaktan çıkıp "karşı
makinenin son hâli" oluyor → `git pull` sonrası base daima repoya eşit → script her
seferinde "yalnız canlı değişti" deyip **gelen taze güncellemeyi bayat kopyayla eziyor**,
üstelik "0 silindi" diye rapor ediyordu. Çatışma dalı da bu yüzden hiç ateşlemiyordu.
**Yasa: paylaşılan taban diye bir şey yoktur. Git yükü taşır, tabanı taşımaz.**
Yeni makinede ilk koşu tabansızdır: farklar çatışma olarak gelir, bir kez seçilir, sonrası akar.

**Üç değişmez:**
1. **Asla silmez.** Bir taraftan düşen dosya geri konur. Çatışmada iki sürüm de arşive alınır.
2. **Yön tahmin etmez.** İki taraf da değiştiyse `ÇATIŞMA` der, durur, exit 1 — seçim Mami'nin.
3. **mtime'a bakmaz.** git checkout mtime'ı bugüne çeker; taze dosya bayat görünürdü.

**Emekli: `memory-sync.mjs`.** Tek yönlüydü ve canlıyı tek otorite sayıyordu — ikinci makinede
repo'daki taze aklı "silinmiş" sanıp arşive sürüyordu. Aynı gün iki kez ısırdı: sabah Mac'te
21, akşam Windows'ta 9 hafıza dosyası. Dosya duruyor ama çalışmaz, çağrılırsa yönlendirip
exit 2 verir. Ledger'daki **T-1** budur, kapandı.

**Codex'in yakaladığı kusur (ikinci göz çalıştı):** ilk hal, "bir taraf sildi + diğeri
değiştirdi" durumunu sessizce *geri yükleme* sanıyordu. **Silme de bir değişikliktir** —
bilerek silinmiş bir dosyayı başka içerikle diriltip "geri kondu" demek yasayı çiğniyordu.
Artık `catismaSilme`. Ders: yön tahmin etmeme yasası, yokluğu da bir taraf saymadan tutmaz.

**Ayrıca onarıldı (aynı denetimden):** symlink'lenmiş skill taramaya hiç girmiyordu (`walk`
yalnız isDirectory/isFile'a bakıyordu) · yarım yazılmış taban her koşuyu öldürüyordu (artık
atomik yazım + bozuksa "taban yok" sayılıp güvenli tarafa düşme).

**Duvar:** `src/core/claudeSync.test.ts` — karar tablosunun tamamı, CRLF/LF eşitliği
(normalize edilmezse iki makine sonsuz it/çek döngüsüne girer), tabanın repoda
tutulmadığı ve `gate.sh`'ın bu script'i çağırdığı. Ledger'daki **T-3** ("aynayı yazan
hiçbir duvar yok") budur, kapandı.

**Ders (MAKRO):** iki bağımsız göz iki AYRI sınıf kusur buldu — Codex mantık tablosundaki
boşluğu (silme bir değişikliktir), çelişkili ajan mimari yanlışı (paylaşılan taban). İkisi de
benim yeşil testlerimden geçmişti. *Yeşil test, doğru tasarım kanıtı değildir.*

**Kapsam dışı bilerek:** `~/.claude/settings.json` taşınmaz — içinde makineye özel yol ve izin
var (notify komutu, sandbox, plugin cache), taşınırsa diğer makinede kırılır.

⚠️ **Aynı gün bulunan ikinci ortam kusuru:** `docsContract.test.ts` hook'ların exec bitini
`statSync` ile ölçüyordu. NTFS'te exec biti YOKTUR, mod daima 666 → test Windows'ta asla
yeşil olamıyordu, yani Mami'nin birincil makinesinde kapı kalıcı kırmızıydı. Artık **git
index modu** (`100755`) ölçülüyor; iki makinede de aynı okunur. Sınıf aynı: *bir araç ortama
dair varsayım yapıyorsa o varsayımı test et.*

İlgili: [[mamilas-tasima-yasasi]] · [[mamilas-insa-ledger-acik]] · [[mamilas-duyu-ve-ikinci-goz-yetkisi]]
