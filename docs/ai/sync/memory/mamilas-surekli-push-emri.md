---
name: mamilas-surekli-push-emri
description: "Mami'nin duran emri (2026-07-29): yapılan her iş SÜREKLİ commit+push edilir, çöp dosyalar dışarıda tutulur. Sorulmaz."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a0ac38a5-976b-4b83-98c7-3d4bedff3841
  modified: 2026-07-29T06:32:33.357Z
---

# Sürekli push — Mami'nin duran emri (2026-07-29)

Mami'nin sözü: *"Ben senin yaptığımız her şeyi güzelce çöpleri dışarıda tutarak sürekli
pushlamanı istiyorum."*

**Why:** Mami iki makinede çalışıyor (Mac + Windows) ve senkron kopunca iş görünmez oluyor.
2026-07-29'da tam bu yaşandı: Windows'ta Üreme revizesi yapıldı, "push ettim" sanıldı,
push edilmemişti — Mac'te hiç görünmedi ve Mami bir sonraki oturumu "dün ne yaptık" diye
aramakla açtı. Kayıp iş değil, **kayıp güven** maliyeti yüksek.

**How to apply:**
- Anlamlı her iş parçasından sonra commit + `main`'e push. Sorma — izin zaten duruyor
  (`CLAUDE.md`: kapı yeşilken commit ve push sorulmaz).
- **Yalnız ilgili dosyaları stage et.** `git add -A` yasak; çöp betikler ve `.DS_Store`
  repoya girmez. Çöp görürsen Mami'ye bildir, kendin silme ([[mamilas-bul-sec-onar]]).
- Oturum sonunu bekleme; iş bitmeden de ara commit at.
- Bir git komutu izin katmanına takılırsa **sessizce geçme** — Mami'ye söyle, çünkü o an
  iş sadece tek makinede kalmış olur.

**Sık karıştırılan:** "erişemiyorum" iki ayrı şey olabilir — (a) iş git'te yok = push
sorunu, (b) iş git'te var ama SOHBET yok = Claude Code oturum geçmişi. İkincisi `--resume`
ile açılır; transkriptler `~/.claude/projects/<proje>/<sessionId>.jsonl` altında durur.
Teşhisi karıştırma, önce hangisi olduğunu ölç.

İlgili: [[mamilas-tasima-yasasi]] · [[mamilas-aktif-uretim-durumu]]
