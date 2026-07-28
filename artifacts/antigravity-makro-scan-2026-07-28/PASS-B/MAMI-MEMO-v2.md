# MAMI MEMO v2 — Kanıtlı Makro Karar Paketi

**1. Ne tuttu?**
- **Üretim Omurgası (B1):** Command JSON'dan Premiere XML kurgu kitine kadar olan hat (`Kütle ve Ağırlık` örneğinde) uçtan uca eksiksiz çalışmaktadır.
- **Frame & Motion Yasası (B4):** "Kare görülmeden motion yazılmaz" kuralı pratikte tam olarak uygulanmaktadır. Motion prompt'ları 35/35 kare incelendikten ve `revize.txt` yazıldıktan sonra türetilmiştir.

**2. İlk turdaki yanlış varsayımların düzeltilmesi (Karşı-Jüri)**
- **Linter Veto İddiası Çürütüldü:** `prompt-lint.mjs` komutu hiçbir pre-commit kapısında (`gate.sh`) yer almamaktadır. Dolayısıyla linter senin kreatif kararlarını engellememektedir; bu iddiayı `REJECTED` olarak sildik.
- **Platform/CRLF İddiası Tarihseldir:** `protocolHash` CRLF sorunu 27 Temmuz'da kapatılmıştır.

**3. Bugün CANLI hatta çalışan İKİ gerçek kilit (CURRENT):**
- **Sessiz EDU Fallback:** Projeye özel isim verildiğinde (örneğin "Gece Serumu"), sistem bunu tanıyamadığı için `src/core/pure.ts:987` seviyesinde varsayılan olarak `ANIMATION_EDU`'ya düşüyor. Şaheser/reklam üretmek isterken sistem projeyi EDU zannediyor.
- **Hafıza Aynası Push Eksikliği:** `memory-sync.mjs` sadece canlı hafızadan repo'ya çekiyor; repo'da yapılan hafıza düzeltmelerini canlıya aktaracak bir `--adopt` seçeneği yok.

**4. Mami yerinde olsam ilk bunu kapatırdım:**
- `deriveProductionPath` varsayılanını `ANIMATION_EDU` yerine `UNKNOWN` yapıp, tanımlanamayan projelerde register seçimini sana sormasını/makbuza bağlamasını sağlamak.

**5. Mami kararı gerekiyor mu?**
- Tanımlanamayan proje isimlerinde varsayılan olarak `ANIMATION_EDU` seçilmesi yerine sistemin register seçimi sormasını onaylıyor musun?
