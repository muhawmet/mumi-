# MAMILAS Session Log — 2026-06-26 (gece turu)

> Bir sonraki Claude bu dosyayı okuyarak sıfırdan başlar.
> Çalışma dizini: `~/Desktop/mamilas-modern`
> Branch: main, Vite localhost:5173 çalışıyor.

---

## Bu Turda Yapılanlar (6 commit, 420b73b → 6857493)

### 1. `feat(brain): anime ref → real cinematography translation layer` `420b73b`
**Sorun:** Demon Slayer + REAL register → camera direktifi `"restrained filmic moves"` (jenerik).
**Neden:** DNA_MAP'te `ribbon arc`, `elemental`, `breath rhythm` için pattern yoktu.
**Fix:**
- `brain-data.ts` DNA_MAP'e 8 anime→sinema entry eklendi: ribbon arc, breath rhythm, elemental force, blade diagonal, spiritual pressure, purple shadow, arc-of-effort, high-contrast black/orange
- `brain.ts` `dnaDirectives()`: Anime/Shonen ref + REAL register → avoid bloğuna "CINEMATOGRAPHY DNA ONLY" guard eklendi

### 2. `feat(brain): expand DNA translation layer — 22 new ref→cinematography mappings` `179f1fa`
**Sorun:** 201/217 ref REAL register'da en az bir generic camera/staging/motion alıyordu.
**Fix:** DNA_MAP'e 22 entry daha:
- Portrait/intimate → kamera: intimate focal compression
- Painterly/Arcane → kamera: dramatic locked angle
- Fashion/luxury → kamera + motion
- Physical effort/sweat → staging + motion
- Appetite/food → staging + motion
- Automotive stance → staging
- Architecture reveal → kamera + motion
- System/hierarchy → staging
- Cross-contamination guard: 3D Animation + Stylized Premium de kapsandı
**Sonuç:** 201→182 generic fallback (-19)

### 3. `feat(worlds): MAPPA, Bones, Toei anime dünya tipleri eklendi` `a168ceb`
**Sorun:** Tek anime dünyası ufotable-grade `anime_cel`'di. MAPPA, Bones, Toei yoktu.
**Fix:** `SURGERY_DATA.json`'a 3 yeni ANIMATION world:
- `mappa_cinematic`: JJK/AoT/Chainsaw Man dark cinematic — heavy atmo, smear frame, selective color pop
- `bones_action`: FMA Brotherhood / MHA — temiz ink outline, smooth choreography, warm amber-blue
- `toei_adventure`: One Piece / Dragon Ball — bold saturated primaries, geniş ufuk, elastic timing
`advisor.ts`'e her birine starter pack eklendi (2-3 uyumlu ref).

### 4. `feat(brain): STY_BANK anime/aksiyon anlatı beats eklendi` `aec4d97`
**Sorun:** `conceptRanked()` anime/aksiyon source text'inde `matched:false` + jenerik fallback.
**Neden:** STY_BANK'ta `savaşçı`, `macera`, `kahraman`, `zafer` için pattern yoktu.
**Fix:** 11 yeni STY_BANK pattern (Türkçe+İngilizce):
- warrior/battle, adventure/quest, hero/protagonist, revenge, triumph, sacrifice, friendship/bond, fate/destiny, power surge, final battle, antagonist/villain
**Sonuç:** Tüm shonen text → `matched:true`, spesifik sahne + hareket açıklaması.

### 5. `fix(brain): WORLD2FAMILY mapping + STY/REAL concept engine gaps` `bbc5427`
**Sorun:** `cinematic_real` ve `real_human_doc` WORLD2FAMILY'de yoktu → PRODUCT fallback'e düşüyordu.
**Fix:** `cinematic_real → EVENT`, `real_human_doc → TESTIMONIAL` eklendi.

### 6. `fix(proof+ui): IP list genişletildi, lazy motion düzeltildi` `6857493`
**Sorun:** IP listesi sadece 6 karakter (Luffy, Naruto, Goku, Pikachu). Glow/cinematic lazy motion flag'leniyordu.
**Fix:**
- IP listesi 6→50+ (tüm major shonen + Ghibli + mecha + DN + MHA + SAO...)
- `reg_lazy_motion`: `glow` ve `cinematic` çıkarıldı (anime world'de false positive veriyordu)
- DirectorStep + RecipeStep UI metinleri iyileştirildi

---

## Mevcut Durum

```
Tests:  203/203 PASS
tsc:    0 hata
Build:  OK (vite localhost:5173 çalışıyor)
Branch: main, push edilmedi (GitHub'dan 8+ commit önde)
```

---

## Açık Kalan Meseleler (sıradaki oturum için)

### 🔴 Yüksek Öncelik
1. **Generic fallback 182/217 hâlâ var.** `DNA_MAP`'e daha fazla pattern eklenebilir. `bankRank`'in nasıl sıraladığını incele — belki `use` alanından da daha fazla sinyal çıkarılabilir.
2. **STY register concept derinliği:** `mappa_cinematic` world seçilince concept STY_BANK'tan geliyor ama "dark atmospheric" öğeleri (kentsel karanlık, duman, gerilim) için pattern az. MAPPA'ya özel concept cümleleri eklenebilir.
3. **One Piece kişisel mod:** Kullanıcı kendi serbest kullanımı için IP guard'ı bypass etmek istiyor. Çözüm: cast alanına karakter yazınca brief'e giriyor (şu an çalışıyor), ama `proof.ts` qaScore'u düşürüyor. Kişisel modda qaScore uyarısını suppress etme seçeneği eklenebilir.

### 🟡 Orta Öncelik
4. **`resetStoryboard` hâlâ `AUTO_GROUP_THRESHOLD` guard'ı içeriyor** (`setBeatMode`'da kaldırıldı ama `resetStoryboard`'da kalmış). Küçük source'ta reset yapınca regroup etmiyor.
5. **Motion prompt kalite turu:** `buildMotionPrompt` çıktısı incelenmedi. Yeni DNA direktifleri motion prompt'a doğru yansıyor mu?
6. **Suno brief derinliği:** MAPPA/Bones/Toei worldleri için özel Suno register yok; `STYLIZED_PREMIUM` fallback'e düşüyorlar. Özel müzik brifleri eklenebilir.

### 🟢 Düşük Öncelik
7. **Canvas preview:** mappa_cinematic, bones_action, toei_adventure için özel canvas sahneleri yok (worldCategory'den taban renderer'a düşüyorlar).
8. **Playwright e2e:** Yeni worldler UI'da göründükten sonra e2e smoke test güncellenmeli.
9. **handoff dosyası temizliği:** `claude_implementation_handoff.md` tamamlandı — silinebilir veya arşivlenebilir.

---

## Mimari Notlar (bir sonraki Claude için)

- **`SURGERY_DATA.json`**: Tek gerçek kaynak. World'ler, ref'ler, paletler burada. Edit edilebilir.
- **`brain-data.ts`**: EDU_BANK, STY_BANK, REAL_BANKS, DNA_MAP, SUNO_MAP — hepsi burada. Single-quote string içinde apostrof KULLANMA (TypeScript syntax hatası).
- **`brain.ts`**: `conceptRanked`, `dnaDirectives`, `buildImagePrompt`, `buildAgentBrief`. Pure fonksiyonlar, state yok.
- **`advisor.ts`**: `STARTER_PACKS` — her world için 2-3 ref. Yeni world ekleyince mutlaka buraya da ekle, test kırılır.
- **`pure.ts`**: `generateBatch` — kaynak storyboard verbatim kullanıyor, hidden re-budget yok.
- **`useStudioStore.ts`**: Zustand store, persist v9. `splitBeat` lossless, `advance()` hata veriyor.

---

## Kullanıcı Bağlamı

Mami (Muhammet) — ajans ortamında çalışıyor, TRT / sınav okulları / Pehlivanoğlu müşterileri. High-end standart, sloppy AI output kabul etmiyor. "Bizim sitem" — Claude aktif ortak. Kısa net cevap, uygula devam et. Gece turları üretime açık.
