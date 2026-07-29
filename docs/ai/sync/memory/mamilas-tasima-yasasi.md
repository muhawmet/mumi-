---
name: mamilas-tasima-yasasi
description: "MAMILAS'ın tek hastalığı bilgi üretmek değil TAŞIMAK — yazılmayan yasa bir /clear ömrü yaşar. Kanon repo'da, hafıza tamamlayıcı."
metadata: 
  node_type: memory
  type: project
  originSessionId: b4e183ce-b2c8-4cf7-a077-a178a69cc6e8
  modified: 2026-07-29T09:07:38.028Z
---

# TAŞIMA YASASI (2026-07-27 zekâ runu)

Sistem bilgi üretiyor ama taşıyamıyordu; taşıma katmanı **Mami'ydi** — "3 videoda hep aynı
şeyleri söylüyorum" şikâyetinin mekanik sebebi bu.

**Why:** Ölçüldü — Sabit Sürat'ta bulunan dört slot hata oranını %65'ten %14'e düşürdü ama
hiçbir dosyaya yazılmamıştı; bir sonraki videoda biri 44/44'ten 2/8'e çürüdü. Aynı desen dört
katmanda tekrarlandı: hafıza git dışında olduğu için 18 dosya sessizce düştü, kalite kapısı
Windows'ta hiç ateşlenmedi, `protocolHash` platforma göre değişti.

**How to apply:**
1. **Prompt yazımının kanonu `agents/PROMPT-YASASI.md`** — repo'da, git'te, Sol'ün de gördüğü
   yerde. Hafıza onu **tamamlar, ezmez**. Yeni bir üretim yasası öğrenildiğinde oraya yazılır;
   yalnız sohbette bırakılan yasa yoktur.
2. **Kanon repo'da, hafıza yardımcı.** Canlı auto-memory `~/.claude/...` altında yaşar ve
   git'te görünmez → `node scripts/memory-sync.mjs` ile aynalanır. Canlıdan düşen dosya
   silinmez, `archive/`e taşınır: kayıp görünür bir git hareketi olur.
3. **Taşınabilirlik bir kalite kuralıdır.** Windows birincil ortam. Bir aracın POSIX
   varsayması (python3, zsh, LF) onu Mami'nin makinesinde sessiz no-op yapar.
4. **Sessiz geçiş yasak.** Bir kapı kendini doğrulayamıyorsa geçmez, bloke eder — kör kapı
   kapalı kapıdan tehlikelidir.

Ölçüt: **bir sonraki videoda Mami kaç kez kendini tekrar etmek zorunda kaldı.** 2026-07-27
başlangıç değeri 34 direktif; hedef 0.

İlgili: `agents/PROMPT-YASASI.md` · [[mamilas-surekli-push-emri]] · [[mamilas-lint-rol-koru]]
(İNŞA turunun ölçümleri — reçete zekâsı, kütüphane makrosu, test yüzeyi, bağlam ekonomisi —
`archive/` altında.)
