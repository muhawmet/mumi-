# MAMILAS — Ne Değişti? (9-10 Temmuz 2026)

Mami için yazıldı. Amaç: körlemesine çalışmayı bitirmek. Her madde **neden** vardı, **ne** oldu,
**nasıl kanıtlandı**.

Bu dosyayı Codex'e verip doğrulatabilirsin. Her iddianın yanında commit hash'i ve
`dosya:satır` var — Codex kendisi bakıp "doğru mu" diyebilir.

---

## 0. Nasıl doğrularsın (Codex'e ver)

```
Repo: ~/Desktop/mamilas-modern   Dal: feat/3d-diorama-shell
Baz:  0336c561   →   Şu an: 8eb0404d   (9 commit)

git log --oneline 0336c561..HEAD
git diff --stat 0336c561..HEAD
npx tsc --noEmit && npx vitest run && npm run build   # 738/738 yeşil olmalı
```

Bir iddiayı tek tek kontrol etmek için:
```
git show <hash>            # o commitin tam diffi
git show <hash> --stat     # hangi dosyalara dokunmuş
```

**Prompt'un gerçek halini görmek** (fixture değil, gerçek üretim). Repo'da hazır script var:
```bash
npx tsx scripts/prompt-bak.ts castlevania_gothic
npx tsx scripts/prompt-bak.ts ukiyo_e_print        # baskı → kamera hareket etmemeli
npx tsx scripts/prompt-bak.ts cyberpunk_neon_noir  # neon → pencere/lamba key'i olmamalı

# dünya listesi:
node -e "console.log(require('./src/core/SURGERY_DATA.json').worlds.map(w=>w.id).join('\n'))"
```

Bugünkü fix'lerin sahadaki hâli, `castlevania_gothic` promptunda tek tek okunabilir:
```
Light: defer the key to the world light law above — the world governs the primary source.
Camera/vantage: low side dolly along the line the action already describes.
Letterform: gothic engraved lettering. Put it on a surface this shot already contains …
```
(eskiden sırasıyla: `warm motivated key (window, lamp, low sun)` · `35mm child-eye push across
the existing tabletop` · `Visible text overlay — bottom-center`)

---

## 1. Sistemin şekli (kim ne yapıyor)

**Doktor = sen.** Sitede reçeteyi kurarsın: dünya, ref, palet, motor, sahne sayısı, kaynak metin.

**Site (`src/core/`) = prompt iskeletini kurar.** Senin yerine *hiçbir şey uydurmaz.*
Sahnenin öznesini yazmaz, VO'yu yazmaz. Yalnızca çerçeveyi kurar:
render yasası, ışık yasası, palet fiziği, kamera, negatifler, yazı yasası.

**Eczacı = `.command`.** Site'nin JSON'unu alır, Claude'a (ya da Codex / Antigravity)
bir *kick* dosyası yazar. Ajan sahnenin **dominant element**'ini yazar, sen görseli
üretirsin, sonra ajan **kareyi görüp** motion yazar.

**Zincir:** Nano Banana 2 (görsel) → Magnific (zorunlu upscale) → Higgsfield (deneme)
→ Kling 3.0 (final take). Müzik: Suno. VO: ElevenLabs. Post-prod YOK.

### Önemli: "senaryoyu site yazmıyor" bir HATA DEĞİL
`pure.ts:1118` → `const voiceOver = beatText;`
Yani VO = senin verdiğin kaynak metnin **birebir kendisi**. Test bunu koruyor:
`scenes.map(voiceOver).join('') === rawSource` (`pure.test.ts`).
Bugün bunu "delik" sanıp düzeltmeye kalktım, geri döndüm. **Site tahmin etmemeli** —
sen zaten reçeteyi seçiyorsun. `rawSource` verirsen hat kusursuz çalışır.

---

## 2. Bugün ne düzeldi (9 commit)

Ortak nokta: bunların **hiçbiri yeni özellik değil.** Kütüphanede (SURGERY_DATA.json)
veri zaten doğruydu — 33/33 dünyanın harf grameri, ışık yasası, lens grameri yazılıydı.
**Prompt o veriyi okumuyordu.** Yapılan iş: veriyi prompt'a bağlamak.

### `6be78243` — `.command` pariteleri
- 3 yeni dünyanın (rick_morty / invincible / castlevania) motion kadansı üç kick'e + production kick'ine eklendi.
- `jjk` motion satırındaki **yasaklı "cinematic"** kelimesi ayıklandı ("cinematic dark hold" → "somber dark hold").
- **Antigravity kick'inde iki delik vardı:**
  - `Never changes: world/render · material · face/identity · logo/text/product geometry` satırı **yoktu.**
    Bu i2v'de yüzü, logoyu ve kompozisyonu koruyan satır. Claude ve Codex kick'lerinde vardı.
  - Gate'inde `ip_style rhythm missing` reddi ve "kopya moving element = kör motion kırmızı bayrağı" yoktu.
- Yani Antigravity **zayıf reçeteyle** çalışıyormuş.

### `a45b9acf` — Ekran yazısı: katman değil, karedeki nesne
**Neydi:** `buildImagePrompt` her dünyaya aynı cümleyi basıyordu:
> `Visible text overlay: '…' — bottom-center, rendered into the scene`

İki kelime her şeyi bozuyor: `overlay` motora "yapıştırılmış altyazı" dedirtiyor,
`bottom-center` 33 dünyanın görsel dilini tek bir altyazı konumuna eziyor.

**Oysa** 33/33 dünyanın `negative_lock`'unda kendi harf grameri **zaten yazılıydı**:
`gothic engraved lettering` · `brush-carved woodblock-style lettering` ·
`neon-sign lettering with a hot core and colored bloom halo` · `hand-crafted physical-prop lettering`…
Bilgi vardı, pozitif emre hiç bağlanmamıştı. Motor pozitifi dinler; malzeme notu
yasak listesinin kuyruğunda kayboluyordu.

**Ne oldu:** yazı artık **sahnedeki fiziksel bir yüzeyde** yaşıyor. Prompt dünyanın
harf gramerini `Letterform:` olarak söyler, koordinat vermez — **yüzeyi kareye bakan ajan seçer**
(kazınmış taş, açık kitap, tebeşirli tahta, gemi yelkeni, diyagramın etiket kutusu, neon tabela).
Yazı yoksa: temiz plaka emri (`no floating text, no caption, no subtitle, no watermark`).
Motion tarafında da `text overlay` → yüzeye ait nesne: *kaymaz, solmaz, yeniden dizilmez,
yalnız yüzeyiyle birlikte hareket eder.*

**`GLOBAL_BRAIN.md`'den sökülen:** `ON-SCREEN TEXT (After Effects Katmanları)` başlığı +
`Giriş: Xs | Süre: Ys | Konum: bottom-center` formatı. Sen After Effects bilmiyorsun; üstelik
o bölüm **ölüydü** — brief o başlığı hiç basmıyordu (`START FRAME TEXT (sahneye işlenmiş)` basıyor),
ajan var olmayan bir şey arıyordu.

**Yan etki yakalandı:** `qa.ts` CHECK 6b regex'i `"Start frame has"` arıyordu; cümle
`"Start frame carries"` olunca QA **sessizce körleşecekti**. Aynı commit'te güncellendi + test altına alındı.

### `5c1daefd` — Telif firewall'u (franchise adları motora gidiyordu)
Gerçek prompt'ta, pozitif bağlamda:
- `bleach_soul_world` → `render_law`'da `Seireitei-style`, `Rukongai-style`; `light_law`'da `Rukongai-alley`.
  Gerçek üretimde **Rukongai 3×, Seireitei 1×**. `negative_lock`'ta mekan yasağı **yoktu** —
  33 dünyada tek istisna (kardeşlerinde `NO Grand Line, NO Wano…` / `NO named specific wall` var).
- `solo_leveling_gate` → `render_law` + `example_injection` pozitif açılışında **"Solo Leveling"**.
  Ayrıca register etiketi `a NIGHT CITY of glass towers` — `cyberpunk_neon_noir`'ün yasaklısı (Cyberpunk 2077).
- `ukiyo_e_print` → `(e.g. The Great Wave)` örneği negatif bölücüde ikiye ayrılıyor; IP yarısı
  haklı olarak siliniyor ama geriye motora giden **`(e.g;` çöpü** ve *yasağın öldüğü* yarım cümle kalıyor.

**Firewall'un kendisi iki yerden kördü:**
1. `render_law contains a proper noun banned by its own negative_lock` testi **yalnız `render_law`'a**
   bakıyordu → `light_law`'daki `Rukongai` hiç görülmedi. Artık `line_grammar/lens_grammar/light_law/
   motion_cadence/one_liner` de denetleniyor.
2. `copyrighted work title` testinin `WORK_TITLES` listesi **elle yazılmış**, anime/manhwa tarafı boştu →
   "Solo Leveling" listede olmadığı için sessizdi.

> **Bu bir sızıntı DEĞİL:** yasaklı adların `Negative:` bandında veya `example_injection`'ın
> `AVOID:` kuyruğunda görünmesi **kasıtlı firewall guard'ıdır** — motoru uzaklaştırır.
> Kod yorumu bunu açıkça söylüyor.

### `a49fb700` — Prompt içinde iki zıt emir
Motor birini seçmek zorunda kalıyordu, ve genelde yanlışını seçiyor.

1. **whiteboard_explainer:** `render_law` diyor
   *"(4) THE HAND: a human hand and forearm holding a marker is visible … never a disembodied line."*
   Aynı prompt'un kuyruğu diyor *"No human subject in this frame … never to a person."*
   → `castlessNoteFor(world)`: el zorunlu dünyada yasak **kimlik**, el değil. Ayrıca reklam
   malzeme listesi (`metal specular, glass refraction, painted bodywork`) düz-mürekkep tahtaya basılmıyor.
   Tespit dar: `"a human hand"` / `"hand and forearm"` — 11 dünyadaki `hand-painted/hand-drawn/hand-carved`
   bileşik sıfatlarına **düşmüyor** (33'te 1 eşleşme).

2. **flat-print dünyalar:** `ukiyo_e_print.light_law` diyor
   *"No directional lighting simulation — value comes from the flat printed color fields themselves."*
   Aynı prompt'ta palet dikişi diyor *"Render these as light behaviour, **never flat fills**."*
   → `paletteReadingFor(world)`: flat dünyada kapanış *"Render these as flat printed plane values —
   each colour its own uniform field, no simulated light falloff."*
   Sınıflandırma `light_law`'dan türetiliyor (elle liste yok): **4 flat / 29 ışıklı.**
   Cel-shaded dünyalar (rick_morty, invincible, spiderverse) *yönlü key* kullandığı için ışık sınıfında
   kalır — gradyansız olmak flat-print olmak değildir.

### `6b7b106c` — Işık otoritesi (EN BÜYÜĞÜ)
**Authority hiyerarşisi:** `Path > World/Render Lock > Material > Source > … > Ref DNA > Palette`.
`resolveLightAuthority()` bunu uygulamak için vardı. Ama tespiti **dört ifadeye** bağlıydı
(`sky-primary` / `key-absent` / `rim-dominant` / `rim-lit`) ve bu ifadeleri **sadece 2 dünya** kullanıyor
(`one_piece_toei`, `jjk_mappa`).

Yani **33 dünyanın 22'sinde R4 hiç çalışmamış.** Ref seçilmese bile, her sahnede, dünyanın kendi
ışık yasasının üstüne şu jenerik satır basılıyordu:
> `Light: … warm motivated key with a named source (window, lamp, low sun)`

Gerçek üretim, `castlevania_gothic`, her sahne:
```
Light law: A single dramatic motivated source — a candle, a torch, a shaft of cold moonlight …
Light:     … warm motivated key with a named source (window, lamp, low sun).
```
Gotik katedrale pencere ve masa lambası. Aynı ezme:
`cyberpunk_neon_noir` (neon low-key, *"White light forbidden"*), `ukiyo_e_print` ve
`motion_design_flat` (*"no directional lighting simulation"* — hiç key yok),
`synthwave_retro_80s` (*"anti-physical by law"*), `solo_leveling_gate` (*"No warm fill anywhere"*).

**Yeni kural:** dünya varsayılan olarak yönetir. Jenerik kaynak dayatması **yalnız** dünyanın
kendi `light_law`'ı aynı warm window/lamp/sun ailesinden bir key kuruyorsa korunur
(pixar *"window sun, desk lamp"*; ghibli *"window shaft at golden hour"*; deakins/fincher
*"motivated practical"*). **11 KEEP / 22 STRIP.** Ref'in kontrast dili
(`hard value separation, one strong key, deep readable shadow shapes`) her hâlde kalır.
Mevcut jüri sözleşmesi ("R4 gereksiz yere ATEŞLEMEZ") ayakta.

### `4bd9f2f3` + `7820b044` + `0cefd909` — Kamera (üç ayrı kusur)

**(a) Kamera sahnenin setini dikte ediyordu.** `CAM_EDU` havuzu bir masaüstü ders diyoraması
varsayıyor ve **sahnede olduğu farzedilen eşyayı adlandırıyor**:
`across the existing tabletop` · `one shelf edge passing as parallax` ·
`inside-object vantage gliding along the active channel` · `where only the mechanism moves`.
Gotik katedralde raf yok, gemi güvertesinde masa yok → motor olmayan prop'u arar, sahneyi ona kurar.
→ `stripCameraSetAssumptions()`: optiği (odak uzunluğu, hareket, parallaks) ve "yeni nesne girmesin"
niyetini (`existing` / `already in frame`) korur, **mobilyayı atar**. `mechanism` → `dominant element`
(sistemin kendi terimi). `brain-data.ts` auto-extracted olduğu için sterilizasyon kod katmanında.

**(b) Kamera yasası `lens_grammar`'ı okumuyordu.** `lawText = render_law + motion_cadence` idi.
Oysa yasa orada yazılı:
- `ukiyo_e_print` → *"no camera lens simulated at all; **this is a print**"*
- `whiteboard_explainer` → *"Locked flat-on camera facing the board … no camera move"*

Bir **woodblock baskıya** `gentle crane-down` ve `close interior vantage gliding` emri gidiyordu.
Ayrıca `TRAVELLING_MOVE_RE` **fiil çekimlerini kaçırıyordu**: `"glide"` asla `"gliding"` ile eşleşmez
(g-l-i-d-e, g-l-i-d-i-n-g'in alt dizgisi değil); `creep`/`arcing` de aynı. **Önceden var olan sessiz bug.**
→ 5 LOCK (ukiyo_e, whiteboard, kurzgesagt, motion_design_flat, retro_anime) / 28 MOVE.
Yanlış pozitif yok: `bleach`'in *"Wide static framing"*i kompozisyondur, kamera değil.

**(c) Her dünya aynı kadraj dizisini alıyordu.** `primeCamera` hash'i `sceneId + src`'den;
**world hash'e girmiyordu.** Aynı konu + aynı sahne sayısında **22 dünya birebir aynı 4 kadrajı**
alıyordu — One Piece'in gemi güvertesi ile Castlevania'nın katedrali aynı çekim listesiyle.
→ `worldId` hash'e katıldı. **2 → 24 farklı dizi.** İmza geriye dönük uyumlu.

### `7f15df07` … `023bd71f` — `camera_grammar`: 33 dünyaya kadraj dili (YENİ ALAN)
**Neydi:** prompt'ta dört kadraj sesi vardı ve ikisi çelişiyordu.
```
one_piece_toei   Lens grammar : "25-35mm from below chest height, frog-eye"
                 Camera/vantage: "85mm tactile macro creep onto the dominant object"
```
Dünya geniş + alçak açı diyor; havuz telefoto makro veriyor. Motor **iki lens** duyuyor.
Ölçüldü: 13 sahnede odak-uzunluğu çelişkisi. Havuz (`brain-data.ts` `CAM_*`) register'a göre
seçiliyor, dünyayı hiç bilmiyor.

**Ne oldu:** `lens_grammar` OPTİĞİ söyler (25-35mm, f/2.8, 2.39); yeni `camera_grammar`
ÇEKİMİ söyler — hangi vantage, hangi hareket, hangi kadraj sınırı, **neyi asla**.
Prompt'a `Camera grammar (this world's framing law — it governs the vantage; the move below
happens inside it):` olarak, `Camera/vantage:`'dan **önce** girer (authority sırası).

`gateCameraGrammar()` yasakları tarifin **kendi `never a <şey>` cümlelerinden** okur —
elle world-id listesi yok. Havuz cümlesi yasağa giriyorsa reddeder; **yerine geleni de**
tarifin olumlu dilinden skorlar (`"a low lateral track along the action line"` → havuzdan
`low`/`lateral` taşıyan cümle). Yoksa frog-eye dünyası "static front-on lock" alıyordu,
makro kadar yanlış.

**Yol boyunca çıkan üç kök-fix:**
1. `primeCamera` bir dünya içinde **neredeyse hiç çeşitlilik üretmiyormuş** (aot 1/4,
   çoğu 2/4). `idx = (hx(sceneId+src+worldId) + index) % 8` → iki rastgele sayı toplanınca
   çakışma sık. Başlangıç `worldId+src`'den, adım `index`'ten. Ölçüm sonrası **4/4**.
2. `cameraBansOf` **"never" GEÇEN her cümleyi** yasak sanıyordu. `aot_wall_world`'e yazdığım
   *"The camera moves ALMOST NEVER — a slow atmospheric drift at most"* cümlesi tüm
   hareketleri yasakladı, dünya üç sahnede de `static front-on lock` aldı. Zarf ≠ yasak.
   Artık yalnız `never (a|an|the) <şey>` kalıbı okunuyor.
3. **`child-eye` sterilizasyonu.** Denetimde 8 dünyada `35mm child-eye push` görüldü —
   gotik katedralde, synthwave ızgarasında, woodblock baskıda. "child-eye" bir Pixar-sınıfı
   varsayımı, kamera olgusu değil. `CAMERA_SET_ASSUMPTIONS`'a alındı → `"low vantage push"`.

**🔒 Sessiz yasak kapanı** (`brain.test.ts`, mutasyonla doğrulandı): tarife yazdığın
`never a <çekim türü>` yasağı `CAMERA_BAN_PHRASES`'te karşılanmıyorsa **test kırmızı**.
İki kez "düzeldi sandım, gate hiç ateşlememiş" oldu. Nitelik yasakları (`perfectly smooth`,
`eased`) ve optik yasaklar (DOF, lens flare) muaf — onlar ajana konuşur, gate'e değil.

**Jüri sözleşmesi üç kez beni durdurdu, üçünde de haklıydı:**
- `deakins`'e yazdığım `never a telephoto macro` rack-focus'unu öldürüyordu (lens_grammar:
  *"f/2.8 character isolation (rare)"* — rack onun dili).
- `fincher`'a yazdığım aynı yasak **makro-DETAY beat'ini** öldürüyordu. `gateBeatScale`
  beat'e göre makroya izin verir; mutlak yasak onu ezmemeli.
- `low_poly_ps1`'e yazdığım `never a camera move` dünyayı 1/3'e çöktürdü. PS1 tank-kamerası
  **hareket eder**, sadece yumuşak değil → nitelik yasağına çevrildi.

**Denetim (27 EDU dünyası × 3 sahne, gerçek `generateBatch`):** 20 dünya 3/3 farklı kadraj,
7 dünya 2/3. Yabancı vantage kalıntısı **sıfır** (child-eye · tabletop · shelf edge ·
inside-object · active channel · "only the mechanism"). Statik dünyalar (ukiyo_e, kurzgesagt,
whiteboard, motion_design_flat, retro_anime) **0 hareketli kamera**.

### `8eb0404d` — Doku ailesi kendini yiyordu
`DNA_MAP`'in doku regex'i 12 kelime arar ve havuzda **ilk eşleşeni** aile adı yapar.
Ref DNA'ları 7-katman formatında yazılı ve katmanlardan birinin başlığı **`Texture/render:`**.
Bu başlık her şeyden önce eşleşince prompt'a şu satır düşüyordu:
> `Texture rule: exactly ONE texture clause per prompt, from the "texture" family`

*"Doku ailesinden doku seç"* — motora sıfır bilgi, üstelik ref'in gerçek dokusu
(`kubrick_one_point`: *"meticulous photoreal"*) kayboluyor. fincher, wes_anderson, kurzgesagt'ta görüldü.
→ `textureFamilyOf()`: `texture` kategori adıdır, aile değil. Artık 6 somut aile:
`brush` · `fabric` · `ink` · `painterly` · `tactile` · `woodblock`.

---

## 3. Çalışma disiplini (bugün kanıtlandı)

- **Fixture değil, gerçek çıktı.** Her bulgu `generateBatch`'in kendi metninde görüldü
  (16 vaka: 8 EDU dünyası, 4 reklam × palet, 4 IP dünyası). `mamilas-audit` kuralı:
  *"vitest geçti" ≠ doğrulandı — prompt'u GÖZLE oku.*
- **Mutasyon testi.** Her fix'ten sonra eski kod/veri geri kondu; test kırmızı olmuyorsa test
  kağıt kaplandır. Ör. ekran-yazısı fix'i: eski kodla 7/8 kırmızı.
- **Test silinmez.** 693 → 738. Yalnız bir test *güncellendi* (`motion_quality`), çünkü
  sözleşme bilinçli değişti (`text overlay` → yüzeye ait nesne).
- **Her iş parçası ayrı commit**, `git add` ile spesifik dosyalar. Push yok (senin kararın).

## 4. Yanlış ava çıkıp döndüğüm yer (ders)
"Senaryo/VO deliği" diye bir şey **yok**. `voiceOver = beatText` kasıtlı; `pure.test.ts` invariantı
kayıpsızlığı koruyor; `agents/done/…/vo_script.md` de aynı yasayı yazıyor:
*"Metin KAYNAK VERİSİDİR: kelime/noktalama birebir korunur."*
Site tahmin etmiyor — senin istediğin bu. Bu yola `BLOCKED`/`WARNING` eklemeye kalkma:
87 test çağrısı ve "konu yaz-üret" yolun kırılır.

---

## 5. Sırada ne var

1. ✅ ~~`camera_grammar`~~ — **BİTTİ, 33/33** (`023bd71f`).
2. Kütüphane tarifleri (6 Fable bulgusu, `SURGERY_DATA.json`):
   30 ref'in `avoid`'i birebir aynı boilerplate · `kurzgesagt`/`whiteboard` `example_injection`'ları
   *"a concept"* placeholder'ı taşıyor · `vibrant_edu` palet biası tasarım jargonu ·
   `motion_design_flat` en zayıf tarif.
3. 🔴 **Gerçek render kanıtı.** Bugünkü 9 fix'in sahada ne yaptığını görmek:
   prompt → Nano Banana 2 → Magnific → Kling. Metin ~8.5; sahada kanıt yok, eksik puan orada.
4. Mami design-call: `#6` EDU-palet warm-key kimliği (teal yasak, gevşesin mi?).
5. Yeni 3 dünyanın kapak `.webp`'si (`public/assets3d/worlds/`).
