# B1 — Gerçek Üretim Omurgası

## İncelenen Gerçek Yol
`agents/COMMAND-INBOX/5. Sınıf - Kütle ve Ağırlık/`
Dosya Zinciri: `Kutle-ve-Agirlik_mamilas_command.json` → `Kütle ve Ağırlık_PROMPTLAR.txt` → `N.png` (Kareler) → `revize.txt` → `REVIZE-VE-MOTION.md` → `Kütle ve Ağırlık_MOTION.txt` → `5. Sınıf - Kütle ve Ağırlık — kaba kurgu.xml`.

## Aday Bulgu — Üretim Hattı Çalışıyor, İsim Eşleme Manuel Düzeltilmiş
- **Durum:** `CURRENT`
- **Beklenen / Gerçek:** Command JSON'dan Premiere XML kurgu kitine kadar tüm adımlar tamamlanmıştır. Ancak Codex'in kare numaralandırması (`K10=35.png`) ile diskteki dosya isimleri (`GERCEK-KARE-ESLEME.txt`) arasında manuel düzeltme gerekmiştir.
- **Kanıt Zinciri:** `revize.txt:5` ("⚠ Codex'in K10=35.png eşlemesi YANLIŞTI") ve `GERCEK-KARE-ESLEME.txt`.
- **Tekrar Üretim:** `agents/COMMAND-INBOX/5. Sınıf - Kütle ve Ağırlık/GERCEK-KARE-ESLEME.txt` dosyasını incele.
- **Karşı-okuma ve Sonucu:** Kurgu kiti XML (`5. Sınıf - Kütle ve Ağırlık — kaba kurgu.xml`) ve Premiere projesi tam olarak oluşmuştur. Hat kesintisizdir.
- **Üretim Etkisi:** Manuel dosya yeniden adlandırma yükü.
- **Korunacak Şey:** Premiere kurgu kiti XML export yapısı.
- **En Küçük Yön / Production Probe:** Command export esnasında `sceneIndex` -> `frameFilename` haritasının makbaza kilitlenmesi.
