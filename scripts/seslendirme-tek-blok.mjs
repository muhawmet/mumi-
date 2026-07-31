#!/usr/bin/env node
// MAMILAS — SESLENDİRME TEK BLOK üreticisi.
//
// NEDEN VAR (Mami, 2026-07-31): *"şu seslendirme txtini tek metin olarak ver ve bunu kural
// yap, parça parça nasıl üreteyim, tekte üreteceğim."* ElevenLabs'e numaralı/başlıklı metin
// yapıştırılamaz — numarayı okur, başlığı okur. Elle temizlemek denendi ve HATA VERDİ:
// ilk elle çıkarımda "AŞAĞISI KOPYALANMAZ" bölümündeki bir yönerge satırı
// ("56. cümle bir SORU — yukarı tonlamayla") metnin sonuna sızdı, çünkü o satır da
// `NN.` deseniyle başlıyordu. Elle yapılan iş bir kez kaçırır; araç kaçırmaz.
//
//   node scripts/seslendirme-tek-blok.mjs "<proje klasörü>"
//   node scripts/seslendirme-tek-blok.mjs "<...>_SESLENDIRME.txt"
//
// ÇIKTI: aynı klasöre `<Ad>_SESLENDIRME-TEK-BLOK.txt`
//   · numara YOK · başlık YOK · yönerge YOK — yalnız okunacak metin
//   · bölüm başlıkları paragraf sınırına dönüşür (boş satır = nefes)
//
// ORTAM YASASI: saf Node, harici bağımlılık yok. BOM + CRLF okunur, çıktı LF.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

/** Kopyalanmayacak bölümün başlangıcı — bu satırdan SONRASI metne girmez. */
const KES = /AŞAĞISI\s+KOPYALANMAZ/i;
/** Bölüm başlığı: `===== BAŞLIK =====` → paragraf sınırı. */
const BOLUM = /^={3,}.*={3,}$/;
/** Okunacak cümle: `12. Cümle burada.` */
const CUMLE = /^(\d{1,3})\.\s+(.+)$/;

/**
 * Numaralı seslendirme metnini tek bloğa çevirir.
 * @param {string} ham dosya içeriği
 * @returns {{metin: string, paragraf: number, cumle: number, kesildi: boolean}}
 */
export function tekBlok(ham) {
  const satirlar = String(ham).replace(/^﻿/, '').split(/\r?\n/);
  const paragraflar = [];
  let buf = [];
  let kesildi = false;
  let cumle = 0;

  for (const satir of satirlar) {
    const s = satir.trim();
    // 🔴 SINIR: "AŞAĞISI KOPYALANMAZ"dan sonrası yönergedir. O bölümdeki satırlar da
    // `NN.` ile başlayabiliyor (okuma yönergesi cümle numarası veriyor) — sınır konmazsa
    // yönerge metne sızar ve ElevenLabs onu OKUR.
    if (KES.test(s)) { kesildi = true; break; }
    if (!s) continue;
    if (BOLUM.test(s)) { if (buf.length) { paragraflar.push(buf.join(' ')); buf = []; } continue; }
    if (s.startsWith('=') || s.startsWith('#')) continue;
    const m = CUMLE.exec(s);
    if (m) { buf.push(m[2].trim()); cumle++; }
  }
  if (buf.length) paragraflar.push(buf.join(' '));

  return { metin: paragraflar.join('\n\n'), paragraf: paragraflar.length, cumle, kesildi };
}

function seslendirmeBul(hedef) {
  if (!existsSync(hedef)) return null;
  if (statSync(hedef).isFile()) return hedef;
  const aday = readdirSync(hedef).find((f) => /_SESLENDIRME\.txt$/i.test(f));
  return aday ? join(hedef, aday) : null;
}

const hedef = process.argv[2];
if (!hedef) {
  console.error('kullanım: node scripts/seslendirme-tek-blok.mjs "<proje klasörü|_SESLENDIRME.txt>"');
  process.exit(2);
}

const kaynak = seslendirmeBul(hedef);
if (!kaynak) {
  console.error(`⛔ _SESLENDIRME.txt bulunamadı: ${hedef}`);
  process.exit(2);
}

const { metin, paragraf, cumle, kesildi } = tekBlok(readFileSync(kaynak, 'utf8'));
if (!cumle) {
  console.error(`⛔ ${basename(kaynak)} içinde numaralı cümle yok. Biçim: "12. Cümle."`);
  process.exit(2);
}

const cikti = join(dirname(kaynak), basename(kaynak).replace(/_SESLENDIRME\.txt$/i, '_SESLENDIRME-TEK-BLOK.txt'));
writeFileSync(cikti, `${metin}\n`, 'utf8');

console.log(`✅ ${basename(cikti)}`);
console.log(`   ${cumle} cümle · ${paragraf} paragraf · ${metin.length} karakter`);
if (!kesildi) console.log('   ⚠ "AŞAĞISI KOPYALANMAZ" sınırı bulunamadı — kaynakta yönerge bölümü yok mu?');
if (metin.length > 5000) console.log(`   🔴 ${metin.length} karakter — ElevenLabs tek seferde 5000 alıyor, BÖLMEN gerekecek.`);
