---
name: mamilas-batch-mode-mandate
description: "Mami sahne-sahne onay hattını reddetti — default TOPLU mod olacak; verdict de toplu (istisna listesi), 60 sahnede tek tek yorum yok"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 441a86da-54fa-4d8c-a638-5d922cb0e01c
  modified: 2026-07-24T06:18:42.914Z
---

**2026-07-16, ilk gerçek üretim denemesinde:** Mami sahne-sahne (author→jury→kare→verdict→motion) hattını
"çok yavaşlatır, salak mıyım her sahneyi ayrı bekleyeceğim" diye reddetti. 60 sahnelik animasyonda tek tek
verdict vermek istemiyor.

**Why:** Mami'nin gerçek rutini toplu: promptları toplu alır, Freepik/NB2'ye seri basar, dönüp toplu bakar
([[mamilas-generation-routine]]). Sahne-sahne hat onu 60 kez launcher'a döndürür. "1. karenin dersi
sonrakileri keskinleştirir" argümanı pratikte iş akışını bölmeye değmez — ders toplu turda da alınır
(60 bas, kötüleri söyle, revize et).

**How to apply:**
- Default = BATCH: tek koşuda TÜM sahnelerin promptu + jüri toplu denetim + REJECT'ler revize → tek pakette
  N PASS prompt.
- Verdict de toplu: Mami kareleri basar, tek mesajla İSTİSNA listesi verir ("3, 17, 42 kötü çünkü...") —
  listede olmayan = APPROVE. 60 ayrı APPROVE yazdırma.
- Ders mekanizması (approvedLessons) toplu turda tur-arası çalışır: tur 1 dersleri → revize turu promptlarına.
- Sahne-sahne hat opsiyon olarak kalabilir (ilk kez denenen riskli dünya) ama asla default değil.

**UYGULANDI (2026-07-16, commit `d17c1a2`, push'lu):** `--batch` + `--approve-storyboard --all-scenes` +
`launchHeadless` (claude -p / codex exec) + `.mamilas/SAHNE-PROMPTLAR.md` toplu paket. Komut:
`node agents/runner.mjs --project "<Ad>" --batch --launch --provider claude`. PROTOCOL.md değişmedi
(hash stabil). **GÜNCEL (2026-07-24): toplu import artık VAR** — `--import-frames <klasör>` klasördeki
kareleri dosya adındaki sahne numarasından eşleştirip tekil yolun aynı kapılarından geçiriyor
(mamilas-command.mjs). Sahne-başına-import boşluğu kapandı. `--skip-image-jury` de tüm yollara bağlandı.
