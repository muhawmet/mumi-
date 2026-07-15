# MACRO 7 — Closeout + sade geçiş

**Tarih:** 2026-07-15 · **Uygulayıcı:** Claude Opus 4.8 · **Plan:** MACRO 7

## Kullanıcı açısından çalışan akış

Kapanmış bir proje paketi açıldığında "hangi Mami kararı → hangi prompt → hangi frame" zinciri
okunur: her shot için onay + ajan-prompt makbuzu + frame verdict + status. Açık riskler (frame'siz
shot, reddedilen frame, onaysız shot) görünür kalır. Dersler OBSERVATION olarak doğar — hiçbiri
otomatik global ders olmaz; ortak hafızaya geçiş yalnız Mami'nin ayrı PROMOTED eylemidir.

## Değişen dosya grupları

- `src/core/projectPack.ts` — `Closeout`/`CloseoutChainLink` tipleri + `buildCloseout(pack)`:
  sahne başına karar→prompt→frame zinciri, summary (approvedFrames/regenerated/noFrame), openRisks,
  observations (hepsi `promoted: false` — otomatik promote yok).
- `src/core/projectPack.test.ts` — closeout zinciri + açık risk + OBSERVATION testleri (+2 → 11).
- **Yanlış Magnific/upscale sözü temizliği** (plan gereği): "zorunlu upscale / `PENDING_UPSCALE`"
  çelişkisi söküldü — frame gate KALDI, upscale Mami'nin opsiyonel dış aracına indi:
  - `.claude/agents/mamilas-motion-author.md` + `.codex/agents/mamilas-motion-author.toml`
  - `.claude/agents/mamilas-qa-jury.md` + `.codex/agents/mamilas-qa-jury.toml`
  - `.claude/skills/mamilas-uret/SKILL.md` + `.agents/skills/mamilas-uret/SKILL.md`
  (Claude ve Codex kopyaları birlikte güncellendi — launcher-parity yasası.)
- **Kural dosyaları güncellendi** (kapatılan drift'ler): `.claude/rules/launcher-parity.md` (#6
  Magnific çelişkisi KAPANDI), `.claude/rules/site-gates.md` (MACRO 4/5 kapatılan kusurlar başlığı).

## Korunan invariant'lar

- **V2026 (eski) projeler silinmez** — closeout kapanmış paketi okur, mevcut projelere dokunmaz;
  legacy pack read-only import (MACRO 6) korunur.
- **Otomatik global ders YOK** — observations `promoted: false`; ortak hafıza Mami kararı.
- Frame gate (onaylı frame olmadan motion yok) her ajan tanımında KORUNDU — yalnız yanlış
  upscale-zorunluluğu kalktı. `brain.ts` "no intermediate resolution pass" zaten doğruydu.
- Faydalı validator/skill davranışı — dokunulmadı.

## Gerçek çıktı

- **Closeout test:** zincir 2 shot okuyor — shot 1 (APPROVED + ajan prompt + APPROVE frame →
  `APPROVED_FRAME`), shot 2 (`NO_FRAME`); açık risk "gerçek frame taşımıyor" görünür;
  observations hepsi `promoted:false`.
- **Magnific temizliği:** `grep "READY FOR MAGNIFIC|PENDING_UPSCALE|Magnific fidelity"` → src/agent
  tanımlarında sıfır zorunlu-upscale sözü (tarihsel drift kaydı hariç).

## Test sonucu

`npx tsc --noEmit` → 0 · `rtk proxy npx vitest run` → **1926 geçti / 0 kaldı (64 dosya)** ·
`npm run build` → OK · E2E smoke 10/10.

## Açık risk / dış bağımlılık

- Closeout `buildCloseout` bir çekirdek fonksiyon; UI'da "projeyi kapat → closeout indir" düğmesi
  MACRO 8 sonrası eklenebilir (şu an export project pack + buildCloseout kanıt zincirini üretiyor).
- Görsel kalite hükmü hâlâ Mami'ye ait (Macro 8 / gerçek frame).
