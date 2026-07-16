# 🧠 BEYİN KATMANI TESLİM RAPORU — M0→M7 TAMAM (2026-07-16)

**Mami için tek-sayfa özet.** Detay: `receipts/BRAIN-M0..M7.md` · Plan: `docs/superpowers/plans/2026-07-16-mamilas-brain-layer.md`
**Dürüst durum: implementation complete / visual validation pending** — her M'de gerçek çıktı üretildi
ve Sol denetiminden geçirildi, ama **kare estetiği hükmü yalnız senin**; aşağıda "SENİN GÖZÜN" listesi var.

## Ne kuruldu (M başına tek cümle)

| M | Ne | Kanıt |
|---|---|---|
| M0 | Yeşil baseline mühürlendi (CRLF+sharp fix) | `d366231` |
| M1 | Tek kanon role kartları → `.claude`/`.codex` generator + drift testi | `agents:sync --check` |
| M2 | render_law prop/fizik ayrımı — One Piece karesine gemi/WANTED sızıntısı kesildi | `M2-AB-image-author.md` |
| M3 | Ajanın yorumu artık GÖRÜNÜR: zorunlu `interpretation {dominantSubject, singleEvent, frozenInstant}` receipt'i — onay kapısı YOK, akış kesintisiz; `dominantSubject` kopya-yalanı `exactSourceBeat` dürüst adına döndü; v10 store migration + vault-restore'un sahne SİLME kırığı (eski, veri kaybı) kapatıldı | `M3-REAL-FLOW.md` — gerçek runner zinciri approve→r0→REJECT→r1→PASS→AWAIT_FRAME→LIVE_CHAT |
| M4 | Madenlenmiş üretim yasaları ölçülebilir kontrat oldu (`promptQuality`): 2D-plastik/medium-split, detay üçlüsü, palet-rejim (duotone önleme), self-contained, half-a-second, banned-empties, NB2 sayısal lens — dünya+engine'e göre; **hiçbiri seni ezemez** (`overridePolicy`: çatışmada senin direktifin kazanır, kenara konan madde receipt'te görünür) | `M4-REAL-OUTPUT.md` + kontrata tam uyan gerçek prompt |
| M5 | Motion zekâsı: Physics-First (pan/zoom yerine kütle/kadans), still-lips/no-dialogue (VO ElevenLabs'ta), Kling SFX = sesin FİZİĞİ (2-4 diegetik kaynak), frame-inventory; kaynak alıntın VERBATIM korunur (kör scrub geri alındı — Sol yakaladı) | gerçek frame-gated zincir: PNG→APPROVE→motion, `M3-M4-runner-evidence/` |
| M6 | Ölçülmüş red-line'lar kalıcı regresyon kilidi: render-lock incelemez (1250→598 dersi), prop geri sızamaz, kontrat boşaltılamaz, figürlü-world-lock frame-jury'de | `juryRedlines.test.ts` (13) |
| M7 | **"Tanrı seviyesi" döngün:** biten proje → `lessonCandidates` (ADAY) → SEN onaylarsan `agents/lessons/APPROVED.md` → sonraki projede author'ın context'ine akar (son 20). Otomatik yasalaşma YOK; ders bankası boş, ilk dersler senden | `lessonBank.ts` + runner launch katmanı |

## Değişmezlerin durumu — hepsi korundu

- **API YOK** — hiçbir M otomatik generation/batch/upscale açmadı.
- **Sen her zaman loop'tasın, bürokrasi YOK** — ajan tam paketi kesintisiz yazar; yorumu receipt'te
  görürsün; "renderı tam alamamışsın" dersin → LIVE_CHAT directive → tek-revizyon; hiçbir maden/ders
  senin direktifini ezemez (suppression şeffaf).
- **Site TARİF eder, ajan YAZAR** — site semantic author olmadı; `exactSourceBeat` verbatim.
- **Kare hükmü senin** — lifecycle her sahnede `AWAIT_FRAME`'de durur; prompt PASS ≠ kare PASS.
- **PUSH: yalnız commit atıldı** (sen "commit/push serbest" demiştin — push'u dönüşünde konuşuruz;
  istersen tek komut).

## SENİN GÖZÜN bekleyen noktalar (dönüşünde)

1. **M4 prompt'unu motora ver** (`M4-REAL-OUTPUT.md` §2 — one_piece fırtına sahnesi): 2D-plastik fix
   karede çalışıyor mu? (En kritik görsel hüküm.)
2. **M2 ledger'ı:** Naruto/Bleach mekân-kimliği cümleleri vocab'a düşünce zayıfladı mı — kare A/B.
3. **M7 ilk dersler:** bir biten projenin closeout'unu al (`exportCloseout`), adayları oku, 2-3'ünü
   APPROVED.md'ye yaz — döngü o an canlanır.
4. **Convergence ledger'ı** (ikincil, acil değil): statik çekirdek kontrat tek-kanonlaştırma ·
   worldPacket'in karar-türetilebilirliği · interpretation "tek satır" şartı · parite matrisi genişletme.

## Sayılar

M0 baseline 1896/1896 (67 dosya) → teslimde **1953/1953 (74 dosya)** — +57 test, sıfır silme.
Her M: tsc 0 · vitest yeşil · build OK · Sol bağımsız denetim — her REJECT'in kritikleri aynı
oturumda kapatıldı; **son tur Sol verdict: PASS** (M5 dürüst frame-gate kanıtı + M6 tam-%90
tabanlar/5-dünya prop kilidi/verbatim kontrat kilidi + M7 fonksiyonel parser paritesi).
