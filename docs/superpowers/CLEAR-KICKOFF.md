# CLEAR SONRASI — Mami'nin yapıştıracağı metin

> Aşağıdaki bloğu **olduğu gibi kopyala**, clear sonrası ilk mesaj olarak yapıştır.

---

Selam. **SEN ORKESTRATÖRSÜN.** Gece boyunca çalışacaksın, **usage bitene kadar durmayacaksın**, sabaha her şeyi teslim edeceksin. **Onay bekleme, soru sorma, çalış.**

## ÖNCE OKU (sırayla, atlama)
1. `docs/superpowers/GECE-TASK-BOARD.md` — **görev listesi, ajan kabiliyet profili, day-zero'lar**
2. `docs/superpowers/HANDOFF-2026-07-11-gece5-faz1.md` — Faz 1'in tamamı, yöntem, dersler
3. `CLAUDE.md` — kanonik kurallar
4. Memory — özellikle `mamilas-simulation-loop` ve `mamilas-mami-is-in-the-loop`

**Durum:** dal `feat/3d-diorama-shell` · tek ağaç · ağaç temiz · **vitest 1691/1691** · tsc 0 · build OK · **PUSH YOK**
**Veri:** 46 dünya · 130 ref · 32 proje · 12 palet

---

## ODAK — MAMİ'NİN SÖZÜ
> *"En büyük odak bizim üçlü: **reçete = doktor, command = eczacı, kod bütünlüğü.** Bunları task'lere bölüp yaptır. Işık yok, gece değil — o kadar mikro da değil, o kadar makro da değil."*

**İrtifa:** somut · ölçülebilir · bitirilebilir. Rim ışığı mikrosu YOK. "Sistemi iyileştir" makrosu YOK.

---

## ⚠️ HER BULGUDA UYGULA — MAMİ DÖNGÜDE
> *"Ben Claude'a atsam, hepsini gündüz yapsa, '4-5'ini gece yap' derim zaten. Ne bunların hepsi?"*

Bir bulguyu kapatmadan **ÖNCE** sor:
### **"Bu, Mami'nin PROMPT'A BAKARAK bir cümleyle düzeltebileceği bir şey mi?"**
- **EVET → KAPATMA.** Rapora *"Mami'nin gözüne bırakıldı"* diye not düş, geç.
- **HAYIR — üretimden ÖNCE, SESSİZCE oluyor → KAPAT.**

*"Ajan bu brief'e itaat edemiyor"* ≠ *"Mami bu prompt'u kullanamaz."* Gece-5'te bu ikisini karıştırıp saatlerce aşırı mühendislik yaptım. **Ajanın raporundaki DRAMI da doğrulamadan aktarma** — bulguyu doğrula, maliyetini KENDİN ölç.

---

## KULVARLAR (paralel)

### 🔴 ÖNCELİK — üçlü + kod bütünlüğü
- **T1** E2E baseline KIRIK (7/15). Fable arayüzü değiştirdi, e2e eski arayüzü arıyor. **Mami'nin fiilen kullandığı yol tarayıcıda hiç kanıtlanmamış.** → bugünkü arayüze onar, akışı koru, selector'ı güncelle. Test silme YOK.
- **T2** Reçetenin **11 karar noktası** → final brief'e hepsi geçiyor mu? Hiç ölçülmedi. (`brandKitLock` böyleydi: alan vardı, prompt'a hiç bağlanmamıştı.)
- **T3** `commandExport` vs `productionExport` — alan alan drift var mı?
- **T4** `.command`'ın 3 şeridi + production dosyası — aynı yasayı mı taşıyor? (Gece-4'te ledger sadece TR şeridindeydi.)
- **T5** Ölü QA check'leri (CHECK 6/6b) — fixture yalanını bitir.
- **T6** `brain-workbench` kopuk kablo (`sourceReport: null`) — Mami'nin denetim aracı yalan söylüyor.

Detay ve "bitti sayılır" kriterleri: **`GECE-TASK-BOARD.md`**

### 🔵 FABLE — Faz 2 tasarım (ayrı worktree, model `fable`)
**Asıl iş:** 46 dünya plakasının hepsi **aynı deniz-günbatımı motifi**. Whiteboard dünyasının kapağında deniz manzarası o dünyayı ANLATMIYOR. `PRESET_PLATE_FILES` sözleşmesi hazır, içi boş.
**Kısıt:** `src/core/*` + store **DOKUNULMAZ** · vitest ≥ 1691 · test silme YOK · her turdan sonra Sonnet review-ajanı.

### ⚫ SİMÜLASYON DÖNGÜSÜ (arka planda sürekli)
`rm -rf ~/Desktop/FAZ5-PILOT && npx tsx scripts/faz5-pilot.ts` → 14 paket
**Codex `gpt-5.6-sol` = DIŞTAN DENETÇİ** (repo'ya DOKUNMAZ):
```bash
cd ~/Desktop/FAZ5-PILOT && codex exec --sandbox workspace-write --skip-git-repo-check \
  -c model=gpt-5.6-sol -c model_reasoning_effort=high "<görev>"
```
Claude opus subagent = ikinci göz, paralel.
**Tek soru:** *"Sen MAMILAS ÜRETİM AJANISIN. `final_brief.md` + `project.json`'ı, ondan image prompt YAZMAK ZORUNDA OLAN ajanın gözüyle oku. Uçtan uca, hiçbir parçasını kırmadan itaat edebiliyor musun?"*
**ŞART:** görev tarifine **"ZATEN KAPANDI"** listesini KOY (aşağıda) — yoksa eski bulguyu tekrar getirir, bir tur yakar.

---

## CODEX'İ NASIL KULLAN (deneyimle öğrenildi)
**İyi:** gerçek çıktıyı okumak · pipeline'ı kendi throwaway test'iyle koşturmak · sözleşmeyi adversaryel okumak · **birebir alıntıyla kanıtlamak**.
**Zayıf:** usage SINIRLI (birkaç derin tur) · zanaat nesri yazmaz · geniş görevde yayılır.
**Kural:** **DAR ve DERİN ver.** Tek soru, tek dosya çıktısı. Kod yazdırma, dünya/ref yazdırma.

---

## ZATEN KAPANDI — görev tarifine KOPYALA
Path'in 2D dünyada 3D emretmesi · kabul kapısının "metafor" istemesi · kilitli markanın dünya negatifi/frameGate IP satırı/"NO English signage" satırınca yasaklanması · referanssız "birebir çiz" (`brand_refs/` + REFERENCE REQUIRED) · negatiflerin ANLAM hatasını kovalamaması (anti-sembol negatifi) · `carryOver`ın olmaması / ışık YÖNÜNÜ / SAATİ dondurması (saat DÖRT fazlı: gece·şafak·gündüz·gün batımı) · anti-sembol negatifinin whiteboard'a kendi okunu yasaklaması · gecenin güneşle aydınlatılması / taşınmaması / paletin gece karesini güneşle yalaması / `dawn-dusk` etiket artığı · dünyanın örnek öznesinin kadro emri sanılması · **havuzların dünyanın render lock'unu ezmesi** (85mm · 100mm makro · dolly · low vantage · pencere/kapı/kemer · "ışık hareket eder" · rim varyantı · key nesneyken "karşı taraftan") · havuz boşalınca kapısız havuza dönmesi · **ürün-register malzeme listesinin HER dünyaya yapıştırılması** ("painted bodywork, product finish") · kompozisyon kalıplarının kendi mobilyasını taşıması (doorway · roof edges · mist band) · EVENT BUDGET (çok-olaylı beat tek shot · **tanım cümlesi olay sayılıyordu**) · **sıra sayısının cümle bitirmesi** ("17. yüzyıl" → `"17."` diye BİR SAHNE) · eser adının 4 kardeş alandan sızması (scrub artık VERİNİN GİRDİĞİ KAPIDA) · **Magnific upscale adımı SÖKÜLDÜ** (Magnific bir node canvas, Nano Banana ve Kling İÇİNDE; 1K → Kling 1080p) · MAMI-README sırası

---

## DAY-ZERO (hiç yapılmamış)
1. **HİÇ KARE ÜRETİLMEDİ.** Her şey teori. ← en büyüğü, raporda GİZLEME
2. **`.command` hiç uçtan uca koşmadı** (Pass A → kare → Pass B → FRAME_PASS → motion)
3. **`brand_refs/` hiç kullanılmadı** — kapı var, sınanmadı
4. **E2E gerçek akış kırık** (T1)
5. **Reçetenin 11 kararı brief'e ulaşıyor mu — ölçülmedi** (T2)

---

## SABAHA TESLİM: `docs/superpowers/GECE-RAPORU.md`
1. Her task: ne yapıldı, kanıt (gerçek çıktıdan alıntı), bitti mi
2. Kaç simülasyon turu döndü, ne bulundu, ne kapandı
3. **Mami'nin gözüne bırakılanlar** ve NEDEN
4. Fable ne yaptı (commit'ler + ekran kanıtı + dürüst öz-eleştiri)
5. İki ajan da TEMİZ dedi mi? Demediyse ne kaldı
6. **DÜRÜST DURUM: "Hâlâ tek bir kare üretmedik."**

## DİSİPLİN
Gate her commit öncesi (tsc + vitest + build + `zsh -n` iki .command) · **test sayısı DÜŞEMEZ** · `git add` spesifik dosya, asla `-A` · **PUSH YOK** · sayaç kilitleri (dünya/ref/proje) EKLERKEN yükselir, ASLA düşmez · her iş parçasından sonra bağımsız review-ajanı (anti-halüsinasyon) · Termius kapanabilir → sık checkpoint · token: `rtk`
