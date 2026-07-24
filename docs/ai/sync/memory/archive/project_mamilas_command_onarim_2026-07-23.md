---
name: project-mamilas-command-onarim-2026-07-23
description: "07-23 test sürüşü: command'i durduran 4 duvar + dalga/izolasyon onarımı; COMMIT YOK, Mami baştan yapacak"
metadata: 
  node_type: memory
  type: project
  originSessionId: 604a8ad2-84c6-4b0b-a96f-f9afd4831516
  modified: 2026-07-23T11:53:11.465Z
---

# COMMAND ONARIMI — 2026-07-23 (test sürüşü günü, 0 video çıktı)

**Mami'nin günü:** 7 video hedefi, sıfır çıktı. 1.5 saat sadece duvar aşmakla geçti.
Gün sonunda **"bırakalım burayı, ben baştan yapayım command'la"** dedi → clear.

## Durum: KOD DEĞİŞTİ, COMMIT YOK

Kapı yeşil: **tsc 0 · vitest 2049/2049 · build ✓** (3 yeni test eklendi: izolasyon, teslim
kapısı, toplu kare). Çalışan ağaç kirli, hiçbir şey commit edilmedi.

## Üretimi durduran 4 duvar (hepsi onarıldı)

1. `BASLAT.command` execute-bit yoktu (644) → `chmod +x` (git'te mode değişikliği duruyor)
2. **Site Komut JSON kilidi** — Mami 60 sahneyi elle 69'a bölüp boş satırları silince
   `sourceIntegrity` "bozuk" sandı. → `useStudioStore.ts:419` Manuel beatMode'da kapı devre dışı
   + `source.ts` wordSkeleton boşluk toleransı + `qa.ts` hash-vetosu kalktı. Mesaj da düzeltildi
   ("%100; %100 gerekli" çelişkisi gitti).
3. **Provider duvarı** — çift tıkta TTY yok → `dryRun=true` → `launch=false` → provider null
   ama `--director` argümanlarda kalıyor. → `runner.mjs:259` `--director` artık explicitLaunch;
   `runner.mjs:217` preflight'tan `--director` düşürülüyor; 4 launcher'a `--provider claude`.
4. **`locks.cast` boş** — Mira FACT_REQUIRED verip 69 sahneyi durdurdu. Geçici çözüm:
   `--add-directive-file --scope PROJECT` ile kimlik bağlandı (`live-6582c96df5f2b9a4`).
   **Kalıcı çözüm PROTOCOL'de:** kurgusal karakter artık FACT_REQUIRED üretmiyor.

## Mimari onarım (paralel dalga)

- **İzolasyon** (`mamilas-command.mjs:1028+`): oturum scratch'i artık
  `.mamilas/work/<scene>/<role>/r<rev>/` — 7 dosya (PROTOCOL/ADAPTER/ROLE/CONTEXT/TEMPLATE/
  SESSION) run köküne yazılıyordu, şeritler birbirini eziyordu. `--lanes 6` yarışının kökü buydu.
- **`sealArtifact` jail'i** işaret-tabanlı (`.mamilas` marker), sabit "iki üst" değil.
- **`writeBatchPromptPack`** tmp adı benzersiz (`pid-counter`), sabit `.tmp` ENOENT üretiyordu.
- **`--lanes N`** geri geldi (izolasyonlu). Kanıt: 4 sahne aynı anda PASS, 0 hata, 10/69 üretildi.
- **`--import-frames <klasör>`** eklendi: dosya adından sahneye eşleşme, toplu kare alımı.
- **69/69 teslim kapısı**: `imagePhaseComplete` + `incompleteScenes`; eksikken "hazır" demiyor.
- **Tek proje kökü**: `runner.mjs:134` repo köküne bağlandı (agents/ + agents/production/ ikiliği).

## Jüri tolerans yasası (Mami direktifi)

`agents/roles/image-jury.md` yeniden yazıldı: **"production gate, not a taste critic."**
REJECT yalnız 6 sert hatada (kaynak anlamı yanlış · özne-eylem-mekân okunmuyor · continuity
bozuk · IP sızıntısı · yanlış ekran yazısı · uygulanamaz/kötü kare). Estetik mikro-eleştiri
→ PASS + not. PASS kanıtı ≤5 madde (eskiden 6000 karakter yazıyordu, çıktının %98'i).

## Ölçülen gerçekler (42 bulgu, ordu taraması)

- **Darboğaz oturum açılışı DEĞİL**: author 222s'de 2392 token = **~10 tok/s**. Model yazma hızı.
- Sıralı: sahne başına ~6dk (author 3 + jüri 3) → 69 sahne ~7 saat. Paralel 6 şerit → ~1 saat.
- `CONTEXT.json` 22.5KB'ın **%96'sı sabit** (69 sahnede byte-aynı) → chunk'lı oturumun gerekçesi.
- Sabit girdi 43.475 karakter/oturum (SESSION+PROTOCOL+ADAPTER+ROLE+CONTEXT) × 138 oturum.
- Bulgular: `/private/tmp/.../scratchpad/dalga-bulgular.json` (geçici!) + workflow journal
  `wf_5406b208-835/journal.jsonl`.

## SOL'UN TEŞHİSİ — süit neden duvarları görmedi

Sol dünkü **kırık kodu geri koyup 2046 testi koşturdu → hepsi yeşil**. Yani üretimi durduran
kodun kendisiyle süit geçiyor. **"Son-metre testsizliği"**: testler dosyanın METNİNE bakıyor
(`readFileSync`), Mami ÇİFT TIKLIYOR. Arada kalan her şey (dosya izni, TTY, argüman aktarımı,
süreç zinciri) tanımsız bölge. `directorSession.test.ts:97` `--director`'ü runner'ı ATLAYIP
çağırıyor ve `--provider`'ı elle ekliyor → duvar görünmez kaldı. `beatMode:'Manuel'` hiçbir
testte yok. `.claude/test-baseline` yalnız SAYI sayıyor, kapsamı sormuyor.

## AÇIK — sıradaki oturumun ilk işi

- **🔴 Mami'nin son direktifi (uygulanmadı):** *"promptlarda kızı tarif etmek yok, `@mira`
  desen yeterli."* Kimlik direktifi (`live-6582c96df5f2b9a4`) uzun paragraf tarif içeriyor →
  handle-only olacak şekilde yeniden yazılmalı, sonra batch yeniden koşmalı.
- Üretilen 10 sahne ESKİ (tarifli) direktifle yazıldı → yeni direktifte yeniden üretilmeli.
- Mami'nin elindeki 69 resim (`agents/MAMILAS-PROJELER/6. Sınıf .../images/1..69.png`) bu
  koşunun promptlarıyla üretilmedi — eşleşme kontrol edilmeli.
- Commit kararı Mami'nin. Hata log'u: `artifacts/test-drive/HATA-LOG-2026-07-23.md`.

İlgili: [[mamilas-test-drive-mode]] · [[mamilas-bul-sec-onar]] · [[mamilas-batch-mode-mandate]]
