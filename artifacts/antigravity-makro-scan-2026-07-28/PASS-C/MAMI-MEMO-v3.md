# MAMI MEMO v3 — Pass C Derinleştirilmiş Karar Paketi

**1. Pass C ile Ne Değişti?**
- **Frame Filename Konusu Kapsam Dışı:** Kare isimleri konusu tamamen senin kişisel dosya/klasör yönetim alanına bırakıldı; koda bulgu veya müdahale konusu yapılmadı.
- **Motion Hattı Statüsü:** "Motion hattı sorunsuz çalışıyor" iddiası görsel `.mp4` klibi gözle veya `motion-qc` ile doğrulanmadığı için `UNPROVEN` (Doğrulanmamış) düzeyine çekildi. Metin yazılması görsel başarı demek değildir.

**2. Doğrulanmış 2 Gerçek Kanal (CURRENT)**
- **Sessiz EDU Sınıflaması:** "Gece Serumu" veya "Cilt Bakımı" gibi proje isimlerinde, `src/core/pure.ts:987` varsayılan olarak `ANIMATION_EDU` dönüyor ve sana sormadan tüm hattı (ref, palet, kurallar) EDU'ya düşürüyor.
- **Hafıza Aynasının Repo Düzenlemesini Ezmesi:** `memory-sync.mjs` tek yönlü olduğu için repo'daki `.md` güncellemeleri canlı `~/.claude/` tarafından bir sonraki senkronize anında ezilebiliyor.

**3. Açık Karar Sorusu (Claude Brief Ön Koşulu)**
1. **Sınıflama Kararı:** Proje ismi belirsiz olduğunda, varsayılan EDU seçilmesi engellenip `input → defaults → command` aşamalarından ÖNCE sana `mamilas-director` veya UI üzerinden açık register seçimi sorulsun mu?
2. **Hafıza Koruma Kararı:** `memory-sync` tarafına repo → canlı aktarımı için `diff + preview + onay + yedekleme` emniyetli bir `--adopt` modu eklensin mi?
