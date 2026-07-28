# B4 — Frame, Revize ve Motion Görsel Doğrulaması

## İncelenen Gerçek Yol
`agents/COMMAND-INBOX/5. Sınıf - Kütle ve Ağırlık/revize.txt` ve `REVIZE-VE-MOTION.md`.

## Aday Bulgu — Motion Prompt'ları Yalnızca Görülmüş Start-Frame Üzerinden Yazılıyor (Yasa İhlali Yok)
- **Durum:** `CURRENT` (Diskteki Üretim Pratiki Doğrulanmıştır)
- **Beklenen / Gerçek:** MAMILAS yasası ("Kare görülmeden motion yazılmaz") pratikte uygulanmaktadır. `revize.txt` 35/35 kare incelendikten sonra oluşturulmuş; revizeler `PATCH_SAFE_FOR_MOTION` (geometri değiştirmeyen, metin/ten düzeltmesi) ile yapısal/kreatif değişiklikler olarak ayrılmıştır.
- **Kanıt Zinciri:** `revize.txt:1` ("denetim 2026-07-28, 35/35 kare görüldü"). `6.png`, `12.png`, `15.png`, `23.png`, `33.png` için `Use this referenced image, change ONLY:` kalıbı ile motion-safe patch talimatı verilmiştir.
- **Tekrar Üretim:** `agents/COMMAND-INBOX/5. Sınıf - Kütle ve Ağırlık/revize.txt` dosyasını incele.
- **Karşı-okuma ve Sonucu:** Motion dosyası (`Kütle ve Ağırlık_MOTION.txt`) ancak revize kararları kesinleştikten sonra üretilmiştir.
- **Üretim Etkisi:** Görsel süreklilik ve fizik doğruluğu korunuyor, bozuk kareden hareket türetilmesi engelleniyor.
- **Korunacak Şey:** Start-frame görülmeden motion yazmama yasası.
- **En Küçük Yön / Production Probe:** Mevcut `mamilas-denetim` akışının korunması.
