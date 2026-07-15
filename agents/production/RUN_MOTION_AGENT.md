# DEPRECATED — eski production paketi çalıştırılmaz

Bu dosya dev Pass A/Pass B Production Agent akışının tarihsel yer tutucusudur. Eski `mamilas.production.v2026` JSON, giant prompt ve otomatik çoklu ajan akışı yeni üretimde kabul edilmez.

Güncel kullanım:

1. MAMILAS Timeline’dan `*_mamilas_command.json` indir.
2. Dosyayı launcher klasörüne koy veya runner’a `--file` ile ver.
3. `MOTION-CALISTIR.command` (macOS) ya da `MOTION-CALISTIR.bat` (Windows) çalıştır.
4. Runner önce proje adını sorar; `MAMILAS-PROJELER/<proje>/runs/<commandId>/` klasörünü açar.
   Session, artifact, approval ve frame dosyalarının tamamı bu proje içinde kalır.
5. Runner kanonik komut doğrulayıcısına gider; yalnız sıradaki tek rolü Claude veya Codex ile interaktif açar.

Karar yasası yalnız `agents/PROTOCOL.md` içindedir. Motion, current gerçek frame ve Mami `APPROVE` olmadan açılamaz.
