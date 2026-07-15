---
name: mamilas-pipeline
description: MAMILAS'ı üç odaklı kapanış fazında yürütür. Mami "execute", "devam et", "phase/faz", "pipeline", "siteyi bitir" veya Core/Studio/Command fazlarından birini kapat dediğinde kullan. Sol'a ürün invariantları içinde yüksek mimari özgürlük, serbest iç ajan koordinasyonu, faz-sonu bağımsız denetim ve final convergence teslim akışı verir.
---

# MAMILAS — three-phase execution

## Başlangıç

Şunları sırayla oku:

1. `docs/ai/PROJECT_CONTRACT.md`
2. `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`
3. `artifacts/decision-pipeline-implementation/MAMILAS-THREE-PHASE-COMPLETION-MAP.md`
4. Yalnız aktif fazın son receipt/audit dosyaları ve gerçek kodu

Eski Macro/task metnini yürütme kaynağı yapma. Tamamlanmış fazı kanıtsız yeniden açma.

## Sol çalışma yetkisi

Sol baş mimar, denetçi ve uygulayıcıdır. Mami ürün sonucunu tarif eder; sınıf, field, task, ajan
topolojisi ve teknik yöntem kutsal değildir. Daha iyi bir fikir bulursan geliştir, kanıtla ve uygula.
Planı checklist gibi taklit etme.

Geri döndürülebilir deney yapabilir, hata yapabilir ve kanıtla düzeltebilirsin. Ama hatayı saklama,
sahte PASS üretme veya ilgisiz dirty-worktree değişikliklerini ezme. Reset/checkout/stash/push yapma.

“10/10” veya soyut kusursuzluk bekleyerek fazı dondurma. Kabul sonucunu sağlayan, bilinen kritik kırığı
olmayan ve orantılı kapılardan geçen işi teslim et. Kozmetik/ikincil bulguları faz-sonu denetim raporuna
taşı; üç fazdan sonraki final convergence oturumu bunları birlikte kapatır.

## İç ajan özgürlüğü

İş bağımsız kollara ayrılıyorsa Sol istediği kadar bounded ajan kullanabilir; araştırma, kod, test ve
karşılaştırmayı kendi içinde koordine eder. Sabit swarm/topoloji, kendini çoğaltan loop veya usage yakan
boş tartışma kurma. Mami'ye iç tartışmayı değil karar, kanıt ve sonucu göster.

Her fazın builder işi bittikten sonra yalnız bir fresh bağımsız denetçi ajan aktif fazı ve gerçek çıktıyı
inceler. Denetçi kod yazmaz; `PHASE-<N>-AUDIT.md` raporu üretir. Veri kaybı, yasak ürün sınırı,
güvenlik veya yeni test kırığı gibi kritik bulgu hemen düzeltilir. Diğer bulgular final convergence
ledger'ına yazılır; fazı sonsuz fix döngüsüne sokmaz.

## Ürün sınırı

- Site exact source ve Mami kararını taşır; final engine prompt yazmaz.
- Sol/Yerleşik Yönetmen Mami'nin niyetini akılla geliştirir; site source kelimelerinden regex, NLP,
  kelime sayısı veya gizli blocker ile niyet uydurmaz.
- Eksik gerçek bilgi marka/yüz/dönem gibi üretimi değiştiriyorsa `FACT_REQUIRED`; yaratıcı çözüm
  gerektiriyorsa Sol önerisini geliştirir.
- Harici image/video API, otomatik generation, batch, zorunlu upscale ve ajan loop'u yoktur.
- Kırk altı world fizik paketi, compatible ref ve palette-as-light korunur.
- Gerçek current frame ve Mami `APPROVE` olmadan motion yoktur.
- Test yeşili görsel PASS değildir.

## Fazlar

1. Decision Core & Creative Library
2. Studio Application, UX & Evidence State
3. Command & Manual Production Runtime
4. Mimari faz değil: üç audit raporunu kapatan Final Convergence & Delivery oturumu

Aktif fazın scope dışına yalnız kanıtlı cross-phase kırık için çık. Mikro onay isteme. Faz sonunda builder
receipt, bağımsız audit raporu, çalıştırılan kapılar ve convergence ledger girdilerini yaz; sonra dur.

## Teslim

Final convergence oturumu üç receipt + üç audit raporunu birlikte okur, kalan uygulanabilir bulguları
önceliklendirip düzeltir, tam TypeScript/Vitest/build/E2E/launcher kapılarını çalıştırır ve tek teslim
raporu yazar. Gerçek Mami frame verdict'i yoksa dürüst durum:
`implementation complete / visual validation pending`.
