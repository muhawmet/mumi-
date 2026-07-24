---
name: project-mamilas-makro-ledger
description: 2026-07-17 makro ordu — 2 doğrulanmış KÖK-B bulgusu (verifyProjectPack hash-içerik + jüri verdict öz-beyan) + mimari kök teşhisi. Clear sonrası buradan devam.
metadata: 
  node_type: memory
  type: project
  originSessionId: b1de5f1a-7cfa-4848-b888-0db81834f8a8
---

# MAKRO LEDGER — 2026-07-17 (usage bitmeden önce doğrulananlar)

38+29 ajanlık iki ordu koştu. Session limit makro ordunun yarısını kesti (14 done / 15 error /
sentez patladı), AMA kesilmeden önce **2 makro bulgu KOŞARAK doğrulandı.** Bunlar bir sonraki
turda kapatılacak — clear sonrası buradan devam.

## ✅ KAPANDI 2026-07-18 (`e2dd283`, push'lu) — M1 + M2 ikisi de

**M1 (KRİTİK) KAPANDI.** verifyProjectPack: `beat.hash===sourceHash(exactText)` (MOD-A) +
sourceIntegrity verify'a dahil + kaynağı-yok hash'ler `unverifiableEvidence[]` ile işaretli
(MOD-B, sessiz güven yok). hasSpans muafiyeti=legacy v1 (re-ingest). 5 forge-probe. Garanti
denetçi: **SAĞLAM** (orta/son beat, aynı-uzunluk forge, span-strip bypass hepsi kapalı; tek
tüketici projectPackToState spansız beat'i re-ingest ediyor).

**M2 (ORTA) KAPANDI.** qa.ts SURGEON per-prompt lint'i saf `scanPromptSurgeon`'a çıkarıldı
(davranış değişmez, qa 46/46). verifyAgentArtifact (TS) + validateRoleContent (mjs runtime
ikizi) author prompt'unu SURGEON'dan geçiriyor → jüri PASS ölçülebilir slop'u AKLAYAMAZ.
Parite **byte-identical** (SLOP_RE md5 eşit + 16-input differential hepsi uyuşuyor). 6 forge-probe
(TS + mjs `__testValidateRoleContent`). Garanti denetçi: **SAĞLAM.**

Kapı: tsc0·**vitest 2027/2027 (80 dosya)**·build·E2E15·runner-mirror.

- **NOT (M2 standing limit, KUSUR DEĞİL):** SURGEON muafiyeti geniş — sahte `Negative:`/
  `NEGATIVE:`/`Engine grammar(` satırı arkasına saklanan slop taramadan kaçar. Bu ESKİ cabinet
  kodundan verbatim miras, iki yüzeyde AYNI (parite bozulmuyor). M2 regresyonu değil; ileride
  daraltılırsa Mami seçsin (yeni lint = [[mamilas-bul-sec-onar]] kapsamı).

## Kapatıldı — ESKİ girdi (ikisi de KÖK-B: "gate içeriği değil formatı doğruluyor")

**M1 — verifyProjectPack hash-içerik ankrajı yok (KRİTİK).** `src/core/projectPack.ts:230-234`.
KOŞULMUŞ kanıt: beat.exactText='Su buharlaşır.' bırakıp beat.hash=sourceHash('BAŞKA METİN')
yaptım + manifest yeniden mühürledim → verify ok:true, problems:[]. Hatta exactText'in kendisi
forge edilebiliyor (ATTACK-2). Aynı kök artifactHash/juryArtifactHash/protocolHash/storyboardHash'
te de var (:258-261 — format-geçerli rastgele hex geçiyor). TEK çalışan ankraj: promptHash===
sha256Hex(finalPrompt) (:257). YAPISAL ÇÖZÜM: "hash taşınıyorsa + kaynağı pack'te varsa → verify
YENİDEN türetip eşitler (MOD-A); kaynağı yoksa (frame pixel) açıkça 'unverifiable' etiketle".
Somut: `beat.hash === sourceHash(beat.exactText)` + sourceIntegrity'yi verify'a dahil et.
Her yeni ankraj için forge-probe mutasyon testi (format-only test hiçbir şey korumaz —
[[mamilas-test-suite-is-hollow]]).

**M2 — jüri PASS verdict'i içerik-boş evidence ile geçiyor (ORTA).** `src/core/agentProtocol.ts:
288-300`. `verifyAgentArtifact` PASS için yalnız verdict enum + boş-olmayan evidence[] bakıyor;
evidence'ın yargıladığı prompt'la ilgisi kontrol edilmiyor → `verdict:'PASS', evidence:['ok']`
geçiyor. contentHash PROVENANCE'ı kanıtlar, CORRECTNESS'i değil. requiredEvidence/rejectIf
kontratı yazılıyor ama kod hiçbir maddeyi prompt'a karşı ÖLÇMÜYOR. YAPISAL ÇÖZÜM: qa.ts PROMPT
SURGEON lint'ini (hex/triad/klon — zaten nötr validator) PASS ön-koşulu yap: "jüri PASS dediyse
kodun ölçebildiği rejectIf maddelerinden HİÇBİRİ tetiklenmemeli". Ölçülemeyenler agentAsserted:true
etiketiyle görünür.

## Mimari kök teşhisi (doğrulama ÇÜRÜTTÜ — dikkat)

- **İki elle-bakımlı ikiz context üretici** (agentProtocol.ts buildImageAuthorContext ↔
  mamilas-command.mjs imageContext) — GERÇEK ama sceneContextHash tarafında ikisi BİREBİR aynı
  hash üretiyor (doğrulama: ff6a00d1… eşit). Yani image-parite sağlam. AMA **motion/jury
  context'lerinde parite YOK** — TS buildMotionAuthorContext ile mjs roleContext(motion_author)
  farklı obje üretiyor (invariant ajanı koşarak kanıtladı). Bu ölü-drift: motion TS context'i
  gerçek runtime'da kullanılmıyor (runner kendi üretiyor), o yüzden zararsız ama kafa karıştırıcı.
- "canonicalize/sha256 ikizliği kök" iddiası **ÇÜRÜTÜLDÜ**: contract.ts saf-JS SHA vs
  mjs native createHash 13/13 byte-birebir. Yani hash tabanı sağlam, sorun değil.
- "rawHash iki filmi bir sayar" iddiası **ÇÜRÜTÜLDÜ**: hiçbir canlı yüzey rawHash'i identity
  sinyali olarak kullanmıyor.

## Bugün KAPANAN (push'lu, güvende)

`df3bea4` — G1-G6 (6 kök-fix, garanti denetçi 6/6 SAĞLAM). Önceki: `c5680dd` (9 fix), `416560e`
(scan). Detay [[project-mamilas-derinfix-2026-07-17]]. Kapı: tsc0·vitest2016·E2E15·build·mirror.

## Devam yolu (clear sonrası)
1. ~~M1~~ ✅ · ~~M2~~ ✅ (`e2dd283`, 2026-07-18).
2. Makro orduyu resume et (`wf_3acfcb9a-12c`) — kesilen 15 ajan + sentez, KÖK-A/C tam analizi.
3. Hiç bakılmayan: UI katmanı (58/100), motion TS/runner context drift temizliği.
4. (opsiyonel, Mami seçerse) M2 SURGEON muafiyet daralması — sahte prohibition-satırı bypass'ı.
