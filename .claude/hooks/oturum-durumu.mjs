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
    const extra = { otherJobs: mod.otherInboxJobs(root, r.state) };
    out(mod.renderState(r.state, drift, extra).join('\n'));
  }
} catch (e) {
  out('[durum] ⚠ oturum durumu okunamadı — scripts/current-work.mjs yok ya da bozuk.');
  out(`        ${e?.message ?? e}`);
  out('        Aktif iş hakkında hüküm verme; Mami\'ye "nerede kalmıştık" diye sor.');
}

process.exit(0);
