---
name: mamilas-decision-pipeline
description: "MAMILAS'ta aktif olan Decision Pipeline dönüşümü — her oturumda önce EXECUTION_STATE.md okunur, sohbet hafızasına güvenilmez."
metadata: 
  node_type: memory
  type: project
  originSessionId: 3aa987c2-4101-4f7c-a5f4-1fc27886d93a
  modified: 2026-07-26T10:08:54.697Z
---

MAMILAS (c:\Mamilas) şu an "Decision Pipeline" dönüşümünü yürütüyor. Kanonik plan
Mami'nin Desktop'ındaki `MAMILAS_CLAUDE_OPUS_4_8_EXECUTION_HANDOFF.md` (Codex 5.6 Sol ile
yazıldı); Mami'nin 2026-07-14'te onayladığı üç değişiklikle revize edildi ve
`/mamilas-pipeline` skill'inde yaşıyor.

**Her oturumda önce oku:** `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`.
Tamamlanmış task'ı yeniden yapma. Çelişki varsa `FACT REQUIRED` ile dur.

**Why:** 2026-07-14 itibarıyla TASK 0 (bağımsız değerlendirme) kabul edildi ve
`receipts/TASK-00.md` altında duruyor. Proje 3 aydır bitmiyordu çünkü kalıcı durum dosyası
yoktu — her oturum sıfırdan başlıyordu. State dosyası tam olarak bunu kapatmak için var.

**2026-07-26 — AKTİF OPERASYON değişti: KALP NAKLİ.** Üretim DURDU (Mami: *"üretimi unut bi
süre, sorma artık — sadece beyni adapte edeceğiz"*). Operasyon planı
`docs/superpowers/plans/2026-07-26-mamilas-kalp-nakli.md`; `/clear` kickoff metni orada,
**durum bilgisi kickoff'a yazılmaz** (yalnız EXECUTION_STATE'te yaşar — iki kaynak bir gün
ikiye ayrılır). Kuzey yıldızı: **günün sonunda konuşarak prompt yazmak.** Ölçüt: *zekâ artıyor
mu?* Silme nötr bir hamledir → tek başına gerekçe değildir.

**Mami yetkisi (2026-07-26): "push her zaman açık."** Kapı yeşilken (tsc → vitest → build)
commit ve `git push origin main` için izin sorulmaz. Bir kez sormak yorgunluk, iki kez sormak
geri sarmadır.

**How to apply:** Mami "execute", "devam et", "task N" dediğinde `/mamilas-pipeline` skill'ini
çağır, state'i oku, son receipt'i gerçek repo durumuyla doğrula, sonra aktif task ile devam et.
Repoda **sıfır gerçek kare** var — prompt QA'sı (`qaScore 100`) kalite kanıtı **değildir**;
sistemin kendi yasası "QA read a string, the engine drew a picture" diyor.
