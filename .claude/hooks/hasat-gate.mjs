#!/usr/bin/env node
// MAMILAS KAPANIŞ HASADI KAPISI (Node — cross-platform)
//
// Neden .sh değil: ORTAM YASASI dört kez kanla yazıldı. `hasat-gate.sh` bir bash script'ti;
// Windows birincil ortamda **sessiz no-op** olurdu — gate.sh'ın python3 kusurunun beşinci
// tekrarı. Script'in kendi yorumu POSIX varsayımının tehlikesini anlatıyordu ama kendisi
// POSIX varsayıyordu. Bu dosya aynı davranışı bash'siz verir.
//
// Neden DURUMA bakıyor, olaya değil: Mami klasörü Explorer'da sürüklüyor, `mv` yazmıyor.
// Komut metnine bakan bir hook bu makinede hiç ateşlemezdi. Kapı "taşındı mı" diye sormaz,
// "hasat GÜNCEL mi" diye sorar. Taşıma biçimi önemsiz.
//
// Neden bloke etmez: hasat Mami'nin onayına giden ADAY üretir, otomatik ders yazmaz (M7).
// Blokesi olan kapı burada yanlış olurdu — ama sessiz geçen kapı daha yanlış. Her zaman
// exit 0, çıktı stderr'e.
//
// ÖLÇEMEDİ ≠ TEMİZ: ön koşul düşerse sessizce geçmez, yüksek sesle "ÖLÇEMEDİ" der.

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const say = (s) => process.stderr.write(`${s}\n`);

// Proje kökü: önce kendi yerinden (.claude/hooks/ → ../..), sonra CLAUDE_PROJECT_DIR.
// cwd'ye GÜVENİLMEZ — hook'un hangi dizinden çağrıldığı sözleşme değil.
const HERE = dirname(fileURLToPath(import.meta.url));
const candidates = [join(HERE, '..', '..'), process.env.CLAUDE_PROJECT_DIR].filter(Boolean);
const root = candidates.find((r) => existsSync(join(r, 'scripts', 'kapanis-hasadi.mjs')));

if (!root) {
  say('[hasat] scripts/kapanis-hasadi.mjs bulunamadı — kapı ÖLÇEMEDİ (temiz demek değil).');
  process.exit(0);
}

try {
  const mod = await import(pathToFileURL(join(root, 'scripts', 'kapanis-hasadi.mjs')).href);
  const res = mod.checkProjects();
  const notOk = res.rows.filter((r) => r.status !== 'OK');

  if (!notOk.length && !res.orphans.length) {
    say(`[hasat] ✅ ${res.rows.length} biten projenin hepsi güncel (${mod.PARSER_VERSION}).`);
    process.exit(0);
  }

  // BU KAPI BİLEREK BLOKE ETMEZ ve bu doğru: hasat, Mami onayına gidecek ADAY üretir.
  // Bloke etmek onay bekleyen adayların oturumu kilitlemesi demek olurdu.
  // Ama 2026-07-31 ölçümü: uyarı düz metin olduğu için terminal kaydında kayboluyordu —
  // 1.858 satır ders adayı biriktiği hâlde APPROVED.md sıfır. Kaçırılmaz hâle getiriliyor.
  say('[hasat] ══════════════════════════════════════════════════════════════');
  say('[hasat] 🚨 HASAT BEKLEYEN PROJE VAR — biten iş henüz derse dönüşmedi');
  say('[hasat] ══════════════════════════════════════════════════════════════');
  say(`[hasat] ⚠️ ${res.rows.length - notOk.length}/${res.rows.length} proje güncel. Bekleyenler:`);
  for (const r of notOk) say(`[hasat]    · ${r.project}  [${r.status}]  ${r.detail}`);
  for (const o of res.orphans) say(`[hasat]    · (sahipsiz) ${o.file} — kaynak klasör "${o.dir}" yok`);
  say('[hasat] Kapanış hasadı yapılmadan biten video sadece bir klasördür.');
  say('[hasat]   node scripts/kapanis-hasadi.mjs --all    (ERROR verenler Mami kararı bekler)');
  say("[hasat] Çıktı ADAY — APPROVED.md'ye yalnız Mami taşır.");
} catch (e) {
  // Kapının kendi çöküşü sessiz geçmez: ölçemediğini SÖYLER.
  say(`[hasat] kapı ÖLÇEMEDİ (temiz demek değil): ${e?.message ?? e}`);
}

process.exit(0);
