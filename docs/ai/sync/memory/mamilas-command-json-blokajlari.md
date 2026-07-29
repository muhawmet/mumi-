---
name: mamilas-command-json-blokajlari
description: "Command JSON'un (site çıktısı) Mami'nin istediklerini bloklayan alanları — üretimde elle aşılan yerler."
metadata: 
  node_type: memory
  type: project
  originSessionId: 0b4a7c89-f6c0-4d85-8a52-503440509ec0
  modified: 2026-07-29T09:08:06.876Z
---

2026-07-25 Bileşke Kuvvet (52 kare) + Sürtünme (31 kare) tam üretiminde ortaya çıktı: site'nin ürettiği `*_mamilas_command.json` bazı yerlerde Mami'nin istediğinin TERSİNİ dayatıyor. Yönetmen bunları elle aşıyor; site düzeltilirse bu iş kalkar.

**1. `locks.cast` BOŞ ("") → yanlış etnisite.** Cast kilidi olmadığı için NB2 arka plan çocuklarını default "çeşitli" yapıyor; siyahi/asyalı çocuklar giriyor. Türkiye okulları için yanlış. **Elle çözüm:** her prompta "every child, main AND background, Turkish/Anatolian; no Black/East-Asian" yaz. **Site'de olması gereken:** cast lock alanı.

**2. YAŞ/SINIF alanı YOK → karakterler fazla küçük çıkıyor.** JSON "child-safe readability", "a child's eye-line" der ama sınıf seviyesi taşımaz. 6. sınıf videosunda 6-7 yaş çocuklar çıktı. **Elle çözüm:** "6th-grade, ~11-12, pre-teen proportions". **Site'de:** grade/age alanı (sınıf zaten seçiliyor, prompta taşınmıyor).

**3. Palette'teki "saffron" kelimesi → SAFRAN ÇİÇEĞİ.** `paletteAsLight` = "Navy, saffron-yellow, tomato-red, board-white". Bu kelime prompta inince NB2 gerçek safran/çiğdem çiçeği çiziyor (K05/06/15/31/33/47 hepsinde). En pahalı hatalardan biri. **Elle çözüm:** "saffron" ve "bloom" kelimelerini prompttan TAMAMEN çıkar → "warm golden glow of light". **Site'de:** palette metnini "golden-yellow" yap.

**4. Render law'daki "sheen" → PLASTİK cilt.** `render_law` "subsurface-style sheen" der; NB2 cildi parlatıp plastikleştiriyor. **Elle çözüm:** "SOFT MATTE, low specular, hand-painted". `agents/PROMPT-YASASI.md` §2 (ten kilidi)

**5. "No named or identifiable person / no invented face / anonymous body" yasası → kahraman engelleniyor.** JSON insan aksiyonunu "arkadan, omuzdan kesik, sadece eller" ile göstermeyi emrediyor. Ama Mami tekrar eden GÖRÜNÜR kahraman istiyor (50-50). Magnific `@handle` auto-tag olduğu için yüz-drift sorunu zaten yok — yasak gereksiz. **Elle çözüm:** @mira/@ali/@can tag'leri + 50-50 dengesi. **Site'de:** karakter tag registry alanı (bu yasağı da devre dışı bırakır).

**6. `Text/logo: clean plate — no on-screen text` default → gerekli etiketler engelleniyor.** Fizik dersi diegetik Türkçe etiket İSTİYOR ("10 N", "R = 0 N", "PÜRÜZLÜ"). Beyin tarafında text ADAPTİF yapıldı ama command sahne metni hâlâ clean-plate diyebiliyor. **Elle çözüm:** gereken karede diegetik kabartma etiket yaz + garble-guard.

**7. `[DIRECTOR TASK — authored by Claude]` placeholder BOŞ geliyor.** `prompts.image` = STYLE SYSTEM + boş kabuk; CLI'ın author agent'ı hiç çalışmadı. Yani JSON tek başına üretilebilir prompt İÇERMİYOR — asıl kareyi yönetmen yazıyor. (Bilinen durum, kritik yol bu.)

**8. Filler beat'ler birleştirilmiyor.** Site her VO cümlesine 1 sahne veriyor → 69 sahne, içinde "Tabii ki hayır", "Zil çaldı", "Mira kenardan izledi" gibi glue satırları var. Görüntü birleştirilerek 52'ye indi (cümle atılmadan). **Site'de:** glue-beat merge mantığı.

**9. `durationSec` VO'ya bağlı değil.** Süreler kaynaktan geliyor ama gerçek zamanlama ElevenLabs VO'suna bağlı. **Elle çözüm:** süreyi VO okuma + baş/tail handle'a göre yönetmen verir. `agents/PROMPT-YASASI.md` §3 (motion template)

**10. Boş alanlar:** `topic: "-"`, `cast: ""`, `location: ""`, `musicId: ""` → dosya adı bile `-_mamilas_command.json` oldu. Dosya adı/konu kimliği kayboluyor.

İlişkili: [[mamilas-force-bloom-viz]] · [[mamilas-nb2-hata-katalogu]] · `agents/PROMPT-YASASI.md` §2 (show/premium yasası) · `agents/PROMPT-YASASI.md` §2 (@tag disiplini)

**Rol ayrımı (değişmez):** site TARİF/brief üretir, motora giden FINAL prompt'u **ajan yazar** — `commandExport.ts:277`: *"prompts.image bir BRIEF'tir, bitmiş prompt DEĞİL"*. "Site deterministik prompt üretsin" çatalı reddedildi; bir daha sorulmaz.
