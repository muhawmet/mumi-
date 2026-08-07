#!/usr/bin/env node
// KARAR YÜZEYİ — Mami'nin telefonu. Otonom stüdyonun İNSAN kapısı.
//
// NEDEN VAR — sistemin gerçek darboğazı:
// Kredi değil, motor değil, kare değil. **Tek onaycı var, telefonda, DEHB'li.** Sistemin
// ölçüsü "kaç kare bastı" değil, *"Mami kaç kez bakmak zorunda kaldı ve her bakışta kaç
// saniyede karar verebildi."* Rapor duvarı bir karar yüzeyi DEĞİLDİR — ölçüldü, duvarın
// içine gömülen teklif okunmamış sayılıyor.
//
// Bu organ bütün durum kaynaklarını tarar ve ŞU AN karar bekleyen en fazla BEŞ şeyi,
// ikili tuşa indirgenmiş halde basar. Beşten fazlası varsa sayısını söyler ama göstermez —
// altıncı madde okunmuyor, o yüzden yazılmıyor.
//
//   node scripts/karar.mjs            # tek ekran
//   node scripts/karar.mjs --json     # Claude bunu AskUserQuestion'a çevirir
//
// BİLDİRİM: bu script bildirim GÖNDERMEZ. Yükü üretir; telefona düşürmek Claude'un işidir
// (`PushNotification`). Sebep: kod haber veremez, ajan verir — ve haber verilecek şeyin
// KARAR olduğuna karar vermek de ajanın işi.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { emirleriOku, vuruslar } from './uretim-defteri.mjs';
import { filmKapasitesi, oku as artifactOku, CUZDAN_YOLU, RAF_YOLU } from './rota.mjs';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DERS_DIZIN = path.join(REPO_ROOT, 'agents', 'lessons');
export const IS_KAYDI = path.join(REPO_ROOT, 'artifacts', 'current-work.json');

/** Altıncı madde okunmuyor. Bu bir tercih değil, DEHB'li tek onaycının ölçülmüş sınırı. */
export const EKRAN_TAVANI = 5;

export class KararError extends Error {}

/** Öncelik: önce ÜRETİMİ BLOKE eden, sonra PARA yakan, en sonra öğrenme. */
export const ONCELIK = Object.freeze({ bloke: 0, para: 1, ogrenme: 2 });

function onayBekleyen(emirler) {
  const kalemler = [];
  for (const emir of emirler) {
    const kareler = emir.shots.filter((s) => s.asama === 'basildi').map((s) => s.n);
    if (!kareler.length) continue;
    kalemler.push({
      oncelik: ONCELIK.bloke,
      baslik: `${emir.proje} — ${kareler.length} kare onayını bekliyor`,
      detay: `kare ${kareler.slice(0, 8).join(', ')}${kareler.length > 8 ? '…' : ''}`,
      gerekce: 'Recreate senin kontrolünde: ben bulurum, sen seçersin.',
      secenekler: ['Hepsi tamam, devam', 'Bazılarını göster', 'Hepsini yeniden bas'],
    });
  }
  return kalemler;
}

function klipBekleyen(emirler) {
  return emirler
    .filter((e) => e.shots.some((s) => s.asama === 'onaylandi'))
    .map((emir) => {
      const kareler = emir.shots.filter((s) => s.asama === 'onaylandi').length;
      return {
        oncelik: ONCELIK.para,
        baslik: `${emir.proje} — ${kareler} onaylı kare klip bekliyor`,
        detay: 'klip basımı en pahalı adım; canary kilidi olmadan açılmaz',
        gerekce: 'Canary\'siz basılan 6 klibin 6\'sı bozuk çıktı.',
        secenekler: ['Bas', 'Önce canary', 'Bekle'],
      };
    });
}

function cuzdanUyarisi() {
  const cuzdan = artifactOku(CUZDAN_YOLU);
  if (!cuzdan) return [];
  const kalemler = [];
  for (const ad of ['magnific', 'higgsfield']) {
    const k = filmKapasitesi(ad, cuzdan[ad]?.kalan);
    if (k && k.film < 1) {
      kalemler.push({
        oncelik: ONCELIK.para,
        baslik: `${ad} bakiyesi bir filmin altında (~${k.film} film)`,
        detay: `${cuzdan[ad].kalan} kredi · bir film ≈ ${k.filmMaliyeti}`,
        gerekce: 'Bütçe kapısı adımda değil ÖNCESİNDE açılır; yarım kalan iş en pahalısıdır.',
        secenekler: ['Diğer cüzdana geç', 'Kredi ekle', 'Yine de devam'],
      });
    }
  }
  return kalemler;
}

function ucVurus(emirler) {
  const dolu = vuruslar(emirler).filter((v) => v.dolu);
  if (!dolu.length) return [];
  return [{
    oncelik: ONCELIK.ogrenme,
    baslik: `${dolu.length} hata sınıfı üç vuruşu doldurdu`,
    detay: dolu.map((d) => `${d.kusur} (${d.vurus} iş)`).join(' · '),
    gerekce: 'Üç ayrı işte tekrar etti — artık kaza değil desen. Yasaya geçsin mi?',
    secenekler: ['Adayları göster', 'Şimdilik bekle'],
  }];
}

export function bekleyenDersSayisi({ dizin = DERS_DIZIN } = {}) {
  if (!existsSync(dizin)) return 0;
  return readdirSync(dizin).filter((f) => f.startsWith('ONAY-') || f.startsWith('CANDIDATES-')).length;
}

function dersKuyrugu({ dizin } = {}) {
  const adet = bekleyenDersSayisi({ dizin });
  if (!adet) return [];
  return [{
    oncelik: ONCELIK.ogrenme,
    baslik: `${adet} ders dosyası onayını bekliyor`,
    detay: 'bankada 7 onaylı derse karşı 115 aday — ve 7\'sinin hepsi tek projeden',
    gerekce: 'Bankaya girmeyen ders üretime hiç dönmez: director, enzim ve yasa hep bankayı okur.',
    secenekler: ['Şimdi geçelim', 'Sonra'],
  }];
}

function acikKarar({ isKaydi = IS_KAYDI } = {}) {
  if (!existsSync(isKaydi)) return [];
  try {
    const kayit = JSON.parse(readFileSync(isKaydi, 'utf8'));
    const soru = kayit.mamiKarari ?? kayit.mami_karari ?? kayit.acikKarar;
    if (!soru) return [];
    const liste = Array.isArray(soru) ? soru : [soru];
    return liste.filter(Boolean).map((s) => ({
      oncelik: ONCELIK.bloke,
      baslik: typeof s === 'string' ? s : (s.soru ?? 'açık karar'),
      detay: 'kayıtta duran açık karar',
      gerekce: 'İş kaydı bunu bekliyor; kapanış bu cevap olmadan yapılmıyor.',
      secenekler: ['Cevapla', 'Düşür'],
    }));
  } catch { return []; }
}

export function kalemleriTopla({ emirDizin, dersDizin, isKaydi } = {}) {
  const emirler = emirleriOku({ dizin: emirDizin });
  return [
    ...acikKarar({ isKaydi }),
    ...onayBekleyen(emirler),
    ...klipBekleyen(emirler),
    ...cuzdanUyarisi(),
    ...ucVurus(emirler),
    ...dersKuyrugu({ dizin: dersDizin }),
  ].sort((a, b) => a.oncelik - b.oncelik);
}

export function ekran(kalemler) {
  if (!kalemler.length) {
    const raf = artifactOku(RAF_YOLU);
    return [
      'KARAR YÜZEYİ — şu an senden bekleyen bir şey YOK.',
      '',
      raf?.elementler?.length ? `   element rafı: ${raf.elementler.length} kayıt hazır` : '   element rafı boş',
      '   Bir iş açmak için: node scripts/brifing.mjs "<kaynak>"',
    ].join('\n');
  }

  const gosterilen = kalemler.slice(0, EKRAN_TAVANI);
  const satirlar = ['KARAR YÜZEYİ', ''];
  gosterilen.forEach((k, i) => {
    satirlar.push(
      `   ${i + 1}. ${k.baslik}`,
      `      ${k.detay}`,
      `      → ${k.secenekler.join('  ·  ')}`,
      `      (${k.gerekce})`,
      '');
  });
  if (kalemler.length > gosterilen.length) {
    satirlar.push(`   + ${kalemler.length - gosterilen.length} madde daha var — altıncı madde okunmuyor, o yüzden yazmıyorum.`, '');
  }
  return satirlar.join('\n');
}

export function usage() {
  return [
    'KARAR YÜZEYİ — şu an Mami\'den bekleyen en fazla 5 şey, ikili tuşa indirgenmiş',
    '',
    '  node scripts/karar.mjs [--json]',
    '',
    'Bildirim göndermez: yükü üretir, telefona düşürmek ajanın işidir.',
  ].join('\n');
}

export function main(argv, secenekler = {}) {
  if (argv.includes('--yardim')) return usage();
  const kalemler = kalemleriTopla(secenekler);
  return argv.includes('--json')
    ? JSON.stringify({ tavan: EKRAN_TAVANI, toplam: kalemler.length, kalemler: kalemler.slice(0, EKRAN_TAVANI) }, null, 2)
    : ekran(kalemler);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (hata) {
    if (hata instanceof KararError) { console.error(`❌ ${hata.message}`); process.exit(2); }
    throw hata;
  }
}
