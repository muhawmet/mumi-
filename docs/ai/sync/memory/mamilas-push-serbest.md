---
name: mamilas-push-serbest
description: "MAMILAS'ta commit'ler main'e push'lanır — eski \"PUSH YOK\" kuralı 2026-07-24'te iptal edildi"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 22f90c66-cd91-486e-b32d-32ee7112bd7f
  modified: 2026-07-24T06:39:00.425Z
---

# PUSH SERBEST — commit'ler main'e push'lanır (2026-07-24)

Mami: "giti de kuralıma ekle, sadece ben görebiliyorum zaten, evde de kullanacağım bu sistemi."

**Kural:** Commit yaptıktan sonra `git push origin main` yapılır. Eskiden "PUSH YOK" (Mami kararı)
vardı — bu **iptal**. Repo private (`github.com/muhawmet/mumi-`), tek kişi görüyor, çok-cihaz
(ofis + ev) senkron gerekiyor.

**Why:** Mami sistemi birden fazla cihazda kullanıyor; push olmadan ev/ofis senkron olmuyor.
Private repo olduğu için görünürlük riski yok.

**How to apply:** Anlamlı iş parçası bitince (kapı yeşilse) commit + push. Branch açmaya gerek yok,
Mami main'de çalışıyor. Yine de zorla-push (force) ve geçmiş yeniden yazma Mami onayı ister.
CLAUDE.md bunu yansıtıyor ("Commit'ler main'e push'lanır"). İlgili: [[mamilas-checkpoint]] rutini.
