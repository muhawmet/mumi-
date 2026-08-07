# MUST-DO KUYRUĞU — usage dolduğunda buradan devam edilir

> Mami'nin emri (2026-08-06): *"usageın bittiği yere bak, onları must do diye al köşeye,
> veri toplayalım."* Bu dosya **karar kuyruğudur**, otorite değil; her madde ya yapılır ya
> Mami tarafından düşürülür. Sıra önemli: yukarıdakiler tarlayı açan, aşağıdakiler duvar örenler.

## 1 — Tarlayı açan işler (önce bunlar)

- [x] ~~**Element mutfağı.**~~ **2026-08-07: raf BOŞ DEĞİLMİŞ.** Magnific `library_list` gerçekten 0,
      ama **Higgsfield Elements'te 9 element duruyor**: `ogr` · `aras1` · `defne1` · `emin` · `ref` ·
      `iye` · `taoni` · `logo` · `building`. `artifacts/element-rafi.json`'a indekslendi
      (`rota.mjs raf-yaz`). Element `<<<element_id>>>` olarak prompt'a gömülüyor ve **NB2, NB Pro,
      GPT Image 2, Seedream ve Kling 3.0** ile çalışıyor.
      🔴 **Soul ID DÜŞTÜ:** yalnız `soul_2` / `soul_cinema` modellerinde çalışıyor, bizim hattımızda
      (NB2 + Kling 3.0) çalışmıyor. Süreklilik yolu Element'tir, Soul değil.
- [x] ~~**`kare-cek.mjs`**~~ **yazıldı (2026-08-07).** `<film> <aralık> [adet] [--ses]` → kareler +
      transkript; donma **ortalama mutlak farkla** ölçülüyor. Üç kademeli gözün HAKEM ayağı kapandı.
- [ ] **Gün sonu SORU-CEVAP kapısı.** `current-work.mjs kapat`'a bağlanır: 8-12 soru, ölçümden
      türetilmiş (hangi kare recreate edildi · hangi motion revize aldı · hangi lint yanlış çıktı),
      cevaplar **kareye bağlı ders adayı** olur. Tetikleyiciler: Mami'nin kelimesi ("bitti",
      "teslim ettim", "kapatalım") · kapatma komutu · kanıtı görüp Claude'un kendi açması.
- [x] ~~**Recreate oranını ölçmeye başla.**~~ **organ yazıldı (2026-08-07):** `is-emri.mjs` her denemeyi
      kaydediyor, `uretim-defteri.mjs karne` **ilk basımda tutma oranını** basıyor. ⚠ Sayı henüz
      DOLMADI — ilk gerçek üretim turunda dolacak. Organ var demek ölçüm var demek değildir.
- [ ] **Dersleri DOĞRU organa yaz.** Bugünün dersleri hafızaya ve commit'e düştü; ama kare yazılırken
      okunan yer `PROMPT-YASASI` + `APPROVED.md`. Bir ders ikisine de düşmezse kareyi değiştirmiyor.
      → `agents/lessons/CANDIDATES-2026-08-06.md` Mami onayından geçince yasaya işlenir.

## 2 — Ölçüm sınavları (üretim turunun yanına sıkıştırılır, 3-5 tanesi)

- [ ] **Kling 2.6 vs 3.0** — aynı start frame, aynı motion. 225 ↔ 450 kredi. Fark filmi taşıyor mu?
- [ ] **Kling 3.0 referansı kimliği kaç karede kaybediyor?** (character ref ×3, startFrame zorunlu)
- [ ] **Yazının bozulma eşiği** — kamera hareketiyle baked-in yazı kaçıncı saniyede eriyor?
- [ ] **Seedance'ın 52 adlı kamera hareketi** gerçekten çalışıyor mu, yoksa isim mi?
      Çalışıyorsa MAMILAS'ın `Camera:` satırı düzyazı değil **parametre** olur.
- [ ] **Ambiyans farkı** — SFX'li ve SFX'siz aynı klip. Mavişehir'de ölçülen en ucuz kusur buydu.
- [ ] **Higgsfield'da NB Pro unlimited gerçekten geçerli mi?** Yöntem: çağrı öncesi/sonrası bakiye.
      (Magnific'te ölçüldü: `unlimitedAppliesHere:false`, 84.756 → 84.681 tam 75 kredi düştü.)

## 3 — Araç ayarları

- [ ] **RTK: ölçüm ve doğrulama komutlarını dokunulmaz yap** — `grep`, `ffmpeg`, `ffprobe`, `md5`, `wc`
      ham koşsun. Ölçüldü: toplam 79,8M token tasarruf (%90) ama **48,8M'i tek başına vitest**
      (%92,5, sıfır riskli); `grep`+`read` 25,1M ama yalnız **%21 verim** ve kanıt yüzeyini
      filtreliyor. Bugün bir `ls|grep` bileşiği yeniden yazılıp grep çıktısı yutuldu.
      Ayrıca hook'ların RTK'nın yeniden yazdığı komutu tanıdığı doğrulanmalı (`buddy-gate` bir kez
      sağır kalmıştı).
- [ ] **Geçmiş oturumlarda arama.** "Bunu daha önce ölçtük mü?" sorusu bugün cevaplanamadı.
      claude-mem'in otomatik yakalaması ALINMAZ (özet kanıtı değil cümleyi taşır), **arama** alınır.
- [ ] **`dis-goz.mjs sor` derinlik sınırı.** Ölçüldü: devam turu BİR TANE; ikinci takip 3/3
      `status:ERROR`. Sebep kanıtlanmadı (bağlam tavanı en olası). Kural şimdilik: takip soruları
      **tek çağrıda toplu**.

## 3b — BAĞLI AMA HİÇ KULLANILMAMIŞ YÜZEYLER (2026-08-06'da sayıldı)

Hepsi **çağrılabilir** durumda; hiçbiri **ölçülmedi**. Ölçüm yöntemi bugünkü unlimited ölçümüyle
aynı: çağrı öncesi/sonrası bakiye + gözle sonuç.

- [ ] **`higgsfield-soul-id` skill'i makinede KURULU** — yüz eğitip kimlik sabitliyor
      (`reference_id` → `text2image_soul_v2`). Mira/Efe sürekliliğinin muhtemel çözümü.
      Claude bunu iki hafta boyunca söylemedi; **kusur Claude'da** (öneri yetkisi ihlali).
- [x] 🔴 **ADOBE ÖLÇÜLDÜ (2026-08-07) — KURGU MOTORU OLARAK KULLANILAMAZ.** Adobe'nin kendi routing
      belgesi: *"Video trimming to timestamps — **not available**"* · *"Large batch processing
      (>~20 files) — **not available**"* · video araçları **assetId** ister ve *"the assistant
      cannot read or upload files from the user's local machine"* → yerel klip için tek yol
      `asset_add_file()` **dosya seçici**, yani klip başına bir tıklama. `video_create_quick_cut`
      bir **highlight reel** seçicisidir, sekans sırasına dizen timeline değil.
      **Sonuç: kurgu `kaba-kurgu.mjs` (Premiere XML) + `ffmpeg` hattında kalır.** Adobe'den geriye
      kalan tek gerçek aday `media_enhance_speech` (tek VO dosyası, tek tıklama).
      ⚠ Adobe'nin kalan yüzeyini **Mami kendi araştırıyor** (2026-08-07).
- [x] 🔴 **Higgsfield `faceless-channel-video` v2.1 KEŞFEDİLDİ** — anlatıcılı explainer / kids /
      story videosu, 30 sn – 10+ dk, stil kilidi + tekrar kullanılan varlıklar, tek videoyu
      sunucu tarafında bitiriyor. **Tam bizim kategorimiz.** Varlığı ölçüldü, **kalitesi ölçülmedi**;
      Türkçe müfredat sadakati, dünya kilidi ve Mami'nin zevki orada YOK. Yerine geçen değil,
      hızlandırıcı olabilir — ölçüm bir sonraki turda.
- [ ] **Adobe MCP'nin kalan yüzeyi** (Mami araştırıyor): Firefly board · `image_generative_expand` /
      `image_fill_area` (Firefly generative expand/fill) · `image_remove_background` ·
      `image_vectorize` · InDesign/IDML · PDF · Express'e HTML aktarma · `video_create_quick_cut` /
      `video_render` / `video_resize` · **`media_enhance_speech` (VO temizleme)** ·
      `media_summarize` · font önerisi · CC depolama · **`asset_license_and_download_stock`
      (Adobe Stock lisansla+indir — Envato'nun yerine geçebilir)**.
- [ ] **Canva MCP bağlı** — brand kit, brand template, export. Müşteri sunumu ve portfolyo sayfası.
- [ ] **Gmail MCP bağlı** — müşteri briefini okuyup enzim kilitlerine çevirmek, teklif draft'ı.
      ⚠ Mami'ye bildirildi: bu yüzey Claude'a posta okuma yetkisi veriyor.
- [ ] **Higgsfield**: 5.157 kredi · creator plan · Soul ID · video · 3D · dublaj · ses klonlama ·
      upscale · virality predictor · `video_analysis`.
- [ ] **Telefon bildirimi + zamanlanmış koşu** — "ben denizdeyim sen çalış" senaryosunun eksik
      parçası. Batch bitince bildirim, kuyruk oturum olmadan koşabiliyor.
- [ ] **Artifact yayınlama** — Upwork portfolyosu için özel web sayfası (showreel, önce/sonra).
- [ ] **YOK olanlar:** Suno MCP yok (müzik: magnific `audio_music_generate` + Higgsfield Seed Audio) ·
      Envato yok (yerine Adobe Stock) · AtomX yok. **ElevenLabs'e ayrı MCP GEREKMİYOR** —
      magnific `audio_tts` sesleri zaten `provider: elevenlabs`, 10 Türkçe ses hazır.
- [ ] 🔴 **Kural: her yeni videonun açılışında YETENEK TARAMASI.** "Geçen aya göre elimizde ne yeni
      var, akışın hangi adımını kısaltır." Mami sormayacak, Claude getirecek.

## 4 — Mami'nin bekleyen kararları

- [ ] `CANDIDATES-2026-08-06.md` altı ders adayı → ✅/❌
- [ ] `ONAY-BEKLEYEN.md` 12 ders (önceki turdan)
- [ ] Hasat ERROR'ları: *Eşeyli ve Eşeysiz Üreme* (birden çok aday final prompt) · *Kuvvet MİRA*
      (final `_PROMPTLAR` yok)
- [ ] **Yetki devri**: canary'den sonra kalan karelerin onayı Claude'a geçsin mi? (aşamalı olacak —
      Mami 2026-08-06: *"her şey oturunca yetki benden gider, daha kurmadık"*)
- [ ] Kareleri kim basacak: **web/Spaces bedava** mı, MCP'den kredi mi? (60 kare = 4.500 kredi)

## 5 — Motion turunda ÖLÇÜLENLER (2026-08-07, Hayvanlarda Üreme)

- 🔴 **Kling 3.0 "ağız oynamasın" negatifini DİNLEMİYOR.** K01'de negatif satırında
      `talking, speaking, mouth opening, lip movement` açıkça yazılıydı; klipte çocuğun ağzı
      yine de oynadı. Mami: *"oynamayacak ama tekrar üretme, kullanılır."*
      → Kare tasarımında çözülür: konuşmayacak karakter **profilden ya da uzaktan** kadrajlanır,
      ağız kadrajın hâkim noktasında bırakılmaz. Negatif tek başına yetmiyor.
- ✅ Ölçülmüş temiz-klip reçetesi K01'de tuttu: karmaşık uzuv hareketi YOK · mikro jest VAR
      (toz, tüy, tek nefes, pençe gerinmesi) · kamera kilitli + birkaç santim push-in.
      `kare-cek` cetveli: komşu kare farkı 14.9–15.75, donma eşiği 0.6 → **donma YOK**.
- 🔴 **Medya yeri KURAL** (Mami, 2026-08-07): kare repoda kalır; **video · ses · kurgu**
      `~/Desktop/6. Sınıf Animasyonlar/<proje>/` altında yaşar → `KLIPLER · SES · KURGU · RENDER`.
      Revize geldiğinde ikisi de aynı yerden bulunur.
- 🔴 **Yazı hükmü tam çözünürlüklü kırpmadan verilir.** Bu turda iki kez küçültülmüş görüntüden
      "diakritik yok" dedim, ikisinde de vardı; üçüncüsünde kırpma penceresi harflerin üstünü
      kesti. Kendi cetvelimi yanlış tuttum. Şüphede kalırsa hüküm verilmez, Mami'ye sorulur.

### 🔴 KAMERA TEKDÜZELİĞİ — motion'ın "kurgu çok basic"i (Mami, 2026-08-07)
Mami: *"kamera hep slowly push in vibeında, haberin olsun."* Üç klibin üçü de aynı hareketle
basıldı. Sebep: temiz-klip reçetesi ("kamera sabit ya da çok düşük genlikli") kamera
GÜVENLİĞİNİ anlatıyor, kamera ÇEŞİTLİLİĞİNİ değil — ben ikisini karıştırdım.
**Kural: düşük genlik korunur, ama hareket TÜRÜ sekans içinde döner.** Ölçülmüş güvenli havuz:
  · çok yavaş push in     · çok yavaş pull out (nefes verme, sekans kapanışı)
  · birkaç santim yanal kaydırma (yeni bir şey ortaya çıkacaksa)
  · kilitli kamera, sıfır hareket (vuruş anı; en güçlüsü, en az kullanılanı)
  · çok hafif aşağı/yukarı yerleşme (karakter oturuyor/kalkıyorsa)
Aynı hareket **arka arkaya ikiden fazla** karede kullanılmaz. Kilitli kamera bir kusur değil,
ritmin nefesidir — L/J kesim yasasının motion'daki karşılığı.

### Ölçülen motor kusuru — sürü sonda eriyor
K11'de sperm sürüsü klibin SONUNA doğru eriyor (Mami: *"sonda sürünün eridiğini gör, ama
kullanılır"*). Kling çok sayıda küçük ve benzer nesneyi klip boyunca sayıca koruyamıyor.
→ Kalabalık sürü karelerinde klip **kısa tutulur** (4-5 sn) ya da sürü kadrajın uzağında
bırakılır; kahraman nesne yakında ve tek başına net kalır.
