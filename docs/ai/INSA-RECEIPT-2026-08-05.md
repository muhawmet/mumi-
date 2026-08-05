# İNŞA RECEIPT — Dörtlü Masa'yı kanıtlı kapıya çevirme turu (2026-08-05)

**Kapsam:** Dörtlü Masa sözleşmesini markdown dekorundan kodla zorlanan bir kapıya çevirmek.
**Faz:** İCRAAT → İNŞA (dar, geri dönüşlü) → İCRAAT. Baseline HEAD `dd83a98`, worktree temizdi.
**Üretime dokunulmadı:** aktif Denetleyici projesinin promptu, Enzimi, referansları, `images/`
klasörü ve Mami'nin NB2 basım sırası değişmedi.

## KURULAN DUVARLAR

| Ne | Nerede | Ne zorluyor |
|---|---|---|
| Dörtlü Masa kanonu | `docs/ai/DORTLU-MASA.md` | roller · sonuç sözlüğü · 5 tetikleyici · artefact yeri — **tek otorite, nüshalanamaz** |
| Dış göz brief + hüküm bloğu biçimi | `agents/DIS-GOZ-BRIEF-SABLONU.md` | Sol/AGY çağrı kuralları, gerçek koşmuş çıktılardan türetildi |
| Hüküm bloğu ölçeni | `scripts/hukum-blogu.mjs` | koşma kaydı yoksa ya da okunan yol diskte yoksa **KIRMIZI** — sahte `CLEAR` duvarı |
| Canary kilidi ölçeni | `scripts/canary-lock.mjs` | boş kilit üretimi açamaz; `RESHAPE`/`UNPROVEN`/`SOL_UNAVAILABLE` açmaz |
| Kapanış makbuzu | `scripts/kapanis-receipt.mjs` | mutlak yol · gerçek sha · süre · durum · kanıt; **`--zorla` ile atlanmaz** |
| Lifecycle bağı | `scripts/current-work.mjs` | `uretim` fazı geçerli canary kilidi + Sol plan hükmü olmadan açılmaz; `kapat` makbuzsuz kapanmaz |
| Kanon duvarı | `scripts/dortlu-masa.test.mjs` | bağ koparsa ya da nüsha doğarsa kırmızı; kod sabitleri kanona çivili |

## KAPILAR

```
npx tsc --noEmit   → 0
npx vitest run     → 2710 test yeşil  (tur başlangıcı 2602 → +108)
npm run build      → OK
launcher (zsh)     → OK
docsContract       → 56/56 (faz paritesi dahil)
```

`MAMILAS_LINT_SKIP` ve `--no-verify` kullanılmadı; test silinmedi, baseline yalnız gerçek
artışla ratchet edildi. Kapı bu tur içinde **iki kez** commit'i bloke etti (kırık ileriye
dönük atıf · canlı motion kırmızısı) ve ikisi de gerçek onarımla açıldı.

## DIŞ GÖZ HÜKMÜ — SOL · 2026-08-05
KOŞULDU: codex exec -m gpt-5.6-sol · model_reasoning_effort=high · -s read-only · 10 dosya
OKUNAN: docs/ai/DORTLU-MASA.md
OKUNAN: agents/DIS-GOZ-BRIEF-SABLONU.md
OKUNAN: scripts/hukum-blogu.mjs
OKUNAN: scripts/canary-lock.mjs
OKUNAN: scripts/kapanis-receipt.mjs
OKUNAN: scripts/current-work.mjs
HÜKÜM: RESHAPE
BULGU: Duvarlar kuruluydu ama altı kaçış yolu açıktı — `kapat --zorla` makbuzu atlıyordu, klasör ve boş dosya medya/kanıt sayılabiliyordu, Sol plan bloğu eksikken faz yine ilerliyordu, kapanışta sha gerçek dosyaya karşı ölçülmüyordu, fixture'lar `.md` dosyalarını kare/klip kabul edip sözlüğü ölçtükleri modülden ithal ediyordu, ve sonuç sözlüğü kanonla kod arasında bağsız duruyordu.
SONUÇ: uygulandı — altı maddenin altısı kapatıldı; yedincisi (Windows'ta KAYNAK yokluğu yanlış alarm veriyordu) daraltıldı, sekizincisi kapsam ihlali olmadığını doğruladı.

Ham çıktı transfer alanında: `~/Desktop/mamiş/04-SOL-INSA-REVIEW.md`
(**transfer alanı otorite değildir** — kanonik kayıt bu dosyadır.)

## AÇIK TEK SINIR

**implementation complete / visual validation pending.**

Bu tur bir ÜRETİM kanıtı üretmedi ve üretemezdi: kurulan kapıların gerçek değeri, ilk gerçek
canary turunda (8 klip · AGY tarifi · Sol çürütmesi · Mami hükmü) ölçülecek. Bugün ölçülen
şey yalnız şu: **kapılar kendi tersine karşı ateşliyor.**

## KENDİ KUSURUM

`--zorla` sınamasını aktif projenin `00-DURUM.txt`'i üzerinde yaptım; dosyayı üzerine yazıp
sildim. Git'te izlendiği için `git checkout --` ile bit-birebir geri alındı ve doğrulandı.
Sınama scratch dosyada yapılmalıydı — kapsam yasası "aktif projenin state'ini değiştirme"
diyordu ve bu ihlaldi.

## AÇIK BULGU — bu turda kapatılmadı

Faz paritesi kilidi (`src/core/docsContract.test.ts:320-330`) **substring-varlık** ölçüyor:
`AGENTS.md` her iki faz yolunu da andığı için, "Aktif faz: İCRAAT" yazarken `CLAUDE.md` İNŞA
yükleyebilir ve kapı yeşil kalır. Bu turda iki giriş ELLE birlikte çevrildi, ama duvar bunu
zorlamıyor. `src/core/` kapsam dışı olduğu için dokunulmadı — ayrı bir mikro task.
