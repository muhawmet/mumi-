---
name: mamilas-disclaimer-does-not-work
description: "Motor ve akıl yürüten ajan, soyut feragatnameyi değil somut şimdiki-zaman cümlesini dinler — yasa koşullu YAZILIR, sarmalanmaz"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: fefb2c9c-6fc2-4bcb-a9c1-d274cc79ea00
---

Bir prompt'a "bu bir üslup yasası, içindekiler listesi DEĞİL" diye uyarı eklemek **işe yaramaz**.

**Kanıt (2026-07-12, gerçek kare):** `buildImagePrompt` zaten
`"STYLE SYSTEM (this is HOW to render, not WHAT)"` başlığını basıyordu ve
`example_injection` zaten `"NEVER copy its subject"` diyordu.
Yine de motor korsan gemisini kareye koydu, **ve akıl yürüten ajan bile** örneğin
liman coğrafyasını kendi volkan sahnesine kopyaladı.

**Why:** Somut, olumlu, şimdiki-zaman bir cümle ("caravel hull *lives inside the frame*")
etrafına sarılan soyut bir uyarıyı ezer. Kusur cümlenin ETRAFINDA değil İÇİNDEDİR.

**How to apply:** Bir dünya yasası istenmeyen bir şey üretiyorsa **cümleyi koşullu YAZ**
("WHERE sky is visible…", "IF the scene already contains it") ya da **ismi tamamen SÖK**
(pozitiften çıkar, gerekiyorsa negatife koy — G2 bunu kanıtladı). **Sarma.**
"Prompt'a bir uyarı cümlesi ekleyelim" refleksi bu projede İPTAL.

Aynı hata iki katmanda tekrar etti: `castAuthorityClause` dünyanın örnek KİŞİsini
"kadro emri değil" diye işaretliyordu — ama NESNE sınıfı kördü. İşaretleme zaten
çalışmıyordu; nesne için de çalışmayacaktı.

İlgili: [[mamilas-simulation-loop]] · [[mamilas-mami-is-in-the-loop]]
