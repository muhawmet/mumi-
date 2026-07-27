---
name: project-mamilas-nano-banana-kalite-2026-07-24
description: "Nano Banana 2 / Firefly kalite runı bulguları — hangi dünya metin-only stil kilitliyor, hangisi ref/isim gerektiriyor. One Piece metinle tutmuyor."
metadata: 
  node_type: memory
  type: project
  originSessionId: 22f90c66-cd91-486e-b32d-32ee7112bd7f
  modified: 2026-07-23T18:58:39.577Z
---

# Nano Banana 2 / Firefly kalite runı — dünya stil-kilidi bulguları (2026-07-24)

**Bağlam:** Mami usage sıfırlanmadan kalite runı yaptı. Gerçek `worldPacket` (ajanın gördüğü
temiz fizik alanları, prop'lar `splitRenderLawPhysics` ile ayrılmış) + Nano Banana Pro yapısı
(`[özne+sıfat][aksiyon][mekân]→kamera→ışık→stil→negatif`) ile 2 kopyala-yapıştır prompt yazıldı,
Mami Firefly'da elle üretti. Promptlar: `artifacts/test-drive/nano-banana-2-prompts.md`.

## ÖLÇÜLEN SONUÇ (gerçek kare, Mami üretti)

- ✅ **rick_morty_scifi: KUSURSUZ.** Boiling wobble-line, noodle-limb, tek toxic-green portal pop,
  murky-olive lab, deadpan yüz+ter damlası — birebir Adult Swim. Metin-only prompt YETTİ.
  Tek ufak: "DENEY ODASI" iki satıra bölündü ("ODASI") → prompt'a "single line" eklendi.
- ❌ **one_piece_toei: REZİL.** Toei-cel DEĞİL — batı graphic-novel look'a kaydı: gradient shading,
  cross-hatching, gerçekçi anatomi, sinematik gökyüzü. Prompt "no gradient/no realistic anatomy"
  DEDİ, model DİNLEMEDİ. Metinle Toei-cel yakalanmıyor (look çok spesifik, Firefly default'a düşüyor).

## KÖK BULGU

**Bazı dünyalar metin-only stil kilitlemiyor.** Rick&Morty look'u o kadar kendine-özgü ki isim
olmadan tutuyor; One Piece/Toei-cel gibi "flat 2-value cel + poster-primary" disiplini metinle
tarif edilince Firefly onu graphic-novel'a çeviriyor. Çözüm = **stil-referans görseli** ya da
**isim-referansı** ("in the style of One Piece").

## ÇÖZÜM BULUNDU — One Piece (2026-07-24, iteratif)

One Piece metin-only tutmuyordu. 4 iterasyonda çözüldü:
- v1 (isimsiz, "no gradient/no realistic"): REZİL — batı graphic-novel'a kaydı.
- v2 (isim eklendi "style of One Piece"): iyileşti ama yarı-gerçekçi anatomi kaldı.
- v3 (KRİTİK: "WILDLY exaggerated Oda anatomy — dev omuz/kocaman el/ince bel + GIGANTIC açık
  ağız/balon göz/rubber-cartoon face"): TUTTU. Gerçekçi "keeper" istemek One Piece'i öldürüyordu;
  Oda'nın abartılı karikatür anatomisi ŞART. Web'den doğrulandı: Oda = "no rules" abartılı proporsiyon,
  bold line, aşırı mimik, poster-doygun bol renk.
- v4 (Mami "texture/render olarak Elbaf de"): açılışta "authentic One Piece anime screenshot, Elbaf
  Saga" + ayrı "RENDER/TEXTURE (key)" bloğu → flat cel paint surface, zero gradient/airbrush/hatching/
  realistic-skin-texture. Yüzey kilidi.

- v4 (isim+"authentic One Piece Elbaf screenshot"): **TELİFE TAKILDI (Firefly reddetti).** IP adı +
  "birebir aynısı" = telif filtresi. İsim yolu ÖLÜ — sürdürülebilir değil, hem Mami'nin kendi
  firewall'una (negativeLock "NO any named One Piece character") ters.
- v5 (ÇÖZÜM: isim TAMAMEN çıkarıldı, sadece STİL GRAMERİ): "classic shonen grand-adventure style"
  + "wildly exaggerated cartoon anatomy" + flat-2D-anime-cel texture bloğu. Asıl işi yapan
  anatomi+cel-texture'dı, isim DEĞİL. Telif-temiz + firewall-uyumlu.

**One Piece prompt reçetesi (KANITLI, telif-temiz):** İSİM YOK. abartılı-karikatür-anatomi(dev
omuz/kocaman el/ince bel) + abartılı-mimik(açık ağız/balon göz) + ayrı texture/render bloğu(flat
cel, zero gradient/airbrush/hatching/realistic-skin) + poster-doygun renk + "NOT 3D/painterly/
western/realistic". Promptlar: `artifacts/test-drive/nano-banana-2-uzay-epik.md`.

**GENEL DERS:** IP ismini prompta koymak = (a) telif reddi (b) tek-kare hile (c) firewall ihlali.
Sürdürülebilir yol = STİLİ ÇAĞIR, ESERİ DEĞİL. Görsel gramerin KENDİSİNİ tarif et. Bu, worldPacket'in
render_law disiplininin zaten yaptığı şey — sorun tarif değil, motorun onu metin-only tutmaması.
Kalıcı sistem çözümü: stil-referans-IMAGE kanalı (kendi ürettiğin telif-temiz stil karesini ref ver).

## One Piece YÜZEY düzeltmesi (v6, plastik→mat cel)
- v5 iyiydi ama Mami "plastik/çizgi-roman" dedi (gerçek OP kareleriyle kıyas: gölge yumuşak-degrade,
  çizgi fazla-dijital, renk gloss'lu). KÖK = YÜZEY, kompozisyon/anatomi değil.
- v6 ÇÖZDÜ: ayrı "SHADING (critical)" bloğu → "exactly ONE hard shadow step, crisp boundary,
  NO soft gradient/airbrush/volumetric-3D/glossy-plastic, matte gouache cel" + LINE "slightly
  organic hand-drawn, NOT clean vector". Mat film-boyası geldi, plastik gitti. Firefly render'a
  meyilli → %100 için stil-referans-IMAGE gerekir ama v6 metnin son noktası.

## KARAKTER "EFE" (özgün, tekrar üretilebilir — telif-temiz)
- Genç Anadolu korsanı, Oda-abartılı atletik anatomi, geniş sırıtış. Normalde SİYAH saç.
- **Awakened/beyaz form (Gear-5 ENERJİSİ, isim YOK):** bembeyaz saç yukarı savrulur, ışıltılı
  beyaz-pembe ten, parlak gözler, lastik-özgürlük kahkahası, beyaz cartoon shockwave halkaları.
- İşaret: boyunda kırmızı boncuk dizisi + sarı bel kuşağı + kırmızı-altın açık ceket.
- Gear-5 telif-temiz reçetesi: "AWAKENED radiant white form + impossible rubber curves + cosmic
  freedom cackle + white shockwave rings" — Nika/Luffy/Gear5/SunGod adı ASLA yazılmaz.

## MOTOR SEÇİMİ — GPT Image 2 vs Nano Banana 2 (KANITLI, 2026-07-24)
Mami'nin ikisi de var (ofis GPT kullanıyor). Efe/Gear-5 uzay karesi İKİ motorda denendi:
- **GPT Image 2 DAHA İYİ** oldu tek-kahraman, akıcı-dinamik, dolu-hareket, "ruh" karesinde.
  GPT'nin promptu BASİTLEŞTİRMESİ burada YARDIM etti (aşırı-kural yığını yerine sahne ruhunu tuttu).
- Web bench: Nano Banana genel 9.3 > GPT 8.6 (photoreal/yumuşaklık); GPT metin ~%100 (Nano zayıf).
- **KARAR:**
  · Efe gibi tek-kahraman/akıcı-dinamik/"ruh" karesi → **GPT Image 2**.
  · Çok-kurallı/statik-kompozisyon/worldPacket-sadık kare → **Nano Banana 2** (daha sadık, sistemle uyumlu).
  · Yoğun+doğru Türkçe metin (afiş/tabela) → **GPT Image 2** (Nano metni bölüyor: "DENEY ODASI" kırıldı).
- ⚠️ Uyarı: Efe promptu TEK dilde (yapısal blok) yazıldı, GPT'ye özel sürüm YOKTU; yine de GPT iyi çıktı.
  Bu, "GPT basitleştirir hep zayıflar" ön-yargısını çürüttü — iş türüne bağlı.

## Rick&Morty (ÇÖZÜLÜ, tekrar üretme)
- İsimsiz portal karesi zaten kusursuzdu. "flat TV cel"+isim → SVG'ye kaydırdı.
- Uzay karesi (astronot + tentaküllü cosmic-horror, "boiling wobble NEVER clean vector NEVER SVG"):
  KUSURSUZ. Bu dünya bitti.

## MAMİ KARARI (2026-07-24)

- Mami: "promptun İÇİNE One Piece / Rick and Morty adını referans ver." → isim-referanslı v2
  prompt verildi (One Piece'e "NOT graphic novel, NOT realistic, NO cross-hatching" sertleştirmesi).
- ⚠️ **ÇELİŞKİ (kayıt için):** Bu, sistemin kendi `negativeLock`'una (`NO any named One Piece
  character`) ve tüm IP firewall'una (`scrubRefFieldIP`, `COMMERCIAL_BRAND_RE`) TERS. Mami tek-kare
  Firefly testinde kendi riskiyle yapıyor. **Sisteme yasa olarak KOYULMADI** (Mami "şimdilik not al,
  sistem değişikliği ayrı oturum" dedi). Firewall bugün OLDUĞU gibi duruyor, koda dokunulmadı.

## SİSTEME TAŞIMA (ayrı oturum — bugün YOK)

- Açık soru: One Piece gibi "metin-only tutmayan" dünyalara **stil-referans-image kanalı** lazım mı?
  Sistemde @-ref / reference-image kanalı var mı ölç ([[mamilas-magnific-char-refs]] notu vardı).
  Telif-temiz yol: önce KENDİ ürettiğin Toei-cel STİL karesi (karakter yok) → onu ref ver.
- Bu bulgu ZEKÂ RUNU'na girer: worldPacket render_law'ı doğru ama motor onu tutmuyorsa, sorun
  tarif değil TESLİM kanalı (text vs image-ref). [[project-mamilas-zeka-run-2026-07-23]] ile ilişkili.

İlgili: [[project-mamilas-zeka-run-2026-07-23]] · [[mamilas-magnific-char-refs]] ·
[[mamilas-physical-medium-law]] · [[mamilas-test-drive-mode]]
