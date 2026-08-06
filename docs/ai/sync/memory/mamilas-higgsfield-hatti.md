---
name: mamilas-higgsfield-hatti
description: "Higgsfield CLI kuruldu — sohbetten kare/klip üretimi çalışıyor; element katmanı taşıyıcı kolon çıktı, fiyat matrisi ölçüldü"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5564e7f1-1d5a-4157-9074-4a383be1e1c1
  modified: 2026-08-06T10:13:50.131Z
---

**2026-08-06'da kuruldu ve uçtan uca ölçüldü.** `@higgsfield/cli` global (`higgsfield`,
alias `hf`), OAuth tamam (pixelagencyai@gmail.com · creator plan), 9 skill
`~/.claude/skills/higgsfield-*`. Workspace `Private` seçili — seçilmezse `account status`
hata verir.

**CLI ile site tek cüzdan, tek depo.** `higgsfield upload list --image` Mami'nin sitede
ürettiklerini UUID'leriyle gösteriyor; `account transactions` her harcamayı tek tek basıyor.
`generate cost <model>` basmadan önce fiyat söylüyor ve **birebir tutuyor** (3 ve 4 tahmin
edildi, 3 ve 4 çıktı).

🔴 **ÖLÇÜLEN ANA BULGU — element referans katmanı MAMILAS'ın taşıyıcı kolonu.**
Denetleyici K01'in teslim edilen 1625 kelimelik prompt'u aynen basıldı (NB2 4k · NB Pro 4k,
7 kredi). **İkisi de çöktü ve aynı şekilde:** Efe 12 yaşında çocuk yerine ~35'lik yetişkin
adam geldi, register `pixar_3d_edu` yerine fotogerçekçi bastı (NEGATIVE satırında "NO
photoreal" yazmasına rağmen), boy çizgisi yılları saçmaladı, Pro'da soba kapağı açık geldi.
Sebep: prompt Efe'nin görünüşünü **hiçbir yerde tarif etmiyor** — dosyanın kendi başlığı
*"sahnede yalnız @handle — görünüş TARİF EDİLMEZ"*. Magnific'te `@efe` çözülüyor, Higgsfield'da
iki ölü token. **Yani referanssız üretim MAMILAS prompt'larıyla çalışmaz; element opsiyon değil
ön koşuldur.** Karşılaştırma kareleri: `~/Desktop/higgsfield-test/`.

**Çözünürlük kazancı gerçek:** mevcut Magnific karesi 1376×768, Higgsfield 4k çıktısı
5504×3072 (alan 16×). Upwork portfolyosu için anlamlı — bkz [[mamilas-upwork-portfolyo-hedefi]].

**Fiyat matrisi (kredi, 2026-08-06):**
- `nano_banana_pro` — 1k **2** · 2k **2** · 4k 4 → 🔴 **1k ile 2k aynı fiyat, 1k basmak saf kayıp.**
- `nano_banana_flash` (NB2) — 1k 1.5 · 2k 2 · 4k 3
- `kling3_0` 5sn — std **10** · pro 12.5 · 4k 30
- `seedance_2_0` 5sn — 480p 15 · 720p 22.5 · 1080p 45
- Bir proje (56 kare 2k + 56 klip Kling std) ≈ **672 kredi**.

**Model yetenek farkı — motion seçimini belirler:**
- `kling3_0`: **referans ALMIYOR**, yalnız `--start-image` / `--end-image`.
- `seedance_2_0`: 9 görsel referans (start/end dahil), 12 toplam — klipte element tutarlılığı
  isteniyorsa tek yol bu, ama iki katı fiyat.
- `nano_banana_pro`: **14 referans** tek çağrıda.

🔴 **`kling3_0`'ın `sound` parametresi varsayılan `on`** — motion metinleri "Silent clip, no
audio" dese de o metin prompt, parametre ayrı. Her çağrıda `--sound off` gitmeli.

**Medya flag'leri yerel dosya yolu kabul ediyor ve kendisi yüklüyor** — `--start-image ./x.png`
yeterli, ayrıca upload gerekmiyor. UUID de kabul ediyor.

`soul-id` boş: 5+ fotoğrafla karakter eğitip kalıcı `reference_id` veriyor — tekrar eden cast
(Mira, Efe) için `@handle`'dan yapısal olarak güçlü, henüz denenmedi. Bkz
[[mamilas-magnific-char-refs]].

⚠ **Magnific MCP** `.mcp.json`'da proje kapsamında, bağlı (87 tool) — ama tool'lar oturum
açılışında yükleniyor, sonradan bağlanınca o oturumda kullanılamıyor.
