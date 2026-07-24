---
name: mamilas-context-economy
description: "Claude'un MAMILAS'ta loop'a girmesinin mekanik sebebi ve kapatılışı — SURGERY_DATA 148k token, CLAUDE.md anlatı doluydu, gate rica'ydı. Üçü de 2026-07-12'de duvara çevrildi."
metadata: 
  node_type: memory
  type: project
  originSessionId: 0d283b47-46f4-4bb3-8c25-3ddceed928b5
  modified: 2026-07-24T06:19:09.084Z
---

**Teşhis (2026-07-12):** Claude "siteyi çöz" görevinde günlerce loop'a girdi. Sebep zekâ değil,
**dikkat ve hafıza.** Üç sızıntı:

## 1. Tek dosya beyni yiyordu
`src/core/SURGERY_DATA.json` = **580K ≈ 148.000 token.** Bir kere okununca 200K'lık pencerenin
**%74'ü** doluyor → erken talimatlar unutuluyor → loop.

**Kapandı (⚠️ mekanizma 2026-07-24'te güncellendi — öz geçerli, detay değişti):**
- `.claude/settings.json` → `permissions.deny` → **yalnız** `Read(./src/core/SURGERY_DATA.json)` kapalı
  (bash-seviye cat/head/grep deny girdileri ARTIK YOK; ölçüldü 07-24).
- ⚠️ `scripts/data-query.ts` + `npm run data` **ARTIK YOK** (repoda bulunmuyor). Büyük veriyi görmenin
  güncel yolu: `npm run workbench` (gerçek generateBatch çıktısı, `output/brain-workbench/`) + `/mamilas-map`.
  Öz DERS geçerli: dev veri dosyasını ham okuma; türetilmiş/özet kanaldan bak.

## 2. Kural yerine hikâye okuyordu
CLAUDE.md 62 satır / 1317 kelimeydi ama yarısı **savaş anısıydı.**
Anthropic'in kendi belgesi: *"Şişkin CLAUDE.md, Claude'un gerçek talimatlarını görmezden gelmesine sebep olur."*
Hedef: **< 200 satır.** Her satır için sor: *"Bunu silsem Claude hata yapar mı? Hayırsa KES."*

**Kapandı:** anlatı arşivlendi (güncel yol: `docs/ai/archive/CLAUDE-legacy-2026-07-12.md`).
Dosya artık bir **YÖNLENDİRİCİ** (sonu skill'lere işaret ediyor), kütüphane değil. Bugün CLAUDE.md 36 satır.

## 3. Gate bir RİCA'ydı
`/mamilas-gate` bir *skill*'di. Skill = rica. Atlandı: `fb18033` **tsc kırmızıyken geçti.**

**Kapandı:** `.claude/hooks/gate.sh` — `PreToolUse` hook. `git commit` öncesi koşar, kırmızıysa
`exit 2` → **commit gerçekleşmez, `--dangerously-skip-permissions` modunda bile.**
**Kırmayı denedim: reddetti.** Reddetmemiş kapı söylentidir.

### İki tasarım dersi hook'a gömüldü
- **Filtre script'in İÇİNDE, `settings.json`'da DEĞİL.** `if: "Bash(git commit *)"` alanına güvenildi;
  o alan **HER bash komutunda** ateşledi. **Kapı kendi kapısını kendi tutar.**
- **Test baseline'ı DOSYADA** (`.claude/test-baseline`), kodda değil. Koda gömülen sayı **bayatlar**:
  MEMORY.md 1838 diyordu, gerçek 1845'ti. Sayı artınca hook baseline'ı **kendisi ilerletir** →
  kapı zamanla **sıkılaşır, gevşemez.**

## Kalıcı yasalar (Anthropic + ölçüm)
- **Facts → CLAUDE.md · Prosedür → Skill · Her seferinde olacaksa → HOOK · İzolasyon → Subagent.**
- **`@import` dosyayı İNCELTMEZ** — import edilen dosya da açılışta yüklenir.
- **Skill listesinin gizli bütçesi var** (context'in %1'i). Aşınca Claude **en az kullandığın skill'in
  açıklamasını sessizce siler.** `/doctor` gösterir.
- **Skill açıklaması iş akışını ÖZETLERSE, ajan açıklamayı okuyup gövdeyi ATLAR** (ölçülmüş).
  Açıklama sadece **NE ZAMAN** tetikleneceğini söyler.
- **MEMORY.md tavanı: 200 satır / 25KB.** Aşarsa **sessizce kesilir**, hata vermez.
  Detay konu dosyalarına iner — onlar açılışta yüklenmez, bedavadır.
- **Hafıza MCP'si KURMA.** Anthropic RAG/vector index'i **bilerek söktü** (Boris Cherny: agentic search
  daha iyi). Popüler `claude-mem` (72k★) **tehlikeli**: token patlatıyor + kimlik doğrulaması olmayan
  localhost API'si açıyor (API anahtarları açıkta).

[[mamilas-simulation-loop]] · [[mamilas-test-suite-is-hollow]]
