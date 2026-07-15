# CLEAR SONRASI — Mami'nin yapıştıracağı metin

> Aşağıdaki bloğu **olduğu gibi kopyala**, clear sonrası ilk mesaj olarak yapıştır.

---

Selam. Gece boyunca fabrikanın sözleşmesi onarıldı; artık **prompt kalitesi** turundayız.

## ÖNCE OKU (sırayla)
1. `docs/superpowers/GECE-RAPORU.md` — ne yapıldı, ne kapandı, ne açık
2. `CLAUDE.md` — kanonik kurallar (gece 4 yeni kural eklendi)
3. Memory

**Durum:** dal `feat/3d-diorama-shell` · HEAD temiz · **PUSH YOK**
**Kapı:** tsc 0 · **vitest 1760/1760** · build OK · **e2e 15/15** · zsh OK

---

## MAMİ'NİN EKSENİ — BUNU UNUTMA

> *"Otonom bir iş yapmıyorum. En önemlisi **command'ın yazdığı promptların kalitesi** ve **seçilen yolların final brief'e geçişi**. Hata kalmadıysa, command'daki üretenle ben konuşup çözerim."*

**Yani:** mikro ışık/gece detayına dalma. Sistemi otonomlaştırma. **Ben döngüdeyim.**
Bir bulguyu kapatmadan sor: *"Mami bunu prompt'a bakıp bir cümleyle çözer mi?"* → **EVETSE KAPATMA.**

**Reçete → final brief bacağı BİTTİ.** (konu, lokasyon, sahne notları artık brief'e ulaşıyor; telif firewall'u dört yoldan da kapalı; runner kapısız paketi reddediyor; eksik gerçek karşısında ajan uydurmuyor DURUYOR.)

---

## ŞU AN AÇIK OLAN TEK SORU: **PROMPT İYİ Mİ?**

Elimde gerçek ajanın yazdığı prompt'lar var: `~/Desktop/MAMILAS-PROMPTLAR/`
Nano Banana 2'de ürettim, kareleri Claude'a atacağım.

### ÖLÇÜLEN AMA ÇÖZÜLMEMİŞ: prompt'un %52'si yasa yığını
Kurumsal sahne prompt'u **1250 kelime** — bunun **652'si RENDER LOCK**, dünyanın yasası olduğu gibi yapıştırılmış. Ajan o yasayı **zaten kareye uygulamış** (kendi cümlesiyle: *"key, bu katta gece var olan motive bir practical"*). Aynı ışık fiziği prompt'ta **üç kez** geçiyor (`two stops under` ×3, `angle of incidence` ×3). **Özne 666. kelimede başlıyor.**

**A/B deneyi hazır:** `A1-kurumsal-TAM.txt` (1250 kelime) vs `A2-kurumsal-INCE.txt` (598 kelime, render lock sökülmüş). **İkisini de üretiyorum.** Kareler gelince karar veririz:
- İNCE kazanırsa → render lock sökülür, tüm prompt'lar yarıya iner
- TAM kazanırsa → dokunma
- Fark yoksa → ucuz olan kazanır (İNCE)

**Kare gelmeden bu konuda kod yazma.**

---

## MAMİ'NİN GÖZÜNE BIRAKILANLAR (kapatma, ben çözerim)
1. **Işık monotonluğu** — ölçüldü: `ghibli_hayao`'da 14 beat'te **5 farklı ışık** (mod-3 döngü). Kamera havuzu sağlıklı. **Uydurma fix yapma.**
2. **Not → sahne id eşlemesi** — reçete notu `id:3` ile sahne `id:3` aynı olmayabilir. Ajan okuyup eşliyor. Zorlamak uydurma özellik olur.
3. **Tesla'nın saati** — kaynak "şehir uyanmamıştı" (şafak öncesi), site "day→dusk" diyor.
4. **Phase 0 breakpoint 1499** — kırığı onardı ama 1440'ta dosya kolonu rayın altına düştü. Tasarım kararı, benim onayıma gelecek.
5. **`brain-workbench` Encyclopedia'sı artık 65/65 PASS** — sahte kırmızı gitti ama **sahte yeşil riski** var (round-trip her zaman geçer).

---

## YARIM KALAN İŞ
**Fable 2. tur** (session limiti kesti, 0 commit — kayıp yok). Görev:
- 3 zayıf plaka: `retro_anime_film` · `arcane_fortiche` · `laika_stopmotion` ↔ `claymation_aardman` ayrımı
- Phase 0 iki-kolon düzen kararı (1280–1499 arası)
- Çalışma adımlarında panellerin sahneyi %80 örtmesi
**Kısıt:** `src/core/*` + store DOKUNULMAZ · vitest ≥ 1760 · test silme YOK · her turdan sonra Sonnet review.

---

## DİSİPLİN
Gate her commit öncesi (tsc + vitest + build + `zsh -n` ×2) · **test sayısı DÜŞEMEZ** · `git add` spesifik dosya, asla `-A` · **PUSH YOK** · sayaçlar (46 dünya / 130 ref / 32 proje) EKLERKEN yükselir, ASLA düşmez · **her iş parçasından sonra bağımsız review-ajanı** (bu gece iki kez telif deliği/kirli kod yakaladı) · her task sonrası **temiz checkpoint**.

**ÖNCE FARKLI GÖZ:** büyük turda önce Codex `gpt-5.6-sol` derin taramayla girer, Claude arkadan.

**PROMPT KALİTESİ = gerçek `generateBatch` çıktısını GÖZLE oku.** "vitest geçti ≠ doğrulandı."
