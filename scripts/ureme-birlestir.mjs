#!/usr/bin/env node
// Eşeyli ve Eşeysiz Üreme — PROMPTLAR/<nn>.md dosyalarını tek dosyada toplar.
// Yeni kareler geldikçe tekrar koşulur; dosya baştan yazılır.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'agents/COMMAND-INBOX/6. Sınıf - Eşeyli ve Eşeysiz Üreme';
const SRC = join(DIR, 'PROMPTLAR');
// Teslim dosyaları `.txt` (PROMPT-YASASI §16 — Windows'ta `.md` uğraştırıyor).
// Script `.md` yazıyordu; bir sonraki koşuda elle yapılan .txt dönüşümünü geri alırdı.
const OUT = join(DIR, 'Eşeyli ve Eşeysiz Üreme_PROMPTLAR.txt');

const SEKANSLAR = [
  [1, 5, 'SEKANS 1 — AÇILIŞ: SORU'],
  [6, 10, 'SEKANS 2 — EŞEYSİZ ÜREME: TANIM'],
  [11, 15, 'SEKANS 3 — BÖLÜNEREK ÜREME'],
  [16, 20, 'SEKANS 4 — TOMURCUKLANMA'],
  [21, 27, 'SEKANS 5 — REJENERASYON İLE ÜREME'],
  [28, 33, 'SEKANS 6 — VEJETATİF ÜREME'],
  [34, 44, 'SEKANS 7 — EŞEYLİ ÜREME'],
  [45, 48, 'SEKANS 8 — ÖZET VE KARŞILAŞTIRMA'],
  [49, 50, 'SEKANS 9 — KAPANIŞ'],
];

const mevcut = new Map();
for (const f of readdirSync(SRC)) {
  const m = /^(\d{2})\.md$/.exec(f);
  if (m) mevcut.set(Number(m[1]), readFileSync(join(SRC, f), 'utf8').trim());
}

const parcalar = [`EŞEYLİ VE EŞEYSİZ ÜREME — 6. SINIF · PRODÜKSİYON PROMPT'LARI (@efe)
=========================================================================
Dünya: pixar_3d_edu · Image: Nano Banana 2 · Motion: Kling 3.0 · VO: ElevenLabs v3 · Müzik: Suno.
Kare: 50 · Tahmini VO: ~4:05 · Kaynak: "6. sınıf eşeyli ve eşeysiz üreme video senaryosu.docx"

REFERANSLAR (basıldı — sahnede yalnız @handle, görünüş TARİF EDİLMEZ):
  @efe · @anne · @gul · @defter · @kedi · @yavrular · @amip · @mikroskop
  Tarif kilitleri (referanssız, sabit öbek): patates · çilek · hidra · denizanası · maya ·
  deniz yıldızı · solucan · kertenkele · öglena · paramesyum · bakteri
  Tam metin: Eşeyli ve Eşeysiz Üreme_REFERANSLAR.txt

KAVRAM IŞIĞI SİSTEMİ (dersin imzası):
  EŞEYSİZ = tek yuvarlak SICAK-ALTIN ışık; bölününce çıkan iki ışık BİREBİR AYNI ton (aynılık).
  EŞEYLİ  = SICAK-AMBER (yumurta) + SERİN-MAVİ (sperm) → birleşince YENİ bir MENEKŞE ışık (zigot);
            çeşitlilik karesinde üç yavrunun üstünde birbirinden FARKLI üç ton.

Her kare tek parça, yapıştırmaya hazır. Kare kare tekil dosyalar: PROMPTLAR/<nn>.md
=========================================================================`];

let yazilan = 0;
const eksik = [];
for (const [a, b, ad] of SEKANSLAR) {
  const kareler = [];
  for (let n = a; n <= b; n++) {
    if (mevcut.has(n)) { kareler.push(mevcut.get(n)); yazilan++; }
    else eksik.push(n);
  }
  if (!kareler.length) continue;
  parcalar.push(`\n\n##### ${ad} (Kare ${a}–${b}) #####`);
  for (const k of kareler) parcalar.push(`\n-------------------------------------------------------------------------\n${k}`);
}

writeFileSync(OUT, parcalar.join('\n') + '\n');
console.log(`${OUT}\nyazılan kare: ${yazilan}/50`);
if (eksik.length) console.log(`bekleyen: ${eksik.join(', ')}`);
