#!/usr/bin/env node
// VİDEO BEYNİ — bir videonun BEYAN'ı ve o beyanı taşıyıcı kolon yapan karar fonksiyonu.
//
// ─────────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// 2026-08-07: aynı gün, aynı model, iki sonuç. Sabah 54 kare 32 dakikada ("şahane ötesi"),
// öğleden sonra 57 kare çöpe ("bu ne aq"). Kaynak docx'te `mutfak` kelimesi 0 kez geçerken
// 56 karelik mutfak dünyası kuruldu ve 136 ajan onu çoğalttı.
//
// Kolay teşhis "hafıza eksikliği" der ve çözüm olarak yeni bir belge yazar. Ölçüm bunu
// çürütüyor: bilgi VARDI. Dünya-kaynaktan kuralı `OLCULENLER.md` 13-16'da, canary zorunluluğu
// `faz-icraat.md`'de, video kilitleri o projenin kendi `_ENZIM.md`'sinde (169 satır, diskte)
// yazılıydı. Dördü de atlandı.
//
// Yani bu repoda belgeler çürüyor çünkü HİÇBİR ŞEY ONLARA BAĞIMLI DEĞİL. Bir belge
// bayatladığında hiçbir şey durmuyor: `00-DURUM.txt` "kare 0/52" diyordu, gerçek 71'di,
// kimse fark etmedi — çünkü kimse ona bakmak ZORUNDA değildi.
//
// Bu dosyanın tezi: hafızayı yeni bir yere yazmak değil, VAR OLAN hafızayı yükün altına
// sokmak. Parayı yakan araç harcadığı anda beyni okur. Bayat beyin üretimi durdurur —
// ve tam bu yüzden bayat kalmaz.
//
// ─────────────────────────────────────────────────────────────────────────────
// İKİNCİ TEZ — BEYİN YALNIZ BEYAN TAŞIR
//
// Bugün bayatlayan her alan ELLE YAZILMIŞTI: kaç kare basıldı, kaç kredi yandı, kaynakta
// kaç kelime var. Bunlar beyne HİÇ girmez; diskten türer (`basim-kuyrugu.mjs`, `is-emri.mjs`,
// buradaki `dunyaSayimi`). Beyin yalnız BEYAN taşır: dünya, cast, ton, Mami kararları,
// öğrenilenler. Türetilen sayı bayatlayamaz.
//
// ─────────────────────────────────────────────────────────────────────────────
// NEDEN KARAR BURADA, HOOK'TA DEĞİL
//
// `harcamaKarari` SAF bir fonksiyondur: disk okumaz, süreç öldürmez. Sebebi ölçülmüş —
// bu repoda dokuz kez görülen ana kusur, doğrulayıcının ölçemediğini "ölçtüm" diye
// geçirmesi. Karar saf olunca her koşulun TERSİ tek kredi yakmadan, tek MCP çağrısı
// yapmadan sınanabiliyor (`video-beyni.test.mjs`). Hook yalnız ince bir kabuk.

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Canary onaylanmadan yakılabilecek en fazla harcama çağrısı.
// Yasa "2 canary kare" diyor; tavan 4 çünkü iki karenin her birine bir yeniden deneme payı
// bırakıyoruz. Dünkü felaket 57 çağrıydı — 4'lük tavan onu ilk beşincide durdururdu.
export const CANARY_TAVANI = 4;

export const SAYAC_YOLU = join('artifacts', 'harcama-sayaci.json');

// ─────────────────────────────────────────────────────────────────────────────
// 1 · FRONTMATTER
//
// Neden yeni bir kalıp icat edilmiyor: `.claude/rules/*.md` zaten `paths:` frontmatter'ı
// kullanıyor. Neden yaml paketi yok: bu repo ORTAM YASASI taşıyor — yeni bağımlılık,
// Windows'ta çalıştığı doğrulanana kadar bir varsayımdır. İhtiyacımız olan gramer küçük.

/** `key: value` · `key: [a, b]` · `key: { a: 1 }` — fazlası desteklenmez, sessizce yutulmaz. */
export function degerAyristir(ham) {
  const s = String(ham ?? '').trim();
  if (!s) return '';
  if (s.startsWith('[') && s.endsWith(']')) {
    return s.slice(1, -1).split(',').map((p) => temizle(p)).filter(Boolean);
  }
  if (s.startsWith('{') && s.endsWith('}')) {
    const nesne = {};
    for (const parca of s.slice(1, -1).split(',')) {
      const i = parca.indexOf(':');
      if (i < 0) continue;
      const k = temizle(parca.slice(0, i));
      const v = temizle(parca.slice(i + 1));
      if (k) nesne[k] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
    }
    return nesne;
  }
  return temizle(s);
}

function temizle(s) {
  return String(s ?? '').trim().replace(/^['"]|['"]$/g, '').trim();
}

export function frontmatterAyristir(metin) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(String(metin ?? ''));
  if (!m) return { meta: null, govde: String(metin ?? '') };
  const meta = {};
  for (const satir of m[1].split(/\r?\n/)) {
    if (!satir.trim() || satir.trim().startsWith('#')) continue;
    const i = satir.indexOf(':');
    if (i < 0) continue;
    const anahtar = satir.slice(0, i).trim();
    // Satır sonu yorumu (` # …`) değerden düşer; `#` bir renk kodunun içindeyse korunur.
    const hamDeger = satir.slice(i + 1).replace(/\s+#\s.*$/, '');
    if (anahtar) meta[anahtar] = degerAyristir(hamDeger);
  }
  return { meta, govde: String(metin).slice(m[0].length) };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · AKTİF PROJENİN BEYNİ

/** `artifacts/current-work.json` → `projectPath` → `<proje>/CLAUDE.md` */
export function beyinYolu(root = REPO_ROOT) {
  try {
    const kayit = JSON.parse(readFileSync(join(root, 'artifacts', 'current-work.json'), 'utf8'));
    if (!kayit?.projectPath) return null;
    return join(root, kayit.projectPath, 'CLAUDE.md');
  } catch {
    return null;
  }
}

export function beyinOku(root = REPO_ROOT) {
  const yol = beyinYolu(root);
  if (!yol) {
    return { ok: false, sebep: 'KAYIT-YOK', mesaj: 'artifacts/current-work.json okunamadı ya da projectPath yok.' };
  }
  if (!existsSync(yol)) {
    return { ok: false, sebep: 'BEYIN-YOK', yol, mesaj: `aktif projede beyin dosyası yok: ${yol}` };
  }
  const { meta, govde } = frontmatterAyristir(readFileSync(yol, 'utf8'));
  if (!meta) {
    return { ok: false, sebep: 'FRONTMATTER-YOK', yol, mesaj: `beyin dosyasında frontmatter yok: ${yol}` };
  }
  return { ok: true, yol, meta, govde };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · DÜNYA SAYIMI — dünkü felaketin tam olarak geçtiği yer
//
// Beyin `dunya: [orkestra, nöron, lunapark]` beyan eder; burada o kelimeler GERÇEK kaynakta
// sayılır. `mutfak` beyan edilip kaynakta 0 çıkıyorsa dünya bir mekân değil, bir fotoğraf
// fikridir. Türkçe ekler yüzünden kelime sınırı aranmaz (`orkestrayı`, `nöronların` sayılır);
// aranan şey KÖK'ün geçip geçmediğidir.

// Ünsüz yumuşaması: `çaydanlık` → `çaydanlığa`, `kitap` → `kitabı`, `ağaç` → `ağacın`.
// Bu tabloyu yazdıran şey bir varsayım değil bir ölçüm: ilk koşuda `çaydanlık` gerçek
// kaynakta 0 çıktı, oysa kaynak "sıcak bir çaydanlığa dokundurup" diyordu. Alt dizge
// araması Türkçede kökü kaybediyor.
const YUMUSAMA = { k: 'ğ', p: 'b', t: 'd', ç: 'c' };

export function kelimeSay(metin, kelime) {
  const govde = String(metin ?? '').toLocaleLowerCase('tr');
  const hedef = String(kelime ?? '').trim().toLocaleLowerCase('tr');
  if (!hedef) return 0;
  const varyantlar = [hedef];
  const yumusak = YUMUSAMA[hedef.at(-1)];
  if (yumusak) varyantlar.push(hedef.slice(0, -1) + yumusak);
  // Varyantlar son harfte ayrıştığı için çakışamaz; toplamak çift saymaz.
  return varyantlar.reduce((toplam, v) => {
    let adet = 0;
    let i = govde.indexOf(v);
    while (i !== -1) { adet += 1; i = govde.indexOf(v, i + v.length); }
    return toplam + adet;
  }, 0);
}

/** Kaynağı okur ve beyan edilen dünya kelimelerini sayar. `.docx` doğrudan açılır. */
export async function dunyaSayimi(meta, root = REPO_ROOT) {
  const kelimeler = Array.isArray(meta?.dunya) ? meta.dunya : (meta?.dunya ? [meta.dunya] : []);
  if (!kelimeler.length) {
    return { ok: false, sebep: 'DUNYA-BEYAN-YOK', toplam: 0, dokum: [] };
  }
  const kaynakYolu = meta?.kaynak ? resolve(root, String(meta.kaynak)) : null;
  if (!kaynakYolu || !existsSync(kaynakYolu)) {
    return { ok: false, sebep: 'KAYNAK-YOK', toplam: 0, dokum: [], kaynakYolu };
  }
  let metin = '';
  try {
    const { kaynakOku } = await import('./brifing.mjs');
    // `kaynakOku` bir NESNE döner (`{ ham, veri, metin }`), düz metin değil. Bu satır ilk
    // yazımda düz metin varsayıyordu ve sayım sessizce 0 verirdi — yani kapı, dünyayı
    // kaynakta ARAMADAN "kaynakta yok" derdi. Bu repoda dokuz kez ölçülen kusurun onuncusu
    // tam burada doğuyordu; ilk gerçek koşuda yakalandı.
    metin = kaynakOku(kaynakYolu)?.metin ?? '';
  } catch (e) {
    return { ok: false, sebep: 'KAYNAK-OKUNAMADI', toplam: 0, dokum: [], kaynakYolu, mesaj: e?.message };
  }
  const dokum = kelimeler.map((k) => ({ kelime: k, adet: kelimeSay(metin, k) }));
  return { ok: true, toplam: dokum.reduce((a, d) => a + d.adet, 0), dokum, kaynakYolu };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 · HANGİ ÇAĞRI PARA YAKAR
//
// Filtre BURADA, settings.json'da DEĞİL. Sebebi `gate.sh:7-9`'da yazılı ve ölçülmüş:
// matcher alanına güvenildiğinde kapı ya her çağrıda ateşledi ya hiç ateşlemedi.
// Kapı kendi kapısını kendi tutar.
//
// Kapsam bilerek iki sunucu: Mami'nin kredisini yakanlar. Adobe/Canva/Gmail buraya girmez —
// gereksiz blokaj bir kapıyı sökülecek bir şeye çevirir.

const HARCAYAN_SUNUCU = /^mcp__(magnific|claude_ai_Higgsfield)__/;

const HARCAYAN_EYLEM = new RegExp([
  'generate', 'upscale', 'expand', 'relight', 'retouch', 'variations',
  'change_camera', 'vectorize', 'to_svg', 'remove_background', 'outpaint',
  'reframe', 'motion_control', 'dubbing', 'voice_change', 'speak',
  'flows_run', 'spaces_run', 'models3d', 'license_and_download',
].join('|'), 'i');

// Toplu araçlar: canary onaylanmadan bunlar HİÇ açılmaz. Bir batch çağrısı tanım gereği
// "iki kare deneyip bakalım" değildir.
const TOPLU_ARAC = /(_batch|spaces_run|flows_run|video_plan)/i;

export function harcamaAraciMi(toolName) {
  const ad = String(toolName ?? '');
  return HARCAYAN_SUNUCU.test(ad) && HARCAYAN_EYLEM.test(ad);
}

export function topluAracMi(toolName) {
  return TOPLU_ARAC.test(String(toolName ?? ''));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 · KARAR — saf fonksiyon, kapının tamamı
//
// Sıra tesadüf değil: en ucuz ve en mutlak kural önce. Ajan yasağı beyin okumadan da
// verilebilir, o yüzden birinci.

export function harcamaKarari({ toolName, agentId = null, beyin, sayim = null, sayac = 0 } = {}) {
  if (!harcamaAraciMi(toolName)) {
    return { izin: true, kod: 'HARCAMA-DEGIL' };
  }

  const meta = beyin?.ok ? beyin.meta : null;

  // 1 — AJAN. Mami, 2026-08-07: "üretim kısmını sadece sen yapacaksın, şef sensin,
  // onlar sadece prompt yazacak; MCP sadece sende. Bıraksam sonsuz üretecektin."
  // Ölçüldü: 6 basım ajanının her birinin kendi döngüsü vardı, hiçbirinde bütçe yoktu,
  // toplamı gören kimse yoktu. Diskte 135 görsel birikti ve sayı kimsede yoktu.
  if (agentId && meta?.uretim_yetkisi !== 'serbest') {
    return {
      izin: false,
      kod: 'AJAN',
      mesaj: `Ajan (${agentId}) üretim çağrısı yaptı: ${toolName}`,
      onarim: 'Üretim yalnız ana oturumda. Ajan prompt YAZAR, BASMAZ — kareyi orkestratör basar.',
    };
  }

  // 2 — BEYİN. Beyni olmayan bir işte dünya beyan edilmemiş demektir; sayılacak bir şey yok.
  if (!beyin?.ok) {
    return {
      izin: false,
      kod: beyin?.sebep ?? 'BEYIN-YOK',
      mesaj: beyin?.mesaj ?? 'aktif projenin beyni okunamadı',
      onarim: 'node scripts/video-beyni.mjs kur "<proje>" — sonra dünya ve kaynak beyan edilir.',
    };
  }

  // 3 — DÜNYA KAYNAKTA VAR MI. Dünkü çöküş tam buradan geçerdi: beyan `mutfak`, kaynakta 0.
  if (!sayim?.ok) {
    return {
      izin: false,
      kod: sayim?.sebep ?? 'SAYIM-YOK',
      mesaj: sayim?.mesaj ?? 'dünya sayımı yapılamadı — beyinde `dunya:` ya da `kaynak:` eksik',
      onarim: 'Beyne `kaynak:` (gerçek docx yolu) ve `dunya:` (mekân anahtarları) yaz.',
    };
  }
  if (sayim.toplam === 0) {
    const liste = sayim.dokum.map((d) => `${d.kelime} 0`).join(' · ');
    return {
      izin: false,
      kod: 'DUNYA-KAYNAKTA-YOK',
      mesaj: `Beyan edilen dünya kaynakta hiç geçmiyor — ${liste}`,
      onarim: 'Bu bir dünya değil, bir fotoğraf fikri. Dünyayı kaynaktan türet ya da Mami\'ye sor.',
    };
  }

  // 4 — CANARY. Ölçüldü: canary'siz basılan 6 klibin 6'sı bozuk çıktı; dün 57 kare.
  const canary = String(meta?.canary ?? 'YOK').toUpperCase();
  if (canary !== 'GECTI') {
    if (topluAracMi(toolName)) {
      return {
        izin: false,
        kod: 'CANARY-TOPLU',
        mesaj: `Canary ${canary} iken toplu üretim açılamaz: ${toolName}`,
        onarim: 'Önce 2 canary kare bas, Read ile aç, Mami onaylasın; sonra beyne `canary: GECTI` yaz.',
      };
    }
    if (sayac >= CANARY_TAVANI) {
      return {
        izin: false,
        kod: 'CANARY-TAVAN',
        mesaj: `Canary onaylanmadan ${sayac} harcama çağrısı yapıldı (tavan ${CANARY_TAVANI}).`,
        onarim: 'Kareleri Mami\'ye götür. Onay gelmeden beşinci çağrı açılmaz.',
      };
    }
  }

  // 5 — BÜTÇE. Mami'nin kuralı: "BASMADAN ÖNCE RAKAM SÖYLENİR ve o rakam aşılmaz."
  // Bugüne kadar bu bir cümleydi; burada bir tavan.
  const onayli = Number(meta?.butce?.onayli ?? 0);
  const birim = Number(meta?.butce?.birim ?? 0);
  if (onayli > 0 && birim > 0 && (sayac + 1) * birim > onayli) {
    return {
      izin: false,
      kod: 'BUTCE',
      mesaj: `Onaylanan rakam aşılıyor: ${(sayac + 1) * birim} > ${onayli} kredi (${sayac} çağrı yapıldı).`,
      onarim: 'Mami yeni rakamı onaylasın, sonra beyindeki `butce.onayli` güncellensin.',
    };
  }

  return { izin: true, kod: 'ACIK', sayac };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 · SAYAÇ — kapıdan geçen harcama çağrısı diske yazılır
//
// Neden dosya: kapı her çağrıda AYRI bir süreçtir, bellekte sayaç tutamaz. Neden proje
// bazlı: bütçe ve canary proje bazlıdır.

export function sayacOku(root = REPO_ROOT) {
  try {
    return JSON.parse(readFileSync(join(root, SAYAC_YOLU), 'utf8'));
  } catch {
    return {};
  }
}

export function sayacArtir(projeId, root = REPO_ROOT) {
  const hepsi = sayacOku(root);
  const anahtar = String(projeId ?? 'bilinmeyen');
  const onceki = Number(hepsi[anahtar]?.cagri ?? 0);
  hepsi[anahtar] = { cagri: onceki + 1, guncel: new Date().toISOString() };
  try {
    mkdirSync(dirname(join(root, SAYAC_YOLU)), { recursive: true });
    writeFileSync(join(root, SAYAC_YOLU), `${JSON.stringify(hepsi, null, 2)}\n`);
  } catch { /* sayaç yazılamazsa kapı yine de çalışır; sessiz kalmaz, hook uyarır */ }
  return onceki + 1;
}

export function sayacDegeri(projeId, root = REPO_ROOT) {
  return Number(sayacOku(root)[String(projeId ?? 'bilinmeyen')]?.cagri ?? 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7 · OTURUM GÖRÜNÜMÜ — beynin insana bakan yüzü
//
// Yalnız BEYAN basılır artı diskten türetilen bir satır. Uzun rapor basılmaz:
// Mami'nin kuralı "eller, beyin değil" — açılışta duvar gibi metin okunmuyor.

export function beyinBlogu(beyin, sayim, ekstra = {}) {
  const satir = [];
  if (!beyin?.ok) {
    satir.push('[beyin] ⚠ AKTİF PROJEDE BEYİN YOK — dünya hakkında hüküm verme.');
    satir.push(`        ${beyin?.mesaj ?? 'sebep bilinmiyor'}`);
    satir.push('        Harcama kapısı bu yüzden KAPALI: üretim çağrısı reddedilecek.');
    satir.push('        Kur: node scripts/video-beyni.mjs kur "<proje>"');
    return satir;
  }
  const m = beyin.meta;
  satir.push(`[beyin] ${m.proje ?? '(adsız)'} — ${beyin.yol.replace(`${REPO_ROOT}/`, '')}`);
  if (sayim?.ok) {
    const dokum = sayim.dokum.map((d) => `${d.kelime} ${d.adet}`).join(' · ');
    const isaret = sayim.toplam === 0 ? '🔴' : '✓';
    satir.push(`  DÜNYA   ${isaret} ${dokum}   (kaynakta sayıldı)`);
  } else {
    satir.push(`  DÜNYA   🔴 sayılamadı — ${sayim?.sebep ?? 'sebep yok'}; üretim kapısı KAPALI`);
  }
  const canary = String(m.canary ?? 'YOK').toUpperCase();
  const butce = m.butce?.onayli ? `${m.butce.onayli} kredi onaylı` : 'rakam onaylanmadı';
  satir.push(`  CANARY  ${canary === 'GECTI' ? '✓' : '⚠'} ${canary}   ·   BÜTÇE ${butce}   ·   harcama çağrısı ${ekstra.sayac ?? 0}`);
  satir.push('  ÜRETİM  yalnız ana oturum — ajan prompt yazar, basmaz (kapı zorluyor)');
  const kararlar = kesitCek(beyin.govde, 'MAMİ KARARLARI', 4);
  if (kararlar.length) satir.push('  MAMİ KARARLARI', ...kararlar.map((l) => `    ${l}`));
  const dersler = kesitCek(beyin.govde, 'BU VİDEODA ÖĞRENİLENLER', 4);
  if (dersler.length) satir.push('  ÖĞRENİLENLER', ...dersler.map((l) => `    ${l}`));
  return satir;
}

/** Gövdeden bir `##` başlığının altındaki ilk N madde. Tavan var: blok duvara dönüşmesin. */
export function kesitCek(govde, baslik, tavan = 4) {
  const metin = String(govde ?? '');
  const i = metin.toLocaleUpperCase('tr').indexOf(`## ${baslik.toLocaleUpperCase('tr')}`);
  if (i < 0) return [];
  const kalan = metin.slice(i).split(/\r?\n/).slice(1);
  const cikti = [];
  for (const satir of kalan) {
    if (/^##\s/.test(satir)) break;
    if (/^\s*[-*]\s+\S/.test(satir)) cikti.push(satir.trim());
    if (cikti.length >= tavan) break;
  }
  return cikti;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8 · CLI

const SABLON_YOLU = join('agents', '_VIDEO-BEYNI-SABLON.md');

function kullanim() {
  return [
    'node scripts/video-beyni.mjs oku                 — aktif projenin beynini bas',
    'node scripts/video-beyni.mjs dogrula             — harcama kapısı şu an açık mı',
    'node scripts/video-beyni.mjs kur "<proje yolu>"  — şablondan beyin iskeleti yaz',
  ].join('\n');
}

async function main(argv) {
  const komut = argv[2] ?? 'oku';
  const root = REPO_ROOT;

  if (komut === 'kur') {
    const hedef = argv[3];
    if (!hedef) { console.error(kullanim()); process.exitCode = 1; return; }
    const dizin = resolve(root, hedef);
    const dosya = join(dizin, 'CLAUDE.md');
    if (existsSync(dosya)) { console.log(`zaten var: ${dosya}`); return; }
    if (!existsSync(join(root, SABLON_YOLU))) { console.error(`şablon yok: ${SABLON_YOLU}`); process.exitCode = 1; return; }
    writeFileSync(dosya, readFileSync(join(root, SABLON_YOLU), 'utf8'));
    console.log(`beyin iskeleti yazıldı: ${dosya}\nfrontmatter'daki <…> alanlarını doldur.`);
    return;
  }

  const beyin = beyinOku(root);
  const sayim = beyin.ok ? await dunyaSayimi(beyin.meta, root) : null;
  const sayac = sayacDegeri(beyin.ok ? beyin.meta?.proje : null, root);

  if (komut === 'dogrula') {
    // Gerçek bir üretim aracı adıyla sınanır — "kapı açık mı" sorusunun tek dürüst cevabı bu.
    const karar = harcamaKarari({ toolName: 'mcp__magnific__images_generate', beyin, sayim, sayac });
    console.log(karar.izin
      ? `✓ HARCAMA KAPISI AÇIK (${karar.kod}) — çağrı ${sayac}`
      : `🔴 HARCAMA KAPISI KAPALI [${karar.kod}]\n   ${karar.mesaj}\n   → ${karar.onarim}`);
    process.exitCode = karar.izin ? 0 : 1;
    return;
  }

  console.log(beyinBlogu(beyin, sayim, { sayac }).join('\n'));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv).catch((e) => { console.error(`video-beyni: ${e?.message ?? e}`); process.exitCode = 1; });
}
