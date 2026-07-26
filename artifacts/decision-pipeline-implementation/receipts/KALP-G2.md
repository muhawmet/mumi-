# KALP-G2 — 5-kare dünya sınavı (2026-07-26)

> Operasyon: `docs/superpowers/plans/2026-07-26-mamilas-kalp-nakli.md`
> Kapı hedefi: *bir dünyayı sınamak video üretmek kadar pahalı olmasın.*
> Gerçek çıktı: `artifacts/decision-pipeline-implementation/g2-sinav/`

## Ne yapıldı

`src/core/worldExam.ts` — 46 dünyaya uygulanabilen ortak **5-kare sınav seti**.
`scripts/dunya-sinavi.ts` — koşucu (`<worldId>` · `<worldId> --prompts` · `--all`).

**Sınav kare üretmez.** Prompt ve yapısal ölçüm üretir; kare Mami'nin elinde doğar (API yok).
Bu yüzden hükümleri `CARRIED / MISSING / CONFLICT / NOT_MEASURABLE` — **`PASS` yok**, çünkü
yapısal taşıma görsel PASS değildir.

### Kontrollü deney — sınavın bütün değeri burada

Beş sahne, konu, mekân, cast, yazı ve notlar **46 dünyada byte-eşit**. Tek değişken dünyanın
kendisi. Soru dünyaya göre değişseydi fark dünyaya değil soruya yazılırdı; sınav ölçü aleti
olmaktan çıkardı. Testle kilitli (`worldExam.test.ts` — iki dünyanın brief'i yalnız
dünya-türevi alanlarda ayrışabilir) ve determinizm ayrıca kilitli (aynı dünya iki koşumda
aynı raporu vermek zorunda — oynayan bir alet dünya farkını ölçemez).

Dünyanın **kendi** üretim yolu kullanılır (`EXAM_PATH_BY_GROUP`): yanlış yol seçmek uyumluluk
kapısını tetikler ve dünya kusuru gibi görünen bir **sınav kusuru** üretirdi.

### Beş eksen

| # | Eksen | Ne yokluyor |
|---|---|---|
| 1 | `PHYSICS` | Dünyanın fiziği kareye iniyor mu; yerine nesne envanteri mi geçiyor; sahnenin ışık kaynağı çözülü mü |
| 2 | `TEXT` | Türkçe metin diyakritikleriyle pakete iniyor mu; temiz-plaka bandı aynı karede iptal mi ediyor |
| 3 | `REF` | Ref DNA'sı gerçekten bir alan dolduruyor mu; ezilen ışık cümlesi makbuz bırakıyor mu |
| 4 | `CAST` | Yaş kilidi · karakter payı · tekrar eden tag brief'e iniyor mu |
| 5 | `START_FRAME` | Kare motion'ın ihtiyacını taşıyor mu; yeni-nesne ve tek-eylem kilitleri var mı |

### Ölçüm yüzeyi — gerçek çıktı okunarak belirlendi

`agentBrief` + `imagePrompt` + `motionPrompt` **birlikte**. Sebep ürün yasası: site final
prompt yazmaz, ajan yazar. Gerçek çıktı okundu ve iki şey görüldü:

- Reçetenin sahne notları (`turkish_labels`, `avoid`, `light_source`) `imagePrompt`'ta değil,
  brief'in **"Doctor's Recipe Notes"** bloğunda yaşıyor — doğru mimari. Yalnız `imagePrompt`'a
  bakan bir sınav, taşınan yarım paketi "kayıp" sanardı. **İlk okumam buydu ve yanlıştı;**
  kod okunarak reddedildi.
- Batch seviyesindeki `deliveryDeclaration: {kind:'baked'}` metni **bütün** sahnelerden ister
  ve taşımayanı `DELIVERY_PROMISE_BROKEN` ile BLOCKED yapar. Sınavın beş karesinden dördü
  bilerek temiz plaka → batch beyanı kullanılsaydı **sınav kendi kendini bloklardı** ve 46
  dünyanın hiçbiri ölçülemezdi. İstek bu yüzden sahne notundan taşınır. Gerekçesiyle testte.

## 🔴 Sınavın ilk bulgusu — 25 dünyada Mami'nin ışık talimatı sessizce düşüyordu

**Yetenek hükmü:** Mami'nin sahne ışığı talimatının hayatta kalması, dünyanın **düzyazısının
sabit bir ifade listesine uymasına** bağlıydı. `namedKeySourceClause` içindeki
`WORLD_KEYS_OFF_WARM_PRACTICAL_RE` kapısı hem varsayılan cümleyi hem de **Mami'nin yazdığı**
kaynağı birlikte kesiyordu.

- İlk tarama 29 dünya gösterdi. **Ölçüm ikiye bölündü:** 4'ü düz-ışık dünyası
  (`isFlatLightWorld`) — orada yönlü key yok, bandın basılmaması **doğru**. Geriye **25 gerçek
  düşme** kaldı. İki durumu tek başlıkta toplamak, doğru davranan dünyaları da suçlamaktı.
- Düşenler arasında ışığın bütün görünüş olduğu dünyalar vardı: `automotive_hero_real` ·
  `nature_doc_real` · `cyberpunk_neon_noir` · `period_reconstruction` · `castlevania_gothic` ·
  `sci_fi_hard_surface` · `archival_newsreel`.
- **Neden G1e bunu yakalamadı:** G1e tek dünyada (`pixar_3d_edu`) gerçek çıktıyla doğrulanmıştı
  ve orada çalışıyordu. Kütüphane genelinde çalışmadığını ancak bu sınav gösterebilirdi —
  **G2'nin var oluş sebebi tam olarak budur.**

### Düzeltme (kod, kütüphane değil)

Kapının gerekçesi **gürültü**ydü: kaynak menüsü olmayan bir dünyaya varsayılan cümle basmak
prompt'u boşuna şişirir. O gerekçe yalnız **varsayılan** dal için geçerlidir. Mami kaynağı
adlandırdığında gürültü sorusu yoktur — talimat vardır, ve PROJECT_CONTRACT açık:
*kullanıcının cümlesi sessizce scrub edilmez.*

Kapı varsayılan dala taşındı; adlandırılmış dal kapısız. Düz-ışık istisnası **korundu**.

**İki test kalıcı kıldı:** (a) düz-ışık olmayan **her** dünyada adlandırılmış kaynak hayatta
kalmak zorunda — düşen dünyaların adı hata mesajında listelenir; (b) varsayılan dalın kapısı
**yerinde** — tamamen sökülseydi fix, çözdüğünden fazla prompt şişirirdi.

**Sonuç:** `PHYSICS` ekseni 21/46 → **46/46**.

## Kütüphane sonucu — 46 dünya

| Eksen | Taşınıyor | Çelişki | Eksik |
|---|---|---|---|
| PHYSICS | **46** | 0 | 0 |
| TEXT | **46** | 0 | 0 |
| REF | **46** | 0 | 0 |
| CAST | **46** | 0 | 0 |
| START_FRAME | **46** | 0 | 0 |

46 dünyanın **46'sı** prompt üretebiliyor, **0** bloklanıyor.

**Dürüst okuma:** bu sonuç "46 dünya iyi kare veriyor" DEMEK DEĞİLDİR. Sınav yapısal taşımayı
ölçer. Kütüphane karnesi (`docs/KUTUPHANE-KARNESI.md`) hâlâ doğru: gerçek kare veren dünya
sayısı **1**. G2'nin kazancı şu: bir dünyayı sınamanın maliyeti bir video prodüksiyonundan
**bir script koşumuna** indi, ve yapısal kusur artık kare üretmeden görülüyor.

## Kapı kanıtı (plan: iki dünyada gerçek çıktı, fark okunabilir olmalı)

| Dünya | Durum | Okunan fark |
|---|---|---|
| `pixar_3d_edu` | bilinen-iyi (103 gerçek kare) | ışık kaynağı **çözülü** · ref ışığı `WORLD_AGREES_DEDUPED` ile 1 cümle düşürüyor, makbuz var |
| `kurzgesagt_edu` | hiç kare görmemiş · düz ışık | **kaynak sorusu geçersiz** (yönlü key yok) · ref ışığı `FLAT_WORLD_DROPS_DIRECTIONAL` ile **2 cümle** düşürüyor, makbuz var |
| `period_reconstruction` | hiç kare görmemiş · fix'in kurtardığı 25'ten biri | fizik 13/13 · adlandırılmış kaynak artık iniyor |

Dosyalar: `g2-sinav/SINAV-pixar_3d_edu.txt` · `SINAV-kurzgesagt_edu.txt` ·
`SINAV-period_reconstruction.txt` (beş prompt gövdesiyle) · `SINAV-46-DUNYA.md`.

## Kapı

`npx tsc --noEmit` → **0** · `rtk proxy npx vitest run` → **2108/2108 (86 dosya)** ·
`npm run build` → **OK** (>500 KB bundle uyarısı FINAL-CONVERGENCE-LEDGER'da kabul edilmiş
debt). Test sayısı 2096 → 2108 (+10 sınav testi, +2 ışık yasası); hiçbir test silinmedi.

## Ledger (final convergence'a taşınan)

1. **Düz-ışık dünyasında Mami'nin adlandırdığı kaynak hâlâ makbuzsuz düşüyor.** Orada key
   kavramı yok, yani düşmesi doğru — ama G1d'nin kurduğu desen gereği **makbuz bırakmalı**.
   Bugünkü fixin kapsamı dışında bırakıldı (receipt threading ayrı iş).
2. **`fizik cümlesi` oranı bazı dünyalarda düşük** (`bleach_soul_world` 3/7, `claymation_aardman`
   3/6, `jjk_mappa` 6/11). Render lock'un verbatim taşınmadığı biliniyordu; sınav artık bunu
   dünya başına sayıyla gösteriyor. Kusur kütüphanede mi kodda mı — **G3'ün işi.**
3. **Sınav tek reçete profili koşuyor.** Beş kare bir kontrollü deneydir; farklı sahne
   sayısı/register kombinasyonları ayrı profil ister. Bugünkü set minimum ortak settir.

## Sıradaki tek adım

**G3 — kütüphane sınavı:** sınav seti 46 dünyaya uygulanır, çıkan kusurlar **kütüphanede**
düzeltilir (kod yasası genel, dünya kusuru yerel). İlk hedef ledger #2: fizik cümlesi oranı
düşük dünyalarda render lock'un neden verbatim taşınmadığı — dünya metni mi, kod mu.
