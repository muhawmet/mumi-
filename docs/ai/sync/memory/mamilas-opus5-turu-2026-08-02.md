---
name: mamilas-opus5-turu-2026-08-02
description: "2026-08-02 OPUS5 turu — yeni doğrulayıcılar, kapıya bağlanan lint'ler, Mami'nin bekleyen 4 kararı ve üretimde duran eksik teslim."
metadata: 
  node_type: memory
  type: project
  originSessionId: 8d6d4d77-e230-4291-adaa-4e9965edc47d
  modified: 2026-08-02T11:40:43.272Z
---

# OPUS5 turu (2026-08-02) — ne kuruldu, ne açık kaldı

Tam devir metni: `docs/ai/GUN-SONU-2026-08-02.md`. Bu kayıt onun **hafızaya geçen** kısmı.
Otorite sırası değişmedi: `artifacts/current-work.json` → devir dosyası → bu kayıt.

## Yeni araçlar — clear sonrası bunları bil

```bash
node scripts/teslim-denetim.mjs --all          # 20 proje: biçim + sayım + VO örtmesi
node scripts/teslim-denetim.mjs "<proje yolu>" # tek proje
node scripts/baglar.mjs                        # belgelerdeki dosya:satır atıfları (kapıda --strict)
```

`motion-lint` artık gerçekten commit duvarında (önce hiçbir kapıya bağlı değildi).
`.md` teslim dosyaları da artık ölçülüyor — prompt ve motion tarafında.

## 🔴 Üretimde duran eksik teslim

**`5. Sınıf - Destek ve Hareket Sistemi` — K43-K52 hiç yazılmamış.** VO 52 cümle, prompt 41
kare; `PROMPTLAR/` altında A/B/C blokları var, **D bloğu yok**. Terra bağımsız doğruladı.
Bu iş bu hâliyle eksik teslim edilecekti.

## Mami'nin bekleyen 4 kararı (dördü de kalite tercihi, ajan seçemez)

- **T6** Motion kelime bandının kanonik sayısı — yasa `:546`=190-215, yasa `:561`=210-260,
  `motion-lint:137`=160-250/180-225. Üçü de "yasa" diye okunuyor.
- **T7** Ajan brief'i kalıcı yetenek olsun mu (`.claude/agents/`) — ama `sekans-denetim`'in
  kıstas sırası çelişik: `director:158` VO-uyumuyla, `denetim:38` FİKİR ile başlıyor.
- **T8** Yasaya makine-okur etiket — her lint kuralı hangi §'i ölçtüğünü beyan etsin.
- **T9** Hangi skill yüzeyi kanon — `~/.claude/skills` üç skill'de proje sürümünü **eziyor**
  (buddy 324 vs 178 satır). Bu yüzden bir düzeltme iki gün sonra geri döndü. Bkz.
  [[mamilas-claude-senkronu]].
- **İzin kararı:** AGY headless düşünüyor ama `read_file` izni reddedildiği için okuyamıyor.

## Bu turun dersi — kendi kusurum

Yeni yazdığım `teslim-denetim`, eskisinin kusur **sınıfını** yeniden üretti: prompt dosyasını
**adıyla** aradı ve yine kör oldu (`Kütle`nin 27 karesi `_CODEX-KALAN-START-FRAMELER.txt`
adlı dosyadaydı). 26 test yeşilken **iki yanlış bulgu** Mami'ye raporlandı. Farkı yeşil test
değil **ikinci göz** (Terra 5.6) yaptı. Kök neden onarıldı: kaynak artık adıyla değil
**içeriğiyle** bulunuyor (`STYLE:`/`NEGATIVE:` taşıyan her dosya) — bu kıstas
`prompt-lint.mjs`'te zaten vardı ve kopyalanmamıştı.

**Genel hüküm:** aynı hattı iki farklı sözleşmeyle okuyan iki doğrulayıcı, bu sistemin ana
kusur sınıfıdır. Ve dış modelin (Terra/Sol/AGY) hiçbir iddiası doğrulanmadan kabul edilmez —
Terra'nın da bir iddiası yanlış çıktı, grep'le elendi. Kural: `docs/ai/MODEL-YONLENDIRME.md` R4.
Bkz. [[mamilas-duyu-ve-ikinci-goz-yetkisi]], [[mamilas-uc-katman-hukmu]].
