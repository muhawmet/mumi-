# SHOT CARD — prompttan ÖNCEKİ düşünce

**Yer:** `agents/COMMAND-INBOX/<Ad>/SHOTS/S<n>.md` · **Ölçen:** `scripts/shot-card-lint.mjs`
**Kart motora GİTMEZ.** Prompt değildir; yönetmenin düşüncesinin kanıtıdır.

---

## NEDEN VAR — yasa bir dilek, kart bir kontroldür

Bu repoda **altı kez ölçüldü**: bir kusur sınıfına karşı yasa yazmak o sınıfı kapatmıyor.

| yazılı yasa | yine de oldu |
|---|---|
| §2d.1 *"İNSAN KOY, KOL KOYMA"* | gövdesiz kol **üç projede** tekrar etti |
| §3b *"slow push-in refleks YASAK"* | **45/53** ve **34/50** klipte push-in |
| *"referans-edit NEGATIVE'e de yazılır"* | Hücre'de **12 edit'in 12'sinde** NEGATIVE yok |
| *"disclaimer çalışmaz, koşullu YAZ"* | bir hafta sonra aynı sınıf motion'da |

**Ve iki kez yasa kusur ÜRETTİ:** *"gerilim yoksa kare ölüdür"* kuralı, gerilimsiz kaynakta
ajana çatışma imal ettirdi ve **müşteri işi reddetti.**

Kart bunu çözer çünkü **düşünceyi diske yazdırır** — yazılmayan düşünce görünür olur.

---

## 🔴 KARTIN EN PAHALI SATIRI — `KAHRAMAN` ↔ `DEĞİŞİM`

**AGY, 2026-08-05'te gerçek klipleri izledi ve yazılı teşhisi çürüttü.**

`_LEHCE-YASASI-2026-08-05.md:18` kök nedeni *"kliplerin yapacak bir işi yoktu, motor boşluğu
kendi uydurdu"* diye yazmıştı. AGY üç klibe de baktı ve üçünde de **"olay klip boyunca
gerçekleşiyor"** dedi. Yani iş vardı.

Mami'nin *"plastik"* dediği karede AGY'nin gördüğü:

> *"kız sol koluyla ahşap manken tutuyor; 2-4 sn **mankenin bacakları bükülüp açı
> değiştiriyor**; kız göz kırpıyor."*

Hareket **vardı** — ama hareketi **katı olması gereken kukla** yaptı, oyuncu değil.
**"Plastik" okuması hareketsizlikten değil, işin YANLIŞ ÖZNEYE verilmesinden doğuyor.**

Bu bir lint kuralıyla yakalanamaz, bir kart satırıyla yakalanır: kadrajın kahramanı X ise,
klip sonundaki görünür değişim X'i ilgilendirmeli. Ölçen bunu **SARI** basar — hüküm ajanın.

---

## ŞABLON — 11 satır, hepsi zorunlu

```
### K12 | 5s · VO "<seslendirmedeki cümle birebir>"
VO YÜKÜMÜ    : hangi nicelik/konum/karşıtlık GÖRÜNMELİ
FİKİR        : VO'suz bakınca ne oluyor
AYRICALIK    : bunu neden animasyon anlatıyor (gerçek kamerayla çekilebilir miydi?)
KAHRAMAN     : kadrajın baskın öğesi
BAŞLANGIÇ    : start-frame olayın hangi eşiğinde — olay BİTMİŞ OLAMAZ
DEĞİŞİM      : klip sonunda görünür olarak ne farklı
MOTION HAZIR : olay kareden fiziksel olarak başlayabilir mi
KAMERA       : neden hareket ediyor — gerekçesizse SABİT
REF ROLLERİ  : kimlik/mekân/ışık/malzeme/kompozisyon hangi ref'ten
RİSK         : yazı · anatomi · katı nesne · mekanik · morph · süre · kamera · yok
SÜREKLİLİK   : öncekinden ne alır (K<n>), sonrakine ne bırakır (K<n>)
```

---

## ÖLÇEN NE YAPAR

**KIRMIZI — kanıtlı eksik:**
- **alan eksik / `—` ile doldurulmuş** — boş alan "düşünülmedi" demektir; prompt o boşluğu
  uydurmayla doldurur, motorun morph üretmesiyle **aynı mekanizma**.
- **`BAŞLANGIÇ: bitmiş` + `MOTION HAZIR: evet`** — olmuş olay canlandırılamaz.
- **sözlük dışı risk** — uydurma risk adı hangi yasa maddesine bağlanacağı bilinmediği için
  yönetilemez.
- **başlıktaki VO seslendirmede yok** — kaynakta olmayan gerçeği uydurmakla aynı sınıf.

**SARI — ajanın tek geçişte bakacağı yer:**
- **`DEĞİŞİM` kahramanı anmıyor** (yukarıdaki AGY bulgusu)
- **kamera hareket ediyor ama gerekçe yok** — *"gerekçesizse sabit"*
- **`SÜREKLİLİK` komşu kareyi anmıyor** — süreklilik kusurlarının **tamamı** tek-kare
  kapsamında doğdu (Eşeyli'de beş ardışık kare gülü bardağa geri döndürdü)

**ÖLÇMEZ ve ölçmeye çalışmaz:** kadrajın güzelliği · sahnenin duygusu · kahramanın DOĞRU
seçilip seçilmediği · fikrin iyi olup olmadığı. Onu Mami ve yönetmen düşünür.

---

## BOZUK KARE — `MOTION INTENT`

Kare bozuksa ya da yeniden basılacaksa kart yine yazılır, ama motion **final olamaz**:
tek cümlelik `MOTION INTENT` bırakılır, motora gitmez. Final motion yalnız **gerçek onaylı
kare açıldıktan sonra**, `frame:` yolu + sha ile ve kartın `BAŞLANGIÇ`/`DEĞİŞİM` satırlarıyla
tutarlıysa yazılır.

---

## KOŞTURMA

```bash
node scripts/shot-card-lint.mjs "agents/COMMAND-INBOX/<Ad>/SHOTS" \
     --vo "agents/COMMAND-INBOX/<Ad>/<Ad>_SESLENDIRME.txt"
```

Aktif projenin `SHOTS/` klasörü varsa `.claude/hooks/gate.sh` bunu **her commit'te** koşar ve
kırmızıda **bloke eder**. Yazılıp çağrılmayan ölçen, bu repoda ölçülmüş bir kusur sınıfıdır.
