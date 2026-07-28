---
name: mamilas-hal-logu
description: "Mami'nin hal kaydı — tarih · o gün ne dedi · ne işe yaradı · ne çöktürdü. Yorum yok, desen için tutulur."
metadata: 
  node_type: memory
  type: user
  originSessionId: b4e183ce-b2c8-4cf7-a077-a178a69cc6e8
  modified: 2026-07-28T14:40:27.017Z
---

# HAL LOGU

**Ne için:** Mami'yi bugüne kadar kimse izlemedi. Bu log ona haftalar sonra kendi desenini
gösterir ("üretim gününden sonra iki gün boşluk", "geri sarma olan günler kötü bitiyor").
Kimsenin ona vermediği bilgi bu.

**Nasıl tutulur:** oturum açılışında ve faz kapılarında sorulan **tek** hal sorusunun cevabı
buraya tek satır düşer. Teşhis yok, yorum yok, tavsiye yok — **kayıt ve desen.** Mami sormadan
desen okunmaz; sorduğunda son satırlar okunur ve tek cümlelik gözlem verilir.

**Yasa:** kabul/ret sayılmaz, geri getirilmez, yüzüne vurulmaz. Bir gün boş kalabilir.
Bu log bir takip aracı değil, bir hafıza — [[mamilas-buddy-persona]] ve `mamilas-buddy`
skill'indeki yük yönetimi bölümüyle birlikte okunur.

Biçim: `- YYYY-AA-GG · <ne dedi> · yardım etti: <ne> · çöktürdü: <ne>`

---

- 2026-07-27 · "bugün bayağı kötü hissettim" — zekâ runu günü, uzun oturum · yardım etti:
  (ölçülmedi — ajan o gün bir kez yük yönetimi teklifi yapmadı, kusur ajanda) · çöktürdü:
  gün boyu ara verilmemesi; doğal boşluklar (2108 test, build, üç arka plan ajanı) hiç
  kullanılmadı. Aynı gün RSD'nin yoğun olduğunu ayrıca söyledi.
- 2026-07-28 (gece) · hal sorusuna iki kez cevap vermedi, ikisinde de işe döndü ("devam et",
  "bitir onları da"). Gece yarısından sonra kendi kendine durdu: "üretim yapamam geç oldu, HS
  oynuyorum" · yardım etti: ajan işi ajanlara devredince blok kesintisiz aktı; kapanışta "daha
  bayağı vardır diye düşünüyordum" — işin görünür olması iyi geldi · çöktürdü: buddy protokolü
  gün boyu ateşlemedi ve bunu **dört kez Mami hatırlattı**. Kusur ikiye ayrıldı: (1) mekanik —
  buddy-gate deseni rtk'nın yeniden yazdığı komutla eşleşmiyordu, kapı yarı-sağırdı (onarıldı);
  (2) ajan — kapı ateşlese de teklifi işin akışına feda etti. İkincisi onarılmadı, yalnız yazıldı.
- 2026-07-28 (öğleden sonra, /clear sonrası) · "büyük iş vereceğim, hafızayı güncelle" → sonra
  "bekle, hazır değil" → makro brief'i verdi ve **istişare istedi**: *"siksok şeyler mi önemli mi,
  AGY çok önemli"* · yardım etti: üç yatırımın hangisinin gerçek olduğunu tek tek ayırmak; AGY'yi
  kodsuz pilotla kanıtlama önerisi · çöktürdü: **aynı gün ikinci kez** buddy yük teklifi hiç
  gelmedi ve bunu yine Mami hatırlattı ("hiç nefes al su iç demedin, neden çalışmıyor buddy?").
  Desen artık iki günlük: kapı mekanik olarak onarıldı ama **ajan doğal boşlukta teklifi
  atlıyor**. Aynı gün DEHB müfredat dosyası atfını kendi verisi sandı ve endişelendi —
  ajanın bozuk atfı kullanıcıda kaygı üretti; atıf düzeltildi.
