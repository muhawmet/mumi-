---
name: project-mamilas-tarif-command-scan
description: "2026-07-19 tarif→command akışı 5-avcı taraması — 17 problem; P1-P6 kapandı (push'lu), P8/P14 Mami-karar, P9-P17 altyapı borcu."
metadata: 
  node_type: memory
  type: project
  originSessionId: b52016a8-32fb-4318-bca6-6aa753f889b9
---

# TARİF→COMMAND TARAMASI — 2026-07-19

5 avcı ajan tarif→command→runtime akışını ayrı seam'lerde taradı (A recipe-wiring, B
generateBatch-prompt, C commandExport-sceneContextHash, D mjs-runtime, E readiness-export).
Çıktı = sınıflı problem listesi (bul-sec-onar: kod değil). Mami tatilde "gerekeni yap,
aptalca regex yok, otomasyon yok" dedi. Aşağıdaki durum güncel.

## ✅ KAPANDI (push'lu, garanti denetçi SAĞLAM)

`c07c010`:
- **P1** directorBrief firewall'dan geçmiyordu → validateBriefCompatibility doctorText'e girdi (site).
- **P2** brandKitLock 3rd-party IP/hex taranmıyordu → aynı döngü; ticari-marka MUAF (kendi markası).
- **hex parite** (denetçi bulgusu): gate 6-hane'ydi → 3/4/6/8-hane (qa.ts HEX_RE kanonu). Tüm doctorText.
- **runtime parite**: mjs `freeTextLeaksIn` + `validateCommand` iki alanı tarıyor (FW_TERM_RES/FW_WORK_TITLE_RE
  yeniden kullanım, yeni regex yok; brand-check asimetrisi korundu).
- **P5** render_law prop-sızıntısı: `renderLock` artık `splitRenderLawPhysics(render_law).physics`
  kullanıyor (fizik verbatim, prop düşer). WorldPacket ile aynı kanon; mjs zaten worldPacket okuyor (parite OK).

`4c0c79d`:
- **P3+P4** projectClass çift-kanon: `buildCommandJSON` artık `deriveProductionPath` + `registerOf(derived)`
  (generateBatch ile birebir). Fuzzy class ('REKLAM' STY→REAL) sapması bitti; commandId fuzzy'de doğru değişir.
- **P6** (M1'in yarım ucu): `unverifiableEvidence` importProjectPack'te atılıyordu → `packEvidenceNotice` state
  + Timeline+Dashboard banner + clearGeneration/STALE_GENERATION'da stale-clear. generateScenes notice'ı silmez.

## ✅ MAMİ TASARIMSAL DEDİ — KAPALI (dokunma)

- **P8** Timeline gate-siz command indirme → **TASARIMSAL.** Mami: "command tarif edecek, ajanlar akıllı
  olacak, ben sohbet edip revize vereceğim." Command = author-input; onaydan önce elle ajana vermek meşru.
  Komplike etme. QA'nın ek onay kapısı ayrı bir yüzey, çelişki değil.
- **P14** recipeScenes↔count kopukluğu → **KASIT.** Beat sayısı otorite, reçete-notu sahne sayısı belirlemez.
  Uyuşmazlık normal, uyarı istenmedi.

## 📋 AÇIK — DÜŞÜK / altyapı borcu (elle-akışa değmiyor; Mami seçerse)

- **P9** turkish_labels baked-etiket kararı motor prompt onScreenText'ine doğrudan geçmiyor (yalnız agentBrief → ajan eliyle).
- **P10** ilk sahne-notu dolu-placeholder default'u ("DIRECTOR MANDATE") Mami dokunmadan agentBrief+commandId'ye sızıyor.
- **P11** motion frameHash içerik-ankrajı validateRoleContent yerine validateArtifactChain'de (eşleşmezse sessiz stale).
- **P12** runtime doğrulaması tek-katman (load-time); sealArtifactDraft/migration kendi çıktısını yeniden doğrulamıyor.
- **P13** TS buildMotionAuthorContext ölü + mjs motionWorld'den sapmış (dead-drift, hash-dışı, zararsız).
- **P15** ölü `Status: PASS` string'i command JSON'da hâlâ üretiliyor (UI okumuyor artık).
- **P16** susturulan uyumsuz ref prompt-yolunda (refDna) makbuzsuz; makbuz yalnız display kanalında.
- **P17** AUTHORITY_HIERARCHY çözücü değil, liste sabiti; ezilen directive ad-hoc kapılarda makbuzsuz (mimari borç).

## Sağlam çıkanlar (negatif kanıt — tekrar ölçme)
WORLD-LOCK ref suppression · palet ham hex sızmıyor · night per-scene carry (prompt yolunda) · validateBriefCompatibility
gerçek kapı (sıfır sahne) · determinizm/commandId content-hash · effectiveTopic tek kanon · sidebar bypass kapalı ·
tek readiness authority · export builder tutarlı · runtime çekirdek hash/gate/frame-decode ankrajı · image sceneContextHash TS↔mjs parite.

İlgili: [[mamilas-bul-sec-onar]] · [[project-mamilas-makro-ledger]] · `.claude/rules/core-prompt-path.md` · `site-gates.md`.
