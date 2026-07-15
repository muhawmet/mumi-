# MAMILAS Agent Protocol v1

Bu dosya Claude ve Codex command oturumlarının tek karar yasasıdır. Provider adaptörleri bu
yasayı kopyalamaz; yalnız kendi I/O ve araç kullanımını tarif eder.

## Ürün sınırı

- Mami yalnız Yerleşik Yönetmen ile konuşur. İç roller kullanıcıya ajan kalabalığı göstermez.
- Site raw source'u, Mami seçimlerini, WorldPacket'i, onaylı storyboard'u ve MamiDirectives'i
  kayıpsız taşır. Final image/motion prompt'u site değil ilgili author yazar.
- Source kelimelerinden text/niyet çıkaran regex, NLP veya kelime-sayısı tahmini yoktur.
- Image/video API, batch, otomatik generation, upscale pipeline veya kredi ritüeli yoktur.
- Palette translation, IP firewall, schema/hash/stale, ref compatibility, engine math ve path
  safety deterministic koddur; ajan rolü değildir.

## Faz yasası

Her yaratıcı faz yalnız `bir author → bir bağımsız jury` çalıştırır. Jury verdict'i yalnız
`PASS | REJECT | FACT_REQUIRED` olabilir. `REJECT` exact failing check ve en küçük targeted fix
taşır. Aynı fazda en fazla bir author revision vardır; ikinci red veya eksik gerçek
`FACT_REQUIRED` olur. Ajanlar birbirleriyle loop kurmaz.

## Image

Image Author yalnız current decision, APPROVED storyboard shot, ilgili exact MamiDirectives,
WorldPacket fiziği, compatible refs, palette-as-light, explicit locks, engine dialect, failure
modes ve continuity özetini alır. Tüm proje JSON'u veya site-yazımı engine prompt'u almaz.
Çıktı engine-facing image prompt artifact'idir; workflow/TODO/`[DIRECTOR TASK]`/raw hex içermez.

Image Jury yalnız Decision + Storyboard + Image Prompt'u ölçer. Frame yokken frame PASS vermez.

## Frame ve Motion

Frame'i Mami harici araçta elle üretir ve site/workspace'e yükler. Frame artifact'i gerçek byte
SHA-256, boyut/aspect, decision/storyboard/image-prompt bağını taşır. Motion yalnız current frame
ve Mami `APPROVE` verdict'iyle açılır; `REGENERATE`, `PROJECT_ONLY_ACCEPT` ve stale frame açmaz.

Frame Jury gerçek frame + Mami verdict'ini okur; Mami'nin estetik hükmünü geçersiz kılamaz.
Motion Author önce frame'i açar, inventory receipt yazar ve yalnız karede görüneni canlandırır.
Motion Jury Decision + Storyboard + Image Prompt + gerçek approved Frame + Motion'u ölçer.

## Artifact yasası

Her artifact şunları taşır: protocolVersion, protocolHash, phase, role, provider, decisionHash,
storyboardHash, inputArtifactHashes, revision, content, contentHash. Hash uyuşmazlığı veya stale
girdi sonraki fazı durdurur. Timestamp artifact kimliğine girmez.

## Gerçeklik sınırı

Marka geometrisi, belirli yüz veya dönem bilgisi kaynak/ref içinde yoksa uydurma:
`FACT_REQUIRED: <eksik gerçek>`. Test yeşili görsel PASS değildir. Gerçek frame ve Mami verdict'i
yoksa yalnız `implementation complete / visual validation pending` denebilir.
