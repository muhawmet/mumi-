---
name: mamilas-agy-video-gozu
description: "AGY = Claude'un olmayan duyusu VE eli (görsel üretir, video üretemez) — yetenek/sınır tablosunun tek otoritesi repo'da, DORTLU-MASA §1a"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2edc1db9-9f2b-4194-a1f2-08d11d8b4443
  modified: 2026-08-05T20:12:46.543Z
---

AGY, Claude'un yapısal körlüğünü kapatır (video izleyemez, ses duyamaz) **ve ayrıca görsel
üretir, referans-edit yapar, karakter tutarlılığı tutar.** **Video ÜRETEMEZ** (ölçüldü).

🔴 **Bu dosya artık ayrıntı taşımıyor — 2026-08-05'te 135 satırdan buraya indirildi.**
Yetenek tablosu, dört sınavın kanıtı, beş güvenilmeyecek durum ve `freezedetect` komutu
**repo'da tek otoritede yaşıyor: `docs/ai/DORTLU-MASA.md` §1a.** Çağrı biçimi `CLAUDE.md`'de.
Tek komut kapısı: `node scripts/dis-goz.mjs gor|ara|kare`.

PATH tuzağı duruyor: `export PATH="$HOME/.local/bin:$PATH"`.
Model seçimi: toplu/hızlı iş `gemini-3.6-flash-high`, geniş okuma `gemini-3.1-pro-high`.

Ezberlenecek tek cümle: **AGY iyi bir İŞARETÇİ, kötü bir CETVELDİR** — nereye bakılacağını
ondan al, ne kadar olduğunu `ffmpeg`/`ffprobe`'dan. Mami'nin kuralı: *"net görevlere gönder,
malın teki ama hızlı."*

**Why:** Aynı bilgiyi hem hafızada hem repo'da tutmak iki gerçek üretir; repo kazanır çünkü
git onu taşır ve Codex de okuyabilir. Hafıza yalnız *nereye bakılacağını* hatırlar.
Ölçülmüş dış bulgu (2026-08-05): 55 düz hafıza dosyası tükenmiş bir desendir; seçici yükleme
hatırlamayı artırır, token'ı düşürür.

**How to apply:** AGY'ye iş vermeden önce `DORTLU-MASA §1a`'yı aç. Bir AGY hükmünü
uygulamadan önce ölçen araçla doğrula. Bkz. [[mamilas-duyu-ve-ikinci-goz-yetkisi]] ·
[[mamilas-buyuk-okuma-agy-de]] · [[mamilas-mimari-dengesizligi]].
