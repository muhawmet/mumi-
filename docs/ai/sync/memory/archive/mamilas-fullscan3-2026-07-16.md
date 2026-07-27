---
name: mamilas-fullscan3-2026-07-16
description: "Üçüncü tam tarama (hard-fix sonrası, akşam) — 78/100; güvenli drift fix'leri commit 416560e; 4 Mami-karar maddesi açık (renderLock verbatim, rhythm bağlam, New-York sızıntı, gate.sh)."
metadata: 
  node_type: memory
  type: project
  originSessionId: b1de5f1a-7cfa-4848-b888-0db81834f8a8
---

# Üçüncü tam tarama — 2026-07-16 akşam (hard-fix run SONRASI hale karşı)

Yöntem: gerçek generateBatch 3 dünya × 2 motor (7/7 GENERATED, hex 0, cabinet blocking 0,
motor grameri doğru) + prompt'ları BİZZAT göz okuma + 2 paralel katman ajanı (ajan katmanı +
veri katmanı) + scan2 açık bulgu yeniden doğrulama. Güvenli fix'ler `416560e` push'lu.

**Genel puan: 78/100** (scan2 72 idi; runner/orkestra 90'a çıktı — izolasyon/retry/resume/
firewall; ajan katmanı drift'leri kapandı; core'daki büyük borç duruyor).

## KAPANDI (416560e)

4 studio kartı DEPRECATED bantlı + manifest tarihî + sync · vocabularyExamples yasası
image-author kartında (yasasız kanal — 'avoid vs negatives' sınıfı) · mamilas-uret skill
Yönetmen-modu default · eski mamilas-director skill emekli bantlı · README --director/--batch
· stale rules determinizm maddesi düzeltildi.

## AÇIK — MAMİ KARARI GEREKEN 4 MADDE (davranış değiştirir, körleme yapılmadı)

1. **renderLock verbatim (EN BÜYÜK):** `splitRenderLawPhysics` (M2) yalnız WorldPacket/ajan
   kanalını temizliyor; SITE image-prompt yolu (`brain.ts renderLock → worldRenderText`)
   render_law'ı hâlâ TAM VERBATIM basıyor — one_piece wanted-poster cümlesi site promptuna
   bugün de giriyor. Ayrıca split kapsamı dar: `shinkai_photoreal_anime` "train carriage,
   convenience-store shelf, handrail, puddle" 7-nesne envanteri hiç ayrılmıyor
   (PROP_NOUN_RE sözlüğü dar). Fix = brain.ts prompt yolunu değiştirir → kare çıktısı
   değişir → Mami A/B'siz yapılmaz.
2. **Rhythm havuzu bağlam-duyarsız:** Chivo yol-boyama sahnesinin MOTION'ında "sensory
   arrival … appetite moment, peak of desire" (yemek-reklam dili) + çift rhythm cümlesi
   yan yana. Kaynağı brain.ts rhythm seçimi; kadraj round-robin'inin kardeşi bir kusur.
3. **"New-York" konum sızıntısı:** pixar dual-register ref anchor'ı "warm tactile New-York
   earthly" — Soul'un New York'u. Work-title scrub adı söktü, KONUM kaldı; hiçbir scrub
   listesi konum içermiyor ("never borrow location" kendi yasası). Veri mi kod mu düzeltilecek
   Mami kararı. Ayrıca Chivo IMAGE'e Tarkovsky anchor'ından "long-take drift / time as
   subject" temporal ifadeleri giriyor (STILL_TEMPORAL_RE bu kalıpları bilmiyor).
4. **gate.sh hayaleti:** `.claude/settings.json` PreToolUse hook'u `gate.sh`'ı işaret ediyor,
   dosya diskte YOK. Hook'un niyeti (full gate mi hızlı kontrol mü) tasarım kararı —
   ya dosya yazılır ya işaretçi kaldırılır.

## Katman notları

- **Veri:** 46 dünya alan sağlığı TAM (boş/kısa 0) · 130 ref boş alan 0 · yetim worldId 0 ·
  kırık proje/path işaretçisi 0 · ham hex yalnız yapısal alanlarda (prompt yolu temiz).
  Medium-gate yanlış-pozitif YOK — 17 bloklanan orphan'ın 17'si gerçek medyum emri taşıyor
  (gate olduğu gibi kalmalı; gelecek iyileştirme: dna'yı katmanlara bölüp ışık gramerini
  REAL'e geçirmek). cinedna_* zayıf ama "dokunma" kuralı var.
- **Ajan katmanı temiz kalemler:** sync OK · mined.json/ipFirewall.json yetim alan 0 ·
  continuityState zinciri tutarlı · adaptörler yasa kopyalamıyor · jury şablonları tam.
- **İkincil ledger (kritik değil):** motion-author kartı continuityState'i anmıyor
  (jury ölçüyor, author bilmiyor asimetrisi) · frame/motion-jury failureModes almıyor ·
  `continuity` (id çifti) artık yarı-ölü · explicitLocks alt-alan yasaları kartlarda isimsiz ·
  qa.ts hex istisnası uyuyan risk · ref-skill aynaları drift'li (generator yok) ·
  UI borçları scan2'den aynen duruyor (iki CSS, ölü ~1200 satır, 2MB bundle).
