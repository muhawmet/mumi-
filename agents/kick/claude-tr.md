# DEPRECATED — ÇALIŞTIRILAMAZ

Bu dosya eski dev “Production Agent” yolunun tarihsel yer tutucusudur. Yeni üretimde eski sağlayıcı ritüelleri taşımaz ve runner tarafından okunmaz.

Kanonik akış:

1. Timeline’dan `*_mamilas_command.json` indir.
2. `MOTION-CALISTIR.command` veya `MOTION-CALISTIR.bat` çalıştır.
3. Runner yalnız `scripts/mamilas-command.mjs` ile schema/hash/gate doğrular.
4. Karar yasası yalnız `agents/PROTOCOL.md` içindedir.

`FACT_REQUIRED`, jüri verdict’i, bir-revizyon sınırı ve gerçek-frame/Mami `APPROVE` kapısı hash’li protokol tarafından uygulanır. Bu dosyayı bir ajana prompt olarak verme.
