# HANDOFF — 2026-07-11 (gece 4) · Fabrika turu

**Durum:** HEAD `9af5f36` · dal `feat/3d-diorama-shell` · **vitest 1207/1207 · tsc 0 · build OK · zsh OK** · PUSH YOK.
(Tur başında 984 test → şimdi 1207. Hiç test silinmedi.)

---

## Turun ekseni — Mami'nin itirazı

> *"Site tarif üzerine kurulu, command'daki beyne ne yapacağını söylemek olmuyor mu bu haliyle? Şu saçma regexler gibi. Yok 'eczacının işine karışmıyoruz, reçeteyi güzelleştiriyoruz' diyor musun?"*

**Cevap: itiraz haklı çıktı, ölçüldü.** 90 gerçek `generateBatch` senaryosuyla `qa.ts`'in 13 check'i tarandı:

- **7'si AYNA** — site'in kendi builder'ının yazdığı string'i, yine site'in regex'iyle tarıyor. Yapısal olarak kırmızıya düşmeleri imkânsız (TRIAD: `subjectLine` daima `dominantSubject`'in aynısı · NEGATIVE BLOAT: satır en fazla 13 madde üretebiliyor, eşik 18).
- **CHECK 6/6b ÖLÜ KOD** — aradıkları `"Moving element:"` / `"Event:"` etiketleri bugünkü `buildMotionPrompt`'ta hiç basılmıyor (FAZ2 refaktörü sökmüş). `qa.test.ts` bunları **elle yazılmış fixture'larla** yeşil tutuyor, `brain.test.ts` ise aynı anda TAM TERSİNİ garanti ediyor. İki test dosyası birbirinin zıddını doğruluyor, ikisi de yeşil.
- **6'sı GERÇEK** — ve hepsinin ortak özelliği: **site'in yazmadığı girdiye bakıyorlar** (Mami'nin ham kaynağı, `directorBrief`, bozulmuş kaynak, dünya/palet verisi).

**Çıkan kural:** *bir check ancak site'in kontrol etmediği bir girdiye bakıyorsa KAPIDIR; kendi yazdığına bakıyorsa AYNADIR.*

**Doğru sınır:** site eczacıya nasıl karacağını söylemez — **eczaneden defter tutmasını ister.** Site = YASA + KAYNAK + kararlar. Ajan = zanaat. Kapı = ajanın yazdığını ve GERÇEK KAREYİ yasaya karşı yargılar; site'in kendi boilerplate'ini asla.

---

## Yapılanlar (8 commit)

| commit | ne |
|---|---|
| `c798fb1` | **Runner belirsiz paketi sessizce seçemez.** Her iki `.command` da klasörü glob'layıp İLK eşleşmeyi alıyordu. Masaüstü'nde eski export'lar birikiyor, sahne id'leri geniş (`1.png`) → yanlış paket de her dosya adına "uyuyor". Mami bugünün karelerini atarken ajan **dünkü brief'e** prompt yazabilirdi. Artık: 1 paket → sessiz · 2+ → en yeni başta, konu adıyla listeler, Mami seçer · geçersiz → durur. Gerçekten koşturularak doğrulandı. |
| `4b3dbf7` → `1da042b` | **Telif: sınır iki adımda bulundu.** Önce eser+stüdyo adı söküldü (fazla katı). Sonra veri okundu: `pixar_3d_edu`'nun `negative_lock`'u zaten *"NO any named Pixar/Disney CHARACTER · NO Pixar City · NO named LOCATION"* diyor, pozitifi ise *"skin MUST be Pixar SSS-shaded"*. Yani yasa **bilinçli ve tutarlı**: STÜDYONUN DİLİNDE ÇİZ, KADROSUNU ÇİZME. Stüdyo adı **kalır** (pipeline'a işaret eder; sökmek dünyayı jenerikleştirir, ki aynı kural onu da yasaklıyor). ESER adı **gider** — "Great-Before" o filmin MEKÂNININ adı, yani dünyanın kendi negatifinin yasakladığı şey. Pozitif, negatifin yasakladığını emrediyordu. |
| `39351bf` | **FRAME GATE.** Kare AÇMAK zaten zorunluydu; ama tek uygunluk sınavı "CONCEPT/EVENT ile çelişiyorsa işaretle"ydi — **jenerik bir 3D yanardağ bu kapıdan geçer.** Artık 8 satırlık checklist (sceneBrief · ledger · world/render · kamera+kompozisyon · palet-ışık · text · kimlik · IP), her satır GÖRÜLENLE cevaplanır ("iyi görünüyor" = FAIL). `frame_checks/<id>.md` = hüküm artefaktı; **FRAME_PASS yoksa `motion/<id>.txt` doğmaz.** `raw_frames/` ayrıldı → `images/<id>.png` artık ONAYLI Magnific upscale demek. `scaffold` insan adımlarını ADIYLA söylüyor (Nano Banana 2 → ham kare → bak → ZORUNLU upscale). |
| `39351bf` | **LEDGER — Mami'nin tasarımı, doğru yerinde.** Site Ledger'ı YAZMAZ; ajanın yazmasını ŞART KOŞAR. `ledger/<id>.md`: proves · mustShow · noMetaphorFor · carryOver. Beat "Peki ya içi?" der; o kareden NE İSTEDİĞİ ajanın **kararıdır** — beat'te yoktur. Beyan edilmemiş yorumu kimse kıramaz. Bu satırlar `frame_checks`'in sahneye-özel satırları olur. (Not: çürüttüğümüz şey **site'in beat'ten Ledger TÜRETMESİYDİ** — o gerçekten boş iş. Mami'nin istediği bu değildi.) |
| `011bd50` | **ZİNCİR TESTİ** — reçete → final brief → command, 10 preset uçtan uca, gerçek çıktı. Bu projenin gönderdiği her kusur bir DİKİŞTE yaşadı, birimde değil. Gerçek bug yakaladı: paletin GÖRÜNEN ADI pozitif prompt'a ham basılıyordu; iki palet ("Desaturated **Cinematic**", "Golden Dust **Epic**") tam da bu projenin yasakladığı sıfatları taşıyor → prompt'un pozitifi motora "cinematic ol" emri veriyordu, negatifi 200 kelime sonra o kelimeyi yasaklarken. |
| `d0a7ebd` | **Kendi açtığım kablo kopukluğu** (bağımsız denetçi yakaladı): "önce ledger" kuralını sadece TR şeridine yazmışım; Codex/Antigravity şeritleri `ledger/`'ı hiç açmıyordu ama FRAME GATE onlarda da "LEDGER satırını cevapla" diyordu. **Girdisi hiç üretilmeyen bir checklist satırı.** Şerit-başına kilit testi kondu. |
| `450c2ac` | **Temiz plaka artık harf tarifi taşımıyor.** 42/42 prompt hem "clean plate, no added signage" diyordu, hem negatifinde POZİTİF tarif veriyordu: *"Turkish label only — blocky dimensional letterform, raised and legible"*. Satırın sadece kuyruğu yasak; başı bir TARİF. Motor, nasıl Türkçe yazı çizeceği söylenince Türkçe yazı çizdi — yazısı olmayan sahnede ambalaja uydurma etiket. |
| `9af5f36` | **Castless yasağı KİMLİĞE indi.** 42/42 prompt "No human subject ... never to a person" diyordu. Ama kaynak insan davranışı öğretiyor: *"pencere önünde durmak"*, *"masayı temizlemek, dosyayı açmak"*. İnsan yasaklanınca motor boş pencere ve kendi kendine açılan dosya üretiyor — **davranışın kendisi değil, metaforu.** Boş cast'in gerçek riski BEDEN değil KİMLİK. Artık: yüz/kimlik icadı yasak · kaynak insan eylemi istiyorsa ANONİM bedenle gösterilir (arkadan, omuzdan kesik, el-önkol) · beat kimseyi istemiyorsa kare insansız kalır. |

---

## SIRADAKİ İŞ

1. **AÇIK — ölü QA check'leri (CHECK 6/6b).** Ölü olduğu kanıtlı, ama **fix'i ölçüme bağlı**: motion monotonluğu 12+ sahnelik uzun metinde gerçek mi? Codex'in raporu (`CODEX-UZUNMETIN-2026-07-11.md` bulgu #3) "PV ışık fix'i 14 beat'te çeşitlenmiyor, her world tam üç konfigürasyonu döngüyle tekrar ediyor" diyor. **Önce ölç, sonra kablola** — CLAUDE.md uyarıyor: "kamera havuzu sağlıklı, uydurma fix yapma."
2. **AÇIK — Codex bulgu #2:** world × palette uzlaştırması üç eşleşmenin üçünde de aynı piksele iki ışık emri bırakıyor (dünya "ambient shadow warm-dark" derken palet "shadows deep cool blue"). R9c ailesinin devamı.
3. **AÇIK — Codex bulgu #4:** ukiyo-e promptlarına STY havuzundan "cel/cinema/DOF" dili sızıyor.
4. **AÇIK — Codex bulgu #7:** runner "Higgsfield zorunlu" derken aynı project.json frame-gated reasoning'i alternatif kabul ediyor.
5. **`scripts/brain-workbench.ts` kopuk kablo:** `sourceReport: null` sabitiyle çağırıyor → Mami'nin günlük denetim aracında Encyclopedia/Volition **hep sahte kırmızı**, gerçek sinyal kayboluyor.
6. **Fable merge kararı** — aşağıda.

---

## FABLE (görsel kulvar) — merge bekliyor

**1. tur bitti:** worktree `agent-ae26245ade1e20342`, dal `worktree-agent-ae26245ade1e20342`, **7 commit**, gate yeşil (vitest 995/995 kendi dalında), yeni e2e kırığı yok. Öz-puan **~9/10**.
- CSS-gradient plakalar emekli → `plateArt.ts` painterly boyama (10 preset benzersiz imza)
- Sabit bakışta yaşayan sahne (kamera nefesi + gerçek parallax + süzülen pus)
- "sekiz yol" bayat başlığı → arketip sayısı veriden (10 preset)
- Reçete dünya listesi (39 world) painterly plakaya geçti + repaint-fırtınası fix'i

**AÇIK KARAR:** `src/scene/SeaSurface.tsx` (GLSL dalga denizi) worktree'de **commit'siz** duruyor. Dashboard pozunda güzel, ama world-adaptif matriste **sert yatay bant regresyonu** var (noir/ghibli'de bariz). Fable ekran-kanıtı geçmediği için commit etmemiş, geri de almamış. **Mami bakmalı.**

**2. tur çalışıyor:** yeni manda — "yalnız tasarım · site high-end değil · three.js'in hakkını ver".

---

## DERSLER

- **Test yeşili ≠ gerçek.** `qa.test.ts` ölü check'leri fixture'la yeşil tutuyordu; `chain.test.ts`'in ilk hâli `onScreenText`'i olan sahneleri atlayarak **boşa geçiyordu** (vacuous pass). Her iddiayı gerçek `generateBatch` çıktısını GÖZLE okuyarak doğrula.
- **İki yanlış alarm gerçek çıktıyla elendi** — uydurma fix yazılmadı. (a) "negatif hâlâ tarifi taşıyor" sandım, yazısı OLAN sahnenin promptunu okumuşum. (b) "onScreenText beat metnini basıyor" sandım, `deriveOnScreenText` AUTO'da yalnız ≤3 kelimelik gerçek başlığı basıyor (Mami kararı 2026-07-05). **Şüpheyi doğrulamadan fix yazma.**
- **Denetçinin iddiasını da doğrula.** Denetçi "prompt kendi kendisiyle çelişiyor, negatif 'no Pixar-clean' diyor" dedi; veriye bakınca negatif **karakter/mekân** yasağıydı, çelişki yoktu. Ona dayanarak Mami'ye yanlış gerekçe verdim, düzelttim. **Anti-halüsinasyon kuralı denetçiye de işler.**
- **Kör regex, elle yazılmış zanaat nesrini SAKATLAR.** Dünya `render_law`'ından stüdyo adını regex'le kesmek `"in the -successor premium-CG pipeline"` üretiyordu — motora bozuk İngilizce, telif riskinden beter. Nesir = VERİ işi, regex işi değil. Kod tarafına **kilit testi** koy, temizliği veride yap.
- **"Yazılmış ama kablosu takılmamış" sınıfı hâlâ avlanıyor** — ve bu sefer onu BEN yaptım (ledger sadece TR şeridinde). Kilidi şerit-başına kur, çünkü drift şerit-başına.
