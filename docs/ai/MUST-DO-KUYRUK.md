# MUST-DO KUYRUĞU — usage dolduğunda buradan devam edilir

> Mami'nin emri (2026-08-06): *"usageın bittiği yere bak, onları must do diye al köşeye,
> veri toplayalım."* Bu dosya **karar kuyruğudur**, otorite değil; her madde ya yapılır ya
> Mami tarafından düşürülür. Sıra önemli: yukarıdakiler tarlayı açan, aşağıdakiler duvar örenler.

## 1 — Tarlayı açan işler (önce bunlar)

- [ ] **Element mutfağı.** Magnific kütüphanesi BOŞ (`library_list` → 0). Tekrar eden her element
      bir kez tasarlanır → gözle onaylanır → id'si projeye yazılır. Süreklilik bu olmadan MCP
      hattından kurulamıyor; tek yol `references:[{type:"image", identifier}]`.
      30 saniyelik bir işte 18 element demek = 18 raf kaydı.
- [ ] **`kare-cek.mjs`** (~40 satır): `<film> <t1-t2> [n]` → n kare PNG + o aralığın whisper
      transkripti. Üç kademeli gözün HAKEM ayağı. Parçalar elde: ffmpeg · whisper · `Read`.
      Donma ölçümü **ortalama mutlak fark** ile (md5 yalnız birebir aynıyı yakalıyor).
- [ ] **Gün sonu SORU-CEVAP kapısı.** `current-work.mjs kapat`'a bağlanır: 8-12 soru, ölçümden
      türetilmiş (hangi kare recreate edildi · hangi motion revize aldı · hangi lint yanlış çıktı),
      cevaplar **kareye bağlı ders adayı** olur. Tetikleyiciler: Mami'nin kelimesi ("bitti",
      "teslim ettim", "kapatalım") · kapatma komutu · kanıtı görüp Claude'un kendi açması.
- [ ] **Recreate oranını ölçmeye başla.** Mami: *"karelerin neredeyse yarısını recreate ediyordum."*
      İlk geçişte tutma oranı sistemin kuzey yıldızı — öğrenme iddiası ancak bu sayı düşerse doğru.
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

## 4 — Mami'nin bekleyen kararları

- [ ] `CANDIDATES-2026-08-06.md` altı ders adayı → ✅/❌
- [ ] `ONAY-BEKLEYEN.md` 12 ders (önceki turdan)
- [ ] Hasat ERROR'ları: *Eşeyli ve Eşeysiz Üreme* (birden çok aday final prompt) · *Kuvvet MİRA*
      (final `_PROMPTLAR` yok)
- [ ] **Yetki devri**: canary'den sonra kalan karelerin onayı Claude'a geçsin mi? (aşamalı olacak —
      Mami 2026-08-06: *"her şey oturunca yetki benden gider, daha kurmadık"*)
- [ ] Kareleri kim basacak: **web/Spaces bedava** mı, MCP'den kredi mi? (60 kare = 4.500 kredi)
