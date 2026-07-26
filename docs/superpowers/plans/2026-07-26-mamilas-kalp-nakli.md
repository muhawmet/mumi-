# MAMILAS — KALP NAKLİ (2026-07-26)

> **Bu dosya `/clear`'a dayanıklı tek gerçektir.** Sohbet hafızasına güvenilmez.
> Oturum açılışında sırayla: bu dosya → `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`
> → aktif kapının receipt'i. Yürütme sözleşmesi: `/mamilas-pipeline`. Çalışma biçimi: `/mamilas-buddy`.

**Mami'nin mandası (2026-07-26, kendi cümleleri):** *"Üretimi unut bi süre, sorma artık —
sadece beyni adapte edeceğiz. Bütün projeye doğru skill'lerle gerekli müdahaleyi yapın A'dan
Z'ye. Sonunda nasıl video ürettiğimi biliyorsun. JARVIS'i de onun üstüne kurarız."*

Yani: **üretim durdu.** Hedef, beynin Mami'nin üretim biçimini bilmesi — her oturumda yeniden
keşfetmemesi. Kare üretimi bu operasyonun çıktısı değil, sınavı.

---

## Neden ameliyat — üç ölçülmüş gerçek

**1. Sistem kendini hatırlamıyor.** `EXECUTION_STATE.md` 2026-07-17'de mühürlü; HEAD 07-26.
Arada **24 commit, 130 dosya, +95 011 / −5 311 satır.** Ref seçiminin çalışması, yönetmen
revizyon fazı, adaptif on-screen text, NIGHT BEAT düzeltmesi — hiçbiri durum kaydında yok.
`/clear` atan ajan dokuz gün geriden başlar ve kapanmış işi yeniden açar. Bu bir kelime kusuru
değil, **sistemin bir yeteneğinin kırık olması**: kendi durumunu taşıyamıyor.

**2. Kütüphane sınanmamış.** 46 dünyanın **45'i hiç kare görmedi.** Darboğaz kelime kusuru
değil, **doğrulama maliyeti** — bir dünyayı sınamak bugün bir video üretmek kadar pahalı.
Sınanmayan 45 dünya, ürün değil iddia.

**3. Gerçek-kare hataları koda ne kadar indi — BİLİNMİYOR.** NB2 hata kataloğunda gerçek
render'larda tekrar eden 10 hata var (aynalı yazı, "0 N"→"ON", yüzen nesne, yüzde glow, yeşil
cilt, ikiz etiket, rol kayması, tag'siz prop drift, garbled tabela, çiçek-glow). `src/core`'da
bu konularda 13 dosyada 67 iz var — yani **bir kısmı kilitli.** Hangisi gerçekten kilitli ve
testli, hangisi yalnız ajan hafızasında yaşıyor: ölçülmedi. **Varsayımla ameliyat yapılmaz;**
G1 bunu ölçer.

---

## Değişmezler — ameliyat bunlara dokunmaz

`docs/ai/PROJECT_CONTRACT.md` tam olarak geçerli. Operasyon boyunca özellikle:

- Site TARİF verir; final engine prompt'unu **ajan** yazar. Site prompt yazmaz.
- **START FRAME her şeyi taşır.** Motion yeni öğe doğurmaz.
- **On-screen text karede doğar, karede biter.** Post-prodüksiyonda yazı katmanı YOK
  (Mami AE bilmiyor, Premiere öğreniyor) → yazıyı post'a bırakan tarif kabul edilmez,
  motion yazı bölgesine dokunmaz, yazı revizyonu = kareyi yeniden üret.
- Gerçek current frame + Mami `APPROVE` olmadan motion yok. **Test yeşili görsel PASS değil.**
- API yok, otomatik generation yok, zorunlu upscale yok, ajan loop'u yok.
- Kullanıcının cümlesi sessizce scrub edilmez; eksik gerçek → `FACT_REQUIRED`.
- Kelime avlamak yasak (MAKRO): bulgu ancak sistemin bir **yeteneğini** açıklıyorsa raporlanır.

---

## Kapılar — adım yoklaması değil, sonuç kapısı

Her kapı: **çıktı + receipt + bağımsız denetim.** Kapı yeşil olmadan sonrakine geçilmez.
Kapı içinde Sol'un mimari özgürlüğü tam; iç ajan koordinasyonu serbest. Mami'ye iç tartışma
değil karar/kanıt/sonuç gösterilir. Her kapı sonunda **tek karar** Mami'ye sorulur.

### G0 — Hafıza mührü (sonuç: `/clear` dokuz günü silmiyor)

**Neden ilk:** Mami `/clear` atacak. Bu kapı kapanmadan atılan her `/clear` operasyonu
sıfırlar.

- `EXECUTION_STATE.md`'ye 07-26 mührü: 24 commit ne getirdi, hangi ledger maddesi kapandı
  (`e2dd283` M1+M2 kök-B), açık kalan ne.
- Bu dosya + kickoff metni: yeni oturum ilk üç dosyayı okuyup aynı yerden devam edebiliyor.
- **Kapı kanıtı:** temiz oturum simülasyonu — üç dosyayı okuyan biri "sıradaki tek adım"ı
  doğru söyleyebiliyor mu.

### ⛔ AÇIK ÇATAL — Mami kararı bekliyor (2026-07-26, restart öncesi soruldu)

**Mami mandası (aynı gün, sonradan geldi):** *"Eskidir, beyin güncelle, gerekirse sil baştan
yap — eski şeyler artık olmuştur, yanlış kurulmuştur. Her şeye yetkin var. Günün sonunda
konuşarak prompt yazacağız."* → **Kuzey yıldızı: konuşarak prompt yazmak.** Bir katmanın
değeri artık tek ölçütle ölçülür: bu yola hizmet ediyor mu?

**Ölçüm yapıldı (varsayım değil, importer sayımı):** `src/core` test-harici **14.294 satır**
(+ `SURGERY_DATA.json` 585 KB) üç kümeye düşüyor —

| Küme | Dosyalar | Kanıt |
|---|---|---|
| Konuşma yolunda canlı | `brain.ts` 2935 · `pure.ts` 1642 · `contract.ts` · `commandExport.ts` · `agentProtocol.ts` · `proof.ts` (IP firewall; brain+pure+commandExport çağırıyor) · `qa.ts→scanPromptSurgeon` (agentProtocol çağırıyor) | gerçek import zinciri |
| Yalnız site UI'ında | `advisor.ts` 411 · `productionPulse.ts` 100 · `qa.ts→evaluateDirectorCabinet` + `QAStep` | importerlar sadece RecipeStep / DashboardStep / RecipeRail / innerVoices |
| Hiç çağrılmıyor | `audit_full.ts` 542 — başlığında `npx tsx ile çalıştır`; ürün yolunda **sıfır importer** | grep: 0 |

**Çatal (sorulacak, cevap gelmeden silme yok):**
- **(A) Yönetmen tek yüzey** — konuşma ANA yol; site = karar + kütüphane + kanıt. Jüri
  tiyatrosu, advisor önerileri, production pulse, çağrılmayan `audit_full` sökülür (~1050
  satır). Her yasa tek yerde yaşar. *Sol'un önerisi budur* — bugünkü drift'in kaynağı yasanın
  iki yerde bakım istemesi.
- **(B) İki yüzey birinci sınıf** — hiçbir şey silinmez, konuşma yolu üstüne eklenir.
- **(C) Önce tam envanter** — 14.294 satırın tamamı ölçülür, silme kararı G1 sonunda.

**Durum:** Mami *"tekrar sorduracam, bekle, restart atmam lazım"* dedi (restart = yeni
skill/ayarların yüklenmesi). **Restart sonrası ilk iş bu çatalı yeniden sormak.** Cevap
gelmeden `src/` içinde silme/taşıma yapılmaz.

### G1 — Gerçek-kare hataları koda iniyor (sonuç: aynı hata iki kez üretilmiyor)

- NB2 kataloğunun **10 maddesi tek tek ölçülür**: her biri için (a) kodda kilit var mı,
  (b) testle bağlı mı, (c) yalnız ajan hafızasında mı. Tablo receipt'e girer.
- Yalnız hafızada olanlar koda iner — **prompt yazım kuralı olarak değil, kapı olarak.**
- Her kilit gerçek `generateBatch` çıktısıyla kanıtlanır. Fixture yardımcı kanıttır, yerine
  geçmez.
- **Kapı kanıtı:** 10/10 madde ya kilitli+testli ya da "kilitlenemez, sebebi şu" gerekçeli.

### G2 — 5-kare sınav seti (sonuç: bir dünyayı sınamak video üretmek kadar pahalı değil)

- 46 dünyanın hepsine uygulanabilen **ortak 5 kare**: dünyanın fiziğini, yazı davranışını,
  ref uyumunu, cast yasasını ve start-frame bütünlüğünü aynı anda yoklayan minimum set.
- Sınav **prompt üretir**, kare üretmez — kare Mami'nin elinde (API yok).
- **Kapı kanıtı:** iki dünya üzerinde gerçek çıktı; biri bilinen-iyi (Sürtünme referansı),
  biri hiç kare görmemiş bir dünya. Fark okunabilir olmalı.

### G3 — Kütüphane sınavı (sonuç: 45 dünya iddia değil, ölçülmüş)

- Sınav seti kütüphaneye uygulanır. **Kusur kütüphanede düzeltilir, kodda değil** — kod
  yasası genel, dünya kusuru yereldir; kodu her dünya için eğmek beyni bozar.
- Çıktı: dünya başına tek satır hüküm + düzeltilen alan. Kelime tablosu değil, yetenek hükmü.
- **Kapı kanıtı:** kaç dünya geçti / kaçı düzeltildi / kaçı `FACT_REQUIRED` ile durdu.

### G4 — JARVIS katmanı (sonuç: beyin Mami'nin üretim biçimini biliyor)

Mami'nin cümlesi: *"Sonunda nasıl video ürettiğimi biliyorsun, JARVIS'i de onun üstüne
kurarız."* Bu kapı G1-G3 bitmeden **açılmaz** — bilmediği bir şeyin üstüne JARVIS kurulamaz.
Kapsam G3 çıktısına göre yazılacak; şimdiden tasarlanmaz (kör plan yasağı).

### G5 — Final convergence

Üç receipt + üç denetim raporu birlikte okunur, kalan uygulanabilir bulgular kapatılır,
tam kapı koşar (`npx tsc --noEmit` → `npx vitest run` → `npm run build` → alan-bazlı E2E),
tek teslim raporu yazılır. Gerçek kare verdict'i yoksa dürüst durum:
**implementation complete / visual validation pending.**

---

## Denetim — Codex/GPT-5.x ikinci göz

**Bölüşüm sebebi:** aynı beynin kendi çıktısını denetlemesi zayıf denetimdir. İki model,
iki kör nokta.

- **Bende kalır:** prompt yazımı, dünya/motor lehçesi, Mami'nin zevki, kütüphane kararları.
  Bunlar taşıdığım bağlam olmadan yapılamaz.
- **Codex'e gider:** her kapı sonunda bağımsız denetim (`codex:rescue` / `/codex`), kod
  kök-neden kazıları, tsc/vitest kırıklarının teşhisi, benim yazdığım kilidin kör eleştirisi.
- **Kural:** denetçi kod yazmaz, rapor yazar. Kritik bulgu (veri kaybı, ürün sınırı ihlali,
  yeni test kırığı, güvenlik) **hemen** düzeltilir; ikincil bulgu convergence ledger'ına
  yazılır ve kapıyı sonsuz fix döngüsüne sokmaz.

---

## Yürütme biçimi — ADHD merkezde

Bunlar süs değil, operasyonun çalışma koşulu (`/mamilas-buddy` çekirdeği):

- **Çalışma belleği diskte.** Nerede kalındığı bu dosyada + receipt'te; Mami'nin akılda
  tutması beklenmez.
- **Tek karar.** Her kapı sonunda Mami'ye tek soru gider, menü değil.
- **Sonuç kapısı, adım yoklaması değil.** "Şu 5 adımı yap" yerine "şu çıktı gelene kadar
  durmuyoruz".
- **Geri sarma yasağı.** Kapı içinde karar kilitlenir; yarıda değişen karar yeni bir
  başlatmadır — en pahalı işlem.
- **Konudan konuya atlama serbest, hiçbir konu düşmez.** Mami'nin talimatı: *"Ben böyle
  konudan konuya atlayacağım, sen de hiçbirini kaçırmayacaksın; drift yok, sadece adapte ol."*
  Açık konular görünür defterde tutulur; yeni konu eskisini silmez.
- **Her kapı sonunda "bak şunu yaptık"** — en fazla 3 madde, hepsi somut çıktı.

---

## `/clear` KICKOFF — yeni oturum bunu okur

```
MAMILAS kalp nakli — devam. Üretim durdu, beyin adaptasyonu sürüyor.

Sırayla oku:
1. docs/superpowers/plans/2026-07-26-mamilas-kalp-nakli.md   (bu operasyon)
2. artifacts/decision-pipeline-implementation/EXECUTION_STATE.md  (durum + 07-26 mührü)
3. docs/ai/PROJECT_CONTRACT.md  (değişmezler)
4. Aktif kapının receipt'i: artifacts/decision-pipeline-implementation/receipts/KALP-<G>.md

Skill'ler: /mamilas-pipeline (yürütme) · /mamilas-buddy (çalışma biçimi + DEHB merkezde)
Denetim: her kapı sonunda Codex bağımsız denetçi.

Sohbet hafızasına güvenme. Çelişki varsa FACT_REQUIRED ile dur.
Aktif kapı ve sıradaki tek adım EXECUTION_STATE'in en üstünde yazılı.
```

---

## Receipt biçimi

Her kapı: `artifacts/decision-pipeline-implementation/receipts/KALP-G<N>.md` —
ne yapıldı · gerçek çıktı nerede · koşan kapılar · denetim verdict'i · açık ledger ·
**sıradaki tek adım** (tek cümle).
