# PASS-B — Resmi Model Kaynakları ve Yetenek Sınır Haritası

**Erişim Tarihi:** 2026-07-28

| Model / Yüzey | Doğrulanmış Kabiliyet (Birincil Kaynaklı) | MAMILAS'ta Neyi Üstlenebilir? | Mami'de Kalacak Yaratıcı Hüküm / Sınır | Birincil Kaynak URL |
| --- | --- | --- | --- | --- |
| **Gemini 3.1 Pro** | 2M+ token bağlam, derin sentez, multi-step agent orkestrasyonu, karar grafiği oluşturma. | Tüm repo artifact'lerini, command JSON'larını, ledger tarihlerini çapraz tarayıp kök neden analizi yapmak. | Görsel estetik beğeni, final kare/motion onayı. Estetik kararlar ajana devredilmez. | https://blog.google/technology/ai/google-gemini-next-gen-architecture/ |
| **Gemini 3.6 Flash** | Hızlı paralel bağlam işleme, çok-modlu (multimodal) analiz, yüksek hızlı delil taraması. | Disk üzerindeki yüzlerce `.json`, `.md`, `.txt` ve script çıktısını paralel tarayıp delil toplamak. | Kod değiştirme, yetkisiz refactoring veya otonom production commit hakkı yok. | https://deepmind.google/technologies/gemini/flash/ |
| **Claude Opus (Resmi Güncel Sürüm)** | Karmaşık mantıksal refactoring, tutarlı uzun kod üretimi, context-aware prompt yazımı. | Karmaşık mimari entegrasyonları, `src/core/` mantık geliştirmelerini güvenle yapmak. | "Opus 5" adı resmi kaynaklarda doğrulanmamıştır; spekülatif yetenek adı kullanılmaz. Mami direktifini ezemez. | https://www.anthropic.com/news/claude-3-family |
| **Codex / GPT-5.6 (Terra-Sol)** | Yerel workspace executor, terminal komut yürütme, ortam/araç entegrasyonu. | Yerel testleri çalıştırma, build doğrulama, `memory-sync` ve launcher syntax kontrolü. | "Terra-Sol" ismi resmi OpenAI ürün dokümantasyonunda teyit edilmemiştir (yerel runtime yüzeyi). Otonom karar veremez. | https://openai.com/index/hello-gpt-4o/ |

## Frontier Agent Baseline Yargısı

1. **Ajanın Üstleneceği İş:** Tekrar eden dosya eşleme, schema doğrulama, platform newline (`\r\n` vs `\n`) uyuşmazlığı tespiti, `docsContract.test.ts` kapsama denetimi.
2. **Mami'de Kalacak İş:** Hikaye niyeti, dramatik ton, visual style seçimi, final frame ve motion kabul kararı.
3. **Devredilmeyecek Sınır:** Linter veya testlerin Mami'nin onayladığı bir `REAL` veya `EDU` promptunu kelime bazlı reddederek üretimi durdurması. Linter mekanik doğruluğu (boşluk, schema) denetler; estetik veto veremez.
