# FAZ 2 — Beyin: Konsept Bankası Kazıma + Claude'a Yaratıcı Devir + Nöron-Sync

**Tarih:** 2026-07-05
**Sahip:** Mami (Doktor) · Orkestratör: Opus 4.8
**Durum:** TASARIM — Mami onayı sonrası `writing-plans` ile uygulama planına dönüşecek.
**Ön koşul:** FAZ 1 (arayüz/vücut) kusursuz kapandı (`@ e30c6dcb`, vitest 507/507 + e2e 15/15). Bu FAZ 1 bitmeden başlamaz — bitti.

> **Clear sonrası okuyan taze Claude için:** Bu doküman kendi kendine yeterlidir. Önce bunu, sonra eşlik eden uygulama planını (`docs/superpowers/plans/2026-07-05-*`) oku. Proje beyni: `CLAUDE.md`. Kod haritası: `src/core/{pure,brain,brain-data,commandExport,productionExport}.ts`.

---

## 1. Problem (Mami'nin kendi sözleriyle)

Mami: *"ingestten anlamasını istemiyorum, hataya sürüklüyor"* + *"anlatımını ben yazamam, sahneleri siz yaratacaksınız"* + *"o edubank çöplüğü... boşuna mı command hazırladık"*.

Bugün site, Mami'nin verdiği kaynak metne bakıp **kendi kafasına göre sahne öznesi uyduruyor** — ama bunu gerçek düşünerek değil, **önceden elle yazılmış kelime→cümle listeleriyle (bankalar)** yapıyor. "yaprak" kelimesini görüp listeden "leaf model" basıyor; "döngü başlar" görüp alakasız sosyal-bilgiler kalıbı basıyor. FAZ5 pilot bug'larının (A/B/C) **kökü buydu**: naif keyword eşleşmesi = ezberci taklit, gerçek yaratıcılık değil.

**Yanlış çözüm (reddedildi):** "bankayı refactor et / iyileştir". Mami bu fikri açıkça reddetti — banka *fazlalık ve çöp*, iyileştirilecek değil sökülecek.

## 2. Vizyon — herkesin rolü netleşiyor

MAMILAS mimarisi baştan böyle tasarlanmıştı (`CLAUDE.md`): **Doktor = Mami** (reçeteyi kurar), **Eczacı = `.command` → Claude** (işi yapar). Banka, bu doğru mimarinin **araya sıkışmış çöp bir ara-katmanıydı** — site, işi Claude'a bırakması gerekirken yarım yamalak konsept uydurup görsel prompt'a basıyordu.

| Aktör | Sorumluluk (YENİ) |
|-------|-------------------|
| **Mami (Doktor)** | Reçeteyi kurar: path/preset, world, ref(ler), palet, kaynak metin, sahne sayısı. Sahne **yazmaz**. |
| **Site (araç)** | Reçeteden **çerçeve** üretir: kaynak beat (verbatim) + world sinema dili (render_law/light/lens/kamera) + ref DNA (zengin) + palet ışık dili + engine dialect + shot pattern + negatif firewall + faz. Sahne öznesini **UYDURMAZ**. |
| **Claude (Eczacı, `.command`)** | Site'nin verdiği çerçeveye sadık kalarak her sahnenin **somut öznesini (dominant element) gerçekten düşünerek yazar**, sonra frame-aware motion'ı yazar. |

**Tek cümle:** Site "nasıl çekilecek"i (sinema dili) verir; Claude "ne gösterilecek"i (özne) yaratır; Mami "neyi anlatacağız"ı (reçete + kaynak) seçer.

## 3. Yeni akış

```
Mami reçete (world+ref+palet+kaynak)
   │
   ▼
generateBatch (site)  ──►  her sahne için ÇERÇEVE:
   • kaynak beat (exactText, VERBATIM — yorumsuz)
   • world render_law / light_law / lens / kamera / negatif firewall
   • ref DNA (VERBATIM zengin — nöron-sync) + shot pattern
   • palet ışık dili (fiziksel, ham hex değil)
   • faz (Intro/Build-up/Climax/Resolution) + engine dialect
   • [dominant element = Claude dolduracak — site UYDURMAZ]
   │
   ▼
.command / production JSON  ──►  Claude'a (Eczacı) SÖZLEŞME:
   "İşte dünya dili + ref DNA + kaynak beat + palet + kamera + negatifler.
    SEN her sahnenin dominant element'ini bu çerçeveye sadık, tek-kare somut
    sahne olarak YAZ. Sonra onaylı start frame'e bakıp frame-aware motion yaz."
   │
   ▼
Claude gerçek sahneyi yaratır → Nano Banana 2 → Magnific → Higgsfield → Kling
```

## 4. Sökülenler (tam envanter — kanıtlı)

Kaynak: keşif ajanı raporu (dosya:satır kanıtlı).

**Konsept bankaları (veri):**
- `EDU_BANK` (brain-data.ts:7, 46 tuple), `WATER_STAGES` (brain-data.ts:146, 5), `EDU_FB` (brain-data.ts:164, 8)
- `STY_BANK` (brain-data.ts:175, 51), `STY_FB` (brain-data.ts:352, 6)
- `REAL_BANKS` (brain-data.ts:361, 81/13 aile), `REAL_FB` (brain-data.ts:471, 13)
- `EDU_SOURCE_BANK` (brain.ts:340, 26), `REAL_SOURCE_BANKS` (brain.ts:429, 10/3 aile)

**Konsept fonksiyonları (motor):**
- `bankRank` (brain.ts:468), `conceptRanked` (brain.ts:550), `primeConcept` (brain.ts:597)
- `applyWorldTaboo` banka-bağımlı token-swap (brain.ts:535) — banka gidince yeniden değerlendirilir
- `realConceptFamily` (brain.ts:494) — banka aile seçimi

**KARAR — `architectureFallbackConcept` (pure.ts:845): ✅ MAMİ SEÇTİ = (A) RADİKAL.**
Bu fonksiyon banka DEĞİL ama özneyi kaynak coreNoun'dan üretiyordu. Radikal kararda o da **özne üretmeyi bırakır**: site hiçbir sahne öznesi (dominant element) uydurmaz — ne bankadan ne coreNoun'dan.

- `buildImagePrompt`'ın `Dominant element:` ve `Motion seed:` satırları artık **site tarafından somut yazılmaz**; yerlerine Claude'a **açık talimat + ham kaynak beat** gelir: *"Bu kaynak beat'i bu dünyanın diline sadık, tek-kare somut sahneye SEN çevir."*
- Site image prompt'un **sinema-dili katmanını** (world/palette/ref/kamera/negatif) tam üretir; **içerik/özne katmanını** boş bırakıp Claude'a devreder. Yani site "image brief" üretir, "bitmiş image prompt" değil.
- **Akış sonucu (Mami kabul etti):** Mami artık siteden hazır image prompt kopyalayamaz; her sahne **Claude adımından** geçer (Claude özneyi yazar → tam prompt → Nano Banana). Bu, `.command`/eczacı mimarisinin zaten var olduğu için doğal uzantısıdır.
- `architectureFallbackConcept` + `compactSourceCue`'nun özne-üretme rolü sökülür; kalırsa yalnız **kaynak beat'i temiz taşıma** yardımcı olarak kalır (özne üretmez).

## 5. Kalanlar (dokunulmaz — bunlar zaten reçeteden geliyor, kaynağı yorumlamıyor)

- World: `render_law`, `line_grammar`, `lens_grammar`, `light_law`, `palette_lock`, `negative_lock`, `motion_cadence`, `example_injection` — Creative Arsenal'in gold-standard içeriği.
- Palet ışık dili (`paletteLightPrompt` — ham hex değil fiziksel dil; Palet Translation Law).
- Engine dialects (`ENGINE_DIALECTS`, engine.ts) — Kling ≠ Seedance gramer farkı.
- `SHOT_PATTERNS` (refId-gated composition), `primeCamera`/`primeShotPattern`.
- `deriveOnScreenText` (pure.ts:573) — banka değil, kaynak-bağlı; Mami'nin 2026-07-05 "temiz plaka + VO" kuralı korunur.
- `extractTurkishKeyterm` (pure.ts:553) — on-screen text için, banka değil; kaderi AÇIK KARAR #2.

## 6. Nöron-sync — ref DNA'yı Claude'a zengin ver

**Bugünkü durum (kanıtlı):** ref'in verbatim 7-katman `dna`'sı image prompt'a **akmıyor** — sadece `dna.avoid` (firewall, verbatim) + refId-gated composition-pattern + `DNA_MAP`'ten kanned cümleler akıyor. Verbatim DNA yalnızca `buildAgentBrief` dossier'ine gidiyor (brain.ts:1002-1008, 1126-1131).

**Nöron-sync hedefi:** Claude image-özneyi yazarken ref'in **zengin verbatim DNA'sını** görmeli. Banka sökülüp özne Claude'a devredildiğinde, .command/dossier Claude'a ref DNA'yı (anchor + 7-katman) **sahne-özne yazımı için açık şekilde** sunmalı. Yani nöron-sync artık "DNA'yı image prompt'a basmak" değil, "**Claude'un özne yazarken kullanacağı zengin ref bağlamını .command sözleşmesine örmek**".

## 7. Site → Claude sözleşmesi (`.command` yeni contract)

Bugün (`commandExport.ts:195-204`, `productionExport.ts:96-117`): "image_prompt'lar onaylı — verbatim kopyala, YENİDEN YAZMA; sadece frame-aware motion yaz."

**Yeni sözleşme:** image prompt'un sinema-dili katmanı hazır gelir AMA **dominant element Claude tarafından yazılır**. Contract Claude'a şunu der:
1. Her sahne için: dünya dili + ref DNA + kaynak beat + palet + kamera + negatif firewall **hazır**.
2. Claude bu çerçeveye **sadık** kalarak dominant element'i (tek-kare somut sahne) yazar — kaynak beat'i somutlaştırır, dünyayı ihlal etmez, negatif firewall'a uyar.
3. Sonra onaylı start frame'e bakıp frame-aware motion yazar (mevcut kural korunur).
4. On-screen text yasası + IP firewall + "Mami AE bilmiyor" kısıtları aynen geçerli.

## 8. Test stratejisi (TDD — test silme YASAK)

~30+ test banka çıktısını assert ediyor (`brain.test.ts` conceptRanked/primeConcept/*_BANK blokları; `pure.test.ts`, `qa.test.ts`, `probe_coverage`, `motion_quality` hafif). Kural: **test silinmez, sayı düşmez** (CLAUDE.md).

Dönüşüm:
- Banka-çıktısı assert eden testler → **yeni çerçeve-sözleşmesini** doğrulayan testlere dönüştürülür: "generateBatch her sahne için verbatim kaynak beat + world dili + ref DNA + Claude-özne-talimatı üretiyor mu; banka izi (leaf model / balance scale) KALMADI mı".
- Yeni regresyon testleri: (a) hiçbir hardcoded banka öznesi prompt'a sızmıyor; (b) kaynak beat verbatim taşınıyor; (c) ref DNA nöron-sync akıyor; (d) .command contract "Claude dominant element yazar" içeriyor.
- `generateBatch REAL fallback` testleri (brain.test.ts:1214+) zaten `architectureFallbackConcept`'i sınıyor → B seçeneğinde büyük ölçüde ayakta kalır.

## 9. Doğrulama & "mihenk taşı" (Mami'nin istediği)

FAZ 2 "yeşil gate"le bitmez — Mami: *"final brief üretip kontrol etme, video üretiminde mihenk taşı olmuş mu ona bakma"*.
- **Gerçek çıktı denetimi** (`/mamilas-audit`): fixture değil, gerçek `generateBatch` çıktısı üretilip **gözle** okunur (yeşil gate canlı çıktıyı görmez — FAZ5 dersi).
- **Mihenk taşı sorusu:** üretilen brief + .command, gerçekten film-grade video ürettirecek kalitede mi? Bir "alıcı gözü" ajan turuyla ölçülür.

## 10. Riskler

- **EN RİSKLİ:** banka testlerinin dönüşümü (~30+ `it`) — refactor'un en iş-yoğun ve kırılgan kısmı. TDD ile tek tek.
- `applyWorldTaboo` banka subject/event'e bağlıydı — banka gidince world-taboo'nun yeni özne akışında hâlâ çalıştığı doğrulanmalı.
- Akış değişikliği (B'de bile) Mami'nin kopyala-yapıştır alışkanlığını etkileyebilir → mamilas-audit ile gerçek bundle test edilmeli.
- Bu **beyin/core** işi — Mami PC başında, TDD, adım adım; işçi alt-ajan (Sonnet 5) mimari/kök-fix YAPMAZ (CLAUDE.md).

## 11. FAZ 2 kapsamı & önerilen sıra

1. **Banka söküm (B):** conceptRanked/primeConcept/bankRank + tüm bankalar sökülür; `architectureFallbackConcept` sadeleşip "concept brief" üreticisi olur. Testler dönüştürülür. (TDD)
2. **.command sözleşmesi:** contract "Claude dominant element yazar"a güncellenir (commandExport + productionExport + agents/*.command). Frame-aware motion kuralı korunur.
3. **Nöron-sync:** ref verbatim DNA + anchor, Claude'un özne yazımı için .command/dossier'e zengin örülür.
4. **Denetim:** mamilas-audit gerçek çıktı + mihenk-taşı alıcı-gözü turu.
5. Her adım: `/mamilas-gate` yeşil + `/mamilas-checkpoint` (Termius crash-safe).

## 12. FAZ 2 sonrası — Jüri Session (ayrı, clear'dan sonra)

Mami: *"iki faz bitince bitirme projesi mantığı, çok katı bir ajan jürisine sunma — SEN sunup onlardan çıktı alacaksın."*
- FAZ 1 (vücut) + FAZ 2 (beyin) bitince, ayrı bir "jüri session"ı açılır.
- Orkestratör (ben), tamamlanmış pipeline'ın gerçek çıktısını **katı bir ajan jürisine sunar**; jüri "bu gerçekten film-grade video üretim aracı mı, mihenk taşı olmuş mu" diye değerlendirip **çıktı/karne verir**.
- Bu session'ın kendi tasarımı ayrıca yapılır; burada sadece kapsam olarak kayıtlı.

---

## Kararlar (netleşti)

1. **#1 — Özne devri: ✅ (A) RADİKAL — Mami seçti.** Site özne uydurmaz; Claude sıfırdan yazar; akış Claude adımından geçer. (§4, §7 buna göre.)
2. **#2 — `extractTurkishKeyterm`: KALIR (dar kapsam).** On-screen text ≠ sahne öznesi — o, görsel prompt'a **baked diegetik overlay** (ör. "Su Döngüsü"), banka değil, Mami'nin "temiz plaka + VO" kuralına bağlı ve çoğu sahnede zaten `null`. Radikal karar özne katmanını Claude'a verir; on-screen text ayrı, dar, kaynak-bağlı bir karardır ve sitede kalır. (Orkestratör kararı.)
3. **#3 — Sıra: nöron-sync ile .command sözleşmesi BİRLEŞTİRİLDİ.** İkisi de "Claude'a doğru bağlamı verme" işi olduğu için tek adımda yapılır. Yeni sıra: (1) banka söküm + özne-devri → (2) .command sözleşmesi + nöron-sync birlikte → (3) denetim (mamilas-audit + mihenk-taşı). (Orkestratör kararı; §11 buna göre okunur.)
