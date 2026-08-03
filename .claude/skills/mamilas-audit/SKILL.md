---
name: mamilas-audit
description: "KOD FAZI SKILL'İ — src/core/ değiştirildikten sonra beyin çıktısında regresyon var mı diye bakar: gerçek generateBatch çıktısı üretilir, motor lehçesi/kadraj kalıbı/cerrah kontrolü yapılır. ⚠ İCRAAT fazında çağrılmaz ve TESLİM EDİLEN PROMPT KALİTESİNİN ÖLÇÜSÜ DEĞİLDİR — CLAUDE.md'de yazılı: generateBatch çıktısı kanıt değildir, o metin motora gitmiyor (%1-3 örtüşme). Teslim edilen prompt'un kalitesi gerçek .txt dosyaları gözle okunarak ve mamilas-denetim ile ölçülür."
---

# MAMILAS Audit — Gerçek Çıktı Denetimi

Fixture'la değil GERÇEK üretimle denetle (ders: cerrah blocker'ı fixture'lar yüzünden kaçmıştı).
**Bu bir kod kokusu listesi DEĞİLDİR** — kıstas üretim gününde doğacak karedir.

0. Önce `docs/ai/PROJECT_CONTRACT.md` dosyasını ve denetlenecek üretim yolunu oku.
1. `src/core/` altına geçici bir `*_audit.test.ts` yaz (işin sonunda SİL):
   - `generateBatch` ile en az 3 dünya × 2 motor (ör. `seedance_2`, `kling_3`) kombinasyonu üret;
     girdiler mümkün olan en temsilî olsun.
   - Assert: motionPrompt `Engine grammar (<doğru motor>):` taşıyor; imagePrompt
     `Composition pattern:` taşıyor (ref seçiliyse ref-kapılı kalıplar erişilebilir).
   - `evaluateDirectorCabinet` koş → `prompt_surgeon` success:true şart (Medium bulgu = beyin
     kendi yasasını ihlal ediyor demektir; muafiyet ekleme, KÖKÜ düzelt).
2. Denetim yüzeyi yalnız imagePrompt + motionPrompt değildir — **brief ve export paketleri de**
   incelenir. En az bir sahnenin tam metnini console.log ile dök ve GÖZLE OKU: jenerik laf var mı,
   hex sızmış mı, sıfat yığını var mı, tek-olay yasası duruyor mu, Türkçe label kuralı sağlam mı.
3. Her bulguyu üç kanıtla bağla: **dosya/satır + gerçek çıktı örneği + üretim etkisi.** Üçü tam
   değilse o bir bulgu değildir.
4. Önceliği yapısal testin KAÇIRDIĞI kusura ver: kötü kare, drift, telif sızıntısı, yanlış motor
   davranışı doğuracak olanlar önce gelir.
5. İlk bulguları bağımsız bir karşı-okuma ile çürütmeye çalış; kanıtsızları listeden çıkar.
6. Kalite hükmü ver: "film-ready mi, değilse hangi cümle zayıf" — somut alıntıyla.

**Yetki sınırı.** Yalnız audit istendiyse KOD DEĞİŞTİRME. Düzeltme de istendiyse en küçük kök-neden
yamasını uygula ve gerçek çıktıyı yeniden üret.

Fixture tek başına yeterli kanıt değildir; **test geçmesi görsel/üretim PASS anlamına gelmez.**

Sabitler: motor adı hep "Kling 3.0" (O3 = reasoning tier, ayrı motor DEĞİL). cinedna_* ref'leri
kasten kompakt — dokunma. Cabinet persona metni asla export'a sızmaz (firewall testleri kanıt).
