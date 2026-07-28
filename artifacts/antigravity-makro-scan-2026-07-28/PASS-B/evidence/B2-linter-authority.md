# B2 — Mami Direktifi ve Linter Otoritesi

## İncelenen Gerçek Yol
`.claude/hooks/gate.sh`, `.claude/settings.json`, `scripts/prompt-lint.mjs`.

## Aday Bulgu — Linter Kapıda/Hook'ta Çağrılmıyor (Kreatif Veto İddiası Reddedildi)
- **Durum:** `REJECTED`
- **Beklenen / Gerçek:** İlk tur raporunda "Linter Mami'nin REAL promptlarını veto edip commit'i durduruyor" iddia edilmişti. Ancak `.claude/hooks/gate.sh` incelendiğinde `prompt-lint.mjs` komutunun KOŞULMADIĞI tespit edilmiştir. Linter yalnızca manuel veya `kapanis-hasadi.mjs` tarafından çağrılan bir teşhis aracıdır.
- **Kanıt Zinciri:** `gate.sh` (Satır 55-89: sadece `tsc`, `vitest`, `build`, `launcher syntax` ve `memory-sync` çağrılıyor). `prompt-lint` araması gate scriptlerinde 0 sonuç veriyor.
- **Tekrar Üretim:** `grep prompt-lint .claude/hooks/*` komutunu çalıştır (0 eşleşme).
- **Karşı-okuma ve Sonucu:** Linter `--strict` parametresine sahip olsa da hiçbir otomatik kapıya bağlanmamıştır. Dolayısıyla Mami'nin üretimi linter tarafından durdurulmamaktadır.
- **Üretim Etkisi:** Linter üretimi durdurmuyor; ilk turdaki "linter'ı boş/dolu denetimine indirge" önerisi dayanaksızdır.
- **Korunacak Şey:** Mami'nin `mamilas-director` ve `PROMPT-YASASI.md` üzerindeki mutlak yaratıcı otoritesi.
- **En Küçük Yön / Production Probe:** Linter'ı pre-commit kapılarına eklemeyip teşhis aracı olarak tutmaya devam etmek.
