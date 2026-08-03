---
name: mamilas-olcum-tersti
description: prompt-lint kaliteyi değil kendi yapıştırdığına uyumu ölçüyordu; duvar artık uzunlukta değil TEKRARDA — ve kapı üretimin dörtte üçünü hiç görmüyordu.
metadata: 
  node_type: memory
  type: project
  originSessionId: 8d6d4d77-e230-4291-adaa-4e9965edc47d
  modified: 2026-08-02T22:10:53.852Z
---

# Ölçüm ters çalışıyordu (2026-08-02/03 onarımı)

**Hüküm:** Sistem kendi kalitesini ters yönde ölçüyordu ve üretimin dörtte üçünü hiç ölçmüyordu.

## Ne bulundu

- `prompt-lint`in hüküm veren iki metriği (STYLE uzunluğu, NEGATIVE tekilliği) tam olarak
  `dunya-kilidi.mjs`'in her kareye **aynen yapıştırdığı** şeydi — araç kendi yapıştırdığını
  ölçüyordu. Tek-STYLE'lı teslimler 0 kırmızı, kare-özel STYLE yazılmış teslim 14/50 kırmızı.
- Asıl ayırt edici zaten hesaplanıyordu (`styleVariants`) ve hiçbir kural okumuyordu.
  Doğal kontrol: aynı projenin iki sürümü — tek-STYLE **53/57**, kare-özel **7/57**.
- `gate.sh` prompt dalı dosyayı **adıyla** arıyordu; `prompt-lint` ta baştan **içeriğe**
  bakıyordu. COMMAND-INBOX'taki 146 prompt dosyasının yalnız 18'i eski ada uyuyor —
  **128'i** duvardan hiç ölçülmeden geçiyordu ve kapı her seferinde "✅ yeşil" yazıyordu.
- Aynı körlük iş kaydındaydı: `Destek ve Hareket`in 41 karesi `PROMPTLAR:false` görünüyordu.

## Kalıcı ders

**Bu repoda tekrar eden ana kusur sınıfı:** bir doğrulayıcı, ölçtüğü hattın gerçek yerleşimini
değil **beklediğini** arıyor — ve yeşil kalıyor. Dört kez ölçüldü: `teslim-denetim` adla arıyordu ·
`baglar` uzantıyı 5 karaktere kesiyordu (`.command` → `.comma`) · `gate.sh` prompt dalı ·
`current-work` teslim taraması. Hepsinde çözüm repoda zaten yazılıydı ve kopyalanmamıştı.

**How to apply:** Yeni bir ölçüm aracı yazarken üç soru: (1) girdisini ADIYLA mı İÇERİĞİYLE mi
buluyor? (2) ortama dair varsayım yapıyor mu (kabuk, satır sonu, HOME)? (3) kapıya bağlı mı ve
BLOKE mi ediyor yalnız uyarıyor mu? Ve **yeşil test kanıt değildir** — duvarın ısırdığını
bilerek bozuk bir örnekle kanıtla. Bkz. [[mamilas-uc-katman-hukmu]], [[mamilas-lint-rol-koru]].
