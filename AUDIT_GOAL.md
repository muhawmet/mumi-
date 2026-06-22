# MAMILAS-MODERN — DENETLEME TURU (detection-only audit charter)

> **Bu bir BULMA görevidir, YAPMA görevi DEĞİL.** Hiçbir dosya düzenlenmez,
> hiçbir kod üretilmez, hiçbir bug "yol üstü" düzeltilmez. Çıktı tek şey:
> kanıtlı bulgu raporu. Düzeltme ayrı bir turda, ayrı bir goal'le yapılır.

Hedef repo: `/Users/Muhammet/Desktop/mamilas-modern`
İşlev/parite çıtası (READ-ONLY referans): `/Users/Muhammet/Desktop/mamilas_work_current/mamilas.html` (11.940 satır)
Eski site = **işlev/menü/içerik kıstası** (görünüm değil). Eski 1/10 görünüm, ama
fonksiyon olarak 10/10 — özellikle **Reçete** ekranının içi. Modern bunu işlevsel
olarak yakalamak ZORUNDA.

---

## 0. ALTIN KURALLAR (her ajan uyar)

1. **Sadece oku, yazma.** `Edit/Write` YOK. Sadece okuma + çalıştırıp gözlemleme.
2. **Her bulgu kanıtlı.** Tahmin yok. Bulgu = nasıl tetiklendiği + nerede (dosya:satır)
   + beklenen (eski sitedeki karşılığı, varsa satır/bölüm) + gözlemlenen.
3. **Kendi üretme.** "Şöyle olsa güzel olurdu" değil; somut **defekt** veya somut
   **eksik işlev**. Kanıtsız estetik yorum P2'nin altına bile yazılmaz.
4. **Eski siteyi referans göster.** Parite bulgusunda mamilas.html'deki ilgili
   bölümü/fonksiyonu adıyla cite et.
5. **Sınıflandır:** her bulgu P0 (kırık/bloklayıcı) · P1 (işlev eksik/yanlış) ·
   P2 (UX/premium cila). Şişirme yok; aynı kök sebep tek bulgu.

## RAPOR ŞEMASI (her bulgu tek satır blok)

```
[ID]  FINDING-<lane><n>
LANE  A|B|C|D|E|F
SEV   P0|P1|P2
WHERE src/...:satır  (veya "runtime: <adım>")
WHAT  Tek cümle: ne kırık/eksik/yanlış.
PROOF Nasıl gözlemlendim (komut/tıklama/konsol/grep çıktısı).
BAR   Eski karşılığı: mamilas.html "<bölüm/fonksiyon>" (yoksa "—").
```

Tüm bulgular `AUDIT_FINDINGS.md`'ye yazılır (TEK çıktı dosyası). Sonunda
özet tablo: lane × severity sayıları.

---

## LANE'LER (paralel ajanlara böl — her lane bağımsız, dosya çakışması yok)

### LANE A — Runtime & render bug'ları (P0 avcısı)
`npm run dev` aç, her adımı (Brief→Reçete→Sahneler→Timeline) gez. Ara:
- **Sayfa kaymıyor mu?** (Bilinen şüphe: `body{overflow:hidden}` + shell `minHeight:100vh`
  + `.ml-main{overflowY:auto}` ama main yükseklik sınırı yok → uzun içerik kırpılıyor.
  Doğrula ve tam kök sebebi yaz.)
- Konsol hataları/uyarıları (her adımda, desktop + ≤820px).
- Layout taşması, üst üste binme, kesik metin, görünmez buton.
- Responsive kırılma (sidebar/right-rail collapse, grid stack).
- Focus tuzağı, klavye ile erişilemeyen kontrol, kontrast (AA).

### LANE B — İşlev paritesi (eski site ↔ modern) — EN KRİTİK
Eski sitenin HER bölümünü modern karşılığıyla kıyasla; **eksik veya zayıf** olanı yaz.
Özellikle bu zengin alanlar (ekran görüntülerinden onaylı):

- **Reçete / Marka Kiti Kilidi:** eskide 5 yapılı alan (MARKA ADI, LOGO NOTU, MARKA
  RENKLERİ, FONT, PALET) + "Müşteri onayı — kiti kilitle" + "KEŞİFTE SERBEST" toggle.
  Modern bunu **tek textarea** ile mi geçiştiriyor? Kanıtla.
- **Varyant Testi A/B/C:** eskide "3 palet varyantı" / "3 world varyantı" butonları +
  "hazır değil" durumu, tek değişken kuralı. Modern entegre mi, gömülü mü?
- **Yaratıcı DNA (1/3):** eskide 3 DNA slotu (kart + "+ DNA ekle"), referans arama,
  karta dokunup kaldırma. Modern kaç slot? Çoklu DNA var mı?
- **AMAÇ & GÖRSEL DÜNYA:** AMAÇ satırı (Eğitim/Stilize/Reklam/Editoryal/Sosyal) +
  GÖRSEL DÜNYA grid (EĞİTİM & STİLİZE 13+ world kartı). Modern grid tam mı?
- **Sağ panel (ADAPTİF ÖNİZLEME):** canlı render önizleme + preset adı +
  "BU TAMAM — BRİEF'İ HAZIRLA" + IDEA/BRIEF/IMAGE/MOTION/SUNO/QA çipleri + ikinci
  canlı world-glyph + REÇETE özeti + KANIT DOKTORU (DURUM + finding) + BATCH READINESS
  (blocked + reçete) + "Kling 30 Batch @ Kopyala"/Image + AKILLI ÖNERİ. Modern sağ
  panel bunların kaçını taşıyor?
- **PROMPT LAB adımı:** eski sidebar'da `4 · PROMPT LAB` ayrı bir adım. Modern'de
  böyle bir adım VAR MI, yoksa kayıp mı?
- **Sahneler:** Sahne/Text sayısı kontrolleri (+Sahne ekle, Son sahneyi sil, Tam sayı,
  Sayıyı uygula, İlk text# no, Numarayı uygula, **Renumber**), Storyboard "Bölümü oynat/
  Durdur" + faz-etiketli thumbnail'lar, Uzun Batch Kalite Kontrolü (İlk/Orta/Son 100/100),
  Üretim Defteri ("Altın demoyu yükle", "Eksiksiz sahneleri toplu onayla", "Defteri
  kopyala", Hazır/Blok/Revizyon/Stale sayaçları). Modern hangilerini taşımıyor?
- **EXPORT:** eskide ayrı adım. Modern Timeline'a mı gömülü, paketler tam mı?

### LANE C — Beyin & çıktı doğruluğu
`src/core/{brain,pure,proof,source,beats}.ts` + `agents/` + `knowledge/`. Ara:
- Brief/paket çıktısında uydurma (no-invention ihlali), kaynak sadakati kaybı,
  token sözleşmesi kırığı (`BRAND KIT: LOCKED`, `CREATIVE VARIANT TEST — variable:`,
  `RENDER LOCK`, `SCENE DOSSIER`, `PROOF STATE`).
- `proofDoctor`/`quantumScore` gerçekten mi denetliyor yoksa kabuk mu (regression
  listesi SURGERY_DATA ile eşleşiyor mu, dar mı).
- Ajan dosyaları ↔ site paket başlıkları gerçekten hizalı mı.

### LANE D — State / store / persistence
`src/store/useStudioStore.ts`. Ara: stale-state temizleme delikleri, migrate kayıpları,
vault load/save kenar durumları, persist v5 alan kaçakları, readiness kapısı gevşeklikleri.

### LANE E — Premium/UX cila eksikleri (P2)
Sadece somut: tutarsız spacing/altın aksan, hizasız grid, eksik hover/focus, mobilde
bozulan blok, "boş hisli" panel (eski sitedeki dolulukla kıyasla). Her biri ekran/adım kanıtlı.

### LANE F — Ölü kod & çöp
Quarantined `src/core/*` (app.ts, brief-generator.ts, references.ts, ab-tester.ts vb.
React'in import etmediği dosyalar), kullanılmayan asset/CSS sınıfı, Tailwind kalıntısı
(kurulu değil — kullanan dosya kaldıysa stilsiz render = P1, sadece import değilse P2).

---

## ÇALIŞTIRMA
Her lane'i ayrı ajan(lar)a ver (A–F bağımsız, aynı anda koşabilir; hepsi salt-okuma →
çakışma yok). Her ajan kendi bulgularını `AUDIT_FINDINGS.md`'ye şema ile ekler.
Bir **entegratör ajan** sonunda dedup + lane×severity özet tablosu yazar.
**Hiçbir ajan kod değiştirmez.** Bitince Claude (Opus) bulguları bağımsız teyit eder:
kanıtsız/uydurma bulgu CHALLENGED damgalanır, gerçek olanlar CONFIRMED.

## BİTİŞ KRİTERİ
`AUDIT_FINDINGS.md` dolu + her P0/P1 reprodüksiyon adımıyla + özet tablo + sıfır kod değişikliği.
