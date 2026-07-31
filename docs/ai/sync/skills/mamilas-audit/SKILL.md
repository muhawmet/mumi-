---
name: mamilas-audit
description: MAMILAS beyin çıktısını alıcı gözüyle denetle — gerçek generateBatch çıktısı üret, motor lehçesi/kadraj kalıbı/cerrah kontrolü yap, prompt kalitesini gözle oku. "Prompt kalitesi nasıl?" sorusunun cevabı budur.
---

# MAMILAS Audit — Gerçek Çıktı Denetimi

Fixture'la değil GERÇEK üretimle denetle (ders: cerrah blocker'ı fixture'lar yüzünden kaçmıştı).

1. `src/core/` altına geçici bir `*_audit.test.ts` yaz (işin sonunda SİL):
   - `generateBatch` ile en az 3 dünya × 2 motor (ör. `seedance_2`, `kling_3`) kombinasyonu üret.
   - Assert: motionPrompt `Engine grammar (<doğru motor>):` taşıyor; imagePrompt `Composition pattern:` taşıyor (ref seçiliyse ref-kapılı kalıplar erişilebilir).
   - `evaluateDirectorCabinet` koş → `prompt_surgeon` success:true şart (Medium bulgu = beyin kendi yasasını ihlal ediyor demektir; muafiyet ekleme, KÖKÜ düzelt).
2. En az bir sahnenin imagePrompt + motionPrompt tam metnini console.log ile dök ve GÖZLE OKU: jenerik laf var mı, hex sızmış mı, sıfat yığını var mı, tek-olay yasası duruyor mu, Türkçe label kuralı sağlam mı.
3. Kalite hükmü ver: "film-ready mi, değilse hangi cümle zayıf" — somut alıntıyla.

Sabitler: motor adı hep "Kling 3.0" (O3 = reasoning tier, ayrı motor DEĞİL). cinedna_* ref'leri kasten kompakt — dokunma. Cabinet persona metni asla export'a sızmaz (firewall testleri kanıt).
