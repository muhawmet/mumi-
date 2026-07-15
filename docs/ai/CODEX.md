# MAMILAS içinde Codex kullanımı

## Başlatma

Windows'ta kökteki `BASLAT-CODEX.bat` dosyasına çift tıkla veya PowerShell'de:

```powershell
.\scripts\start-codex.ps1
```

Launcher gerçek Codex masaüstü CLI yolunu bulur, çalışma kökünü `C:\Mamilas` yapar
ve canlı web aramasını açar. Model ve reasoning seçimi Codex CLI'nin kendi
yapılandırmasında/oturumunda yaşar — launcher bunu zorlamaz (`.codex/config.toml`
yalnız görsel üretimi/çoklu ajanı ayarlar).

## Görsel üretme

Codex'e doğal dille söyle:

```text
MAMILAS için bu brief'ten 16:9 bir dünya önizleme karesi üret.
PROJECT_CONTRACT kurallarına uy ve seçilen finali artifacts/imagegen/<slug>/ altına koy.
```

Yerel bir görseli başlangıçta eklemek için:

```powershell
.\scripts\start-codex.ps1 -Image "C:\yol\referans.png" -Prompt "Bu görseli incele ve yalnızca ışığı değiştir."
```

Normal üretimde yerleşik imagegen kullanılır ve API anahtarı gerekmez. Kullanıcı özel
olarak API/CLI fallback istemedikçe ayrı Python image API yolu kullanılmaz.

## Görev örnekleri

- `Gerçek generateBatch çıktısıyla üretim kalitesi audit'i yap.`
- `Bu bug'ın kök nedenini bul; düzeltmeden önce kanıtla.`
- `Bu dünya için üç bağımsız görsel yön üret ve karşılaştır.`
- `Kalite kapısını çalıştır, yalnızca yeni kırıkları raporla.`
