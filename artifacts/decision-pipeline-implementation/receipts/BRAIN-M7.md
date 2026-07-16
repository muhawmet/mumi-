# BRAIN-M7 — Biten projelerden öğrenme: Mami-onaylı ders bankası

**Tarih:** 2026-07-16 · **Uygulayıcı:** Claude Opus 4.8 (1M) · **Denetçi:** Codex `gpt-5.6-sol` high (birleşik tur)
**Plan:** Task M7 · **Mami isteği:** *"Eski işlerinden öğrenmesi sistemi tanrı seviyesine çıkarır."*

## Döngü (kapatıldı — dersler artık ölü arşiv değil)

```
biten proje → buildCloseout → lessonCandidates[] (hepsi CANDIDATE — otomatik promote YOK)
      ↓ Mami okur, beğendiğini APPROVED.md'ye ELLE yazar
agents/lessons/APPROVED.md  (satır biçimi: "- <ders> — kaynak: <proje> · <tarih> · Mami onayı")
      ↓ runner launch anında (yalnız author rolleri)
CONTEXT.json.approvedLessons (son 20 — context ekonomisi)  ← HASH-DIŞI katman
      ↓ role kartı yasası
author okur; çelişkide Mami direktifi kazanır; kenara konan ders receipt'te görünür
```

## Ne yapıldı

- `src/core/lessonBank.ts` (yeni): `parseApprovedLessons` (format-dışı satır sessizce atlanır —
  banka opsiyonel, yoksa akış durmaz) + `approvedLessonsSlice` (APPROVED-only, tavan 20).
- `src/core/projectPack.ts` `buildCloseout`: `lessonCandidates[]` — kanıt zincirinden deterministik
  aday türetimi (onay oranı / REGENERATE ortak kusuru / stale zincir / frame'siz shot). Tarih
  çağıranın (`closedAtDate`) — core saat okumaz. Store `exportCloseout` günün tarihini verir.
- `scripts/mamilas-command.mjs`: launch anında APPROVED.md → `sessionContext.approvedLessons`
  (yalnız image_author/motion_author).
- Role kartları (image-author, motion-author): dersleri mined-clause disipliniyle okur; çelişkide
  Mami direktifi kazanır, kenara konan ders `suppressedContext`/`risks`te adlandırılır.
- `agents/lessons/APPROVED.md` seed (boş banka + biçim sözleşmesi — ilk gerçek dersler Mami'den).

## KRİTİK mimari sınır (test kilitli)

**Dersler sceneContextHash'e GİRMEZ.** `buildImageAuthorContext` lessons parametresi ALMAZ
(`lessonBank.test.ts` fonksiyon imzasını ve context şeklini kilitler): dersler karar değil atölye
hafızasıdır — hash'lenen katmana girseydi banka her büyüdüğünde TÜM command'ler stale olurdu.
Doğru katman: runner'ın hash-dışı `sessionContext`'i (artifactContract ile aynı seviye).

## Sol birleşik tur karşılıkları

- "Hash-eşitlik testi eksik" → eklendi: banka-bağımsız context determinizmi + approvedLessons'ın
  hash'lenen context'te hiç görünmediği canonicalHash ile kilitli (`lessonBank.test.ts`).
- "Parser regex/cap iki dosyada kopya, parite testi yok" → parite testi eklendi (imza + cap 20
  iki dosyada da doğrulanır). Tam fonksiyonel parite (runner'ın parse ÇIKTISI) launch-yolu
  E2E'si ister — convergence adayı, ledger.
- "Otomatik promote yok" → Sol doğruladı (closeout yalnız CANDIDATE üretir).

## Gerçek döngü kanıtı

- Gerçek `generateBatch` (one_piece_toei, 2 sahne) → `buildProjectPack` → `buildCloseout('2026-07-16')`
  → 2 gerçek aday üretildi (onay-oranı + frame'siz-shot dersleri; `sourceProject` gerçek pack hash'i).
- Geçici test dersi bankaya yazıldı → runner'ın parse regex'i okudu (1 ders) → **banka geri alındı**
  (Mami onayı olmadan kalıcı ders yazılamaz — ürün yasası).
- **Mami göz bekliyor:** ilk GERÇEK dersler, Mami dönüp bir closeout'un adaylarını okuyup
  APPROVED.md'ye yazdığında akmaya başlar. Sistem hazır, banka boş — bilerek.

## Kapı

Birleşik (M5+M6+M7): tsc 0 · vitest **1951/1951 · 74 dosya** (M4: 1927 — +24, silme yok) · build OK.

## Dosyalar

- `src/core/lessonBank.ts` + `src/core/lessonBank.test.ts` (yeni)
- `src/core/projectPack.ts` — lessonCandidates
- `src/store/useStudioStore.ts` — exportCloseout closedAtDate
- `scripts/mamilas-command.mjs` — approvedLessons launch katmanı
- `agents/lessons/APPROVED.md` (yeni) · `agents/roles/image-author.md` · `agents/roles/motion-author.md`
