---
name: mamilas-test-drive-mode
description: "🔴 TEST SÜRÜŞÜ GÜNÜ modu (2026-07-23): üretim koşarken hata KAYDET, onarma. Fix ayrı oturumda."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b52016a8-32fb-4318-bca6-6aa753f889b9
  modified: 2026-07-23T05:59:41.251Z
---

# TEST SÜRÜŞÜ GÜNÜ — kaydet, onarma (2026-07-23 Mami direktifi)

Mami'nin sözü: *"bugün test sürüşü günü, hataları da kaydedip sonra onarma günü."*

**Why:** Üretim akarken fix'e dalmak hem üretimi kesiyor hem yarım yamalak yama üretiyor.
Mami 6-7 video çıkaracak; akış bozulmamalı. Hata avı ile onarım AYRI oturumlar.

**How to apply:**
1. Üretim sırasında hata/tuhaflık çıkarsa: **DUR, ONARMA.** Kaydet:
   - ne yapıyordu (hangi adım/dünya/motor) · ne bekliyordu · ne oldu (tam hata metni/ekran)
   - tekrar ediyor mu · üretimi durdurdu mu (BLOKER) yoksa devam edilebiliyor mu
2. Kayıt yeri: `artifacts/test-drive/HATA-LOG-2026-07-23.md` (yoksa aç).
   Her madde: `[BLOKER|CIDDI|KOZMETIK] · adım · beklenen → olan · tekrar? · ekran/log`
3. **İstisna — anında fix hakkı:** yalnız üretimi TAMAMEN durduran (BLOKER) ve tek satırlık
   bariz bir kırık varsa Mami'ye "bu bloker, tek satır, düzelteyim mi?" diye SOR, onay gelirse onar.
   Onay yoksa kaydet, geç.
4. Gün sonunda: log'u sınıfla (kök-desen bağıyla), Mami seçer → ONARIM oturumu ayrı açılır
   ([[mamilas-bul-sec-onar]] disiplini: bul → Mami seçer → onar).
5. Üretim gününde **tarama/refactor/iyileştirme YOK** — sadece Mami'nin akışını akıtmak.

İlgili: [[mamilas-bul-sec-onar]] · [[mamilas-batch-mode-mandate]] · [[project-mamilas-tarif-command-scan]]
