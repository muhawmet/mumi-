# BRAIN-M1 — Canonical consolidation (tek kaynak → iki yüzey)

**Tarih:** 2026-07-16 · **Uygulayıcı:** Claude Opus 4.8 (1M) · **Denetçi:** Codex `gpt-5.6-sol` high

## Ne kuruldu (KUSUR-B kapanışı)

- **Kanon taşındı:** 6 manuel Studio ajan gövdesi (`director`, `image-author`, `ip-firewall`,
  `motion-author`, `palette-translator`, `qa-jury`) → `agents/roles/studio/*.md`. Taşıma öncesi
  iki yüzeyin gövdeleri 6/6 birebir aynı ölçüldü (kayıp yok).
- **`agents/manifest.json`:** role → canonical source → yüzey meta (description/tools/model).
- **`scripts/agents-sync.mjs`:** `syncAgents()` üretir, `checkAgents()` temp-üretim + byte-compare
  + orphan avı + banner kontrolü. Hash: `mamilas-command.mjs` `sha256`'sı (yeni hash icat edilmedi).
  CLI: `npm run agents:sync` / `npm run agents:sync -- --check` (drift'te exit 1).
- **12 dosya artık GENERATED:** `.claude/agents/mamilas-*.md` (6) + `.codex/agents/mamilas-*.toml` (6),
  her biri `GENERATED — DO NOT EDIT · source · protocolHash` banner'lı.
- **`scripts/agents-sync.d.mts`:** tsc için tip deklarasyonu.
- **`src/core/agentsSync.test.ts`:** 5 test — (1) drift boş, (2) banner+protocolHash, (3) orphan yok,
  (4) *bağımsız*: manifest 6 ajan + kanon dosyaları var, (5) *bağımsız*: iki yüzey de kanon gövdeye
  kayıpsız decode oluyor (builder'ı oracle yapmadan, doğrudan diskten — Sol P2 fix'i).

## Gerçek doğrulamalar

- TDD: test önce FAIL (modül yok) → generator sonrası PASS.
- Elle-drift: `.claude/agents/mamilas-director.md`'ye "HACKED" eklendi → `--check` **FAIL exit 1**
  (`stale/hand-edited` + `missing-banner`); `agents:sync` dosyayı kanondan onardı → OK.
- Round-trip: 6/6 kanon gövde her iki yüzeyden birebir geri okunuyor (script + test).
- Launcher parity: hiçbir `.bat`/`.command` dosyasına dokunulmadı (Sol da PASS verdi).

## Sol denetimi (gpt-5.6-sol high, adversarial)

**Kapılar yeşil onaylandı.** Kritik (P0/P1) bulgu YOK. Mami kararı (2026-07-16): *"kelimelere
takılmayın, kritik değilse post'ta fixleriz."* Bulgular:

| Bulgu | Aksiyon |
|---|---|
| P2: parity testi builder'ı oracle yapıyor | **HEMEN KAPATILDI** — 2 bağımsız test eklendi (manifest+kanon varlığı, gerçek decode round-trip) |
| P2: plan "provider wrapper'ı generator tüketsin" diyordu; adapters/*.md okunmuyor | Ledger — gerçek lifecycle adapter'ı zaten runtime'da okuyor (`mamilas-command.mjs:728`); Studio yüzeyinde wrapper gereksiz. Convergence'ta karara bağlanır |
| P2: orphan avı tek seviye readdir; alt-klasör/farklı-uzantı kaçar | Ledger — bugün alt-klasör yok; convergence'ta recursive yapılabilir |
| P3: `trimEnd()` trailing-whitespace byte'larını normalize ediyor | Kabul edilen davranış (kanon gövdesi anlamlı içerik; trailing whitespace sözleşme değil) |
| P3: TOML kontrol-karakteri kaçışı yok | Ledger — kanonda kontrol karakteri yok; `"""` zaten reddediliyor |

## Kapı (gerçek çıktı)

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | 0 hata |
| `rtk proxy npx vitest run` | **1901 passed / 0 failed (68 dosya)** — M0'a göre +5 test, sayı düşmedi |
| `npm run build` | OK (✓ built in 346ms) |
| `npm run agents:sync -- --check` | OK — iki yüzey kanonla birebir |

## Convergence ledger'a giden ikincil bulgular

Yukarıdaki tabloda "Ledger" işaretli 3 madde (provider-wrapper kararı, recursive orphan avı,
TOML kontrol-karakteri sertleştirmesi).

## Sıradaki

**M2 — render_law prop/fizik ayrımı** (`toWorldPacket().renderPhysics`). Plana göre M2 öncesi `/clear`.
