# ASSET GOAL — T1 Işıklı Atölye (Mami'ye)

Slot sistemi M4'tekiyle aynı: dosyayı `public/assets3d/<slot>.webp` olarak at, kod değişmeden bağlanır.
Eksik dosyada sahne bugünkü sıcak placeholder'ıyla yaşar (`console.warn` basılır, kırılmaz).
M4'ün 8 slotu zaten canlı — T1 ile 1 yeni slot eklendi ve mevcutların bağlamı değişti (kartlar artık duvar çerçevesi).

| Slot (dosya adı) | Boyut | Durum | İçerik brief'i |
|---|---|---|---|
| `wall-plaster.webp` | 2048², seamless | **YENİ — bekleniyor** | Gece atölyesi sıva/ahşap panel dokusu — sıcak kahve-bej bandı (#2a211a ailesi), hafif yaşanmışlık; keskin desen YOK (önündeki çerçeveler okunmalı). 4×1.6 tile edilir. |
| `floor-disc.webp` | 2048², seamless | M4'ten canlı — **sıcak revizyon önerilir** | Eskimiş geniş ahşap döşeme, sıcak koyu (#1a1410 ailesi); mevcut doku soğuk okunuyorsa yenisi atılır, 3×3 tile |
| `table-top.webp` | 1024² | M4'ten canlı | Zanaat masası üstü: çizik ahşap + mürekkep izi; ortası sade (üstünde 3D prop var) |
| `card-*.webp` (4) | 1024×1448 | M4'ten canlı | Artık duvar çerçevelerinin yüzü — painterly arketip plate'leri aynen çalışıyor |
| `logo-card.webp` | 1024×1448 | M4'ten canlı | Duvar tepe merkezindeki pirinç çerçevede amblem |
| `backdrop-sky.webp` | 2048×1024 | M4'ten canlı | Duvar üstünden görünen gece göğü — çok koyu, ufukta altın-amber sızıntı |

Aplik / çerçeve kasası / ray / masa lambası PROSEDÜREL (pirinç + ahşap malzeme) — asset İSTEMEZ.

## V3.1 kanun özeti (T1 ile yürürlükte)

- **Işık:** altın ana (masa lambası, `LOOK.light.lamp`) + ≤2 sıcak aplik + ambient 0.35 sıcak. Soğuk mavi directional EMEKLİ — tek ışık ailesi.
- **Atmosfer:** fog 14→34 sıcak kahve (`#161009`); clearColor `#14100b`; vignette 0.32/0.68 (gevşedi).
- **Slenderman testi:** establish kadrajında zemin + duvar + ≥3 nesne ışıkta seçilir; ortalama luminance %4-%12 bandı (`scripts/scene-proof.mjs` ölçer — T1 kanıtı: %7.1 PASS).
- **Kamera ön-yarımküre:** pozlar duvar (z=-4.2) arkasına düşemez (designLaws testli, `lookConfig.test.ts`).
- **Oda dönmez:** vitrin rotasyonu emekli — hafif nefes salınımı (`sin(t·0.08)·0.03`).
- **Parlak alan tavanı:** V3 §8'deki "%4" tavanı V3.1'de **%10**'a çıktı (atölye ışık gölleri meşru).
