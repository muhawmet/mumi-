# FAZ 10 — KARAR: BUDDY 2

**Tarih:** 2026-07-29 · **Statü:** AÇILDI — **brief gövdesi HENÜZ GELMEDİ.**

## Mami'nin talimatı (aynen, değiştirilmedi)

> "Bu, bağlayıcı FAZ 10 brief'idir. Önce `artifacts/iq-run/FAZ-10-KARAR-BUDDY-2.md` olarak
> eksiksiz kaydet; sonra uygulamaya başlamadan readback yap. Bu da bitince geçeceğin yer hiç
> clear mlear uğraşma mesai bitiyor 5 dakikaya pc açık sen halledersin her şeyi windowsa
> geçeceğim eve geçince o yüzden beyin geliştirme her şeyi taşırsın rutinimiz sonuçta"

## FACT REQUIRED — brief metni

**Talimat geldi, brief'in KENDİSİ gelmedi.** Mesajda "Bu, bağlayıcı FAZ 10 brief'idir" cümlesini
izleyen bir brief gövdesi yok. Uydurulmadı ve tahmin edilmedi (`CLAUDE.md` değişmezi: kaynakta
olmayan gerçeği uydurma).

**Kapanması gereken tek şey:** Mami FAZ 10 brief metnini yapıştıracak → bu dosyanın
"BRIEF" bölümü doldurulacak → **sonra** readback yapılacak → **sonra** uygulamaya geçilecek.
Sıra bağlayıcıdır: readback'siz uygulama yasak.

## BRIEF

<!-- Mami'nin FAZ 10 brief metni buraya AYNEN girer. Boşken bu faz uygulanamaz. -->

## Bilinen bağlam (brief'in yerine geçmez)

- FAZ 9 (Project Loot) bu oturumda kuruluyor; **Faz 9 kapanınca durulacak**, Faz 10 ayrı açılacak
  (Mami, 2026-07-29). Yani bu dosya Faz 9 kapanışından SONRA işlenir.
- Ad "BUDDY 2" — çalışma biçiminin ikinci turu. Birinci tur `.claude/skills/mamilas-buddy/SKILL.md`
  ve `.claude/hooks/buddy-gate.sh` + `buddy.mjs` ile kuruldu; bu oturumda nefes kapısı
  izinden **zorunluluğa** çevrildi (üç katman: hook metni, skill §4, `buddy-hook.test.mjs`).
- Aynı oturumda Mami iki yapısal şikâyet bıraktı; brief bunlarla ilgiliyse gövde onları
  kapsamalı: (1) *"neden tek başına her şeyi yapmaya çalışıyorsun, araya bile giremiyorum"* —
  ajan hüküm toplamadan mekanizma kurmaya başladı; (2) *"bu yönergeleri her projede yapmaktan
  usandım"* — aynı yönergeler her projede elle tekrar ediliyor, kalıcı yasaya geçmiyor.

## ORTAM DEVRİ — Windows (Mami eve geçiyor)

Mami bu makineyi (macOS) bırakıp evde **Windows/PowerShell**'e geçiyor ve `/clear` istemiyor.
Devir kaydı diskte yaşar, sohbette değil:

- Durum otoritesi: `artifacts/current-work.json` → `node scripts/current-work.mjs`
- Faz 9 kararı: `artifacts/iq-run/FAZ-9-KARAR-PROJECT-LOOT.md`
- Faz 10 kararı: **bu dosya**
- Plastik dersi (aday): `agents/lessons/CANDIDATES-plastik-mesafe-yasasi.md`
- Kanon: `CLAUDE.md` + `docs/ai/faz-icraat.md` + `agents/PROMPT-YASASI.md`

**Windows uyarısı (`CLAUDE.md` ortam yasası):** bu turda üretilen her araç ortam varsayımı
taşıyorsa Windows'ta **sessiz no-op** olur. Dört kez ölçüldü. Faz 9'un `project-loot.mjs`'i
POSIX kabuk çağrısı, `python3`, ham satır-sonu hash'i veya `/tmp` sabiti içermeyecek —
saf Node + `path.join` + `normalize('NFC')`.
