# CHARACTERS GOAL — T2 Gerçek DE Kadrosu (Mami prosedürü)

## Ne yapıyorsun
Gerçek Disco Elysium portre art'ını aşağıdaki adlarla `public/assets/characters/`
üstüne atıyorsun (üzerine yaz). KOD DEĞİŞMEZ — dosya adı sözleşmedir; dosya
göründüğü an UI painterly portreyi kendisi alır, dosya yoksa sprite fallback çalışır.

## Format kanunu
- 512×512 PNG, transparan zemin, portre büst kadrajı (baş+omuz)
- Painterly DE dili; metin/harf YOK; neon renk YOK (amber kimlikle uyum)

## Dosya listesi (15)
| Dosya | Kim | Durum |
|---|---|---|
| harry_du_bois.png | Harry Du Bois | VAR — gerçek art ile değiştir |
| kim_kitsuragi.png | Kim Kitsuragi (Director sesi) | VAR — gerçek art ile değiştir |
| skill_volition.png | Volition | VAR — değiştir |
| skill_perception.png | Perception | VAR — değiştir |
| skill_shivers.png | Shivers | VAR — değiştir |
| skill_logic.png | Logic | VAR — değiştir |
| skill_visual_calculus.png | Visual Calculus | VAR — değiştir |
| skill_drama.png | Drama | VAR — değiştir |
| skill_case_ledger.png | Case Ledger | VAR — değiştir |
| skill_conceptualization.png | Conceptualization | YOK — yeni |
| skill_encyclopedia.png | Encyclopedia | YOK — yeni |
| skill_inland_empire.png | Inland Empire | YOK — yeni |
| skill_prompt_surgeon.png | Prompt Surgeon (özgün MAMILAS sesi — DE'de yok, DE üslubunda cerrah/terzi) | YOK — yeni |
| skill_rhetoric.png | Rhetoric | YOK — yeni |
| skill_electrochemistry.png | Electrochemistry | YOK — yeni |

## Doğrulama
Dosyaları attıktan sonra:

    node scripts/check-assets3d.mjs

15/15 karakter satırı ✓ olmalı. Kabul anında: `node scripts/check-assets3d.mjs --strict`
NOT: `--strict` şu an `wall-plaster.webp` (T1 duvar dokusu, ayrı iş) eksik olduğu için de
FAIL verir — karakter satırlarının 15/15 ✓ olması yeterli; wall-plaster ayrıca teslim edilir.
Sonra tarayıcıda hard refresh (dev server restart gerekmez; görünmezse restart).
