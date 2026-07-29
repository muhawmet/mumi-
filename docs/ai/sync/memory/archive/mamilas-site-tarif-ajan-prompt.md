---
name: mamilas-site-tarif-ajan-prompt
description: "MAMILAS'ta site yalnız TARİF/brief üretir; motor prompt'unu AJAN yazar — site prompt yazmaz."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2745ba3b-7d30-4423-9af2-bf80a2f6dc15
---

MAMILAS'ta rol ayrımı KESİN ve DEĞİŞMEZ (Mami, 2026-07-15, büyük vurguyla):

**Site TARİF (reçete/brief) için vardır. Site motor prompt'u YAZMAZ.
Motora giden FINAL prompt'u, `.command` (runner) İÇİNDEKİ AJAN yazar.**

Akış: **site → brief/tarif → `.command` çalışır → içindeki AJAN bitmiş prompt'u yazar → motor.**
Prompt sahibi = `.command`'ın içindeki ajan. Site değil, ayrı bir "kod prompt üreteci" de değil.

**Why:** Handoff'un TASK 4 çatalı "prompt'u site mi yazsın, ajan mı" diye soruyordu. Mami
karara bağlamış: site sadece brief verir (`commandExport.ts:277`: "prompts.image bir BRIEF'tir,
bitmiş prompt DEĞİL"). Bitmiş prompt'u `.command` içindeki ajan üretir. Elimizdeki geçen kareler
bu ajan hattından çıktı.

**How to apply:** TASK 4'te "site deterministik prompt üretsin" (çatal A) yönüne GİTME — o
reddedildi. Ajan-yazımı korunur. TASK 2'nin `DeliveryPromise`/blocker'ları prompt'u ajana
YAZDIRMAZ; ajanın uyması gereken ölçülebilir SÖZLERİ ve typed FACT REQUIRED'ları verir.
Kod, ajanın yazdığı prompt'u DOĞRULAR ve kapılar — prompt'u üretmez. Bunu bir daha Mami'ye
sorma; karar verildi. Bağlantılı: [[mamilas-decision-pipeline]].
