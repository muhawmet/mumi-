# MAMILAS Agent Kurulum ve Kullanım

## Dosya Eşleşmesi

| Rol | GPT talimatı | Claude talimatı | Knowledge |
|---|---|---|---|
| IDEA | `gpt/01_IDEA_GPT.md` | `claude/01_IDEA_CLAUDE.md` | `../knowledge/01_IDEA_KNOWLEDGE.md` |
| IMAGE | `gpt/02_IMAGE_GPT.md` | `claude/02_IMAGE_CLAUDE.md` | `../knowledge/02_IMAGE_KNOWLEDGE.md` |
| MOTION | `gpt/03_MOTION_GPT.md` | `claude/03_MOTION_CLAUDE.md` | `../knowledge/03_MOTION_KNOWLEDGE.md` |
| SUNO | `gpt/04_SUNO_GPT.md` | `claude/04_SUNO_CLAUDE.md` | `../knowledge/04_SUNO_KNOWLEDGE.md` |
| DESIGN | `gpt/05_DESIGN_GPT.md` | `claude/05_DESIGN_CLAUDE.md` | `../knowledge/05_DESIGN_KNOWLEDGE.md` |
| PROOF | `gpt/06_PROOF_GPT.md` | `claude/06_PROOF_CLAUDE.md` | `../knowledge/06_PROOF_KNOWLEDGE.md` |

## Kurulum

- GPT-5.5: GPT dosyasını talimat olarak, eşleşen knowledge dosyasını bilgi
  kaynağı olarak ekleyin.
- Claude: Claude dosyasını project/custom instruction olarak, eşleşen knowledge
  dosyasını project knowledge olarak ekleyin.
- Her görevde siteden alınan ilgili handoff/brief metnini kullanıcı girdisi
  olarak verin.

## Kullanım Sırası

`SITE -> IDEA -> IMAGE -> MOTION -> SUNO -> PROOF`

Design işleri için:

`SITE Design -> IDEA -> DESIGN -> PROOF`

## Site Paket Eşlemesi (mamilas-modern)

Modern site Timeline ekranındaki **"Ajan Paketleri"** menüsü her ajan için
hazır bir giriş paketi üretir. Kopyala → eşleşen ajana yapıştır:

| Site menü öğesi | Ajan |
|---|---|
| Ana Ajan Brief | tüm zincir (ortak production brief) |
| IDEA Paketi (Fikir) | `01_IDEA_*` |
| IMAGE Paketi (Görsel) | `02_IMAGE_*` |
| MOTION Paketi (Hareket) | `03_MOTION_*` |
| SUNO Paketi (Müzik) — yalnız video | `04_SUNO_*` |
| PROOF Paketi (Denetim) | `06_PROOF_*` |

Paketlerin taşıdığı tetik tokenleri (`BRAND KIT: LOCKED`,
`CREATIVE VARIANT TEST — variable:`, `RENDER LOCK`, `SCENE DOSSIER`,
`PROOF STATE & QUALITY STATUS`) ile ajan kapıları arasındaki sözleşme
`GLOBAL_BRAIN.md` → "Site ↔ Ajan Paketleri" bölümünde tanımlıdır.

## Sağlayıcı Kararı

GPT talimatları kısa, başlıklı sözleşmeler ve ayrı knowledge yönlendirmesi
kullanır. Claude talimatları açıklayıcı ve iyi biçimlenmiş XML bölümleri
kullanır. Her iki sağlayıcı da kullanılabilir üretim çıktısını önce verir.
