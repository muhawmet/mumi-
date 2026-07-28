---
name: mamilas-kaba-kurgu-hatti
description: "Kurgu kitinin beşinci parçası KABA-KURGU.xml — Premiere timeline'ı kurulu gelir; VO cümlelerine whisper'la hizalanır"
metadata: 
  node_type: memory
  type: project
  originSessionId: 22381bee-fca3-453f-a7ce-d1d385abc524
  modified: 2026-07-28T13:49:14.992Z
---

**`scripts/kaba-kurgu.mjs` → `KABA-KURGU.xml`** (2026-07-28, Mami: *"çok iyiymiş bu, direkt bitti iş"*).
EDIT-PLAN zaten tam kesim listesiydi ama Premiere'e hiç **dosya olarak** girmiyordu; Mami her
videoda 35-44 klibi elle sürüklüyordu. Artık kit **beş parça**: MOTION + EDIT-PLAN + SESLENDIRME
+ SUNO + **KABA-KURGU.xml**. İş "kurmak"tan "rötuş"a düştü.

**Hizalama tahmin değil ÖLÇÜM.** `whisper-cpp` (yerel, `~/.cache/whisper/ggml-medium.bin`, Türkçe)
VO'yu yazıya döker; her transkript cümlesi bir kareye atanır, kare kendi ilk cümlesinin gerçek
saniyesinde başlar. Kütle'de 35/35 nokta atışı. **Plan tahmini sistematik olarak uzun çıkıyor** —
Kütle 3:33→3:00, Sabit Sürat 312→275s. Ses otorite, plan değil.

**Kanlı canlı dört tuzak** (hepsi aynı gün yaşandı, hepsi `src/core/kabaKurgu.test.ts`'te duvar):
- **Kare piksel.** Premiere 1924×1076 görünce PAR'ı *D1/DV PAL (1.0940)* sanıp %9 gerdi — scale
  %100'de bile kenarlar siyahtı. `<pixelaspectratio>square</pixelaspectratio>` şart.
- **Boyut beyan etme.** `<file>` içine width/height yazınca Premiere medyayı o ölçüye zorluyor.
  Yazma — gerçek dosyadan okusun. (Mami: *"sen çözünürlüğüne dokunma videoların."*)
- **Türkçe kesme işareti.** `’` tırnak sayılınca `Dünya’da` cümleyi ortadan kırpıyor; K23 kısalıp
  K22 onun cümlelerini yuttu. Tırnak listesine `‘’` GİRMEZ.
- **Tekrar eden ses klibi** aynı `file id`'yi göstermeli; yeni-boş id = tanımsız referans =
  *File Import Failure* (hata mesajı boş gelir, teşhis zor).

İlgili: [[mamilas-uzatilmis-klip-karari]] · [[mamilas-uretim-akisi]]
