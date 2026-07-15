---
name: mamilas-ref
description: MAMILAS'a yeni referans (ref) eklerken/yüklerken kullan — referansın SURGERY_DATA.json'da tam nereye, hangi worldId'ye, hangi 7-katman alanlarla gireceğini ve pipeline'da (brain.ts dnaDirectives→perRef→buildImagePrompt) nasıl işlendiğini bilir; körleme eklemez. Mami "referans ekleyeceğiz / referans yükleyeceğiz / şu dünyaya ref" dediğinde çalıştır.
---

# MAMILAS — Referans Ekleme Router'ı

Bu skill referansın **tam nereye** girdiğini bilir; körleme tahmin YASAK. Yazım kalitesi için ayrıca `mamilas-world` disiplinini, çıktı denetimi için `mamilas-audit`'i, kapanış için `mamilas-gate`'i koş.

## 0. Önce Mami'ye 3 soru (ref niyeti netleşmeden yazma)
1. **Hangi dünya?** Referans bir dünyaya mı bağlı (worldId) yoksa dünyalar-arası sinematografi grameri mi (cinedna_)?
2. **Ne getiriyor?** Tek cümlelik gramer katkısı (ışık davranışı / lens / blocking / doku) — franchise kimliği DEĞİL.
3. **Preview gerekli mi?** Galeride bespoke prosedürel önizleme mi, yoksa default yeter mi?

## 1. Tek veri yeri: `src/core/SURGERY_DATA.json` → `refs[]`
Referans buraya bir obje olarak girer. Başka HİÇBİR yere ref listesi yazılmaz (kopya = drift).

**Normal (dünyaya-bağlı) ref alanları — HEPSİ zorunlu:**
```jsonc
{
  "id": "kebab_case_benzersiz",         // benzersiz; cinedna_ ile başlama (o rezerve)
  "name": "İnsan-okunur kısa ad",
  "cat": "Kategori (ör. Anime / Shonen, Cinematography, Photoreal)",
  "use": "SADECE insan-tavsiye prosası — 'grammar only, original subjects only…' (generateBatch pool'a ALMAZ, brain.ts:387).",
  "avoid": "Sert negatifler — NO named franchise chars/props/locations, NO <yanlış medyum>. (brain.ts negatife threadler.)",
  "dna": "<7-KATMAN — aşağıya bak. Pipeline'ın asıl yediği alan.>",
  "preview": "id_ile_aynı_ya_da_REF_SCENES_anahtarı",
  "anchor": "Tek-nefes imza cümlesi (brain.ts anchor→kanal karakteri; boşsa dna'nın ilk virgülüne düşer).",
  "worldId": "MEVCUT_bir_world_id"       // DATA.worlds[].id'de VAR olmalı
}
```

**7-katman `dna` sırası (mamilas-world kanunu — her katman bir cümle):**
`Medium/era → Named anchor → Signature light → Color/grade → Lens/optics → Texture/render → Composition+motion`. (brain.ts:398 bu format başlığına güveniyor.)

## 2. Karar tablosu — referans TİPİNE göre nereye
| Durum | worldId | Nasıl |
|---|---|---|
| Bir dünyaya özgü grameri güçlendiren ref | O dünyanın id'si | Tam 7-katman dna + anchor/use/avoid; `refs[]`'e ekle |
| Dünyalar-arası sinematografi (deep-focus, one-light…) | **YOK** | `cinedna_*` id; **KOMPAKT** yaz (kısa dna+anchor) — CLAUDE.md: cinedna_ ref'leri kasten kompakt, **genişletme/dokunma** |
| Simetri-kilitli bir ref (nadir) | — | id'yi `brain.ts:971` `SYMMETRY_LOCK_REFS` set'ine ekle (yalnız gerçekten simetri dayatıyorsa) |
| One Piece dünyası ref'i | one_piece_toei | dünya materialId **'none'** (CLAUDE.md) |

## 3. Preview (opsiyonel prosedürel önizleme)
`preview` bir dosya yolu DEĞİL (`public/refs/` boş). `src/components/refScenes.ts` → `REF_SCENES` (satır ~904) içindeki prosedürel çizim anahtarıdır; `hasRefScene(id)` guard'lar, tanımsızsa galeri default'a düşer (crash yok).
- **Default yeter** → `preview`'i mevcut yakın bir REF_SCENES anahtarına ver ya da bırak.
- **Bespoke önizleme istiyorsan** → `refScenes.ts` `REF_SCENES`'e `<preview-id>: SceneFn` ekle (prosedürel, asset değil).

## 4. Pipeline nasıl işler (körleme değil — kanıtla)
`dnaDirectives(refs, register)` (`brain.ts:386`): `dna`+`name`+`cat` → pool; `avoid` → negatif havuz (REAL dünyada stylized ref'in avoid'i cross-contamination guard'a girer, brain.ts:411); `anchor` → "apply the character of <names>"; `perRef` → `buildImagePrompt`/agentBrief (`brain.ts:1688`). `use` GÖZ ARDI edilir (insan prosası).

## 5. Sert kısıtlar (ihlal = geri dön)
- **Palet/hex prompt'a girmez** — dna fiziksel ışık dili konuşur, `#RRGGBB` yazma (Palette Translation Law).
- **Franchise kimliği sızmaz** — `avoid` "NO named characters/props/locations" içermeli; dna gramer/ışık/doku anlatır, tanınır isim/silüet DEĞİL (telif firewall'u `qa.test.ts`).
- **"cinematic/dynamic/stunning/4K/epic" YASAK** — somut kamera fiili / ışık davranışı yaz.
- **Test silme yasak, sayı düşmesin.**

## 6. Kapanış (double-check ZORUNLU)
1. `mamilas-audit` → GERÇEK generateBatch çıktısını üret, yeni ref'in `dna`/`anchor`/`avoid`'inin prompt'a (perRef/negatif/kanal) düştüğünü GÖZLE oku ("json'a yazdım" ≠ "prompt'a işledi").
2. `mamilas-gate` → tsc 0 · vitest yeşil (sayı düşmedi) · build OK · zsh -n. İlgili testler: `brain.test.ts`, `preview.test.ts`, `faz2_*`.
3. `git add` SPESİFİK dosya(lar) (SURGERY_DATA.json [+ refScenes.ts + brain.ts]) → ayrı commit, push yok → `mamilas-checkpoint`.
