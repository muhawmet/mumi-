---
name: mamilas-interrupt-ajani-olduruyor
description: "Her interrupt (yeni mesaj/ESC) arka planda koşan BÜTÜN ajanları öldürür — meta.json'da stoppedByUser:true; iş yapılmış olsa bile dosya yazılmadan çöpe gider"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 86cafcb2-ec5a-4102-aba8-577ca2365eab
  modified: 2026-07-30T07:21:27.579Z
---

Ölçüldü 2026-07-30. Beş ajan sekans başına kare yazıyordu; Mami araya mesaj yazdı,
beşi de öldü. Kanıt: `~/.claude/projects/<oturum>/subagents/agent-*.meta.json` →
**`stoppedByUser: true`**, beşinde de. Transkriptleri 135-224 KB idi, yani yasayı okuyup
kare yazıyorlardı — **çıktı dosyasını yazmadan** kesildiler. Kod hatası yok, model hatası yok.

**Why:** Mami akış hâlinde yazar, araya mesaj girmesi normaldir ve engellenemez. Yani
"tavan 6 ajan" kuralı sessiz bir ön koşul taşıyor: *ajanın yazma anına kadar mesaj gelmeyecek.*
Bu koşul Mami'nin çalışma biçimiyle çelişiyor — [[mamilas-buddy-persona]] araya girmeyi
teşvik ediyor.

**How to apply:**
- Uzun tek-parça ajan işi (bir sekansın tamamını yazmak gibi) **ajana verilmez** — Mami yazarsa
  hepsi gider. Kendim yazarım; yavaş ama kesin.
- Ajan hâlâ değerli: **kısa, okuma-ağırlıklı, bağımsız** işler (araştırma, tarama, ölçüm).
  Onlar kesilse de kayıp küçük.
- Ajana iş verirken **ara çıktı yazdır**: her kare bittiğinde dosyaya ekle, sonda toplu yazma.
  Kesilirse yarısı kurtulur.
- Ajanın kesildiğini varsayma, **doğrula**: `PROMPTLAR/` gibi çıktı klasörünü listele.
  Bildirim gelmeyebilir.
