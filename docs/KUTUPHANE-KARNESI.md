# MAMILAS KÜTÜPHANE KARNESİ

**Elle yazma — üret:** `npx tsx scripts/kutuphane-karne.ts > docs/KUTUPHANE-KARNESI.md`

## Tek cümle

**46 dünyanın 1'i gerçek kareyle doğrulanmış.** Kütüphane kâğıtta tam —
46/46 dünya sekiz katmanın hepsini taşıyor, 120 ref'in hepsi 6+ cümlelik dna'ya
sahip — ama 45 dünya hakkında BİLDİĞİMİZ bir şey yok: hiçbiri motora sürülmedi.

## Durum tanımı

- **VALIDATED** — bu dünyadan gerçek kare üretildi, kusurları görüldü ve dünyaya yazıldı.
- **UNVALIDATED** — tarif yazılı, kare yok. Kalitesi hakkında hüküm verilemez. "Oyuncak"
  demek de "hazır" demek kadar kanıtsızdır.

## Ref sınıfları

- **130 ref** = 76 dünyaya-bağlı (`worldId`) + 44 **orphan** (worldId yok,
  kategoriden uyumlanır) + 10 `cinedna_` (dünyalar-arası sinematografi).
- Orphan sınıfını `refCompatibleWithWorld` (`src/core/pure.ts`) tanır: worldId taşımayan ref,
  kategorisi bir animasyon medyumunu REAL bir dünyaya dayatmadıkça uyumludur.
  **`mamilas-ref` skill'i bu sınıftan hiç bahsetmiyor** — skill "worldId zorunlu" diyor,
  veri 44 kayıtla aksini söylüyor.
- **Kendi ref'i olmayan 7 dünya:** science_viz_real · technical_cutaway · shinkai_photoreal_anime · archival_newsreel · nature_doc_real · period_reconstruction · automotive_hero_real.
  (Orphan havuzundan besleniyorlar, ama kendi imza ref'leri yok.)

## Karne

| Dünya | Grup | Durum | Gerçek kare | Kendi ref | Uygun ref | render_law |
|---|---|---|---|---|---|---|
| `pixar_3d_edu` | ANIMATION_EDU | VALIDATED | 103 | 4 | 58 | 1829 |
| `invincible_hero_comic` | ANIMATION_BOLD_CEL | UNVALIDATED | — | 1 | 55 | 1411 |
| `naruto_shinobi_world` | ANIMATION_BOLD_CEL | UNVALIDATED | — | 1 | 55 | 1341 |
| `one_piece_toei` | ANIMATION_BOLD_CEL | UNVALIDATED | — | 2 | 56 | 1568 |
| `retro_anime_film` | ANIMATION_BOLD_CEL | UNVALIDATED | — | 6 | 60 | 1252 |
| `demon_slayer_ufotable` | ANIMATION_CEL_3D_HYBRID | UNVALIDATED | — | 2 | 56 | 1937 |
| `aot_wall_world` | ANIMATION_DARK | UNVALIDATED | — | 1 | 55 | 1532 |
| `bleach_soul_world` | ANIMATION_DARK | UNVALIDATED | — | 2 | 56 | 1279 |
| `castlevania_gothic` | ANIMATION_DARK | UNVALIDATED | — | 1 | 55 | 1385 |
| `cyberpunk_neon_noir` | ANIMATION_DARK | UNVALIDATED | — | 1 | 55 | 1236 |
| `jjk_mappa` | ANIMATION_DARK | UNVALIDATED | — | 1 | 55 | 1492 |
| `solo_leveling_gate` | ANIMATION_DARK | UNVALIDATED | — | 1 | 55 | 1363 |
| `claymation_aardman` | ANIMATION_EDU | UNVALIDATED | — | 1 | 55 | 1097 |
| `kurzgesagt_edu` | ANIMATION_EDU | UNVALIDATED | — | 1 | 55 | 1112 |
| `paper_craft_popup` | ANIMATION_EDU | UNVALIDATED | — | 1 | 55 | 1235 |
| `science_viz_real` | ANIMATION_EDU | UNVALIDATED | — | — | 54 | 1825 |
| `technical_cutaway` | ANIMATION_EDU | UNVALIDATED | — | — | 54 | 1768 |
| `whiteboard_explainer` | ANIMATION_EDU | UNVALIDATED | — | 1 | 55 | 955 |
| `ghibli_hayao` | ANIMATION_PAINTERLY | UNVALIDATED | — | 4 | 58 | 2132 |
| `shinkai_photoreal_anime` | ANIMATION_PAINTERLY | UNVALIDATED | — | — | 54 | 1815 |
| `ukiyo_e_print` | ANIMATION_PAINTERLY | UNVALIDATED | — | 1 | 55 | 957 |
| `watercolor_storybook` | ANIMATION_PAINTERLY | UNVALIDATED | — | 1 | 55 | 1059 |
| `arcane_fortiche` | ANIMATION_STYLIZED | UNVALIDATED | — | 3 | 57 | 2222 |
| `laika_stopmotion` | ANIMATION_STYLIZED | UNVALIDATED | — | 1 | 55 | 1067 |
| `low_poly_ps1` | ANIMATION_STYLIZED | UNVALIDATED | — | 1 | 55 | 1210 |
| `motion_design_flat` | ANIMATION_STYLIZED | UNVALIDATED | — | 2 | 56 | 828 |
| `rick_morty_scifi` | ANIMATION_STYLIZED | UNVALIDATED | — | 1 | 55 | 1400 |
| `spiderverse_sony` | ANIMATION_STYLIZED | UNVALIDATED | — | 3 | 57 | 1646 |
| `synthwave_retro_80s` | ANIMATION_STYLIZED | UNVALIDATED | — | 1 | 55 | 1078 |
| `vintage_comic_book` | ANIMATION_STYLIZED | UNVALIDATED | — | 1 | 55 | 1117 |
| `archival_newsreel` | CINEMATIC_REAL | UNVALIDATED | — | — | 37 | 1638 |
| `chivo_naturalist_handheld` | CINEMATIC_REAL | UNVALIDATED | — | 1 | 38 | 1541 |
| `deakins_naturalist` | CINEMATIC_REAL | UNVALIDATED | — | 4 | 41 | 2321 |
| `fincher_precision` | CINEMATIC_REAL | UNVALIDATED | — | 4 | 41 | 1431 |
| `nature_doc_real` | CINEMATIC_REAL | UNVALIDATED | — | — | 37 | 1797 |
| `noir_high_contrast` | CINEMATIC_REAL | UNVALIDATED | — | 1 | 38 | 1087 |
| `period_reconstruction` | CINEMATIC_REAL | UNVALIDATED | — | — | 37 | 1759 |
| `sci_fi_hard_surface` | CINEMATIC_REAL | UNVALIDATED | — | 1 | 38 | 1233 |
| `wes_anderson_symmetric` | CINEMATIC_REAL | UNVALIDATED | — | 1 | 38 | 1424 |
| `appetite_tabletop_real` | COMMERCIAL_REAL | UNVALIDATED | — | 3 | 40 | 2210 |
| `automotive_hero_real` | COMMERCIAL_REAL | UNVALIDATED | — | — | 37 | 2032 |
| `civic_promo_real` | COMMERCIAL_REAL | UNVALIDATED | — | 3 | 40 | 2311 |
| `edu_promo_real` | COMMERCIAL_REAL | UNVALIDATED | — | 3 | 40 | 2524 |
| `kurumsal_brand_film` | COMMERCIAL_REAL | UNVALIDATED | — | 3 | 40 | 2543 |
| `product_brand_real` | COMMERCIAL_REAL | UNVALIDATED | — | 3 | 40 | 2051 |
| `sports_energy_real` | COMMERCIAL_REAL | UNVALIDATED | — | 3 | 40 | 1907 |
