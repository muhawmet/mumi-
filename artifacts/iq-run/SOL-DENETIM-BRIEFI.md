# SOL'A DENETİM BRIEFİ — MAMILAS Faz 8, 2026-07-29

> Mami'ye: bunu olduğu gibi Sol'a yapıştır. Amaç övgü değil — **beni kırması.**

## Rolün

Bağımsız ikinci gözsün. Görevin bu turda yapılan işi **onaylamak değil, çürütmek**.
Salt-okuma çalış. Repo: `/Users/Muhammet/Desktop/mamilas-modern`, dal `main`, 13 commit
(`859068c..HEAD`, 2026-07-29). Kapı durumu: `tsc` 0 hata · `vitest` 2306 PASS / 0 FAIL.

Not: Codex bu turda zaten bir denetim yaptı ve **7 gerçek kusur** buldu (hepsi kapatıldı).
Aynı yerleri tekrar kazma — aşağıdaki "zaten bulundu" listesine bak. Yeni bir şey bul.

## Ne iddia ediyorum (hepsi saldırıya açık)

1. **Kod motora giden prompt'u üretmiyor.** Kodun ürettiği metin ile teslim edilen kare
   arasındaki örtüşme %1-3; aktif projede %0 (site hiç koşulmadı). Bu yüzden Codex'in IQ
   planındaki Planner/Selector/Compiler katmanı **kurulmadı**.
   → *Saldır:* örtüşme ölçümü yanlış olabilir mi? Site gerçekten hiç koşulmadı mı?
   Bu karar hangi durumda yanlış olur?

2. **71 revizenin sıfırı sahne fikri kusuru.** Sınıflandırma: yazı/rakam %35 · kavram ışığı %20 ·
   rol/fiil %10 · prop-@tag %8.
   → *Saldır:* sınıflandırma taraflı mı? "Fikir kusuru" tanımı çok mu dar seçildi?
   Bir bloğu başka sınıfa atsan sonuç değişir mi?

3. **Linter artık kalıbı değil işlevi ölçüyor.** ~200 sahte alarm susturuldu; ifade AİLELERİ
   kabul ediliyor (`Three physics beats` = `three things are alive`).
   → *Saldır:* `scripts/prompt-lint.mjs` içindeki her `test:` regex'ini gerçek korpusa karşı
   koştur. Hangi aile fazla geniş (gerçek eksiği kaçırır), hangisi fazla dar (sahte alarm)?
   Özellikle: `temas`, `derinlik`, `ten`, `bearsText`, `nearSkin`, `frameBody`, `heceHatalari`.

4. **`dunya-kilidi.mjs` dünya kilidini doğru emit ediyor.** 46/46 dünya, ham hex 0, STYLE ort. 86.
   → *Saldır:* çıktı gerçekten o dünyanın kilidi mi, yoksa kütüphaneden rastgele seçilmiş
   cümleler mi? Puanlama **sezgisel** (kabul ediyorum) — hangi dünyada yanlış bileşen seçiyor?
   `pixar_3d_edu` çıktısını Üreme'nin gerçek STYLE'ıyla karşılaştır.

5. **Kapanış kapısı artık atlatılamaz.** Eksik kit/medya/bloke/açık karar varsa kapanmaz;
   yalnız `--zorla` geçer ve override kapıda okunmaz.
   → *Saldır:* `scripts/current-work.mjs` `cmdKapat`'ta başka kaçak var mı? `scanDeliverables`
   yalnız dosya ADI sayıyor — boş ya da geçersiz teslim kapıyı geçer mi?

6. **Skor 81/100 ve tavan üç boyutta sıfır kanıtla sınırlı.**
   → *Saldır:* puanlar rubriksiz (kabul ediyorum). Hangi boyut şişirilmiş? Hangi kanıt sütunu
   iddiayı taşımıyor? `artifacts/iq-run/CALISMA-LOGU.md`.

## Zaten bulundu ve kapatıldı — tekrar etme

Codex bu turda buldu: `face` deseni `surface` içinde eşleşiyordu · Bileşke `FIREWALL NEGATIVE:`
yazıyor ve görülmüyordu · temas ailesi `contact plane touching` kabul etmiyordu · `bearsText`
`"200 g"`yi kaçırıyordu · MOTION tespiti dardı · kapanış kapısı `deliverablesOverride` ile
atlatılabiliyordu · buddy "blok başına tek teklif" garantisi yanlıştı.
Bir ajan buldu: `lintBlock` dosya tipini almıyordu (motion dosyasında `bad` kirleniyordu).
Kendim düşürdüm: `kare-özel oran` metriği revizeyi TERS yönde öngörüyordu → SARI'ya indirildi.

## Nereye bakılmadı (buralarda bir şey varsa değerlidir)

- `src/core/` **hiç değiştirilmedi** (donuk). Ama orada ölçülmemiş ne var?
- 46 dünyanın 45'i hiç kare görmedi — REAL hattı sıfır gerçek kareyle yargılanıyor.
- `qaScore` motion'a bakmıyor; hex sızıntılı prompt 100 alıyor (`proof.ts`).
- Register motion/quality kontratına inmiyor (`agentProtocol.ts`'te "register" kelimesi geçmiyor).
- `memory-sync` tek yönlü; üç ayrı tarama işaretledi, hiçbiri gerçek kayıp üretemedi.
- `Kuvvet MİRA` ve `Kuvvet ve Kuvvetin Ölçülmesi` aynı videonun iki sürümü, iki klasörde.

## İstenen biçim

En fazla 12 bulgu, ağırdan hafife. Her bulgu: **GERÇEK / SAHTE / DOĞRULANAMADI** + `dosya:satır`
+ tek cümle. Övgü yazma. Emin olamadığına `DOĞRULANAMADI` yaz — tahmin, bulgudan kötüdür.
Bir bulgu ancak sistemin bir **yeteneğini** açıklıyorsa raporlanır; kelime avı yasak.
