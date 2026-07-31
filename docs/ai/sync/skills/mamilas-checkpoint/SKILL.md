---
name: mamilas-checkpoint
description: Crash-güvenli MAMILAS checkpoint — işi commit'le + memory'yi güncelle. Termius her an kapanabilir; her anlamlı iş parçasından sonra bunu koş.
---

# MAMILAS Checkpoint

Mami'nin talimatı: her şey yazılacak ki sonraki oturum (Termius crash'i sonrası) kaldığı yeri anında anlasın.

1. Önce gate (bkz. mamilas-gate) — kırık işi checkpoint'leme.
2. Commit: pillar/iş-parçası başına AYRI commit, mesajda "neden" anlatılır. `git add` ile SPESİFİK dosyalar (asla `-A`). Push YOK (Mami kararı).
3. Memory güncelle (`~/.claude/projects/-Users-Muhammet/memory/`):
   - `project_mamilas_brain_session.md`: ne bitti (commit hash'iyle), ne kaldı, hangi ders çıktı, sonraki oturım nereden devam eder.
   - `MEMORY.md` index satırını güncel tut (~150 karakter, en güncel hash + kalan işler).
4. Bekleyen background ajan varsa durumunu da yaz (hangi dosyalarda, ne bekleniyor, denetim protokolü ne).
5. Kapanışta Mami'ye tek paragraf: ne değişti, tek soru neyse o.

Duran kararlar: mamilas-antigravity silme onayı Mami'de; origin push Mami'de; UI freeze KALKTI (2026-07-02 'mamilas-allah' onayı); Codex/Antigravity işçi modeli EMEKLİ — her işi Fable yapar, mekanik işler Agent tool'a bölünebilir.
