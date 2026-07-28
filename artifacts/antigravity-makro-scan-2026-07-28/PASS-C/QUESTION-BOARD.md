# PASS-C — Makro Soru Tahtası (Derinleştirilmiş 4 Eksen)

## C1 — Belirsiz Proje Sınıfında Mami Seçimi (Path / Default-Ref Üretimi Öncesi)
- **Soru:** Proje adı belirsiz/özel bir marka olduğunda (örn. "Gece Serumu"), sistem path/default-ref seçmeden ÖNCE Mami'ye bu seçimi nasıl soracak?
- **Durum:** `CURRENT` (Bugün soru sorulmuyor, `deriveProductionPath` sessizce `ANIMATION_EDU` basıyor).

## C2 — Pipeline Boyunca Sessiz Sınıflama Riski
- **Soru:** Seçilen register `input → defaults → world guard → command → runner → receipt` hattında hiçbir yerde sessizce EDU'ya ezilmeden kalabiliyor mu?
- **Durum:** `CURRENT` (`pure.ts:987` varsayılanı tüm hattı EDU'ya sürklüyor).

## C3 — Memory-Sync ve Overwrite Koruması
- **Soru:** `memory-sync --adopt` gerçekten gerekli mi? Gerekiyorsa kazaen canlı hafızayı ezmemek için `preview`, `diff`, açık onay ve overwrite koruması nasıl sağlanmalı?
- **Durum:** `CURRENT` (Repo editleri `memory-sync.mjs` çalıştığı an canlı tarafından sessizce eziliyor).

## C4 — Frame Filename Ayrımı ve Motion Hattı İddiası
- **Soru:** Frame filename konusu kapsam dışıdır. Gerçek video klip (`.mp4`) gözle veya `motion-qc` ile izlenmeden "Motion hattı sorunsuz çalışıyor" denebilir mi?
- **Durum:** `UNPROVEN` (Metin düzeyinde motion `.txt` yazılması görsel motion başarısının kanıtı değildir).
