DURUM: TAMAMLANDI

# FABLE ADVERSARIAL KULLANICI + İÇERİK TARAMASI — 2026-07-16

Rol: sistemi KULLANAN ve KIRAN göz (kod denetçisi değil). Yöntem: Playwright ile gerçek UI sürüşü
(headless Chromium, http://localhost:5173) + runner'ı Mami rutiniyle bizzat koşma + 4 gerçek senaryoda
image_author/image_jury/frame_jury/motion_author/motion_jury rollerini BİZZAT oynama (müdahalesiz,
dürüst-ortalama ajan disipliniyle). Tüm çalışma alanı scratchpad'te; repoya tek dokunuş geçici test
dersi (APPROVED.md) idi ve geri alındı (`git status` temiz doğrulandı).

Bilinçli kilitler (bug DEĞİL): IP/marka export firewall · motion yalnız Mami-onaylı gerçek frame ·
on-screen text diegetik-veya-hiç · FACT REQUIRED durması · palet ham hex girmez.

---

## BULGULAR — KAPILAR VE AKIŞLAR (UI sürüşü)

- [DOĞRULANDI-SAĞLAM] Sidebar'dan ileri atlama kapıları baypas ETMİYOR; boş brief'te "4 Timeline" tıklandığında recipe'ye düşüyor ve sebep çipi görünür ("Reçete eksik: Dünya"). · kanıt: A0-sidebar-jump.png · hüküm: MEŞRU SINIR (site-gates kapanışı gerçek)
- [DOĞRULANDI-SAĞLAM] Dünya seçilmeden "Sahneler'e geç →" disabled + sebep görünür. Shot onayı bundle'sız VERİLEMİYOR ("Onayla" disabled; panel sırayı yazıyor: "Önce hash-valid author+jury bundle'ını geri al, sonra shot'ı onayla"); motion kapısı kapalıyken sebep yazılı ("⏸ Motion kapalı — Current ajan prompt receipt yok veya prompt değişti"). · hüküm: MEŞRU SINIR, açıklamalı
- [KRİTİK] `--export-image-bundle` ve tekrar `--import-frame`, sahnede frame_jury artifact'i OLUŞTUKTAN sonra KALICI kırılıyor; hata mesajı yanlış yöne işaret ediyor: "frame_jury: current frame receipt yok" — oysa receipt diskte duruyor. Kök neden: her iki komut da zinciri `validateArtifactChain(sceneArtifacts, null, …)` ile frame=null geçerek doğruluyor (scripts/mamilas-command.mjs:771 ve :780); frame_jury artifact'i frame kanıtı isteyince null'a çarpıyor. Sonuç: Mami zinciri bitirdikten sonra site-import bundle'ını alamaz ve kareyi DEĞİŞTİREMEZ (daha iyi kare gelse bile). · repro: tam zincir COMPLETE → `--scene 4 --export-image-bundle` veya yeni PNG ile `--import-frame` · kanıt: iki komutun da aynı hatayla düşmesi, `--scene 4` aynı anda "COMPLETE" diyor · hüküm: BUG — "yapamazsın deyip kendini kapatma" şikayetinin runner tarafındaki en somut örneği
- [KRİTİK] frame_jury REJECT'in devam yolu YOK: nextAction frame_jury PASS değilse doğrudan FACT_REQUIRED çıkmazına düşüyor (mamilas-command.mjs:577) ve üstteki bug yüzünden yeni kare de import edilemiyor → sahne fiilen ölüyor. image_author'da r1 revizyon yolu var; frame katında ne revizyon ne yeni-kare yolu çalışıyor. · hüküm: BUG (tasarım niyeti "Mami hükmü egemen" olsa bile yeni kare yükleme yolu kapalı kalmamalı)
- [ORTA] Aynı QA ekranında çelişen hazırlık dili: GATES 4/4 PASS + "SONRAKİ EN İYİ HAMLE: Teslimi aç — Tüm üretim kapıları yeşil" ile ÜRETİM DURUMU "78% READY — 96 shot receipt bekliyor" yan yana; "Teslimi aç" tıklanınca gözlemlenebilir HİÇBİR ŞEY olmuyor. · kanıt: F2-teslim.png; DOM metni tıklama öncesi/sonrası birebir aynı · hüküm: BUG (eski "rakip readiness" hastalığının kalıntısı; "yeşil diyor ama vermiyor" hissi)
- [ORTA] Sahne sayısı alanı "1–60" vaat ediyor (`<input min=1 max=60>`) ama 65 beat'lik SOURCE ingest'i sceneCount=96 yapıp alanı kilitliyor; PLAN kapısı "96 sahne hedefi PASS" basıyor ve motor 96 sahneyi 1.8sn'de üretiyor (donma yok, hata yok). Tavan hiçbir katmanda gerçek değil — ya etiket yalan ya kapı delik. · hüküm: BUG (tutarsız sözleşme)
- [ORTA] QA cabinet 4 içses "FIX" derken tüm export'lar timeline'dan gate'siz iniyor; "Kapanış Receipt" hiçbir shot onaylanmadan indirilebiliyor (içeriği dürüst: tüm chain NO_FRAME/null). FIX'ler tavsiye. · hüküm: karar Mami'de olduğu için MEŞRU sayılabilir; ama "Kapanış" adı üretim başlamadan yanıltıcı
- [DÜŞÜK] Export dosya adları iki farklı sanitizer'dan geçiyor (timeline JSON emoji koruyor, diğer 6'sı `_`'lıyor) → aynı projenin dosyaları yan yana sıralanmıyor. `<script>`/emoji topic MD/CSV başlığına verbatim geçiyor (sözleşme gereği scrub yok — MEŞRU). Timeline başlığında ham float: "754.8000000000009s". "SONRAKİ ADIM" kartı zaten o adımdayken tıklanınca tepkisiz. Runner'da `--help` yok; hata "0 aday; --file kullan" hangi dosya kalıbını aradığını söylemiyor (`*_mamilas_command.json`). · hüküm: BUG'lar (kozmetik/UX; Mami talimatıyla derinleşilmedi)
- [BİLGİ] locks.topic bayat: Brief'e "Rüzgârın Elektriği" yazılmasına rağmen export `locks.topic: "Su Döngüsü"` (recipe `subject` alanı varsayılanı). RAW_SOURCE varken ajan yoluna girmiyor (imageContext topic'i siliyor) ama topic-bazlı üretimde yanlış konu kilitlenir. · hüküm: BUG (düşük görünürlüklü, doğrulanması kolay)

---

## İÇERİK KALİTESİ (Mami önceliği)

### 1) Dünya tarifleri (46 world taraması + 9 derin okuma)

**Hüküm: boş laf YOK.** 46 dünyanın tamamı jenerik kalıp taramasından temiz çıktı ("masterpiece,
8K, stunning, award-winning, highly detailed" sınıfından SIFIR eşleşme; "perfect/epic/amazing"
eşleşmelerinin hepsi fizik bağlamında: "never digital-perfect", "no drone-epic cliché", negative
lock içinde "NO Amazing Amy"). Derin okunanlar: edu_promo_real, kurumsal_brand_film,
appetite_tabletop_real, ukiyo_e_print, noir_high_contrast, motion_design_flat, whiteboard_explainer,
bleach_soul_world, synthwave_retro_80s, wes_anderson_symmetric.

- En kısa tarifler (ukiyo_e_print light_law 187ch, motion_design_flat lens 109ch) zayıf DEĞİL — medyumun gereği: "print'te ışık simülasyonu yok, value renk-düzleminden gelir" tam ve doğru bir yasa. Kısalık = disiplin.
- COMMERCIAL_REAL grubu korpusun EN işlenmiş kısmı (render_law 1.9–2.5KB, 8-10 negative lock, fizik-temelli): "reklam dünyaları zayıf mı" endişesi verilerle YANLIŞLANDI. automotive_hero_real'in "the body is a mirror" bölümü ve appetite'ın "one low raking key at 15–35°" yasası endüstri-kalitesinde.
- Tek isim düzeyi pürüz: Dashboard arketip kartında "Kurumsal / Kamu | Kurumsal / Kamu" (başlık=motto tekrarı — diğer kartların hepsinde gerçek motto var).

### 2) Command dosyası içerik kusurları (4 gerçek üretimden)

- [KRİTİK — ölü kanal] `failureModes` HER sahnede null: runner ve TS iki yüzey de `scene.handoff?.IMAGE?.avoid` okuyor (scripts/mamilas-command.mjs:621, src/core/agentProtocol.ts:438) ama handoff.IMAGE paketinde alanın adı `negatives`/`warnings`. Motor kaçınmaları ("morphing, warping, extra fingers, identity drift between frames"…) image_author'a HİÇ ulaşmıyor. Parite testleri bunu yakalayamaz çünkü iki yüzey AYNI yanlış alanı okuyor (M2'deki vocabularyExamples vakasının birebir tekrarı, başka alanda). · hüküm: BUG
- [KRİTİK — reklam] Ekran-yazısı beat'i köreltiliyor: SOURCE "Ekranda yazı belirir: \"ARDIÇ — Doğanın İlk Yudumu.\"" iken s5 `prompts.onScreenText = null` VE aynı sahnenin site draft'ına "Text/logo: clean plate — this scene carries no on-screen text" bandı basılıyor; ajan yolunda `explicitLocks.onScreenText = null`. Kaynak açıkça ekran yazısı isterken sistem NO_TEXT kilitliyor — MEMORY'deki "onScreenText TERS" kusuru yeni yapıda da yaşıyor. Reklamda slogan = satış değeri; kayıp doğrudan paraya dokunur. · hüküm: BUG
- [KRİTİK — reklam] `brandKitLock`'un UI'da GİRİŞ ALANI YOK: `grep brandKit src/pages src/components` → 0 eşleşme; alan yalnız store'da yaşıyor. State'e elle yazınca (testte bilinçli müdahale) locks'a ve ajan context'ine (`explicitLocks.brandKitLock`) kusursuz ulaşıyor; AMA site draft prompt'una brain.ts:2199-2203'ün "BRAND KIT: LOCKED" bloğu HİÇ girmiyor (D'nin 6 sahnesinin hiçbirinde "BRAND KIT" geçmiyor). Mami bugün siteden marka kiti kilitleyemez. · hüküm: BUG (reklam hattı için en pahalı eksik)
- [KRİTİK — kanal tasarımı] `worldPacket.paletteAsLight` = SEÇİLİ palet, ama "world" alanının İÇİNDE taşınıyor ve dünya yasasıyla çelişebiliyor: jjk_mappa command'inde aynı context'te `world.lightPhysics` "key light often ABSENT, cold blue-black, rim-dominant" derken `world.paletteAsLight` "Vibrant Education — Broad saffron key lands flat and even… NO menace" diyor. Hangisinin üstün olduğu ne CONTEXT'te ne PROTOCOL.md'de yazıyor (AUTHORITY_HIERARCHY brain.ts'te ama ajana verilmiyor). Site de vibrant_edu-üstüne-jjk seçiminde tek kelime uyarı vermiyor (dikkatsiz Mami senaryosu birebir yaşandı: dünya seçimi paleti GÜNCELLEMİYOR, eski default kalıyor). · hüküm: BUG (öncelik beyanı eksik + sessiz çelişki)
- [ORTA] Kadraj ataması (imageVantage/composition) beat'e sağır round-robin: B s3 "Dev dalga tekneyi yatırır" beat'ine "85mm eye-level CLOSE view"; D s2 "Makro planda…" beat'ine "50mm eye-level medium"; C s2 yazısız kibrit sahnesine "static front-on lock … keeping any text razor sharp" (bayat gerekçe). Ajan vantage'a uymak zorunda değil (kart bunu söylemiyor — o da ayrı belirsizlik) ama kanal, karar değil kalıp taşıyor. MEMORY'deki "imageVantage round-robin" kusuru yeni yapıda sürüyor. · hüküm: BUG (içerik değeri düşük kanal)
- [ORTA] `exactSourceBeat` verbatim'inde kaçak baş newline: `"\nSOURCE: Gece evde Elif…"` — "kayıpsız/verbatim" iddialı alanda whitespace kirliliği; hash'e giriyor, karşılaştırma araçlarını şaşırtır. Türkçe karakterler ve noktalama bunun dışında birebir korunuyor (65 beat'lik testte %100 coverage, RAW=RECON hash eşit). · hüküm: BUG (küçük ama sözleşme alanı)
- [ORTA — kontrat] Mined "2D-medium law" maddesi TÜM animation gruplarına uygulanıyor (isAnimationWorld regex: /ANIMATION|STYLIZED/ — mamilas-command.mjs:62): pixar_3d_edu (3D CGI!) sahnesinde kontrat "hangi yüzeyler flat-cel" beyanı istiyor, dünyanın negativeLock'u ise "NO hard cel shading, NO flat graphic fill" diyor. Lafzen karşılanamaz madde + bastırma kanalı yalnız direktiflere açık → kartı harfiyen uygulayan jüri REJECT basıyor (bizim zincirde bastı). · hüküm: BUG (kontratın 2D/3D ayrımı yok)
- [DÜŞÜK] handoff.IMAGE kimlik alanları tuhaf: `projectId: "scene-36e5922a"`, `sourceHash: "scene-9bd99cb7"` — her şey "scene-" önekli; alan adları ile içerik uyumsuz. `prompts.image` (site draft'ı, sahne başına ~5.5KB) [DIRECTOR TASK]/"Claude yazar" workflow bantları taşıyor — ajan yoluna girmiyor (contextSummary.containsSiteGeneratedPrompt=false doğrulandı; runner [DIRECTOR TASK]'ı final prompt'ta reddediyor) ama Mami bu metni doğrudan motora yapıştırırsa çöp taşır. · hüküm: tasarım gereği kabul edilebilir; adlandırma düzeltilmeli

---

## COMMAND PROMPT KALİTESİ (4 senaryo — rolleri bizzat oynayarak)

Metodoloji: her senaryo gerçek UI'dan üretilen command ile, runner'ın kurduğu gerçek workspace'te
(CONTEXT.json + ROLE.md + kontrat), kendi zekâmla telafi ETMEDEN, malzemenin yazdırdığı şekilde
yazıldı. Runner dördünü de kabul etti (hash/şema/receipt tam).

### A · pixar_3d_edu · "Rüzgârın Elektriği" s4 (gece, tel sarma) — FINAL PROMPT (r1, jüri PASS):

> 40mm at f/2.8, framed at a seated child's eye level. Feature-animation 3D CGI rendered as physical material: subsurface-scattered skin, painted soft ambient occlusion, no outlines — the figure reads through lighting rim and value separation against the darker room. Medium split: the figure carries continuous SSS-shaded 3D surface treatment, the background carries painted-soft-AO 3D with gentle focus falloff — no surface in this frame is flat-cel; the register gap between sharp SSS figure and soft painted-AO ground carries the style. A 10-year-old girl — short black hair, yellow raincoat, curious gaze — sits at a wooden desk in a dim home room at night, rewinding copper wire back onto a spool; the frame freezes half a second before her fingers press the next coil flat. Single motivated key: a desk lamp at 60 degrees camera-left throws warm tungsten light across her hands, honey-warm subsurface glow on her knuckles; cool-violet bounce fill at roughly 30 percent opens the shadow side; a saturated warm-red rim accent separates her shoulder from the dark shelf behind. Composition: her face and the copper spool share the sharp focal plane in the mid — the desk edge soft in the near foreground, the room falling into gentle focus falloff behind; her eyeline lands on the wire between her fingertips. Detail: a fine coil-scratch groove crossing the spool's satin varnish; her thumb pad flattening slightly against the taut wire; the copper strand catching the lamp as one thin specular curve. Palette regime: high-saturation warm midtones against deep cool readable shadow, high value contrast, warm bias — shadow stays warm-dark, never black. Material: visible wood grain with satin-varnish sheen on the desk, woven stitch texture on the raincoat sleeve. Clean motion-ready still. Negative: no cel shading, no cartoon outline, no clay or plasticine skin, no added text or signage.

Hüküm: motor bundan büyük ihtimalle İYİ kare üretir (özne erken, ışık motive, malzeme somut) —
HİPOTEZ, kare ile doğrulanmalı. Zayıflıklar sistemden: (1) cast lock gece evde sarı yağmurluğu
zorladı (dikkatsiz cast tanımına karşı sistemin savunması yok; kural "birebir koru" dediği için
ortalama ajan saçmalığı koruyor); (2) "Medium split" cümlesi sırf kontratı susturmak için var — kare
bilgisi eklemiyor; (3) r0→REJECT→r1 turu tamamen kontratın kendi 2D/3D hatasının bedeliydi.

### B · one_piece_toei · "Fener Adası" s3 (dev dalga) — FINAL PROMPT (r0):

> Toei-style bold-cel production frame: every surface flat 2-value cel — the figure carries 3-5px uniform pure-black outline with saturated mid and deep marine cel shadow, the sky behind is hand-brush-painted cumulus mass; the gap between flat-cel figure and painted sky carries the style. 85mm eye-level close view: a 17-year-old sailor — messy black hair, white shirt with sleeves rolled up, determined face, mouth open mid-shout — grips the wooden helm with both hands on the deck of an old sailboat as the whole deck tilts on a hard diagonal; behind him, still legible, a towering dark-marine wave wall rises over the rail, its crest a painted cream-white mass. The tilted deck line against his counter-leaning body is the single compositional axis; his eyeline drives toward the bow off-frame left. Sky as the light engine: storm-grey cumulus with one amber-orange rake breaking through at the climax edge, hard 2-value cel step between mid and marine shadow, spray flecks rim-lit at his shoulder. Detail: the soaked shirt pressed flat against his upper arm; knuckles whitening around the helm spoke; one backlit spray arc catching the amber rake as a bright cel-edge curve. Palette regime: high saturation, hard 2-value contrast, cool marine shadow bias with warm cream-gold sky accents — no grey, no achromatic black fill. Clean motion-ready still, frozen half a second before the wave crest breaks over the rail. Negative: no photoreal rendering, no soft gradient shading, no named franchise character or emblem, no text.

Hüküm: dünya fiziği (sky-engine, 2-value cel) kareye gerçekten karakter veriyor; AMA sitenin verdiği
"85mm close" vantage'ı dev-dalga beat'inin ölçeğini boğdu — dalga arka plan dekoruna indi. Bunu ben
seçmedim; kanal dayattı, kart "vantage bağlayıcı mı" demiyor. Kadraj kararının sahibi belirsiz.

### C · jjk_mappa · "Gece Bekçisi" s2 (kibrit/tırnak izleri) — FINAL PROMPT (r0):

> MAPPA-style underexposed 2D cel frame, 1-1.5 stops below standard cel: the figure carries flat 3-step cel values with a cold rim edge, the station behind is a crushed near-black painted ground — flat-cel figure against painted darkness is the medium split. 50mm eye-level medium view: a 55-year-old night watchman — grey mustache, worn old coat, tired but upright posture — stands in profile on a dark abandoned metro platform, a struck match flaring in his cupped hands; the platform edge and one tiled column read as near-silhouettes in deliberate negative space around him. The match is the only light source: a small warm-amber sphere of light around his hands and face, everything beyond its radius falling into cold blue-black; on the wall beside him, just inside the flame radius, clawed scratch grooves in the plaster catch the amber light as raking micro-shadows. His eyeline crosses the flame to the scratches — the frame reads: the light, the man, and what the light has just found. Detail: coat fabric pilled and worn at the cuff nearest the flame; the match head still sputtering a point of white; the scratch grooves throwing thin raking shadows up the wall. Palette regime: very low key, high contrast, cold blue-black shadow bias with one warm amber accent zone — no broad key, no flat even light, midtones nearly absent. Clean motion-ready still, frozen half a second before the flame steadies. Negative: no named franchise character or technique, no photoreal skin, no soft gradient fill, no text.

Hüküm: dördün en sineması — ama bunun kaynağı sistem DEĞİL, beat'in kendi dramaturjisi (tek ışık
kaynağı + görünen iz). Sistemin katkısı çelişkiydi: paletteAsLight "broad saffron key, NO menace"
bu sahneye girmemeliydi; ajan dünya fiziğini seçip paleti risks'e yazdı — bu kararın hukuku sistemde
tanımsız (jüri "NO menace uygulanmamış" diye REJECT de basabilirdi).

### D · product_brand_real · "ARDIÇ Reklam" s2 (makro logo damlası) — FINAL PROMPT (r0):

> 100mm macro at f/4, locked tabletop hero angle. Photoreal Turkish product-hero commercial frame: real glass, real liquid physics, no grade tricks. A dark-green glass bottle with a long neck stands on a near-black seamless field; embossed on the glass body, the brand mark ARDIC in squared serif letterforms with a three-juniper-berry badge above it, the emboss reading as raised glass relief, not print; the cap is matte black metal. One condensation drop slides down the neck and is crossing the top serif of the embossed logo — its meniscus stretching over the relief edge, refracting a thin line of the rim light as it passes. A soft gradient key from behind-left wraps the bottle shoulder; fill sits two stops under so the shadow side stays open but dim; a single sculpted rim highlight runs the bottle profile and separates it from the black field; the glass shows true refraction of the dark set, the liquid inside answering the key as one calm caustic band on the field. Detail: micro condensation beads clustered on the shoulder above the drop trail; the drop leaves a cleared dark-glass path behind it; the matte cap swallows the key with only a faint brushed-ring sheen. Palette regime: near-black field, controlled neutral speculars, restrained warm accent held in the liquid tone — sculpted, quiet, luxury restraint: black holds, gold whispers, nothing moves but the drop. Clean motion-ready still, frozen half a second before the drop clears the last serif. Negative: no printed label or added text beyond the embossed mark, no fake gloss or wax surface, no floating overlay, no English signage.

Reklam özel hükmü — marka/slogan/ürün kilitleri ulaştı mı: **yarım ulaştı.**
(1) brandKitLock ajan context'ine kusursuz ulaştı ve prompt'a geometri olarak girdi (yeşil cam,
kabartma köşeli serif, meyve rozeti, mat siyah kapak) — AMA yalnız elle state yazıldığı için;
UI'dan bu kilit bugün kurulamıyor. (2) Director mandate (product proof + tabletop macro + luxury
quiet) mamiDirective olarak geldi, APPLIED receipt'lendi ve karede fiziksel karşılık buldu ("black
holds, gold whispers"). (3) SLOGAN KAYIP: s5'te site NO_TEXT kilitledi; slogan hiçbir karede
yazı olarak var olamıyor. (4) "ARDIÇ"taki Türkçe İ için referans görsel yok — dürüst ajan FACT
sınırına yazdı; brand-kit'in görsel referans kanalı (Kling Element/ref image) bağlı değil.

### Endüstri kıyası (NB2 image + Kling 3 i2v — dış kaynak taraması)

| Endüstri (kaynaklar altta) | Bizim prompt | Fark kritik mi? |
|---|---|---|
| NB2: özne ilk ~15 token içinde | 4/4 prompt lens/medium cümlesiyle açılıyor; özne 2. cümlede | ORTA — kontratın "numeric lens early" maddesi ile NB2'nin "subject first" önerisi çekişiyor; HİPOTEZ: kare ile A/B'lenmeli |
| NB2: cümle yaz, tag yazma; "realistic" yerine lens+ışık | Birebir uyumlu (kontratın en güçlü yanı) | Uyum |
| NB2: render edilecek metni çift tırnakla ver, 3-5 öğe, büyük punto | Sistem metin sahnesini komple köreltiyor (s5 NO_TEXT) — NB2'nin güçlü text-render yeteneği hiç kullanılmıyor; kontratta tırnaklı-metin kuralı yok | KRİTİK (reklam hattı için) |
| Kling: tek ana aksiyon, sahneyi basit tut | motionQuality "exactly one single-action arc" birebir | Uyum |
| Kling: görünüşü değil hareketi tarif et; start-frame anchor | Engine dialect "describe only what changes" birebir | Uyum |
| Kling 3 Omni: native audio'yu prompt sonunda fiziksel seslerle ver | SFX-spine yasası uyumlu; bizim motion prompt'ta ses satırı sonda | Uyum |
| Kling 3: [Character/Voice] etiketiyle lip-sync mümkün | still-lips yasası bunu bilinçli kapatıyor (VO=ElevenLabs) | MEŞRU ürün kararı, cehalet değil |

Kaynaklar: [Google Cloud NB prompting guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana) · [invideo NB2 guide](https://invideo.io/blog/nano-banana-2-prompt-guide/) · [fal NB2 tips](https://fal.ai/learn/tools/how-to-use-nano-banana-2) · [fal Kling 3.0 guide](https://blog.fal.ai/kling-3-0-prompting-guide/) · [vicsee Kling 3 i2v](https://vicsee.com/blog/kling-3-prompts) · [atlabs Kling 3 guide](https://www.atlabs.ai/blog/kling-3-0-prompting-guide-master-ai-video-generation)

---

## SİNEMA TESTİ (Mami'nin ana sorusu)

Tek cümle özet: **sistem BASIC BULLSHIT üretmiyor; ama sinemayı da sistem üretmiyor — sinema
beat'ten geliyor, sistem onu bozmadan geçiriyor ve kadraj kararını round-robin'e bırakıyor.**

1. **Kadraj bir karar mı?** HAYIR — kanalın kararı. Vantage siteden round-robin geliyor (B'de dalga sahnesine 85mm close, D'de makro beat'ine 50mm medium). Ajan kartında "vantage'ı yorumla/чık" hukuku yok; itaatkâr ajan yanlış kadrajı basıyor (B), beat'i okuyan ajan vantage'ı çiğniyor (D — hangisi doğru davranış, tanımsız). Kadraj bugün ne sitenin bilinçli seçimi ne ajanın özgürlüğü: sahipsiz.
2. **Dramaturji:** beat taşıyorsa prompt taşıyor. C'nin "the light, the man, and what the light has just found" cümlesi karede soru kuruyor (SİNEMA); A'nın "her eyeline lands on the wire" cümlesi bilgi veriyor (doldurma değil ama soru da değil). Sistem dramaturjiyi ne istiyor ne ödüllendiriyor; kontratın hiçbir maddesi "kare bir soru sorsun" demiyor.
3. **Detaylar sahneye özgü mü?** Çoğunlukla evet (ıslak gömleğin kola yapışması dalga beat'inden, damlanın serif üstünde gerilmesi logo beat'inden doğdu). AMA 4/4 tekrar eden İSKELET kalıpları var — kontratın mekanik izi: "Clean motion-ready still, frozen half a second before …" (4/4 aynı cümle şablonu), "Palette regime: …" (4/4), "Detail: x; y; z" üçlü listesi (4/4), medium-split beyan cümlesi (4/4). Bu cümleler motor için işlevsel ama dört farklı filmin prompt'u yan yana konunca aynı elin form doldurduğu görülüyor.
4. **Dünya yaşıyor mu?** EVET — bu sistemin en güçlü yanı. Sky-engine (B), underexposed-rim (C), clearcoat/refraction fiziği (D) etikete değil davranışa çevrildi; worldPacket fizik alanları (M2 ayrımı) ajan elinde gerçekten çalışıyor.
5. **Kontrat-kafesi hükmü:** İSKELET, tabut değil — üç çürük çubukla: (a) 2D-medium maddesi 3D dünyada tabutlaşıyor (A'da bir tam revizyon turu yedi ve prompt'a bilgi taşımayan bir cümle soktu); (b) round-robin vantage yaratıcı kadraj kararını gasp ediyor; (c) zorunlu kapanış/palet/detay şablonları prompt'ları tekdüzeleştiriyor. Maddeleri doğal sinemaya eriten prompt (C: palet rejimi alevin fiziğiyle aynı cümlede) ile maddeyi sırayla dolduran prompt (A: "Medium split:" diye başlayan kontrat-susturma cümlesi) arasındaki fark, maddenin sahneyle çakışıp çakışmamasında — ajanın yeteneğinde değil. Kök neden kontratın kendisi değil, kontratın DÜNYA-KÖRÜ uygulanması.

Senaryo hükümleri: A **KARIŞIK** (ışık sinema, medium-split cümlesi form) · B **KARIŞIK** (deck-tilt aksı sinema, 85mm kadraj sakat) · C **SİNEMA** · D **SİNEMA** (tür standardında güçlü; slogan kaybı ticari değeri düşürüyor).

---

## COMMAND AŞAMASI USER DENEYİMİ (sancı raporu — Mami rutini bizzat)

Adım listesi (bir sahnenin tam ömrü): export → klasöre koy → `--file` → `--approve-storyboard --scene N`
→ `--scene N` → `--launch --provider claude` (rol oturumu) → ARTIFACT doldur → SESSION.md'deki seal
komutu → tekrar `--scene N` → jüri turu (aynı 4 adım) → kare üret/`--import-frame --verdict APPROVE`
→ frame_jury turu → motion turu ×2 → COMPLETE. Rol başına 3-4 komut; 5 rollü sahnede ~18-20 komut.

Sürtünmeler (yaşananlar, önem sırasıyla):
1. [KRİTİK] Zincir bittikten sonra `--export-image-bundle` ve yeni kare `--import-frame` kalıcı kırık + mesaj yanlış ("current frame receipt yok") — üstte detaylandı. Bir kez frame_jury yazıldı mı sahnenin karesi sonsuza dek o.
2. [ORTA] Keşif deneyimi: `cmd-ruzgar.json` gibi bir adla dosya bulunmuyor; hata "0 aday; --file kullan" — hangi kalıbı aradığını (`*_mamilas_command.json`) söylemiyor. Çıplak `mamilas-command <proje adı>` da aynı hatayı veriyor (ad argümanı yok sayılıyor). `--help` yok.
3. [İYİ] Türkçe + boşluklu path ("Projeler/Rüzgar Elektriği", "ARDIÇ Reklam") macOS'ta HER adımda sorunsuz; SESSION.md'deki seal komutu kopyala-yapıştır VERBATIM çalıştı (tırnaklama doğru).
4. [İYİ] Hash uyuşmazlığı hiç yaşanmadı: UI'dan inen 4 command'ın 4'ü de ilk validate'te PASS; bozuk template mühürlenirse bir sonraki koşumda net alan listesiyle reddediliyor ("image prompt, promptHash, interpretation receipt eksik…" — yol gösterici).
5. [ORTA] `--scene N` çıktısı JSON-makine dili; Mami için "şimdi ne yapmalıyım" cümlesi yok (action.kind'ı yorumlamak kullanıcıya kalıyor). AWAIT_FRAME'de "kareyi şuraya koy, şu komutu koş" denmiyor.
6. [DÜŞÜK] Her rol için `--launch` zorunlu ritüel; launch başarısız oturumda bile workspace'i doğru kuruyor (bu iyi) ama başarı mesajı yok, hata metni ("oturum tam bir yeni artifact üretmeli; bulunan 0") ilk kez göreni suçlu hissettiriyor.

approvedLessons katmanı DOĞRULANDI: APPROVED.md'ye yazılan test dersi launch anında author
CONTEXT.json'una `approvedLessons` olarak girdi (jürilere boş dizi gidiyor — tasarıma uygun);
test dersi geri alındı, dosya temiz.

---

## AJAN SİSTEMİ İSTİŞARESİ (rol rol — rolün ağzından)

**image_author (A/B/C/D'de oynandı):** "Kartım net ve iyi yazılmış — FRAME-BUILD sırası gerçekten
prompt yazdırıyor. CONTEXT'te aradığımın çoğu var: beat verbatim, dünya fiziği ayrıştırılmış, kilitler
açık. BULAMADIKLARIM: (1) motor kaçınmaları — failureModes hep null, oysa pakette duruyormuş;
(2) palet ile dünya çatışınca kimin kazanacağı — otorite sırası bende yok, PROTOCOL'de de yok;
(3) vantage'ın hukuku — architecture.imageVantage'a uymak zorunda mıyım? Kart susuyor. (4) 2D-medium
maddesi 3D dünyamda beni suçlu doğurttu; bastırma kanalım yok çünkü ortada direktif yok — risks'e
yazdım, jüri yine de kesti. İlk 30 saniyede ne yazacağım netleşiyor mu: EVET — shot+world+locks
üçgeni yeterli; 16KB'ın kalanı (protocol tekrarı, ref katalogları) taramayla geçiliyor."

**image_jury (A'da REJECT+PASS, B/C/D'ye hazır):** "Kartım beni cetvel yapıyor: 'her karşılanmayan
madde exact failing check'. A r0'da 2D-medium maddesini kesmek ZORUNDAydım — madde dünyayla çelişse
bile, çünkü bastırılmamıştı ve bastırma hakkı yalnız direktiflere tanınıyor. Kontratın kendisi hatalıyken
benim elimde 'bu madde bu dünyada geçersiz' deme yetkisi yok — bu yetki tanımlansın ya da madde
dünya-farkında olsun. Author'ın interpretation'ını ve risks'ini görüyorum (iyi); onun görmediği bir
şeyi ben de görmüyorum (simetri iyi)."

**frame_jury (A'da oynandı — plumbing PASS, gerçek hüküm değil):** "Karta göre kareyi kendim açıp
piksel okuyacağım — localPath/storedFile geldi, açtım. Ama REJECT'imin sonucu tanımsız: PASS değilse
akış FACT_REQUIRED'a düşüyor ve Mami yeni kare de yükleyemiyor (import kırık). Kararımın tek meşru
çıkışı PASS — bu, jüriyi süse çevirir. Bir de: sentetik/yanlış kare bana kadar GELEBİLDİ; Mami APPROVE
verdikten sonra tek gerçek göz benim, ama elimde 'kare prompt'la örtüşmüyor ama teknik temiz' diyecek
ara verdict yok."

**motion_author (A'da oynandı):** "Kural net: yalnız karede olan. Ama image_author'ın interpretation'ı
(frozenInstant: 'yarım saniye sonra ne olacak') bana GELMİYOR — kareyi ve beat'i alıp niyeti yeniden
tahmin ediyorum. Kling'e 'start frame is truth' demek doğru; ama frozenInstant tam olarak 'sonraki
yarım saniyenin' tarifiydi — ölü kanal. SFX-fiziği ve tek-hareket yasaları yazdırırken gerçekten iyi
hissettiriyor; kontratın en olgun köşesi motion."

**motion_jury (A'da oynandı):** "Ben author'ın GÖRMEDİĞİ imagePromptArtifact'i görüyorum — author'ı
hiç görmediği bir belgeyle yargılayabilirim (asimetri). Tetik-kelime taraması, envanter-kare eşleşmesi,
tek-hareket kontrolü ölçülebilir ve mekanik uygulanabilir maddeler — kontratın bu kısmı laf kalabalığı
değil, gerçek cetvel."

**Faz geçişleri / ölü kanallar özeti:** jüri→author bilgi akışı sağlıklı (interpretation+risks
görünür); image→motion geçişinde `interpretation.frozenInstant` ölür (tasarım karşı-savı: frame-is-truth);
`failureModes` kanalı doğuştan ölü (alan adı uyuşmazlığı); `approvedLessons` yalnız author'lara dolu
gider (tutarlı); motion_jury'nin imagePromptArtifact görmesi author'a görünmeyen bir yargı zemini
yaratıyor (bilinçli mi, belirsiz).

---

## COMMAND BÜTÜNLÜĞÜ (İÇERİK-4)

- 4 UI-export command'ın 4'ü runner validate'inden İLK seferde PASS (schema, commandId=hash(baseDecision), protocolHash, storyboardHash, sceneContextHashes tutarlı).
- mamiDirectives dürüst: D'de directorBrief → `site-directive-001` SITE projeksiyonu birebir; A/B/C'de boş dizi (director atlanınca sessizce boş — doğru davranış). Runner, SITE projeksiyonunu ve LIVE_CHAT id türetimini gerçekten doğruluyor (validateCommand:201-226).
- deliveryPromise: A'da `{kind: "pedagogy_auto"}` — dürüst ama snapshot'ta yalnız jüri-dışı roleDecision'a giriyor; image_author bu vaadi hiç görmüyor (küçük ölü kanal adayı; pedagojik vaat kareye etki edecekse kanal eksik — HİPOTEZ).
- Tamper denemesi yapılmadı (Sol'un alanı); ama bozuk/yarım template mühürleme denendi: sonraki koşumda alan-listeli net redle yakalandı.

---

## SONUÇ

**En can alıcı 3 bulgu:**
1. **Runner'ın frame-sonrası kilidi** (export-image-bundle + import-frame kalıcı kırık, mesaj yanlış; frame_jury REJECT'in çıkışı yok) — mamilas-command.mjs:771/:780/:577. Mami'nin "kareyi değiştireyim" dediği ilk gün duvara çarpacak.
2. **Reklam hattının üç kanayanı birden:** brandKitLock'un UI'sı yok + slogan/ekran-yazısı beat'i NO_TEXT'e köreltiliyor + NB2'nin text-render gücü kontratta hiç yok. Mami'nin para kazandığı türde sistem bugün marka kilidi kuramıyor ve slogan basamıyor.
3. **Ölü/çelişik ajan kanalları:** failureModes null (avoid≠negatives alan adı, iki yüzeyde aynı hata), paletteAsLight seçili paleti "world" kılığında taşıyıp dünya fiziğiyle çelişebiliyor (öncelik beyanı yok), 2D-medium kontrat maddesi 3D dünyada karşılanamaz → jüri REJECT üretti.

**"Yapamazsın" şikayetinin en olası kök neden hipotezi:** Sistemin duvarları iki sınıfa ayrılıyor.
Meşru kapılar (frame gate, bundle doğrulama, sidebar) açıklamalı ve sağlam. Şikayeti üreten sınıf ise
"tek yönlü kapılar": bir aşama geçildikten sonra GERİ/YENİDEN yolu ya kodda yok (frame değiştirme,
bundle alma, frame_jury REJECT) ya da var ama yanlış hata mesajıyla gizli ("current frame receipt yok"
— receipt orada; "0 aday" — aranan kalıp söylenmiyor; "Teslimi aç" — tıklanıyor, hiçbir şey olmuyor).
Yani sistem hayır demiyor; YANLIŞ SEBEPLE hayır diyor veya sessiz kalıyor — kullanıcı bunu "kendini
kapattı" diye yaşıyor. Çözüm yönü: her duvar ya gerçek sebep cümlesi taşımalı ya da bir geri-dönüş
komutu sunmalı (özellikle frame replace yolu).

**UI mevcut görsel durumu (nötr envanter, 5 satır):**
1. Genel sahne: golden-hour degrade (turuncu-mavi ufuk) tam-ekran arka plan üstünde koyu, yarı saydam cam panellerden oluşan "STUDIO CONSOLE 2026" düzeni; sol dikey sidebar 4-5 numaralı aşama kartı, sağda "ÇİZİM EKRANI / LIVE CANVAS" sütunu.
2. LIVE CANVAS kartında dünya seçilene dek altın kabartma MAMILAS monogram plakası; dünya seçilince 4 statik arketip görselinden biri + "STİL ARKETİPİ · gerçek kare değil" rozeti + palet hex çipleri (1D3557 vb. ham hex UI'da görünüyor) + CAM/LIGHT/STAGE metin blokları.
3. Sağ altta SOURCE GATE kartı (BEKLİYOR/PASS, coverage yüzdesi, RAW/RECON hash kısaltmaları), sol altta ÜRETİM DURUMU karesi (% READY + SONRAKİ ADIM butonu), sağ üstte "AKVARYUM MODU" toggle'ı.
4. Timeline'da 96'ya kadar ölçeklenen numaralı film şeridi (INT/BLD/CLX/RES faz rozetleri, süre etiketleri, OVER LIMIT ⚠ glifi), altında EXPORT düğme sırası ve sahne listesi; QA'da 7 içses kartı (VISUAL CALCULUS, INLAND EMPIRE…) PASS/FIX rozetleriyle konuşma sırası düzeninde.
5. Dashboard'da Phase-0 arketip kartları küçük görsel küpürlerle iki hat halinde ("GÜNLÜK HAT — REKLAM & EĞİTİM" / "SET ARŞİVİ"); genel tipografi: serif başlık (Hikayenin omurgası) + tracking'li küçük caps etiketler; animasyonlu geçişler cross-fade.

**Kanıt dizini:** scratchpad `01-dashboard.png, A0-*, B1-B4, C1, D1, E1-E2, F1-F3, G1, H*, cmd-*.png`;
komutlar `cmd-{ruzgar-elektrigi,fener-adasi,gece-bekcisi,ardic-reklam}.json`; tam rol zinciri
`Projeler/Rüzgar Elektriği/.mamilas/artifacts/4-*.json` (author r0/r1, jury r0 REJECT/r1 PASS,
frame_jury, motion_author, motion_jury) + `Projeler/{Fener Adası,Gece Bekçisi,ARDIÇ Reklam}/.mamilas/`.
