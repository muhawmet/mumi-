# FAZ 8 — KARAR 01: IQ hattı nereye kurulur

**Tarih:** 2026-07-29 · **Karar sahibi:** Opus (showrunner) · **Kaynak plan:** Codex "PHASE 8 — MAMILAS IQ RUN"
**Statü:** AÇIK — Mami vetosuna kadar yürürlükte.

## Faz sorusu

*MAMILAS'ı "daha iyi fikir seçen" sistem mi yapacağız, yoksa "yalanı basmadan önce yakalayan" sistem mi?*

## Invariantlar (bu fazda kırılmayacak)

1. Kod donuk kalır — `src/core/` bu turda değişmez. Ölçüm katmanı (`scripts/`) serbest.
2. Kare kalitesinin ve ders terfisinin son hükmü Mami'nindir; otomatik promote yok.
3. Mami'nin gerçek teslim dosyaları (prompt/revize/kare) değiştirilmez.
4. Yeni yasa dosyası, ikinci runner, ikinci prompt kanonu kurulmaz.
5. Bir ölçüm "yeşil" diyemiyorsa, ölçmediğini de söylemek zorundadır (kapsam beyanı).

## Kanıt (üç bağımsız ajan, 2026-07-29)

**K1 — Revize korpusu, n=71, 4 dosya.**
Sınıf dağılımı: yazı/rakam **%35** · kavram ışığı **%20** · rol/fiil %10 · prop-@tag %8 · fizik/temas %6 ·
ten render %4 · sembol %3 · süreklilik %3 · istenmeyen figür %3 · kalan tekil.
**Sahne fikri zayıf: 0/71.** Kompozisyon tekrarı: 0/71. Işık/lens/kadraj: 0/71.
71'in **~44'ü (kısmenlerle ~52'si)** üretimden ÖNCE prompt metnine bakılarak kesilebilirdi.

**K2 — Prompt hattı.**
Kodun ürettiği prompt ile teslim edilen kare arasındaki örtüşme **%1-3**; aktif projede **%0**
(site hiç koşulmadı). Kütle'de kod `cast=""` görüp castless dalını ateşlemiş ve
"No named or identifiable person" yazmış — teslim baştan sona `@efe`+`@anne`.
Semantik aday katmanı kodda **yok** ve bir kez bilerek **sökülmüş**: `pure.ts:1596` *"FAZ2: konsept motoru söküldü"*.
Yerine `brain.ts:2284` `[DIRECTOR TASK]` notu konmuş; o metin motora hiç gitmiyor
(command JSON'larda 246/186/312 kopya olarak duruyor, teslimde sıfır).

**K3 — Ölçüm duvarı (asıl kusur).**
`prompt-lint` yasanın 13 slotundan 8'ine bakıyor; `TEXT:`/`NEGATIVE:` yalnız **varlık** düzeyinde.
`--all` globu yalnız `*_PROMPTLAR.(txt|md)`; aktif projenin 50 tekil kare dosyası ve
`_CODEX-KALAN-START-FRAMELER.txt` (K09–K35) **hiç taranmıyor**. Register 7 projede de sabit EDU.
`handle` slotu `soft` + `needsIf` yok → `prompt-lint.mjs:167` yüzünden **asla hata üretmiyor**.

**K3-KRİTİK — linter yeteneği değil kelimeyi ölçüyor. Ölçüldü:**
Sürtünme, tarihteki **tek sıfır-revize** projesi (31/31 temiz). Linter karnesi:
`ten 0/31 · canli 0/31 · derinlik 0/31 · temas 0/31 · text 0/31`.
Gerçek metinde beşi de VAR, başka kelimeyle:

| Slot | Linterin aradığı | Sürtünme'nin yazdığı |
|---|---|---|
| canli | `three things are alive` | `Three physics beats:` (31/31) |
| temas | `rests in contact` / `contact shadow` | `their contact plane touching` · `the surfaces MUST touch` |
| derinlik | `depth in three layers` | `out-of-focus chair anchors the near plane, the world falls away behind` |
| text | `^TEXT:` satırı | `On-screen Turkish text: "TEMAS ŞART"` · `Clean plate — no on-screen text` |
| ten | `matte skin` / `never tinted green` | `subsurface-style honey-warm skin` |

Aynı 0/31'i 52 revize almış Bileşke de alıyor. **Ölçüm en iyi ile en kötüyü ayırt edemiyor.**
`prompt-lint.mjs:14` kendi sözleşmesini zaten yazmış: *"Bulamıyorsa linter yanlıştır, prompt değil."*

## KARAR

**Codex'in IQ planının merkezi reddedildi, kenarı kabul edildi.**

| Aşama | Hüküm | Gerekçe |
|---|---|---|
| IQ1 graph · IQ2 Planner/Selector · IQ3 PromptCompiler | **KURULMAYACAK** | 0/71 fikir kusuru; katman zaten bir kez sökülmüş ve devir tuttu. Kodun ürettiği string motora gitmiyor — daha akıllısı da gitmez. |
| **IQ4 pre-spend risk taraması** | **KURULACAK — tek iş bu** | ~44-52/71 revize buradan kesiliyor. Yeni sistem değil: `prompt-lint`'in onarımı + üretimden ÖNCEye alınması. |
| IQ5 zevk kanıtı | **advisory, ucuz** | `MAMI-ZEVKI.md` zaten madenlendi; yasa yapılmaz, IQ4'e sinyal olur. |
| IQ6 öğrenme halkası | **SIRADAKİ** | `APPROVED.md` **sıfır ders** taşıyor, yanında 8 hasat dosyası bekliyor. Kırık olan kod değil, terfinin Mami için bir dakikalık iş olmaması. |
| IQ7 kör tavan testi | **ERTELENDİ** | 24-40 eşleşmiş çift = gerçek kredi + 32-40 Mami saati. Ayrıca 46 dünyanın 45'i doğrulanmamış; cross-world PASS'in temeli yok. |
| IQ0 baseline · IQ8 pilot | IQ4 bitince | Baseline zaten bu receipt'tir. |

**IQ4'ün mimarisi — regex DEĞİL, ve API DEĞİL.**
*(Mami 2026-07-29, doğrudan sınır: "otomasyon api falan yok, elle yapıyoruz unutma.")*
Semantik geçişi bir script **otomatik olarak bir modele çağırmaz.** Geçişi **ajan** yapar —
bugün prompt'u zaten ajan yazıyor (K2), denetimi de ajan yapıyor (`mamilas-denetim`).
IQ4 bu yüzden iki parçalıdır: (a) deterministik script yalnız **gerçekten ölçebildiğini** ölçer
ve ölçemediğini **açıkça beyan eder**; (b) semantik hüküm ajanın tek geçişinde, üretimden önce
verilir. İkinci runner, provider çağrısı ya da otomatik generation yolu kurulmaz.

K3-KRİTİK gösteriyor ki slot eklemek kusuru büyütür:
her yeni regex yeni bir kelime tuzağıdır ve Mami'nin ölçüme güveni zaten kırık
(Üreme'de 50 karede 19 sahte alarm; 7 tuzak hitinin 7'si sahte). Doğru kat:
**prompt metnini okuyan semantik geçiş** — "bu karede temas ifade edilmiş mi?" sorusuna
kelimeyle değil anlamla cevap veren. Ucuz, çünkü girdi metin; kredi yakmıyor.
Deterministik lint ölçebildiğini (lens sayısı, @tag varlığı, STYLE kelime tavanı) ölçmeye devam eder.

**Codex'in IQ4 PASS ölçütü aynen korunur** — doğru olan oydu, yeri yanlıştı:
leave-one-project-out · kritik kusur recall ≥%70 · yanlış blok ≤%10 · kaynağı genericleştiren
otomatik rewrite yok. Kabul testi bu receipt'te sabitlenmiştir:

> **Sürtünme'nin 31 karesi sessiz geçmeli** (bugün 5 slotta 0/31 kırmızı veriyor)
> **ve Bileşke'nin 52 karesindeki gerçek kusurların ≥%70'i yakalanmalı.**
> İkisi aynı anda olmadan IQ4 PASS değildir.

**SUPERSEDED (2026-07-29, Mami):**
*"elimizdeki arşiv sadece şu anlık ne iş yaptığımın kanıtları olarak kalsın · Eşeyli-Eşeysiz Üreme
[dışındaki] geri kalan senin için kıstas değil · eşeyliyi evde ürettim, Windows'takiler ben işten
çıkarken ürettirdiklerim, yani onlarda hatalı · en iyi örnek şu an Windows'ta, o promptlar Magnific'te."*

→ **Yeni kanıt:** `COMMAND-INBOX` arşivi kalite kıstası DEĞİL, iş kaydıdır. Arşivdeki revize
sayıları kalite sinyali sayılamaz — "sıfır revize" o işin kusursuz olduğunu değil, o turda öyle
gittiğini gösterir. Sürtünme'nin 31/31'i de bu sınıfa girer.

→ **Yeni karar:** Altın standart **Eşeyli ve Eşeysiz Üreme**'dir (Mami'nin evde ürettiği en iyi iş).
Kabul testi buna bağlanır:
> **Üreme'nin 50 karesi sessiz geçmeli** (Mami'nin en iyi işi kırmızı almaz)
> **ve bilerek bozulmuş kontrol karelerindeki kusurların ≥%70'i yakalanmalı.**
> Arşiv projeleri yalnız *ikincil* örnek olarak okunur, PASS ölçütü değildir.

→ **Beklenen girdi:** Magnific'teki gerçek Üreme prompt'ları (Mami gönderecek). Repo'daki
`Eşeyli ve Eşeysiz Üreme_PROMPTLAR.md` bu metnin aynısı mı yoksa erken sürümü mü — **doğrulanmadı**.
Magnific kopyası gelmeden IQ4'ün kalibrasyonu kapanmaz.

## Ajan ve token özeti

3 ajan · her biri tek soru, ayrık kapsam, salt-okuma · ~340k subagent token.
Kanıtladıkları yetenekler: (1) revize korpusunun kusur sınıfları ölçülebilir,
(2) kod-ajan prompt devri ölçülebilir, (3) önceki taramaların açık/kapalı durumu doğrulanabilir.
Recursive spawn yok. Aynı dosya iki ajana okutulmadı.

## Açık kalan — Mami'ye

- **Day-0:** Codex planı "Day-0 PASS olmadan başlama" diyor; repoda `Day-0` geçen **tek dosya yok**.
  Bu karar Day-0'ı beklemiyor, çünkü IQ4 ölçüm katmanında ve kodu dondurma yasasını ihlal etmiyor.
  Day-0 gelirse `SUPERSEDED` satırıyla güncellenir.
- **Faz profili:** Bu iş `scripts/` içinde kaldığı sürece İCRAAT fazı bozulmuyor. `src/core/`'a
  dokunulması gerekirse faz İNŞA'ya çevrilmeden yapılmaz.

---
*Karar değişirse bu dosyaya `SUPERSEDED: <eski> → <yeni kanıt> → <yeni karar>` satırı eklenir; üstü çizilmez.*
