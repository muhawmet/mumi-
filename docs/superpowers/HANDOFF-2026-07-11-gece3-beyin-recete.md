# HANDOFF — 2026-07-11 (gece 3) · Beyin + Reçete turu

**Durum:** HEAD `fcf495b` · dal `feat/3d-diorama-shell` · **vitest 984/984 · tsc 0 · build OK · zsh OK** · PUSH YOK · ağaç temiz, worktree yok.

---

## Bu turda ne yapıldı

### 1) Kurtarma
Tailscale kopunca ölen oturum `QAStep.tsx`'te yarım bir IIFE bırakmıştı (tsc kırmızı). Kapatıldı (`eca3303`). #4 QA-gate zaten commit'liymiş — iş kaybı yok.

### 2) #5 Semantic Scene Ledger — **İPTAL, kanıtla**
Çoklu-ajan tasarım paneli üç yaklaşımı da düşük puanladı (en iyi 5.7/10). **Gerçek `generateBatch` çıktısıyla doğrulandı:** kaynak beat image prompt'a zaten **VERBATIM** giriyor (`brain.ts` subjectLine + DIRECTOR TASK). Beat'ten türetilen defter motora yeni bilgi taşımıyor. İstişare dokümanının Q4'teki "Ledger GEREKLİ" hükmü **yanlış**.
→ Değerli olan çekirdek: **üretilen KAREYİ söz verilene karşı denetlemek** (vision-gate). Hâlâ AÇIK.

### 3) Codex (gpt-5.6-sol) adversaryel denetimi → 7 fix

| commit | ne |
|---|---|
| `dc4b2fc` | `.command` "motorun adı DAİMA Kling" diyordu → Veo/Runway seçimini eziyordu. Kling ailesine kapsamlandı. |
| `2ddba76` | **Bozuk kaynak "%100" yazıp QA'yı geçiyordu.** coverage bozulmada uzunluk oranına düşüyor; otorite artık `ok` + hash eşitliği. |
| `438388c` | **FRAME-AWARE artık veri kapısı.** `prompts.motion` kare gelene kadar `null`; kör taslak `prompts.motionDraft`'ta. |
| `86c3ef2` + `334d7fe` | Split sahne dosya sözleşmesi (shot başına kare+motion: `3a`/`3b`); çelişen tekil alanlar null'landı; `.command`'lara öğretildi. |
| `8b7abc9` | **Ref kimliği prompt'a ulaşmıyordu** — farklı ref'ler BİREBİR aynı prompt üretiyordu. Anchor enjekte edildi (R11 kadans süzgeciyle). |
| `3cb4587` | **R9c**: dünya "warm highlights" derken palet "NO warm element" diyordu. Battaniye yasak kapsamlandı. |
| `ff160ff` | **Işık monotonluğu**: `VAR_LIGHT` motoru yazılmış ama `pv` HİÇ geçilmemişti → her sahne aynı ışık. Kablo takıldı. |
| `7c85da0` | Bölünen sahnede shot başına image prompt (sözleşme simetrik). |
| `f843696` | **Kompozisyon kıtlığı**: 12 kalıbın 9'u ref-kapılı; simetri-kilitli dünyalarda (fincher) geriye TEK kalıp kalıyordu → her sahne aynı kadraj. 4 yeni evrensel kalıp. fincher 1→4, pixar 3→5. |
| `ecbcf7d` | **KENDİ AÇTIĞIM DELİK**: anchor enjeksiyonu `apple_object_worship`'in "Apple" adını POZİTİF prompt'a soktu (motor gerçek iPhone çizer), üstelik aynı prompt'un negatifi "NO real brand" diyordu. `scrubAnchorIP()` ile kapandı: marka ölür, zanaat tarifi yaşar. |

### 4) Reçete çürümesi (Mami: "presetler generic bullshit")
`6510875` + `e999fb9` + `fcf495b`:
- `presets.ts`'teki **19 dünya adının 19'u da BAYAT**'tı. `normalizeWorldId` onları legacy haritasından sessizce kurtarıyor ve **HER reklam niyetini 3 film dünyasına** (fincher/chivo/deakins) eziyordu — CLAUDE.md'nin "reklam ≠ film" kuralının tam ihlali. 6 COMMERCIAL_REAL dünyası öksüzdü.
- Artık preset **gerçek dünyanın adını söylüyor**:
  - Ürün / Marka → `product_brand_real`
  - Kurumsal / Kamu → `kurumsal_brand_film`
  - Etkinlik / Kampanya → `civic_promo_real` (tören/kalabalık; `sports_energy_real` "Campaign energy" seçeneğinde)
  - **YENİ** Yemek / İçecek → `appetite_tabletop_real`
  - **YENİ** Eğitim Reklamı → `edu_promo_real`
- **6 reklam dünyasının 6'sı da bağlı.** Preset 8 → 10.
- 2 test kilitliyor: preset'te bayat ad yasak · reklam preset'i COMMERCIAL_REAL zorunlu.

### 5) Fable (görsel kulvar) — 2 tur merge'lendi
`73b161f` + `47d7bb8`: bağımsız denetim 4/10 → Fable öz-değerlendirme 8.5/10.
- Sahne: kutu artefaktı kökten söküldü (three.js `alphaMap` YEŞİL kanal okur), güneş atmosfere erir, kuşlar varyanslı, su parıltıları ışığa döndü, derinlik merdiveni (parallax).
- Kompozisyon: sahte gradient blob + siyah perde SÖKÜLDÜ — paneller cam, ışık render'dan geliyor.
- **Telif:** Disco Elysium portresi landing'den kaldırıldı (tipografik alıntı plakası).
- **Phase 0 yeniden kuruldu:** kart duvarı → **"BU TIK NEYİ KİLİTLER"** karar dosyası (hiyerarşi + canlı dossier + kilitli durum + ayırt edici imza etiketleri).

---

## SIRADAKİ İŞ (öncelik sırasıyla)

1. **Fable 3. tur** — 8.5 → 10. Oturum limitine takıldı (Istanbul 17:30'da sıfırlanır), **0 commit attı, iş kaybı yok**. Brief hazır; kendi itirafları: (a) CSS-gradient plakalar dossier boyunda prosedürel duruyor, (b) vibrant_edu plakası "afiş" gibi, (c) sabit bakışta sahne durağan. **Layout artık 10 preset taşımalı** (sabit 8 varsayımı yapmasın).
2. **Vision gate (AÇIK, en büyük)** — üretilen kareyi söz verilene karşı denetleyen HİÇBİR ŞEY yok. `qa.ts` sadece prompt STRING'ini tarıyor; hiçbir yer `images/<id>.png` açmıyor. Eski `.command` bunu yapıyordu — swarm onu emekli ederken **vision-gate'i düşürdü** (regresyon). Bu, #5'in gerçekten değerli olan tek parçası.
3. **Karakter kimliği sahneler arası bağlanmıyor** — prompt'a `Character lock:` metni giriyor ama sahne 1'in karesini sahne 5'e bağlayan mekanizma yok. Mami'nin Magnific @-handle rutiniyle çözülüyor → **Mami kararı**, körlemesine mimari EKLEME.
4. **Disco Elysium varlıkları** (`public/assets/characters/harry_du_bois.png` vb.) ThoughtDock/InnerVoice'ta duruyor. **Export'a SIZMIYOR** (core'da atıf yok, firewall testleri 5/5) — üretim riski değil, sadece konsol optiği. **Mami kararı, silme.**

---

## DERSLER (tekrar etme)

- **"Yazılmış ama kablosu takılmamış" motor ara.** `pv` (ışık varyantı) ve ref `anchor` böyleydi: kod vardı, çağıran yoktu, kimse fark etmedi çünkü **testler YAPIYI ölçüyordu, ÇIKTIYI değil**.
- **Prompt yoluna yeni bir metin kaynağı bağlarken ÖNCE firewall'dan geçir.** Anchor'ı enjekte ederken telif deliği açtım; review-ajanı yakaladı.
- **Bir alanı "yanıltıcı" diye null'ladıysan AYNI disiplini paketteki TÜM rakip alanlara uygula** — yoksa JSON kendi içinde çelişir. Ve kapıyı JSON'da kapatmak yetmez: ajanın OKUDUĞU `.command` metnini de güncelle (İKİ tane var, ikisi de).
- **Senkron-bekçisi testler (advisor PRESET_WORLD_SCOPE, presetPlate sözleşmesi) işini yapıyor** — kırıldıklarında testi değil kendini düzelt.
- **Kamera havuzu (7-8) sağlıklı — orada sorun YOK.** Uydurma fix yapma.
- Codex'in "41 cümle her sahnede tekrar ediyor" bulgusu **kusur DEĞİL**: her image prompt motora AYRI gidiyor, dünya yasasının her prompt'ta tam olması zorunlu (self-contained).
