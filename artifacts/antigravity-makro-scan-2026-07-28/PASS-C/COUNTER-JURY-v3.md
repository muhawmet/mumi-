# PASS-C — Karşı-Jüri Çürütme Kararları (v3)

1. **"Motion hattı sorunsuz çalışmaktadır" İddiası:**
   - **Jüri Kararı:** `WEAKEN` → `UNPROVEN`'a çekildi.
   - **Gerekçe:** Diskte `.txt` prompt dosyalarının bulunması görsel klip kalitesinin kanıtı olamaz. Klip izlenmeden veya `motion-qc` çalıştırılmadan bu iddia kabul edilemez.

2. **"Frame Filename Uyuşmazlığı Bir Sistem Bug'ıdır" İddiası:**
   - **Jüri Kararı:** `REJECTED` / `OUT OF SCOPE`.
   - **Gerekçe:** Mami'nin klasördeki kare isimleri kendi yönetimindedir; kod hatası olarak tanımlanamaz.

3. **"Sessiz EDU Sınıflaması Bir Sistem Hatasıdır":**
   - **Jüri Kararı:** `ACCEPT` (`CURRENT`).
   - **Gerekçe:** `src/core/pure.ts:987` doğrudan kod kanıtına dayanır. Proje adı belirsiz olduğunda Mami'ye sormadan EDU varsayılanı atamak mimari bir boşluktur.

4. **"Memory-Sync --adopt Komutu Doğrudan Eklenebilir":**
   - **Jüri Kararı:** `WEAKEN`.
   - **Gerekçe:** Körleme bir `--adopt` canlı hafızayı ezebilir. Yalnızca `preview`, `diff`, `interactive confirmation` ve `backup` mekanizmaları varsa eklenebilir.
