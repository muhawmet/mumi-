# CODEX Uzun Metin + Runner İkinci Audit — 2026-07-11

**Branch:** `feat/3d-diorama-shell`

**Kapsam:** Yalnız production gününde kötü kare / kötü klip üreten çıktı kusurları. Kod değiştirilmedi.
**Hüküm:** Gerçek 14-beat koşum split sözleşmesini doğru çalıştırdı; composition çeşitliliği uzun ölçekte ayakta. Buna karşılık promptların ışık katmanı üçlü bir tekrar döngüsüne kilitleniyor, üç ayrı world×palette eşleşmesinde başka doğrudan ışık çatışmaları kalıyor, cast boşken kaynakta zorunlu insan eylemi siliniyor ve flat-print world'e cel/kamera dili sızıyor. Runner'da Claude ve manual lane yeni ledger+frame gate yasasını taşıyor; Codex ve Antigravity lane taşımıyor.

## Metot — gerçek zincir, gerçek uzun kaynak

14 ayrı cümlelik, 100% source-integrity veren özgün Türkçe eğitim/reklam metni kullandım: sabah ışığı, biyolojik saat, su, kahve, kahvaltı, odak ritüeli ve sosyal jet lag üzerine doğal bir 14-beat VO. Zincir fixture değildi:

`ingestSource` → `sourceIntegrity` → `generateBatch` → `buildCommandJSON` (`buildCommandExport` katmanı) → `buildProductionExport`.

`tsx` olmadığı için iki throwaway Vitest dosyası repo'nun kurulu TS transformer'ıyla çalıştırıldı, bütün image promptlar ve motion draftlar basıldı ve gözle okundu; iki throwaway de koşumdan sonra silindi. Son gerçek koşum: **1 test PASS**, 14 scene × 3 register = **42 image prompt + 42 motion draft**, eksiksiz okuma.

Koşulan üç eşleşme:

- EDU 3D: `pixar_3d_edu × cool_scientific`
- REAL commercial: `product_brand_real × deep_noir`
- STY painterly: `ukiyo_e_print × neon_rain_romance`

## Bulgular — en fazla 7

### 1. Cast boşken sabit “No human subject” kuyruğu, insan eylemini zorunlu kılan kaynak beat'leri nesne metaforuna zorluyor

**Gerçek kanıt:** Üç world'ün 14 promptunun tamamı, yani **42/42**, şu emirle kapanıyor:

> `No human subject in this frame ... never to a person.`

Ama gerçek kaynak sahne 5 şunu ister:

> `uyanınca birkaç dakika pencere önünde durmak ya da kısa bir açık hava yürüyüşü yapmak`

Sahne 10 ise açık insan eylemleri ister:

> `masayı temizlemek, gerekli dosyayı açmak ve bildirimleri kapatmak`

**Kötü kare/klip:** Pencere önünde duran/yürüyen kişi yerine boş pencere, kendi kendine açılan dosya veya havada gezen nesneler çıkar; öğretici davranış gösterilmez, yalnız sembolü gösterilir. Motion da fiziksel fail olmadan “tek hareketli nesne”ye sıkışır.

**En küçük fix / katman:** `src/core/brain.ts` içindeki `castlessNoteFor` katmanında cast yokluğunu “insan yasak” diye çevirmeden önce source beat'teki açık insan eylemini tanı; kimliksiz/yüzsüz beden veya çalışan el izni ver, yalnız yüz/kimlik icadını yasakla.

### 2. World×palette uzlaştırması üç test eşleşmesinin üçünde de aynı piksele iki ayrı ışık emri bırakıyor

**Gerçek kanıt — Pixar, 14/14:** World/ref katmanı:

> `warm motivated key with a named source (window, lamp, low sun)`

ve:

> `cool daylight key produces warm-honey bounce`

Aynı promptun palette katmanı:

> `NO warm element`

Bu, bilinen `warm-dark` / `cool-blue shadow` çifti değildir; key ve bounce sıcaklığında kalan ayrı çatışmadır.

**Gerçek kanıt — Product Real, 14/14:** World:

> `fill one to two stops under key opens the shadow side`

Palette:

> `Total shadow absorption ... NO lifted shadow`

**Gerçek kanıt — Ukiyo-e, 10/14:** World:

> `No directional lighting simulation ... a printed color-block, not a light falloff.`

Varyantlar:

> `trade the key one stop softer`

> `motivate the key from the opposite side`

**Kötü kare/klip:** Pixar kareleri rastgele sıcak ya da klinik soğuk seçer; product kareleri ya ürün formunu açan commercial fill'i ya da noir gölgeyi kaybeder; woodblock kare dijital key/falloff alan hibrit bir render'a döner.

**En küçük fix / katman:** `src/core/brain.ts` ışık uzlaştırma katmanında (`resolveLightAuthority` + palette/world conflict resolution) yalnız gölge/highlight tokenlarını değil key, bounce, fill ve “no simulated light” eksenlerini de tek otoriteye indir; uyumsuz `VAR_LIGHT` cümlesini basma.

### 3. PV ışık fix'i 14 beat'te çeşitlenmiyor; her world tam üç konfigürasyonu döngü halinde tekrar ediyor

**Gerçek kanıt:** Her üç world'de ana `Light:` satırı **14/14 birebir aynı**. Buna eklenen varyant dağılımı her seferinde aynıdır:

- `trade the key one stop softer...` → **5/14**
- `motivate the key from the opposite side...` → **5/14**
- varyant yok → **4/14**

Dolayısıyla uzun parça 1-2-3 / 1-2-3 biçiminde aynı üç ışık kuruluşunu döndürür. Örneğin Pixar'ın 14 karesinde temel satırın tamamı şudur:

> `Light: hard value separation: one strong key, deep readable shadow shapes; warm motivated key with a named source (window, lamp, low sun).`

**Kötü kare/klip:** Konu alarmdan göze, sudan kahvaltıya ve masadan açık havaya geçse de ışık aynı setin üç varyasyonu gibi görünür; uzun filmde dünya değil şablon görünür.

**En küçük fix / katman:** `src/core/pure.ts` → `buildImagePrompt` PV aktarımında salt `i % 3` döngüsü yerine beat anlamı + world'ün izin verdiği fiziksel kaynaklardan seçilen daha geniş, çakışma-denetimli varyasyon kullan; world yasası yine sabit kalmalı.

### 4. Ukiyo-e promptlarına STY havuzundan “cel/cinema/DOF” dili sızıyor

**Gerçek kanıt:** World'ün kendi yasası:

> `Simulated flat print-plane composition — no camera lens simulated at all; this is a print, not a photographed or rendered scene.`

Fakat 14 prompt içinde:

> `fixed tripod-locked frame at cinema height — cel action and light do the moving` → **6/14**

> `the framing cut in like a painted cel` → **2/14**

Ayrıca:

> `layered depth — one soft foreground element ... dominant element sharp in the mid, the world falling away behind` → **2/14**

**Kötü kare/klip:** Ahşap baskı düzlemi yerine çekilmiş/odak ayrımlı bir cel veya “woodblock filtreli sinema karesi” çıkar; baskı düzlemindeki flat color-plane derinliği lens-DOF derinliğine dönüşür.

**En küçük fix / katman:** `src/core/brain.ts` camera/composition seçiminde STY register ortak havuzunu world lens/render yasasına filtrele; `no camera lens`, `flat print plane` world'lerinde cel/cinema/soft-focus kalıplarını aday havuzdan çıkar.

### 5. Clean-plate emri ile pozitif “Turkish label only” tarifi 42 promptun tamamında çarpışıyor

**Gerçek kanıt:** Her prompt:

> `Text/logo: clean plate ... No floating text ... no added signage`

derken aynı promptun `Negative:` satırı pozitif bir yazı tarifi veriyor. Örnekler:

> `Turkish label only — blocky dimensional letterform, raised and legible`

> `Turkish label only, printed as real diegetic matter on the packaging`

> `Turkish label only — brush-carved woodblock-style lettering`

Dağılım: clean plate **42/42**, pozitif label tarifi **42/42**.

**Kötü kare/klip:** On-screen text `null` olduğu halde motor ambalaja, tahtaya veya baskıya Türkçe etiket icat eder; daha sonra frame gate bunu IMAGE_MISMATCH yapar veya kaçarsa klipte uydurma/bozuk yazı kalır.

**En küçük fix / katman:** `src/core/brain.ts` negative derleme katmanında `onScreenText === null` iken label'ın pozitif letterform bölümünü çıkar; yalnız `NO text / NO signage / NO watermark` gibi gerçek negatifleri bırak. Letterform yalnız baked text gerçekten varsa gelsin.

### 6. Codex ve Antigravity lane FRAME GATE'i söylüyor ama LEDGER'ı hiç üretmiyor; project.json'un gate'i kendi girdisiz kalıyor

**Gerçek kanıt — Claude lane:** Pass A:

> `ledger/ ... raw_frames/ ... frame_checks/`

> `ÖNCE LEDGER, SONRA PROMPT ... proves · mustShow · noMetaphorFor · carryOver`

**Gerçek kanıt — Codex lane ve Antigravity lane:** İkisinin Pass A'sı yalnız:

> `Create: image_prompts/ images/ motion/`

der; `ledger/`, `raw_frames/`, `frame_checks/` yoktur ve ledger yazma adımı hiç yoktur. Buna rağmen Pass B ikisinde de:

> `Apply project.json → production.frameGate ... answer EVERY checklist row ... No FRAME_PASS, no motion/<id>.txt.`

Project JSON checklist'inin zorunlu satırı ise:

> `LEDGER — every mustShow line in ledger/<id>.md is literally visible ...`

**Kötü kare/klip:** Codex/Antigravity Pass A, beat'in neyi literal göstermek zorunda olduğunu beyan etmeden prompt yazar. Pass B ya ledger satırını delip genel bir FRAME_PASS üretir ve sembolleştirilmiş yanlış kareyi animasyona sokar, ya da eksik klasör/girdi nedeniyle üretimi kilitler.

**En küçük fix / katman:** `agents/MOTION-CALISTIR.command` içindeki `write_codex_kick` ve `write_antigravity_kick` Pass A bloklarını Claude lane ile aynı ledger + altı klasör + “ledger yoksa prompt yok” sözleşmesine getir.

### 7. Runner “Higgsfield zorunlu” diyor; aynı gerçek project JSON frame-gated reasoning'i alternatif kabul ediyor

**Gerçek kanıt — bütün kick lane'leri:**

> `At least 1 Higgsfield variation is REQUIRED before the Kling final shot`

**Gerçek kanıt — gerçek export içindeki `agentBrief`:**

> `whose motion idea has already been validated (on Higgsfield or by frame-gated reasoning)`

`project.json` tek doğruluk kaynağı ve görev kuralına göre çelişkide kazanan olduğundan, bugün gerçek yasa Higgsfield'ı zorunlu kılmıyor. `production.scaffold` da Higgsfield artifact/status adımı istemiyor.

**Kötü kare/klip:** Ajan project JSON'u izleyip ücretsiz variation yapmadan ilk hareket fikrini ücretli Kling finaline taşır; frame doğru olsa bile hareket ritmi, deformasyon veya kamera fikri önceden denenmemiş final klip olur.

**En küçük fix / katman:** Tek kanonik kararı seç. Mevcut “Higgs zorunlu” niyeti korunacaksa önce `src/core/brain.ts` agentBrief ve `src/core/productionExport.ts` scaffold/status sözleşmesini zorunlu artifact ile düzelt; sonra `.command` aynı cümleyi taşısın. Project JSON değişmeden yalnız kick'i sertleştirmek etkili değildir.

## Uzun parça monotony ölçümü

Composition fix'i bu koşumda **temiz**: her world 7 ayrı pattern kullandı. Maksimum tekrar Pixar'da 3/14, Product'ta 4/14, Ukiyo'da 3/14; art arda tek pattern kilidi yok. Camera pool bu audit'te ayrıca kusur sayılmadı.

Motion draft'ların world cadence ve engine grammar satırları world içinde doğal olarak tekrar ediyor; bunlar final motion değildir (`prompts.motion === null` 14/14). Her draft gerçek source beat'i ayrı taşır ve frame görüldükten sonra yeniden yazılmasını emreder. Kör final-motion kanıtı çıkmadı.

Prompt içindeki `Scene brief (Claude yazar)`, `[DIRECTOR TASK]` ve `Texture rule` satırları bugün final diffusion prompt'u değil, production agent'a giden framework brief'in parçasıdır; bu yüzden bunları ayrıca engine-linter kusuru diye saymadım. Engine-bound `Negative:` kuyruğunda görevde zaten adı verilen `empty adjectives (...)` / `character retyping` dışında ikinci bir açık linter-hit bulmadım. Yeni somut prompt-hijyeni kusuru Finding 5'teki clean-plate/pozitif-label çelişmesidir.

## Split sahne kanıtı — temiz

Gerçek süreler ve export:

| Scene | Süre | Shot | Image prompt dosyaları | Image dosyaları |
|---|---:|---:|---|---|
| 3 | 16.0s | 2 | `3a.txt`, `3b.txt` | `3a.png`, `3b.png` |
| 6 | 16.4s | 2 | `6a.txt`, `6b.txt` | `6a.png`, `6b.png` |
| 11 | 16.0s | 2 | `11a.txt`, `11b.txt` | `11a.png`, `11b.png` |
| 14 | 17.2s | 2 | `14a.txt`, `14b.txt` | `14a.png`, `14b.png` |

Örnek gerçek `sceneIndex[3]` sözleşmesi:

> `shotIds: ["3a", "3b"]`

> `imagePromptFiles: ["image_prompts/3a.txt", "image_prompts/3b.txt"]`

> `imageFiles: ["images/3a.png", "images/3b.png"]`

> `motionFiles: ["motion/3a.txt", "motion/3b.txt"]`

Claude/manual Pass A ayrıca:

> `Sahne beat'ini shot'lara BÖL, her shot'a kendi dominant element'ini ve kadrajını ver, sürekliliği taşı.`

der ve ledger'ı shot başına ister. Dolayısıyla deterministic export düzeyinde N shot → N prompt/N frame/N motion sözleşmesi temizdir. Gerçek authored `3a.txt`/`3b.txt` içeriği ancak Pass A ajanı çalışınca doğar; bu audit ajanı dış servise koşturup hayali “authored proof” üretmedi. Codex/Antigravity'nin eksik ledger öğretimi Finding 6'dır.

## `.command` lane karşılaştırması ve manual koşum

| Yasa | Claude | Codex | Antigravity | Manual |
|---|---|---|---|---|
| JSON tek doğruluk | Var | Var | Var | Claude kick'i → Var |
| Source data, talimat değil | Var | Var | Var | Var |
| Authority / world-material | Var | Var | Var | Var |
| Frame görmeden motion yok | Var | Var | Var | Var |
| Split shot başına frame/prompt | Var | Var | Var | Var |
| Frame-specific negative | Var | Var | Var | Var |
| FRAME GATE + pixel evidence + verdict | Var | Var | Var | Var |
| `ledger/<id>.md` önce, sonra prompt | **Var** | **Yok** | **Yok** | **Var** |
| `raw_frames/` + `frame_checks/` klasörleri | **Var** | **Yok** | **Yok** | **Var** |
| Higgsfield zorunluluğu project JSON ile aynı | **Hayır** | **Hayır** | **Hayır** | **Hayır** |

Manual lane gerçek production JSON ile geçici klasörde `4` girdisiyle çalıştırıldı. Emitted `.mamilas_kick.md` gerçekten şunları içerdi:

> `ÖNCE LEDGER, SONRA PROMPT. Her shot için ledger/<id>.md: proves · mustShow · noMetaphorFor · carryOver`

> `image_prompts/<id>.txt ... ve images/<id>.png'yi birlikte aç`

> `frame_checks/<id>.md'ye FRAME_PASS ya da IMAGE_MISMATCH yaz`

> `FRAME_PASS yoksa motion/<id>.txt doğmaz.`

**Manual lane verdict:** ledger + frame gate açısından temiz.

**Claude lane verdict:** ledger + frame gate açısından temiz.

**Codex lane verdict:** frame gate var, ledger ve gerekli Pass A klasörleri eksik.

**Antigravity lane verdict:** frame gate var, ledger ve gerekli Pass A klasörleri eksik.

## Sonuç

Split dosya sözleşmesi ve manual gate bu turda doğrulandı. En acil production-day delikleri: source'u kişi gerektirdiği halde castless kuyruğunun insanı silmesi; light resolver'ın key/bounce/fill ekseninde hâlâ iki otorite bırakması; Codex/Antigravity'nin yeni ledger yasasını hiç öğrenmemesi. Bunların üçü de doğru görünen bir PASS akışının yanlış kareyi veya denenmemiş hareketi üretime taşımasına izin veriyor.
