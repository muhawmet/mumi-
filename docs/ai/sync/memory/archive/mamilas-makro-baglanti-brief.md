---
name: mamilas-makro-baglanti-brief
description: "Mami'nin yazdığı MAKRO BAĞLANTI CERRAHİSİ brief'i — 7 P0 kopukluk, Faz A-D, kabul testleri. BEKLİYOR: 2026-07-28 itibarıyla görev henüz verilmedi."
metadata: 
  node_type: memory
  type: project
  originSessionId: 651a452b-2f9e-43f9-aef5-0f4175d8c3db
  modified: 2026-07-28T14:34:39.753Z
---

# MAKRO BAĞLANTI CERRAHİSİ — brief hazır, görev **henüz verilmedi**

Kaynak: `docs/ai/OPUS-5-MAKRO-ISTISARE-VE-ICRAAT-BRIEFI-2026-07-28.md` (577 satır, Mami'nin
doğrudan görevlendirmesi, git'te takipsiz). **2026-07-28: Mami "bekle, daha vermedim, hazır değil"
dedi — brief okundu, operasyon BAŞLAMADI.** Kendiliğinden başlatma.

**Tek cümlelik hedef:** *MAMILAS'ta özellik varlığı değil, **yetenek bağlantısı** kanıtlanacak.*
"Ajanı yapmışsın ama bağlanmamış" sınıfının tamamı.

## Yedi P0 kopukluk (her biri yeniden ölçülecek, körleme doğru sayılmayacak)

1. **Giriş sözleşmesi bayat ve pahalı** — her oturum 1300 satırlık ledger okutuluyor (121 ajan
   × aynı dosya = 6.5M token) ve güncel üretim gerçeğini taşımıyor. İstenen: küçük, makinece
   türetilen **NOW / ACTIVE PRODUCTION** hot state ([[mamilas-aktif-uretim-durumu]] bunun elle
   yazılmış ilk hali).
2. **Buddy çağrılıyor ama yetenek yoktu** — o gün onarıldı, skill artık repo'da iki yüzeyde.
   İstenen: hook'un işaret ettiği capability'nin varlığını ölçen meta-duvar.
3. **Hafıza split-brain** — canlı/repo/Codex üç ayrı depo, sync yönü otomatik tahmin ediliyor.
   İstenen üç sınıf: standing order (repo kanonu, testli) · Mami-onaylı precedent · oturum-local not.
4. **Skill paritesi isim paritesi** — klasör adları eşit, capability contract yok. İstenen:
   trigger/precondition/input/output/postcondition/next + sağlayıcı adaptörü, testle doğrulanan graf.
5. **Final Brief konuşmadan sonra final kalmıyor** — Kütle'nin command'ı `cast=""`, `heroTags=[]`,
   `directorBrief=""`, 41 scene derken gerçek film 35 kare/@efe/dusk. İstenen: kaynak command'a
   dokunmadan hash-bağlı **Director Closeout receipt** + ondan türeyen current command.
6. **Kalite kapısı dosyayı ölçüyor, prodüksiyonu değil** — sidecar dosya görünmeden PASS veremesin;
   beklenen storyboard sayısı = lint edilen kare sayısı.
7. **Revize↔motion arasında durum makinesi yok.** İstenen dört hal: `PASS` ·
   `PATCH_SAFE_FOR_MOTION` (yazı/uzak arka plan) · `FRAME_AFFECTING_EDIT` (özne/temas/yörünge/
   kamera → yeni kare görülmeden motion yok) · `REGENERATE / CREATIVE_DECISION_OPEN`.
   P1: REAL register ana hatta kalıtılmıyor (`"Gece Serumu"` sessizce EDU'ya düşüyor).

## Yürütme sınırları (Mami'nin verbatim çerçevesi)

- Sınırlı ve **görünür bir İNŞA turu**; bitince giriş sözleşmeleri **İCRAAT'a geri döner.**
- Destructive reset/checkout yok · ilgisiz dosyaya dokunma · Mami'nin gerçek karelerini bozma.
- **Yasak kapsam:** harici API, ikinci lifecycle runner, otomatik provider çağrısı, ödeme
  altyapısı, model backend önerisi. Kare dosya-adı/numara kimliğini Mami kendi ele alıyor.
- Faz sırası: **A** doğru açılış + ortak akıl → **B** capability graph + gerçek handoff →
  **C** REAL hattı (`Gece Serumu` provası) → **D** convergence, taze Claude + taze Codex
  simülasyonu, sonra İCRAAT'a teslim.
- Codex **adversarial ikinci göz**: teşhis sonrası · mimari karar öncesi · final convergence.
- Eşzamanlı ajan tavanı **6**, pratik hedef 2–4; aynı dosyayı altı ajana okutma.
- "Rapor yazıp bırakma" — doğrula, tek makro kararı Mami'yle konuş, uygula, provadan geçir.
- Gerçek kare hükmü yoksa doğru final cümlesi: *"Mimari bağlantı tamamlandı; görsel doğrulama
  Mami'nin gerçek frame verdict'ini bekliyor."*

İlgili: [[mamilas-insa-ledger-acik]] · [[mamilas-tasima-yasasi]] · [[mamilas-ajan-devri-buddy-on-kosulu]]
