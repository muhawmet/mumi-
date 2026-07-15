# MAMILAS — DESIGN LANGUAGE V3 · "ALTIN KARANLIK"
**Tarih:** 2026-07-03
**Kapsam:** 3D çağı (M3 ve sonrası). Bu belge kanundur; M3 panel giydirme işi buradaki reçetelerin dışına çıkamaz.
**V2 ile ilişki:** V3, V2'yi **genişletir**, çöpe atmaz. V2'nin editorial ruhu — hairline çizgiler, eyebrow/mono anotasyon, film-plate world kartları, kaybolmayan CTA, "world paletleri UI'yı boyamaz" — aynen yaşar. V2'nin tek maddesi resmen değişir: **glassmorphism/blur yasağı kalkar, yerine cam bütçesi gelir.** Cam artık dekor değil, dünyanın malzemesidir: panelin camdan olmasının tek meşru sebebi arkasındaki dioramayı göstermesidir. Diorama göstermeyen yüzeye cam yapılmaz. Çelişkide V3 kazanır. Beyin (kabinet, prompt üretimi, Final Brief, export) bu belgenin konusu değildir ve dokunulmazdır.

**Otorite sırası (tek doğruluk kaynağı zinciri):**
1. `src/styles/tokens.css` — renk/ölçü/süre token'ları
2. `src/scene/lookConfig.ts` — 3D şiddetleri ve kamera pozları
3. `src/styles/design_v3.css` — kabuk ve panel CSS'i
4. Bu belge — hepsinin üstündeki niyet; kod bu belgeyle çelişirse kod düzeltilir.

---

## 1. Kimlik cümlesi

MAMILAS'ın 3D çağı **Disco Elysium yağlıboya karanlığı ile altın stüdyo konsolunun füzyonudur**: near-black sıcak grafit bir boşlukta tek bir altın sokak lambası yanar, sis (`#0b0a08`) her şeyi 9–26 birim arasında yutar, panel camları bu dioramanın önünde asılı durur ve arkalarından lambanın ışığı sızar. Oyun hissi vardır — düşünceler daktiloyla konuşur, kartlar havada süzülür, kamera stage'ler arasında sinematik kayar — ama bu bir oyuncak değil, bir **çalışma aletidir**: metin her zaman okunur, hit-target asla kaymaz, Final Brief 3D olmadan da çalışır. Neon yasaktır; ışık boya değildir, tek altın kaynaktan gelir (`--gold #f6c862` / sahnede `#f7c948`), karşısında yalnızca soluk buz-çeliği bir dolgu (`#8fa3c2`) durur. Renk doygunluğu karakter portrelerine ve TONE etiketlerine aittir; kabuk kendini fısıltıyla anlatır.

---

## 2. Katman hiyerarşisi kanunu

Z-düzeni sabittir. Yeni bir yüzey eklenirken bu banda oturur; band icat edilmez.

| z | Katman | İçerik | Doluluk bütçesi | Blur bütçesi | Işık bütçesi |
|---|--------|--------|-----------------|--------------|--------------|
| **0** | **Diorama + atmosfer** | `SceneLayer` (R3F, `fixed inset:0`, `pointer-events:none`), `AntigravityBackground`, `.ml-v3-floor`, `.ml-spotlight`, shell'in god-ray/grain pseudo'ları | Opak (sahnenin kendisi) | Backdrop-blur yok | Bloom 0.35 (eşik 0.72), grain 0.16, vignette 0.28/0.82, CA 0.0012, clear `#080705`; DOM atmosfer katmanlarında altın alpha toplamı ≤ 0.09 |
| **1** | **Panel camı** | `.ml-main` → `.ml-v3-screen` (aktif stage'in çalışma yüzeyi) | Üst ışık gradyanı + `color-mix(in srgb, var(--s2) 42%, transparent)` — okunurluğu blur taşır (mockup onayı 2026-07-03, Mami waive: uygulama içi ekran kanıtı onay yerine geçer)¹ | `blur(30px) saturate(1.15)` | Altın kenar ışığı `--v3-edge` (0.16); breathe SADECE box-shadow |
| **2–6** | **Chrome** | z2: `.ml-sidebar` + `.ml-right-rail`; z6: akvaryum pili | `--v3-glass` %52 | `blur(30px) saturate(1.15)`; pil `blur(16px)` | İç üst parlama `rgba(255,214,130,0.22)`; tilt ±7.5°, hover'da `translateZ(22px)` düzleşme |
| **40** | **Thought dock** | Toast'lar + ünlem rozeti (`position:fixed`, alt-orta) | Toast: `color-mix(in srgb, var(--m2-ink) 88%, transparent)` | `blur(14px)` | Kenar rengi TONE_COLOR'dan `${color}66`; en fazla 2 toast |
| **50** | **Drawer** | Düşünce geçmişi çekmecesi (sağ, 360px) | `color-mix(in srgb, var(--m2-ink) 94%, transparent)` | `blur(18px)` | Sol hairline `rgba(247,201,72,0.18)` |

**Ek kanunlar:**
- Kamera hariç hiçbir şey z0'a yazamaz; DOM ile diorama arasında tek iletişim yönü store → sahnedir.
- Bir bakış hattında (aynı piksel sütununda) üst üste en fazla **3 backdrop-blur yüzeyi** durabilir. Kalıcı düzen zaten 1'dir (chrome ve panel yan yanadır, üst üste değil); toast panel üstünde 2 yapar, drawer + toast anlık 3'tür. Dördüncü blur isteyen tasarım reddedilir.
- z1 panel camının doluluğu artık yüzde ile ölçülmez: `color-mix(in srgb, var(--s2) 42%, transparent)` + üst ışık gradyanı sabit reçetedir; diorama görünürlüğünü ve metin okunurluğunu birlikte taşıyan blur(30px) saturate(1.15)'tir. Diorama görünmüyorsa cam olmanın anlamı kalmaz; metin okunurluğu yine pazarlık konusu değildir.
- Sahne ışığı sabittir: tek altın pointLight (intensity 14, decay 2), buz-çeliği directional `#8fa3c2` 0.5, ambient 0.22 `#e8ddc8`. Panel/chrome bu ışığı taklit eder, kendi ışığını icat etmez.

¹ **Tadil notu (2026-07-03):** z1 doluluk/blur reçetesi `mockup-m3-panels.html`'in `.panel--glass` (satır ~276) onaylanmış çıktısına eşitlendi — `blur(18px)` → `blur(30px) saturate(1.15)`, doluluk yüzdesi yerine `color-mix` + gradyan reçetesi geçti; ayrıntı §3a.

---

## 3. Cam / parşömen panel reçetesi (M3'ün ana işi)

İki panel varyantı vardır. Üçüncüsü yoktur.

### 3a. CAM — çalışma panelleri
Brief formu, Reçete grid'i, Sahne editörü, Timeline, Yönetmen ekranı. Kullanıcı burada **yazar ve seçer**; arkada diorama nefes alır. Dış cam zaten `.ml-v3-screen`'dir (aktif stage çerçevesi, §2 z1); iç kartlar bu camın üstüne `.ml-v3-panel-glass` ile biner ve kendi backdrop-filter'ını TAŞIMAZ (blur bütçesi bakış hattında 1 kalsın diye — cam içine cam konmaz).

```css
.ml-v3-screen {
  position: relative;
  margin: 26px 28px 34px;
  border-radius: var(--r-lg);                     /* 20px */
  animation: v3-screen-breathe 9s ease-in-out infinite alternate;
  background:
    linear-gradient(172deg, rgba(255, 255, 255, 0.05), transparent 30%),
    color-mix(in srgb, var(--s2) 42%, transparent);
  backdrop-filter: blur(30px) saturate(1.15);
  -webkit-backdrop-filter: blur(30px) saturate(1.15);
  border: 1px solid var(--v3-edge);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.09),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.5),
    var(--v3-shadow-near);                        /* 0 24px 60px -24px rgba(0,0,0,0.7) */
  overflow: clip;
}
/* Altın kenar ışığı: lamba camın sol-üstünü öper; alt-sağ buz karşı-ışığı. */
.ml-v3-screen::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit; pointer-events: none;
  background:
    radial-gradient(60% 26px at 18% 0%, var(--v3-edge), transparent 70%),     /* rgba(246,200,98,0.16) */
    radial-gradient(40% 20px at 92% 100%, var(--v3-iceline), transparent 75%); /* rgba(143,163,194,0.22) */
  opacity: 0.85;
}

/* iç kart: aynı cam atanın üstünde oturur, kendi blur'ı yoktur */
.ml-v3-panel-glass {
  border: 1px solid var(--line);
  border-radius: var(--r-md);                     /* 14px */
  background:
    linear-gradient(170deg, rgba(255, 255, 255, 0.045), transparent 35%),
    color-mix(in srgb, var(--s2) 55%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

Bu, `mockup-m3-panels.html`'in `.panel--glass` (satır ~276) + `.mini-card` (satır ~335) reçetesinin birebir kanonlaştırılmış halidir; TEK fark alt-sağ karşı-ışığın mockup'taki geçici `--v3-tealline` yerine kalıcı buz tonunu (`--v3-iceline`, `rgba(143,163,194,0.22)`) taşımasıdır (bkz. §7 neon yasağı).

### 3b. PARŞÖMEN — verdict / okuma alanları
Final Brief, CABINET READ kartı, Inland Review alıntısı, QA verdict listesi, uzun okuma blokları. Kullanıcı burada **okur**; diorama geri çekilir, kağıt öne gelir. Parşömen de cam atası TAŞIMAZ — her zaman blur'lü bir cam (`.ml-v3-screen` / `.ml-right-rail`, ikisi de blur30) içinde oturur.

```css
.ml-v3-parchment {
  position: relative;
  border: 1px solid var(--parch-line);
  border-radius: 16px;                            /* mockup 18 → radius sözlüğü: parşömen ≤16 */
  background:
    linear-gradient(168deg, var(--parch-tint), transparent 34%),
    color-mix(in srgb, #2a2418 30%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 240, 210, 0.12),
    var(--v3-shadow-near);
}
.ml-v3-parchment::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit; pointer-events: none;
  background: radial-gradient(70% 30px at 20% 0%, rgba(246, 200, 98, 0.14), transparent 72%);
}
```

`#e8ddc8` = `lookConfig.LOOK.palette.paper`. `--parch-tint`/`--parch-line` tokens.css'te bu değerden türetilir; sapma gate'te yakalanır (`designLaws.test.ts`).

**Varyant kanunları:**
- **Cam yazar, parşömen okur.** Bir ekranda ikisi karışabilir (cam panel içinde parşömen verdict kartı) ama **tek seviye**: parşömen cam içine oturur, cam içine cam KONMAZ (blur yığını büyür, §2 bütçesi patlar). Bu yüzden hem `.ml-v3-panel-glass` hem `.ml-v3-parchment` kendi backdrop-filter'ını taşımaz — atadıkları cam atanın blur'ını devralırlar.
- Parşömen dolu ve opaktır (`#2a2418` %30 + gradyan); arkasındaki hareket okumayı bozmasın diye içinde caret dışında hiçbir şey animate olmaz.
- Toast (`color-mix ink 88% + blur 14`, radius 12) ve drawer (`ink 94% + blur 18`) reçeteleri bugünkü haliyle mühürlüdür — cam ailesinin fixed-overlay üyeleridir, panel varyantı sayılmaz.
- Köşe yarıçapı sözlüğü: panel camı `--r-lg` 20, iç kart `--r-md` 14, parşömen 16, toast 12, node 9–10, pil `--r-pill`. 26px (`--r-xl`) üstü yarıçap yoktur.

---

## 4. Tipografi + ton etiketleri

**İkili sabit:** `--font-sans` (Inter Variable) insan sesi — başlık, gövde, form. `--font-mono` (JetBrains Mono Variable) makine sesi — kicker, hash, sahne numarası, tone chip, rozet sayacı, voice adı. Bu görev dağılımı değişmez: mono ile başlık atılmaz, sans ile hash yazılmaz.

**Ölçek** V2'den aynen devralınır: 11 / 12 / 13 / 14 / 16 / 20 / 28 / 40. V3'ün mikro-uçları eklidir: kicker 9px, eyebrow 10px, brand-sub 8.5px.

**Kalıplar (mühürlü):**
- **Eyebrow** (`.ml-v3-eyebrow`): 10px · 800 · letter-spacing 2px · `--text-muted`. Bölüm üstü fısıltı.
- **Kicker** (`.ml-v3-kicker`): mono · 9px · 800 · letter-spacing 1.6px. Rengi M3'te buz tonuna (`#8fa3c2`) çekilir, text-shadow parlaması kaldırılır (neon yasağı).
- **Stage başlığı:** eyebrow ("STAGE 1 · BRIEF" kalıbı, altın) + 28–40px sans başlık + `--text-soft` lead.
- **Toast anatomisi:** voice mono 10px ls1.6 uppercase (TONE rengi) · tone chip mono 9px, zemin `${color}18`, radius 4 · başlık strong 13px `--m2-paper` · gövde 12.5px/1.55 `--m2-muted` · portre 52×52.
- **Brand:** 15px · 800 · ls 4px; alt satır 8.5px · ls 2.4px.

**TONE_COLOR dokunulmazdır.** `voicePortraits.ts`'teki beşli, kabinetin sesidir; hiçbir tema işi, token birleştirme veya "tutarlılık" refactor'u bu değerlere dokunamaz:

```
pass  #93c9a8  PASS   ·  warn  #d6a84f  FIX  ·  fail  #f26d6d  FAIL
info  #9c9588  READ   ·  spark #8fa3c2  WILD
```

`--red` (#ff5c79) UI'nın yıkıcı-eylem rengidir, `fail #f26d6d` kabinetin hüküm rengidir — **ikisi ayrı yaşar, birleştirilmez.** Portreler her zaman painterly 2D'dir (`AdvisorPortrait`); emoji/ikon fallback yoktur, son çare `FALLBACK_PORTRAIT` (case_ledger)'dır.

---

## 5. Hareket kanunu

**Kamera:** Tek otorite `CameraRig`'dir. Stage geçişi `THREE.MathUtils.damp` ile yapılır, lambda **2.2** (`LOOK.cameraDamp`) — pozisyon, hedef ve FOV aynı lambda ile damp'lenir. Pozlar yalnızca `CAMERA_POSES`'tan gelir; FOV bandı 30–36. Başka hiçbir birim kamerayı oynatamaz. Dioramanın kendi nefesi kameradan bağımsızdır: sahne grubu 0.02 rad/s döner, kartlar `sin(t·0.6)·0.12` yüzer, `sin(t·0.25)·0.06` salınır.

**DOM zamanları (token):** hover `--dur` 0.18s, reveal/panel `--dur-2` 0.34s; easing `--ease` `cubic-bezier(0.22,0.61,0.36,1)` ve `--ease-out` `cubic-bezier(0.16,1,0.3,1)`. Step buton geçişleri 260ms, spine dolumu 500ms, chrome tilt dönüşü 700ms.

**Spring sabitleri (framer-motion, mühürlü):**
- Toast: `stiffness 320 / damping 26`; giriş `y:18, scale:0.96`, çıkış `y:-10, scale:0.97`.
- Rozet: `stiffness 420 / damping 18`; `scale 0 → 1` pop.
- Drawer: `stiffness 300 / damping 30`; `x: 380 → 0`.

**Daktilo:** 45 cps; caret `0.9s steps(2)` blink; toast otomatik kapanma **9000ms**; ekranda aynı anda en fazla **2 toast**. Merge içeriği tazelese bile mount edilmiş toast'ın metni donuktur — daktilo baştan başlamaz; yeni düşünce yalnız yeni `key` ile remount olur.

**ASLA animate olmayanlar:**
1. Okunan metnin altındaki layout — panel "breathe" yalnız box-shadow'dur, transform içeremez (hit-target'lar e2e ve insan için sabit kalır).
2. Form input'larının konumu — kullanıcı yazarken hiçbir şey kaymaz.
3. Parşömen içi her şey (caret hariç).
4. Kamera, stage geçişi dışında — scroll parallax, hover kamera itmesi yasaktır.
5. `prefers-reduced-motion: reduce` altında sahne tümüyle durur (ray, floor, breathe, tilt geçişleri kapalı).
6. 900px altında stage düzleşir: tilt yok, floor yok, breathe yok.

---

## 6. Akvaryum modu

**Tanım:** UI çekilir, diorama vitrine çıkar. MAMILAS'ın "bu bir dünya" iddiasının kanıt ekranıdır.

- **Gizlenenler:** sidebar, panel camı (`.ml-main`), sağ ray **ve thought dock'un tamamı** (toast + ünlem rozeti); drawer açıksa kapanır. (Bugünkü kod dock'u gizlemiyor — M3 bu kanunla gizler.) Gizleme reçetesi `HIDDEN_CHROME`'dur: `opacity:0; visibility:hidden; pointer-events:none; scale(0.985)`, süre `--dur-2`, easing `--ease`.
- **Kalanlar:** yalnız diorama + atmosfer katmanları ve dönüş pili. Pil `right:364 → 22`'ye kayar, etiketi "MENÜLERİ AÇ" olur. Spotlight 0.28 opaklığa iner ki sahne nefes alsın.
- **Kuyruk yaşar:** kabinet düşünmeye devam eder; toast/rozet üretimi durmaz, sadece görünmez. Çıkışta rozet sayacı günceldir, auto-open hakkı kaybolmaz.
- **Vitrin hilesi yoktur:** akvaryumda `LOOK` şiddetleri (bloom, grain, kamera) değişmez. Sahne her zaman vitrine çıkabilecek kadar iyidir; "gösterim modu güzelleştirmesi" yasaktır.

---

## 7. Yasaklar listesi

1. **Cyan/magenta neon.** Doygun cyan `#37e2d5` (`--v3-teal`) mirastır; M3 dokunduğu her kullanımı buz-çeliğine (`#8fa3c2` ailesi) migre eder. Magenta hiçbir dozda giremez. Soğuk renk yalnız desatüre karşı-ışıktır, asla vurgu ışığı değildir.
2. **Saf siyah `#000`.** En koyu değerler: sahne `#080705`, abyss `#050507`, sis `#0b0a08`. Karanlık bile sıcaktır.
3. **3'ten fazla eşzamanlı backdrop-blur katmanı** (aynı bakış hattında). Blur değerleri sözlük dışına çıkamaz: 10 / 14 / 16 / 18 / 30.
4. **Bloom intensity > 0.6.** Nominal 0.35'te kilitli; eşik 0.72 altına inemez (geniş yüzeyler bloom'a giremesin).
5. **Grain opacity > 0.20** (nominal 0.16) ve **CA offset > 0.002** (nominal 0.0012). "Filmi hisset, kirlendiğini hissetme."
6. **Glow-heavy her şey:** tek elemanda `--goldglow` 0.28 üstü parlama, neon text-shadow, ışıldayan CTA (V2 yasası devam eder).
7. **World paletlerinin UI'yı boyaması** — palet yalnız swatch/preview/3D önizleme malzemesinde görünür (V2'den devralınır).
8. **Okuma sırasında layout hareketi** — transform'lu breathe, hover'da büyüyen metin kutusu, kayan input.
9. **CameraRig dışından kamera dokunuşu** ve DOM'dan sahneye yazan her türlü geri-kanal.
10. **3D'ye rehin işlev:** Final Brief ve tüm beyin akışı WebGL'siz eksiksiz çalışmak zorundadır; "sadece 3D'de görünen" hiçbir bilgi olamaz.
11. **Sessiz placeholder düşüşü:** asset yüklenemezse `console.warn` + placeholder + gate raporu şarttır.
12. **`--r-xl` (26px) üstü köşe yarıçapı, rounded SaaS card-soup, büyük düz gradient arka plan** (cam reçetesi dışında).
13. **AI-slop metin** ("premium", "stunning", "beautiful") — V2'den beri yasak.
14. **DPR > 2** ve idle'da tam frameloop — performans bütçesi görsel dilin parçasıdır; takılan sinematik, sinematik değildir.

---

## 8. M4 asset yerleşim kuralları

Painterly dokular geldiğinde şöyle entegre olacak:

**Slotlar ve yol:** Tüm gerçek asset'ler `public/assets3d/` altına düşer ve slotlara otomatik bağlanır. Slotlar: (a) yüzen kart yüzleri (`FloatingCard` — bugün altın-kağıt malzeme), (b) zemin diski, (c) masa üstü, (d) gökyüzü/arka fon, (e) karakter portreleri (zaten 2D painterly, `AdvisorPortrait` hattı).

**Format ve boyut:**
- Kart yüzü: WebP, **1024×1448** (geometri 1.1×1.55'e oran-eş). İçerik world/ref plate'idir — film still hissi; UI ekran görüntüsü kart yüzüne basılmaz.
- Zemin: WebP, **2048×2048 seamless**; masa: 1024².
- Portre: şeffaf PNG, 512².
- Hepsi sRGB colorSpace, mipmap açık, anisotropy ≤ 8.

**Renk kabul bandı (altın-karanlık kimlik):** Dokunun dominant rengi amber bandında (hue ≈ 35–55°) ve düşük value'da kalır; soğuk tonlar yalnız desatüre buz ailesinden. Luminance > 0.72 alan payı **%4'ü geçemez** — aksi halde bloom eşiğini tetikler ve sahne patlar. Fırça izi görünür kalır: Magnific'te painterly/natural upscale kullanılır, **fotogerçekçi upscale yasaktır** (foto dokusu DE formülünü öldürür).

**Placeholder'dan geçiş kriteri** — üçü birden sağlanmadan gerçek asset canlıya bağlanmaz:
1. Gate script yeşil: dosya var, format/boyut doğru, eksik slot raporlanıyor.
2. `scripts/final-shots.mjs` ekran kanıtında kimlik korunuyor: altın tek ışık okunuyor, panel camı arkasında doku seçiliyor, bloom patlaması yok.
3. Görsel fark "daha güzel placeholder" değil "boyanmış dünya" — kart yüzünde plate içeriği, zeminde fırça dokusu ayırt ediliyor.

**Tek zemin otoritesi:** Gerçek zemin dokusu bağlandığında DOM'daki `.ml-v3-floor` perspektif grid'i sahne AÇIKKEN kaldırılır — iki zemin aynı anda yaşamaz. Grid yalnız WebGL fallback'inde (2D modda) kalır.

**Işık dokunulmazlığı:** Asset'ler geldi diye ışık kurulumu değişmez; doku ışığa uyarlanır, ışık dokuya değil. `LOOK` şiddetlerinde M4 cilası yalnız grain/partikül ince ayarıdır ve §7 tavanlarının altında kalır.

---

## 9. V3.1 Tadili — Işıklı Atölye (T1, 2026-07-03)

Mami hükmü: karanlık "Slenderman" değil "gece yarısı hâlâ çalışan atölye". Bu tadil §7-8'in şu maddelerini günceller:

**Set:** Yüzen kartlar + sokak direği EMEKLİ. Yeni set: arka duvar (z=-4.2, 18×7, `wall-plaster` slotu) + pirinç çerçeve rayı + 4 duvar çerçevesi (card slotları yüz olarak yaşar) + amblem çerçevesi + merkez çalışma masası (üstünde kart destesi + mürekkep şişesi) + masa lambası + 2 duvar apliği.

**Işık kanunu (LOOK.light — designLaws testli):** altın ana ışık = masa lambası; ≤2 sıcak ikincil = aplikler; ambient 0.35 sıcak kağıt. Soğuk mavi directional emekli — tek ışık ailesi.

**Atmosfer bandı:** fog `#161009` 14→34 (eski 9→26); clearColor `#14100b` sıcak kahve; vignette 0.32/0.68 (eski 0.28/0.82). Sıcaklık sırası kanunu: fon renklerinde r ≥ g ≥ b.

**Kamera:** ön-yarımküre kanunu — hiçbir poz duvar arkasına düşemez (`position.z > 0`, testli). Oda dönmez; hafif nefes salınımı (`sin(t·0.08)·0.03`).

**Geçiş:** stage değişiminde cross-fade (`AnimatePresence mode="popLayout"` + adım-içi Suspense) — eski içerik yenisi gelene dek camda kalır; boş bulanık cam yasak.

**Slenderman testi (yeni kabul kriteri):** establish/akvaryum kadrajında zemin + duvar + ≥3 nesne ışıkta seçilir; kare ortalama luminance %4-%12 bandı — `scripts/scene-proof.mjs` ölçer ve bandın dışında exit 1 döner.

**§8 revizyonu:** "Luminance > 0.72 alan payı %4'ü geçemez" tavanı **%10**'a çıkar (atölye ışık gölleri meşru; bloom eşiği 0.72 sabit kaldığından patlama scene-proof'ta denetlenir). §8'deki `FloatingCard` referansı artık `FramedPlate` (duvar çerçeveleri) olarak okunur; slot adları ve format kuralları AYNEN geçerli + `wall-plaster` (2048² seamless, 4×1.6 tile) eklendi.
