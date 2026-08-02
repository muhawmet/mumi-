---
name: mamilas-skill-kanonu-git
description: "Skill kanonu GİT — bir skill adı yalnız .claude/skills'te yaşar; canlı yüzeyde ikizi durursa repo nüshası hiç koşmaz."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8d6d4d77-e230-4291-adaa-4e9965edc47d
  modified: 2026-08-02T13:00:09.988Z
---

# Skill kanonu GİT — Mami'nin kararı (2026-08-02)

Bir skill adı yalnız **`.claude/skills/`** altında yaşar (+ `.agents/skills/` Codex ikizi).
`~/.claude/skills` ve `docs/ai/sync/skills` altında **ikizi durmaz.**

**Why:** Skill'ler dört yüzeyde yaşıyordu ve çakışmada **canlı yüzey sessizce kazanıyor** —
Claude Code onu yükler, repo nüshası hiç koşmaz. Üç skill (buddy · gate · audit) aynı anda
ayrışmıştı ve hiçbir test bunu görmüyordu. Somut hasar: Mami 2026-07-29'da *"etiketsiz nefes /
ekranda nefes yazma"* yasağını **açıkça kaldırdı**; düzeltme repo nüshasına yazıldı, koşan
canlı nüshada eski yasak kaldı. `buddy.mjs` hook'u ekrana nefes kutusu basarken yüklenen skill
"nefes yazma" diyordu. Kural doğru yazıldı, **yanlış rafa kondu**, iki gün sonra yokmuş gibi
davranıldı. Aynı yapısal koşul Mami'nin İngilizce hükmünü de (C1) haftalarca gölgelemişti.

**How to apply:**
- Bir skill'i düzeltirken **`.claude/skills/<ad>/SKILL.md`**'ye yaz, `.agents/skills/` ikizini de
  aynı anda güncelle (test içerik paritesi şart koşuyor).
- Canlı yüzeye skill yazma. Yazdıysan `docs/ai/sync/skills/` ikizini de **AYNI ANDA** sil —
  yalnız birini silmek işe yaramaz, `claude-sync` diğerinden geri diriltir
  (`scripts/lib/sync-karar.mjs` karar tablosu).
- Windows'ta `git pull` sonrası, ilk `claude-sync` koşusundan **ÖNCE** oradaki canlı ikizi de sil.
- Duvar: `src/core/skillSurface.test.ts` — kıstas içerik eşitliği değil **TEKLİK** (senkron
  zamanlamasına duyarlı olmasın diye). Kırmızı verdiğinde hata mesajı onarım reçetesini basar.
- Yan kural: **skill hafızayı EZER.** Bir hüküm değiştiğinde yalnız hafızaya yazmak yetmez;
  her oturumda otomatik yüklenen skill dosyasına da işlenmeli. Genel kural "çakışırsa memory
  kazanır"dır — bu onun ölçülmüş istisnası. Bkz. [[mamilas-claude-senkronu]],
  [[mamilas-nefes-kapisi-emirdir]], [[mamilas-tasima-yasasi]].
