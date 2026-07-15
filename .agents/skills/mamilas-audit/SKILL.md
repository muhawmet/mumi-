---
name: mamilas-audit
description: MAMILAS beyin/prompt/üretim kalitesini, gerçek generateBatch çıktısını ve üretim gününde kötü kare doğuracak kusurları denetlemek istendiğinde kullan.
---

# MAMILAS Output-First Audit

Bu audit kod kokusu listesi değildir. Önce `docs/ai/PROJECT_CONTRACT.md` dosyasını ve
ilgili üretim yolunu oku.

1. Gerçek `generateBatch` yolunu çalıştır; mümkün olan en temsilî girdileri seç.
2. Üretilen image prompt, motion prompt, brief ve export paketlerini gözle incele.
3. Her bulguyu dosya/satır, gerçek çıktı örneği ve üretim etkisiyle kanıtla.
4. Yapısal testin kaçırdığı ama kötü kare, drift, telif sızıntısı veya yanlış motor
   davranışı doğuracak kusurlara öncelik ver.
5. İlk bulguları bağımsız bir karşı-okuma ile çürütmeye çalış; kanıtsızları çıkar.
6. Kullanıcı yalnızca audit istediyse kod değiştirme. Düzeltme istediyse en küçük kök
   neden yamasını uygula ve gerçek çıktıyı yeniden üret.

Fixture tek başına yeterli kanıt değildir. Test geçmesi görsel/üretim PASS anlamına gelmez.
