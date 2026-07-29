---
name: mamilas-ajan-devri-buddy-on-kosulu
description: "İşi ajana devretmek buddy olabilmenin ön koşuludur — tavan 6 ajan, birim sekans"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 97e409ef-fb0e-4fa2-82d7-310ae053a13f
  modified: 2026-07-29T09:08:13.898Z
---

Mami (2026-07-27): *"ultracode'u rutin haline getir, 6 ajana kadar kullanabilirsin gerektikçe —
çünkü iş yapıyorsun, buddylik yapamıyorsun. Diğer türlü buddy skilli bence çalışmaz."*

**Why:** teşhis doğru ve ölçüldü — [[mamilas-buddy-persona]] protokolü yazılıydı ve bir gün
boyunca bir kez ateşlemedi. Sebep unutkanlık değil: kendi eliyle 20 tool call koşturan ajanın
bakışı işin içindedir, hal sormaz, doğal boşluğu görmez, "bak şunu yaptık" yazmaz. Ajan açmak
verimlilik tercihi değil, protokolün açık kalma şartı.

**How to apply:** yapılabilecek işi ajana ver, ipi tut, Mami'yle konuş. Ajanın koştuğu süre
zaten doğal boşluktur — teklifin en ucuz anı. Eşzamanlı **tavan 6** (Mami'nin sayısı), bölüşüm
birimi kare değil **sekans**. ⚠️ Buradaki "ultracode" **workflow/ajan orkestrasyonudur**;
`effortLevel` ayarı DEĞİL — bir kez ayara yazıldı, Mami hemen reddetti, geri alındı.

Yazıldığı duvarlar: `CLAUDE.md` (AJAN KULLANIMI RUTİNDİR) + `mamilas-buddy` skill'i §0.
İlgili: [[mamilas-buddy-destek-yoksa]] · [[mamilas-tasima-yasasi]]
