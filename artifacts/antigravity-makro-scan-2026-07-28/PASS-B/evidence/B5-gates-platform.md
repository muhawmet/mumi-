# B5 — Kapılar ve Platform Davranışı

## İncelenen Gerçek Yol
`.claude/hooks/gate.sh`, `.claude/hooks/buddy-gate.sh`, `artifacts/decision-pipeline-implementation/EXECUTION_STATE.md`.

## Aday Bulgu — protocolHash CRLF Hatası Kapanmıştır; Hook'lar Fail-Closed Modunda Çalışmaktadır
- **Durum:** `HISTORICAL`
- **Beklenen / Gerçek:** İlk raporda `protocolHash` CRLF hatasının üretimi durdurduğu iddia edilmişti. `EXECUTION_STATE.md` (Satır 512-525) ve `agentProtocol.test.ts` incelendiğinde CRLF normalization işleminin 2026-07-27 tarihinde tamamlandığı ve `.gitattributes` dosyasının eklendiği teyit edilmiştir.
- **Kanıt Zinciri:** `EXECUTION_STATE.md:512` ("2128/2128 test bu onarımla önce KIRILDI... Kök neden kapandı: .gitattributes").
- **Tekrar Üretim:** `npx vitest run src/core/agentProtocol.test.ts` komutunu çalıştır (tüm testler YEŞİL).
- **Karşı-okuma ve Sonucu:** Hata güncel canlı hat üzerinde mevcut değildir, 27 Temmuz'da çözülmüş tarihsel bir dersdir.
- **Üretim Etkisi:** Canlı hattı etkilememektedir.
- **Korunacak Şey:** `.gitattributes` ve `agentProtocol.ts` içindeki CRLF normalization katmanı.
- **En Küçük Yön / Production Probe:** Ek bir müdahaleye gerek yoktur.
