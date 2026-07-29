# FAZ 9 — KARAR: PROJECT LOOT / kapanış öğrenme halkası

**Tarih:** 2026-07-29 · **Kaynak brief:** Codex · **Mami onayı:** ALINDI (dört düzeltmeyle)
**Statü:** ONAYLANDI — **ama HENÜZ İNŞA EDİLMEYECEK.** Sıra aşağıda.

## Neden var

Bugünkü ölçümde en düşük skor **öğrenme halkası: 45/100**. `APPROVED.md` sıfır ders taşıyordu;
47 aday 12 satırlık oy pusulasına indirildi (`agents/lessons/ONAY-BEKLEYEN.md`) ama halka
Mami'nin ✅'ine kadar kapanmıyor. Sol'un bağımsız denetimi de aynı yeri işaretledi:
*"asıl büyük halka hâlâ yapılmamış."*

## SIRA — bağlayıcı (Mami, 2026-07-29)

1. **Önce yeni videoyu gerçek üretim olarak bitir.**
2. **Finalden hemen sonra taze Mami hükümlerini topla.**
3. **Project Loot halkasını BU GERÇEK PROJE üzerinde kur ve doğrula.**
4. **İkinci videoya yalnız doğrulanmış carry-forward dersleriyle gir.**

Gerekçe: loot'un işi *biten bir projeden hüküm toplamak*. Bugün toplanacak taze hüküm yok —
Üreme'nin hükümleri tarihsel, arşiv de kıstas değil (Mami: *"eski işlere bunlar kötü, bunlar
yanlış gözüyle tara"*). Mekanizmayı önce kurmak, ilk gerçek kullanımını aynı zamanda ilk testi
yapardı — bu turda üç kez ısırılan desenin ta kendisi. Birinci video **canlı fixture** olur.

## Mami'nin kabul ettiği DÖRT DÜZELTME

**1. Röportaj tamamen ATLANABİLİR.**
Atlanırsa teknik loot **yine yazılır**: `layerVerdicts: null`, `status: "interview-skipped"`.
Gerekçe: 5 soru × her proje DEHB'de yüktür; zorunlu röportaj angaryaya döner, angarya atlanır —
`APPROVED.md`'nin bugün boş olmasının sebebi tam olarak buydu.

**2. `confidence` YOK — yerine ölçülebilir `evidenceStrength`.**
Yalnız sayılabilir üç şeyden türer: **kapsanan kare sayısı · before/after kanıtı · tekrar sayısı**.
Bunlar yoksa `null`. Model tahmini veri kılığına sokulmaz — bu turda kendi `kare-özel oran`
metriği tam bu sebeple KIRMIZI'dan SARI'ya düşürüldü.

**3. `PROJECT-LOOT.json` TEK KANONİK KAYNAK.**
`HASAT-*.md` yalnız ondan **deterministik üretilen görünüm** olur. İkinci gerçeklik kurulmaz —
bu repoda o hastalığın ölçülmüş örneği var (`Kuvvet ve Kuvvetin Ölçülmesi` klasöründe iki rakip
teslim, `HASAT.json` ile beyan edilerek çözüldü).

**4. Loot İKİ AYRI BÖLÜM taşır.**
- `subjectiveVerdict` — **Mami'nin değiştirilmemiş hükmü** (yasa: metni sessizce yeniden yazma)
- `objectiveMetrics` — `prompt-lint` ve mevcut ölçüm araçlarının çıktıları
Gerekçe: yalnız sözler saklanırsa "motionlar zayıftı" kalır ama **neden** zayıf olduğunu ölçen
sayı kaybolur. Bugün her proje için objektif karne var: temas · text-hece · STYLE kelime aralığı ·
NEGATIVE kare-özelliği.

## Değişmeyen sınırlar (Codex brief'inden, aynen geçerli)

`src/core` **DONUK**, ProjectPack'e dokunulmaz · site/UI yok · API ya da otomatik model çağrısı
yok · ikinci lesson bankası yok · mevcut `kapanis-hasadi.mjs` + `current-work.mjs` +
`ONAY-BEKLEYEN.md` + `APPROVED.md` genişletilir · Mami'nin söylemediği estetik hükmü sistem
**tahmin etmez** · sorular birer birer · üretimi durduran dev mimari tur yok.

## İki otorite seviyesi (değişmedi — kanon)

- Mami'nin proje hakkındaki hükmü **doğrudan** `PROJECT-LOOT.json`'a yazılır.
- Bir hüküm **yalnız Mami açıkça "sonraki projelere taşı" dediyse** global derse dönüşür.
- Taşıma hükmü yoksa **yalnız aday**; `APPROVED.md`'ye sessizce girmez.
- Aynı ders iki kez eklenmez.

## Zorunlu testler (brief'ten, aynen)

Güçlü start-frame + zayıf motion doğru ayrışıyor · carry-forward denmezse `APPROVED` değişmiyor ·
dendiyse sonraki uygun Director context'ine giriyor · ders yanlış world/register/layer'a
uygulanmıyor · aynı proje iki kez kapatılınca duplicate yok · yarım röportaj kaldığı yerden
devam ediyor · `PROJECT-LOOT` olmayan eski projeler kırılmıyor · boş/belirsiz cevaptan ders
uydurulmuyor · bozuk JSON sessizce yutulmuyor · `.agents`/`.claude` aynaları drift etmiyor ·
Windows/macOS yolları korunuyor.

## Kanıt ölçütü

**Yeşil test bitmişlik sayılmaz.** Gerçek proje üzerinde uçtan uca gösterilecek:
proje kapanışı → Mami cevapları → `PROJECT-LOOT.json` → APPROVED/aday ayrımı →
yeni Director açılışında **yalnız ilgili dersin** görünmesi.

---
*Bu turdan sonra yeni mimari önerilmez. Sistem üretime döner.*
