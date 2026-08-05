#!/usr/bin/env node
// DIRECTOR CONTEXT — ajanın küçük canlı beyni.
//
// ─────────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// Bugün her ajan 84 KB'lık yasayı, 133 ref'i ve 107 aday dersi çekmeye çalışıyor. Sonucu
// ölçüldü: aynı dünyada DÖRT LEHÇE doğdu (Kütle'nin ilk 8 karesi 81-91 kelime, kalan 27'si
// 23-30 kelime; `overscale` 8/8 → 0/27). Bağlam dolunca ajan yasayı değil, o an elinde
// kalanı uyguluyor.
//
// Bu betik DERLEYİCİDİR, YAZAR DEĞİL. Prompt yazmaz, kamera seçmez, dominant element
// belirlemez, hikâye kurmaz. Yalnız diskte GERÇEKTEN VAR OLAN artefact'lerden küçük bir
// seçki toplar ve onu hash'ler. Hash'in sebebi: üretim ortasında ders bankası büyüdü ya da
// dünya kartı değişti diye filmin dili SESSİZCE değişmesin.
//
// ─────────────────────────────────────────────────────────────────────────────
// SEÇKİ SINIRLARI — bunlar tavsiye değil, kod
//   · en fazla 6 APPROVED makro ders
//   · en fazla 2 iyi + 1 kötü precedent
//   · yalnız İSTENEN sekansın Shot Card'ları (hepsi değil)
//   · ref sözleşmeleri TAM (kısaltılmaz — TAŞIMAZ satırı kesilirse kusur geri gelir)
//
// Kullanım:
//   node scripts/director-context.mjs "<proje adı>" [--sekans S3] [--yaz]

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = resolve(import.meta.dirname, '..');
const INBOX = join(ROOT, 'agents/COMMAND-INBOX');
const MAX_DERS = 6;
const MAX_IYI_PRECEDENT = 2;
const MAX_KOTU_PRECEDENT = 1;

const oku = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
const varsa = (p) => (existsSync(p) ? p : null);

function projeBul(ad) {
  for (const kok of [INBOX, join(INBOX, 'Biten')]) {
    if (!existsSync(kok)) continue;
    const hit = readdirSync(kok).find((d) => d === ad || d.toLowerCase().includes(String(ad).toLowerCase()));
    if (hit && existsSync(join(kok, hit))) return join(kok, hit);
  }
  return null;
}

const dosyaBul = (dir, re) => (existsSync(dir) ? readdirSync(dir).filter((f) => re.test(f)).sort() : []);

/** APPROVED.md'den YALNIZ ilgili dersleri seçer — banka büyüdükçe context büyümez. */
export function ilgiliDersler(approvedMetin, { worldId, register, anahtarlar = [] }, tavan = MAX_DERS) {
  const satirlar = String(approvedMetin ?? '').split('\n').filter((l) => /^\s*-\s+\S/.test(l));
  const puan = (l) => {
    const s = l.toLowerCase();
    let p = 0;
    for (const a of anahtarlar) if (a && s.includes(String(a).toLowerCase())) p += 2;
    if (worldId && s.includes(String(worldId).toLowerCase())) p += 3;
    if (register && s.includes(String(register).toLowerCase())) p += 1;
    return p;
  };
  // Puanı 0 olanlar da tamamen dışlanmaz — banka küçükken hepsi ilgili sayılır; ama
  // sıralama ilgiliye öncelik verir ve TAVAN kesin. Sessiz kırpma YOK: kaç ders elendi
  // çıktıda yazılır (bkz. derle()).
  return satirlar
    .map((l, i) => ({ l, p: puan(l), i }))
    .sort((a, b) => (b.p - a.p) || (a.i - b.i))
    .slice(0, tavan)
    .map((x) => x.l.trim());
}

export function derle(projeAd, { sekans = null } = {}) {
  const dir = projeBul(projeAd);
  if (!dir) throw new Error(`proje bulunamadı: ${projeAd}`);

  const enzimAd = dosyaBul(dir, /_ENZIM\.(md|txt)$/i)[0];
  const refAd = dosyaBul(dir, /_REFERANSLAR.*\.(txt|md)$/i)[0];
  const voAd = dosyaBul(dir, /_SESLENDIRME(?!-TEK).*\.(txt|md)$/i)[0];
  const lockAd = dosyaBul(dir, /_CANARY-LOCK\.(md|txt)$/i)[0];

  const enzim = enzimAd ? oku(join(dir, enzimAd)) : null;
  const ref = refAd ? oku(join(dir, refAd)) : null;
  const lock = lockAd ? oku(join(dir, lockAd)) : null;

  // Dünya/register: Enzim kilitlerinden okunur — UYDURULMAZ, bulunamazsa "bilinmiyor".
  // Dünya kimliği Enzim'de iki biçimde yazılıyor: `worldId: x` ya da KİLİT 1 — DÜNYA
  // başlığının altında backtick'li snake_case id (`pixar_3d_edu`). İkisi de aranır;
  // bulunamazsa "bilinmiyor" YAZILIR — tahmin edilmez, çünkü yanlış dünya tüm kareyi bozar.
  const worldId = (enzim?.match(/world(?:Id)?\s*[:=]\s*`?([a-z0-9_]+)`?/i) ?? [])[1]
    ?? (enzim?.match(/DÜNYA[\s\S]{0,300}?`([a-z][a-z0-9]*(?:_[a-z0-9]+)+)`/i) ?? [])[1]
    ?? null;
  const register = (enzim?.match(/register\s*[:=]?\s*\*{0,2}(REAL|EDU|STY)\b/i) ?? [])[1] ?? null;

  // Shot Card: yalnız istenen sekans. Hepsini dökmek bu betiğin varlık sebebini yok eder.
  const shotsDir = join(dir, 'SHOTS');
  const shotDosyalar = dosyaBul(shotsDir, /\.(md|txt)$/i)
    .filter((f) => !sekans || f.toLowerCase().includes(String(sekans).toLowerCase()));
  const shots = shotDosyalar.map((f) => ({ ad: f, metin: oku(join(shotsDir, f)) }));

  // Ders bankası — ilgili seçki, tavanlı.
  const approved = oku(join(ROOT, 'agents/lessons/APPROVED.md'));
  const toplamDers = String(approved ?? '').split('\n').filter((l) => /^\s*-\s+\S/.test(l)).length;
  const anahtarlar = [projeAd, ...(ref?.match(/@[a-zçğıöşü][\w-]*/gi) ?? []).slice(0, 8)];
  const dersler = ilgiliDersler(approved, { worldId, register, anahtarlar });

  // Precedent — gerçek görsel kanıt taşıyanlar. Dizin yoksa AÇIKÇA "yok" yazılır;
  // sessizce boş bırakmak "precedent kontrol edildi" izlenimi verirdi.
  const precDir = join(ROOT, 'agents/precedents');
  const precedents = existsSync(precDir)
    ? readdirSync(precDir).filter((d) => existsSync(join(precDir, d, 'PRECEDENT.json')))
    : [];
  const iyi = []; const kotu = [];
  for (const id of precedents) {
    let j = null;
    try { j = JSON.parse(readFileSync(join(precDir, id, 'PRECEDENT.json'), 'utf8')); } catch { continue; }
    const hedef = j?.verdict === 'kotu' || j?.hüküm === 'kötü' ? kotu : iyi;
    hedef.push({ id, ...j });
  }

  const parcalar = {
    proje: projeAd,
    dizin: dir.replace(`${ROOT}/`, ''),
    worldId: worldId ?? 'bilinmiyor',
    register: register ?? 'bilinmiyor',
    enzim: enzimAd ?? null,
    ref: refAd ?? null,
    vo: voAd ?? null,
    canaryLock: lockAd ?? null,
    shots: shots.map((s) => s.ad),
    dersSayi: dersler.length,
    dersToplam: toplamDers,
    precedentIyi: iyi.slice(0, MAX_IYI_PRECEDENT).map((x) => x.id),
    precedentKotu: kotu.slice(0, MAX_KOTU_PRECEDENT).map((x) => x.id),
  };

  const govde = [
    `# DIRECTOR CONTEXT — ${projeAd}${sekans ? ` · ${sekans}` : ''}`,
    '',
    '> Bu dosya DERLENMİŞTİR, yazılmamıştır. İçindeki her satır diskte var olan bir',
    '> artefact\'ten gelir. Prompt, kamera, dominant element ve hikâye BURADA YOKTUR —',
    '> onu yönetmen düşünür. Üretim ortasında banka büyüse bile bu seçki DONMUŞTUR.',
    '',
    '## KİMLİK',
    `- proje: \`${parcalar.dizin}\``,
    `- dünya: \`${parcalar.worldId}\` · register: \`${parcalar.register}\``,
    `- canary kilidi: ${lockAd ? `\`${lockAd}\` ✅` : '**YOK — üretim fazı açılamaz**'}`,
    '',
    '## VİZYON KİLİDİ (Enzim)',
    enzim ? enzim.trim() : '_(yok — `/mamilas-enzim` ile KİLİT 0-5 kapatılmadı)_',
    '',
    '## REFERANS SÖZLEŞMELERİ',
    '> TAM aktarılır, kısaltılmaz: `TAŞIMAZ` satırı kesilirse ref kendi kadrajını sahneye',
    '> ithal eder (ölçüldü: ayak kadrajda 7/7 kötü kare, 0/4 iyi kare).',
    ref ? ref.trim() : '_(yok — referans envanteri ilk iştir, §4a)_',
    '',
    `## MAKRO DERSLER — ${dersler.length}/${toplamDers} seçildi (tavan ${MAX_DERS})`,
    dersler.length
      ? dersler.join('\n')
      : '_(banka boş — hiçbir ders onaylanmamış)_',
    toplamDers > dersler.length
      ? `\n_(${toplamDers - dersler.length} ders bu seçkinin DIŞINDA bırakıldı — sessiz kırpma değil, tavan.)_`
      : '',
    '',
    '## GÖRSEL PRECEDENT',
    precedents.length
      ? `iyi: ${parcalar.precedentIyi.join(' · ') || '—'} · kötü: ${parcalar.precedentKotu.join(' · ') || '—'}`
      : '_(YOK — `agents/precedents/` dizini boş ya da yok. Precedent gerçek kare/klipten doğar; prompt precedent sayılmaz.)_',
    '',
    `## SHOT CARD — ${shots.length} kart${sekans ? ` (yalnız ${sekans})` : ''}`,
    shots.length
      ? shots.map((s) => `### ${s.ad}\n${s.metin.trim()}`).join('\n\n')
      : '_(yok — kart yazılmadan prompt yazılmaz)_',
    '',
    '## CANARY KİLİDİ',
    lock ? lock.trim() : '_(yok — canary hükmü verilmemiş, tam üretim kapalı)_',
    '',
  ].join('\n');

  const hash = createHash('sha256').update(govde).digest('hex').slice(0, 16);
  return { govde: `${govde}\n---\ncontext-sha256: ${hash}\n`, hash, parcalar };
}

function main() {
  const argv = process.argv.slice(2);
  const ad = argv.find((a) => !a.startsWith('--'));
  const sekans = argv.includes('--sekans') ? argv[argv.indexOf('--sekans') + 1] : null;
  if (!ad) {
    process.stdout.write('kullanım: node scripts/director-context.mjs "<proje>" [--sekans S3] [--yaz]\n');
    process.exit(1);
  }
  const { govde, hash, parcalar } = derle(ad, { sekans });
  if (argv.includes('--yaz')) {
    const out = join(ROOT, 'artifacts', parcalar.proje.replace(/[^\w.-]+/g, '_'));
    mkdirSync(out, { recursive: true });
    const yol = join(out, `DIRECTOR-CONTEXT${sekans ? `-${sekans}` : ''}.md`);
    writeFileSync(yol, govde, 'utf8');
    process.stdout.write(`✅ yazıldı: ${yol.replace(`${ROOT}/`, '')}\n   context-sha256: ${hash}\n`);
  } else {
    process.stdout.write(govde);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
