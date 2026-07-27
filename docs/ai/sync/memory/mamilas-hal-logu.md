---
name: mamilas-hal-logu
description: "Mami'nin hal kaydı — tarih · o gün ne dedi · ne işe yaradı · ne çöktürdü. Yorum yok, desen için tutulur."
metadata: 
  node_type: memory
  type: user
  originSessionId: b4e183ce-b2c8-4cf7-a077-a178a69cc6e8
  modified: 2026-07-27T18:32:56.430Z
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
