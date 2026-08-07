#!/usr/bin/env node
// SessionStart — aktif işin kaydını oturuma taşır.
//
// Neden düz stdout, `additionalContext` JSON zarfı DEĞİL: bu repoda düz stdout'un SessionStart'ta
// Claude'a ULAŞTIĞI kanıtlı (buddy-gate.sh bugün böyle çalışıyor). Kanıtlanmamış zarfı denemek
// tam olarak "yazdım = çalışıyor" hatası olurdu.
//
// Neden .mjs ve bash değil: ORTAM YASASI. `node ...` ile çağrıldığı için exec bitine ihtiyaç
// duymaz — Windows'ta exec biti taşınmıyor, .sh hook'ları bu yüzden bir kez 126 verdi.
//
// Neden her şey try/catch ve exit 0: SessionStart bloke edemez. Ve hata stderr'e DEĞİL stdout'a
// basılır — hasat-gate.sh'ın bugün ölçülen sessizliği (0 bayt stdout, mesajlar stderr'de, exit 0)
// tam olarak bu hatadan doğuyordu: "kapı ölçtü ve temiz" ile "kapı hiç ateşlemedi" ayırt edilemez.

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = (s) => process.stdout.write(`${s}\n`);
const root = resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());

try {
  const mod = await import(pathToFileURL(resolve(root, 'scripts/current-work.mjs')).href);
  const r = mod.readState(root);
  if (!r.ok) {
    out(mod.renderMissing(r.reason, r.detail).join('\n'));
  } else {
    const drift = mod.driftOf(root, r.state);
    // Basılmamış kare sayısı AYRI try ile alınır: yeni bir araç eskiyen bir kaydı kilitleyemez.
    const basim = await import(pathToFileURL(resolve(root, 'scripts/basim-kuyrugu.mjs')).href)
      .then((bk) => bk.basimOzeti(root, r.state.projectId)).catch(() => null);
    const extra = { otherJobs: mod.otherInboxJobs(root, r.state), basim };
    out(mod.renderState(r.state, drift, extra).join('\n'));
  }
} catch (e) {
  out('[durum] ⚠ oturum durumu okunamadı — scripts/current-work.mjs yok ya da bozuk.');
  out(`        ${e?.message ?? e}`);
  out('        Aktif iş hakkında hüküm verme; Mami\'ye "nerede kalmıştık" diye sor.');
}

// ─── VİDEO BEYNİ ────────────────────────────────────────────────────────────────
// Mami'nin emri (2026-08-07): "o başta triggerlanmasını sağlarsan çok ekstra olur."
//
// Sebebi ölçüldü aynı gün: yeni sohbet `CLAUDE.md` + faz profili + `OLCULENLER.md` ile
// açılıyordu; AKTİF VİDEONUN kilitleri (`_ENZIM.md`, 169 satır, diskte) kimsenin bağlamında
// değildi. Oturum prosedürü biliyordu, o videonun dünyasını bilmiyordu — ve kaynakta 0 kez
// geçen bir mekâna 56 kare yazdı.
//
// AYRI try: beyin okunamazsa `[durum]` bloğu yine de basılmalı. Yeni bir yüzey eski bir
// yüzeyi kilitleyemez — bu repoda ölçülmüş kural.
try {
  const vb = await import(pathToFileURL(resolve(root, 'scripts/video-beyni.mjs')).href);
  const beyin = vb.beyinOku(root);
  const sayim = beyin.ok ? await vb.dunyaSayimi(beyin.meta, root) : null;
  const sayac = vb.sayacDegeri(beyin.ok ? beyin.meta?.proje : null, root);
  out(vb.beyinBlogu(beyin, sayim, { sayac }).join('\n'));
} catch (e) {
  // Sessiz kalmak yasak: beyin okunamıyorsa harcama kapısı da kapalıdır ve oturum bunu bilmeli.
  out('[beyin] ⚠ video beyni okunamadı — scripts/video-beyni.mjs yok ya da bozuk.');
  out(`        ${e?.message ?? e}`);
  out('        Harcama kapısı bu durumda üretimi REDDEDER; önce aracı onar.');
}

process.exit(0);
