# 11 çöp betik — arşivlendi, silinmedi (2026-07-29)

`scripts/` altında **takipsiz** duruyorlardı; hiçbir kapı, test, skill ya da yasa onlara atıf
yapmıyor (ölçüldü: repo genelinde sıfır referans). Hepsi tek bir biten üretimin
("Kuvvet ve Kuvvetin Ölçülmesi") tek seferlik prompt üreticileri — aynı işin dokuz sürümü
(`_clean`, `_perfect`, `_rich`, `_master`, `_turkish_typography`…), toplam 4132 satır.

`scripts/` üretim yüzeyidir; orada duran her dosya bir sonraki ajana "bu çalışan bir araç"
diye görünür. Dokuz rakip sürüm ise hangisinin doğru olduğunu bilinemez kılar — `Kuvvet ve
Kuvvetin Ölçülmesi` klasöründeki "iki rakip teslim" kusurunun betik hali.

**Silinmedi, taşındı.** Mami'nin duran emri "çöp dışarıda" — ama takipsiz dosyanın `rm`'i
geri alınamaz, o yüzden arşive girdi ve bu commit'le git'e alındı: artık geri getirilebilir.

Gerçekten gerekiyorsa: `git mv artifacts/archive-scripts-2026-07-29/<dosya> scripts/`
