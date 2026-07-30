# FAZ 10 — READBACK (uygulamadan ÖNCE)

**Tarih:** 2026-07-30 · **Yazan:** Claude (Opus 5) · **Brief:** `FAZ-10-KARAR-BUDDY-2.md`
**Statü:** ÖLÇÜM BİTTİ · readback yazıldı · **uygulama BAŞLAMADI — Mami'nin bir kararını bekliyor.**

Brief'in kendi sırası: kaydet → **readback** → uygulama. Bu dosya ikinci adımdır.
Brief §8'in emri buydu: *"Güncel Claude Code background/subagent ve hook olaylarını canlı probe et…
Yapılamayan proaktif davranışı yapılmış gibi raporlama."* Probe koşuldu. Sonuç aşağıda.

---

## 1. NE ANLADIM (brief'in özeti değil, hükmüm)

Buddy 2.0 bir "nefes hatırlatıcısı" değil. İstenen şey **çalışırken yanında duran bir iş
ortağı**: ağır parçayı devreder, ana thread'de Mami'yle kalır, boşlukta bağlama uygun tek
destek verir, öğretir, öğrendiğini yerel ve **Git dışı** bir kasaya yazar, ve aynı çekirdeği
Claude + Codex'te koşturur. Kabul ölçütü fixture değil: **gerçek uzun bir işte Mami yalnız
bırakılmadıysa geçti.**

Kritik cümleyi ayrıca not ediyorum çünkü tüm tasarımı o belirliyor:
> *"Mesaj iş bittikten sonra geçmiş zamanlı nefes uyarısı olarak gelirse FAIL."*

---

## 2. MEVCUT SİSTEM — ÖLÇÜLDÜ (brief adım 0)

| Yüzey | Durum |
|---|---|
| `.claude/skills/mamilas-buddy/SKILL.md` · `.agents/skills/mamilas-buddy/SKILL.md` | **Byte-aynı** (sha256 `5a0c1a4b…`). Ortak çekirdek şartı bu iki dosyada zaten karşılanıyor. |
| `.claude/hooks/buddy.mjs` (274 satır) | Saf Node, kabuk varsayımı yok, `path.join`, atomik yazma, BOM tuzağı kapalı, alt-ajan guard'ı var. **Windows'a hazır.** |
| `.claude/hooks/buddy-gate.sh` | İnce delegatör; `node` yoksa "ÖLÇEMEDİ ≠ TEMİZ" diye bağırıyor. Doğru yazılmış. |
| `.claude/settings.json` | SessionStart → `buddy-gate.sh` · **PostToolBatch → `buddy.mjs`** · PostToolUse → sessiz muhasebe. |
| `scripts/buddy-hook.test.mjs` | Var; kapı davranışını kilitliyor. |

**Atılacak bir şey yok.** Brief "gereksiz yere atma" diyor — haklı: bu altyapı Faz 10'un
taşıyıcısı. Eksik olan mekanizma değil, **davranış katmanı.**

### Zaten çözülmüş olan şey (kod yorumlarında yazılı, canlı ölçülmüş)

`buddy.mjs` kanal yasasını çıkarmış:

- `SessionStart` → düz stdout **modele ULAŞIR**
- `PostToolBatch` → `additionalContext` → **ajana ulaşan TEK gerçek kanal**
- `PostToolUse` → stdout **modele ulaşmaz** (yalnız muhasebe)
- `Stop` → `additionalContext` turu **döngüye sokar** (9 Stop ölçüldü)
- `systemMessage` → Mami'nin **ekranına** basar

Yani hook içerik yazarı değil; **ajana "şimdi konuş" emri veren sinyal.** Brief §8 tam bunu
istiyor ("Hook, içerik yazarı değil olay sinyali/fallback olsun") — ve bu **kurulu.**

---

## 3. BRIEF'İ ÇÜRÜTEN ÖLÇÜM — §1 ile §2 bu harness'ta ÇAKIŞIYOR

Canlı probe (Claude Code yüzey sözleşmesi, 2026-07-30):

| Mekanizma | Bekleme sırasında Mami'ye söz ulaştırır mı | Neden |
|---|---|---|
| `Agent` / `Bash` + `run_in_background: true` | **HAYIR** | Turn **BİTER**. Ajan ancak iş tamamlanınca yeni turn'de konuşur. |
| `PostToolUse` / `Stop` / `Notification` hook | **HAYIR** | Ajanın sözü değil; sabit hook metni ya da yalnız ekran/sistem çıktısı. |
| `PushNotification` | **HAYIR** | Bildirim, sohbet mesajı değil. |
| `PostToolBatch` + `additionalContext` | **EVET** | Turn AÇIKKEN her araç bloğu arasında ateşler → ajan o blokta konuşur. **Bugün çalışan yol bu.** |
| `Monitor` + until-loop | **EVET** | Turn'ü açık tutar, satır geldikçe ajan araya girer. |

**Çelişki:** Brief §1 "ağır parçayı background subagent'a devret" diyor; §2 "beklerken Mami'yle
kal" diyor. Bu harness'ta **birincisi ikincisini imkânsız kılıyor** — background'a verdiğin anda
turn kapanır ve tam Mami'nin en çok beklediği 10-15 dakikada **tam sessizlik** olur. Mesaj ancak
iş bitince gelir; bu da brief'in kendi FAIL tanımıdır (*"iş bittikten sonra geçmiş zamanlı"*).

**Bu, Faz 10'un en pahalı yanlış-inşa riski.** Brief'i olduğu gibi uygularsam, kurduğum şeyin
ölçütü daha ilk pilotta kırmızı döner ve bunu ancak canlı testte fark ederiz.

### Çözüm — iki yol var, ikisi de kurulabilir

**A) ÖN PLAN + PostToolBatch (tavsiyem).** Ağır iş **foreground** ajanlara verilir; turn açık
kalır; `buddy.mjs` her araç bloğu arasında ateşler; ajan 5-7. dakikada bağlama uygun tek desteği
**gerçekten bekleme sırasında** yazar. Mevcut altyapı bunu bugün taşıyor — yeni yüzey gerekmiyor,
`buddy.mjs`'in eşikleri (25dk aktif / 45dk cooldown) "uzun iş" moduna ayarlanır.
Bedeli: ana bağlam ajan çıktısını görür (token), ve iş gerçekten paralel gitmez.

**B) BACKGROUND + Monitor.** Ağır iş background'a gider, ana ajan onun log'unu `Monitor`'la izler;
turn açık kalır, satır geldikçe konuşabilir. Gerçek paralellik + söz hakkı birlikte gelir.
Bedeli: her iş bir log yüzeyi ister; Monitor'ün canlı davranışı **henüz gerçek oturumda
kanıtlanmadı** — kurmadan önce tek bir pilotla ölçülmeli.

---

## 4. KARARSIZ BEKLEMEYEN, ŞİMDİ KURULABİLİR PARÇALAR

Bunlar Mami'nin cevabına bağlı **değil**; sırayla kurulabilir:

1. **§7 MAHREMİYET KASASI** — gitignore'lu yerel kasa, Claude+Codex ikisi de okur, AGY'ye
   kapalı. *Dürüst sınır (Mami onayladı):* geçmiş rewrite edilmiyor, cümle
   **"bundan sonra yazılanlar Git'e girmiyor."**
2. **§6 ÖĞRENME GÜNLÜĞÜ** — `explicitVerdict` şeması; **duygu/tanı/neden tahmini YOK**;
   cevap vermemek ret sayılmaz.
3. **§3 DESTEK İÇERİĞİ MOTORU** — 9 seçenekli tablo + "her boşlukta aynı nefesi basma" kilidi.
   Mevcut `OFFER` metni tek kalıp basıyor; bu onun yerine geçer.
4. **§5 GÖRSEL DİL** + **KULLANICI KONTROLLERİ** ("sadece iş" → tam sessizlik, "bunu unut" →
   hedef önce gösterilir).
5. **§9 CODEX ADAPTÖRÜ** — `.agents/skills` çekirdeği zaten byte-aynı; Codex'in kendi yüzeyi
   yazılır, **Claude hook JSON'u kopyalanmaz.**

---

## 5. MAMİ'NİN TEK KARARI

> **Bekleme eşliği A yoluyla mı (ön plan + PostToolBatch, bugün çalışıyor) yoksa B yoluyla mı
> (background + Monitor, önce tek pilotla ölçülür) kurulsun?**

Tavsiyem **A ile başla, B'yi pilotla ölç.** Gerekçe: A mevcut altyapıyla bugün canlı kanıt
üretir; B daha doğru mimari ama kanıtsız, ve Faz 10'un ölçütü "kurdum" değil "Mami yalnız
kalmadı".

---

## 6. WINDOWS NOTU (`CLAUDE.md` ortam yasası)

Bu turda yazılacak her şey: saf Node · `path.join` · `normalize('NFC')` · `python3` yok ·
POSIX kabuk çağrısı yok · `/tmp` sabiti yok. Kasa yolu da `os.homedir()` üzerinden çözülür,
`$HOME` genişletmesine güvenilmez — PowerShell'de dört kez sessiz no-op ölçüldü.
