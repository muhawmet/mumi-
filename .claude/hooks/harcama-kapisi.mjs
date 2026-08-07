#!/usr/bin/env node
// HARCAMA KAPISI — kredi yakan her MCP çağrısından ÖNCE koşar.
//
// ─────────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// 2026-08-07: kaynak docx'te `mutfak` 0 kez geçerken 56 karelik mutfak dünyası kuruldu,
// 136 ajan onu çoğalttı, 57 kare basıldı ve hepsi çöpe gitti. O gün kapı yoktu; yalnız
// kural vardı. Kural bir RİCA'dır — yorulunca atlanır ve atlandı.
//
// `gate.sh` aynı dersi commit tarafında öğretmişti: bir skill atlanır, bir PreToolUse hook
// atlanamaz. Bu dosya o duvarı PARANIN yandığı yere taşır.
//
// ─────────────────────────────────────────────────────────────────────────────
// NEDEN BU KABUK BU KADAR İNCE
//
// Kararın tamamı `scripts/video-beyni.mjs → harcamaKarari()` içinde ve SAF. Sebebi
// ölçülmüş: bu repoda dokuz kez, doğrulayıcı ölçemediğini "ölçtüm" diye geçirdi. Karar saf
// olunca her koşulun TERSİ tek kredi yakmadan sınanabiliyor (`video-beyni.test.mjs`, 27 test).
// Burada yalnız stdin okunur, sonuç yazılır, süreç kodu verilir.
//
// ─────────────────────────────────────────────────────────────────────────────
// NEDEN HATA = BLOKAJ
//
// `gate.sh:16-19`: "kapi kendini dogrulayamiyorsa SESSIZCE GECMEYECEK — yuksek sesle
// blokolayacak. Kor kapi, kapali kapidan tehlikelidir." Burada yanlış tarafa düşmenin
// bedeli asimetrik: sessiz geçiş = 4.200 kredi, gürültülü blokaj = 10 saniye.
//
// ACİL ÇIKIŞ (ölçüldü, OLCULENLER 21): satır-içi ön ek hook'a ULAŞMAZ; hook ayrı süreçte
// koşar. Tek çalışan biçim:
//     export MAMILAS_HARCAMA_ACIK=1
// Kapatmak için: unset MAMILAS_HARCAMA_ACIK

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());

const blok = (baslik, satirlar) => {
  process.stderr.write(`\n🔴 HARCAMA KAPISI — üretim BLOKE edildi.\n\n${baslik}\n\n${satirlar.join('\n')}\n`);
  process.exit(2);
};

let ham = '';
process.stdin.on('data', (d) => { ham += d; });
process.stdin.on('end', async () => {
  let girdi;
  try {
    girdi = JSON.parse(ham);
  } catch {
    // Ayrıştıramadığımız bir çağrıyı "harcama değil" saymak tam olarak sessiz geçiştir.
    blok('Hook girdisi ayrıştırılamadı (bozuk JSON).', [
      'Kapı kör kalamaz. Sorun düzelene kadar üretim kapalı.',
      'Geçici açmak için:  export MAMILAS_HARCAMA_ACIK=1',
    ]);
    return;
  }

  const toolName = String(girdi?.tool_name ?? '');
  const agentId = girdi?.agent_id ?? null;

  let vb;
  try {
    vb = await import(pathToFileURL(resolve(root, 'scripts/video-beyni.mjs')).href);
  } catch (e) {
    blok(`Kapının kendisi yüklenemedi: ${e?.message ?? e}`, [
      'scripts/video-beyni.mjs yok ya da bozuk — kapı ölçemediği şeyi geçiremez.',
      'Geçici açmak için:  export MAMILAS_HARCAMA_ACIK=1',
    ]);
    return;
  }

  // Harcama olmayan çağrı hiç maliyet üretmeden geçer: hesap bakma, liste, durum sorgusu.
  // Bu ayrım kapının sökülmemesinin şartı — her şeyi bloke eden kapı, kaldırılan kapıdır.
  if (!vb.harcamaAraciMi(toolName)) process.exit(0);

  if (process.env.MAMILAS_HARCAMA_ACIK === '1') {
    process.stderr.write(`⚠ HARCAMA KAPISI ELLE AÇIK (MAMILAS_HARCAMA_ACIK=1) — ${toolName} denetimsiz geçti.\n`);
    process.exit(0);
  }

  try {
    const beyin = vb.beyinOku(root);
    const sayim = beyin.ok ? await vb.dunyaSayimi(beyin.meta, root) : null;
    const projeId = beyin.ok ? beyin.meta?.proje : null;
    const sayac = vb.sayacDegeri(projeId, root);

    const karar = vb.harcamaKarari({ toolName, agentId, beyin, sayim, sayac });

    if (!karar.izin) {
      blok(`[${karar.kod}]  ${karar.mesaj}`, [
        `→ ${karar.onarim}`,
        '',
        `araç: ${toolName}${agentId ? `   ·   çağıran: ajan ${agentId}` : ''}`,
        beyin.ok ? `beyin: ${beyin.yol}` : 'beyin: YOK',
      ]);
      return;
    }

    // Yalnız GEÇEN çağrı sayılır: reddedilen çağrı kredi yakmadı, bütçeden düşmesi yanlış olur.
    vb.sayacArtir(projeId, root);
    process.exit(0);
  } catch (e) {
    blok(`Kapı ölçüm sırasında düştü: ${e?.message ?? e}`, [
      'Ölçemediğini geçiremez — bu repoda boş/başarısız sonuç "temiz" değil KIRMIZI\'dır.',
      'Geçici açmak için:  export MAMILAS_HARCAMA_ACIK=1',
    ]);
  }
});
