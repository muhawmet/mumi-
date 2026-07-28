# B6 — Memory Sync ve Hafıza Asimetrisi

## İncelenen Gerçek Yol
`scripts/memory-sync.mjs`.

## Aday Bulgu — Hafıza Senkronu Tek Yönlüdür; Canlı Silinmeyi Repo Üzerine Arşivleyerek Yansıtır
- **Durum:** `CURRENT`
- **Beklenen / Gerçek:** `memory-sync.mjs` aracı canlı auto-memory (`~/.claude/projects/.../memory`) dizinini otorite sayar. Canlıdan silinen bir dosya repo'da `archive/` dizinine taşınır (`scripts/memory-sync.mjs:84-91`). Ancak repo'da yenilenmiş/tamir edilmiş bir hafıza canlı tarafa otomatik push edilmez (`--adopt` seçeneği yoktur).
- **Kanıt Zinciri:** `scripts/memory-sync.mjs:8-10` ("Bu script tek yönlü bir AYNA kurar: canlı hafıza -> docs/ai/sync/memory/").
- **Tekrar Üretim:** `scripts/memory-sync.mjs` kodundaki `added`, `changed`, `dropped` filtrelerini incele.
- **Karşı-okuma ve Sonucu:** Script kasten tek yönlü yazılmıştır (canlı hafıza üretimi korumak için). Ancak geliştirici/Mami repo üzerinden hafıza güncellemek istediğinde canlıya aktaracak bir argüman bulunmamaktadır.
- **Üretim Etkisi:** Repo'daki taze hafıza canlı `~/.claude` dizinine akamaz.
- **Korunacak Şey:** Canlı hafızadan düşen dosyaların repo'dan tamamen silinmeyip `archive/`'e taşınması.
- **En Küçük Yön / Production Probe:** `memory-sync.mjs` betiğine opsiyonel bir `--adopt` (repo → canlı hafıza) bayrağı eklenmesi.
