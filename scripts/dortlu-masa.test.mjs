// DÖRTLÜ MASA — KANON DUVARI.
//
// Ölçülen kusur (2026-08-05): Dörtlü Masa sözleşmesi aylarca YALNIZ oturum planında yaşadı
// (`~/.claude/plans/…`), repo'da tek satırı yoktu. Plan ölünce yasa da öldü ve masa hiç
// toplanmadı: T6 (Sol plan karşı-denetimi) hiç koşmadı, canary PASS'i doğmadı, 52 klip
// canary'siz basıldı ve tam video bozuk çıktı.
//
// Bu dosyadaki her test, yasa ya NÜSHALANIRSA ya da BAĞ KOPARSA düşecek biçimde yazıldı.
// İkisi de bu repoda ölçülmüş kusur sınıfıdır.

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOL_SOZLUGU, SOL_ULASILAMADI, SONUC_SOZLUGU } from './hukum-blogu.mjs';
import { URETIMI_ACAN_SOL, URETIMI_ACMAYAN_SOL } from './canary-lock.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KANON = 'docs/ai/DORTLU-MASA.md';

/** Satır sonu içerik değildir — repo `core.autocrlf=true` ile checkout ediliyor. */
const oku = (yol) => readFileSync(resolve(REPO, yol), 'utf8').replace(/\r\n/g, '\n');

/** Kanona bağlanmak ZORUNDA olan giriş sözleşmeleri ve faz profili. */
const BAGLI_BELGELER = ['CLAUDE.md', 'AGENTS.md', 'docs/ai/CODEX.md', 'docs/ai/faz-icraat.md'];

/**
 * Beş tetikleyicinin ayırt edici başlıkları. Bunlar YALNIZ kanonda geçebilir — bir başka
 * belgede görünmeleri, listenin ikinci bir nüshasının doğduğu anlamına gelir.
 */
const TETIKLEYICI_BASLIKLARI = [
  'VİZYON KİLİDİ + CANARY SHOT CARD HAZIR',
  'CANARY FRAME\'LERİ GELDİ',
  'CANARY KLİPLERİ GELDİ',
  'AYNI SHOT İKİ KEZ BOZULDU',
  'TAM FİLM HAZIR',
];

/** Kanonda GEÇMESİ beklenen sonuç kelimeleri — elle yazılı, ölçenden ithal DEĞİL. */
const KANONDA_BEKLENEN_SONUCLAR = ['CLEAR TO CONTINUE', 'RESHAPE', 'NARROW', 'UNPROVEN', 'SOL_UNAVAILABLE'];

describe('Dörtlü Masa — kanon repo\'da yaşıyor', () => {
  it('kanon dosyası VAR (plan dosyası ölünce yasa ölmesin)', () => {
    expect(existsSync(resolve(REPO, KANON)), `${KANON} yok — yasa yine plan ömrü yaşar`).toBe(true);
  });

  it('sonuç sözlüğünün beş kelimesi de kanonda tanımlı', () => {
    const kanon = oku(KANON);
    for (const kelime of KANONDA_BEKLENEN_SONUCLAR) {
      expect(kanon.includes(kelime), `sonuç sözlüğünde "${kelime}" yok`).toBe(true);
    }
  });

  it('beş tetikleyicinin beşi de kanonda yazılı', () => {
    const kanon = oku(KANON);
    for (const baslik of TETIKLEYICI_BASLIKLARI) {
      expect(kanon.includes(baslik), `tetikleyici eksik: ${baslik}`).toBe(true);
    }
  });

  it('dört rolün dördü de kanonda adlandırılmış', () => {
    const kanon = oku(KANON);
    for (const rol of ['Claude', 'Codex Sol', 'AGY', 'Mami']) {
      expect(kanon.includes(rol), `rol eksik: ${rol}`).toBe(true);
    }
  });

  it('sahte CLEAR yasağı ve AGY\'nin hüküm vermeme kuralı kanonda yazılı', () => {
    const kanon = oku(KANON);
    // Bu iki kural gevşerse otomatik yargıç doğar — plan bunu açıkça yasaklıyor.
    expect(kanon).toMatch(/[Ss]ahte `?CLEAR/);
    expect(kanon).toMatch(/PASS_CANDIDATE/);
  });

  it('artefact yerleşimi kanonda: dört hükmün dördü de mevcut artefact\'in içinde yaşıyor', () => {
    const kanon = oku(KANON);
    for (const yer of ['_ENZIM.md', 'CANARY-LOCK.md', 'Shot Card', 'kapanış hasadı']) {
      expect(kanon.includes(yer), `artefact yerleşiminde eksik: ${yer}`).toBe(true);
    }
    // `~/Desktop/mamiş/` otorite DEĞİL — bu ayrım kanonda açıkça durmalı.
    expect(kanon).toMatch(/mamiş[\s\S]{0,200}(kanonik receipt değildir|otorite\s*değildir)/);
  });
});

// 🔴 Sol karşı-denetimi (2026-08-05, RESHAPE, madde 6): sonuç sözlüğü hem kanon belgede hem
// ölçenlerin içinde yaşıyordu ve ikisini bağlayan bir şey yoktu — yani sessizce ayrışabilirlerdi.
// Repo yasası zaten şunu söylüyor: bir belge bir sıralamayı BİREBİR taşıyorsa, o sıralama koda
// KİLİTLENMEK zorundadır (PROJECT_CONTRACT.md:27-28). Kod artık kanona çivili.
describe('kod ile kanon ayrışamaz', () => {
  it('hukum-blogu.mjs Sol sözlüğü kanonda yazan sözlükle birebir aynı', () => {
    const kanon = oku(KANON);
    for (const kelime of SOL_SOZLUGU) {
      expect(kanon.includes(kelime), `ölçende var, kanonda YOK: ${kelime}`).toBe(true);
    }
    expect(kanon.includes(SOL_ULASILAMADI)).toBe(true);
    // Ters yön: kanonda tanımlı olup ölçende bulunmayan bir sonuç kelimesi kalmasın.
    for (const kelime of ['CLEAR TO CONTINUE', 'RESHAPE', 'NARROW', 'UNPROVEN']) {
      expect(SOL_SOZLUGU, `kanonda var, ölçende YOK: ${kelime}`).toContain(kelime);
    }
  });

  it('Claude\'un tek karşılık sözlüğü de kanonda yazılı', () => {
    const kanon = oku(KANON);
    for (const kelime of SONUC_SOZLUGU) {
      expect(kanon.includes(kelime), `ölçende var, kanonda YOK: ${kelime}`).toBe(true);
    }
  });

  it('üretimi açan/açmayan Sol kümeleri kanonun sözlüğünün alt kümesidir', () => {
    for (const k of [...URETIMI_ACAN_SOL, ...URETIMI_ACMAYAN_SOL]) {
      expect([...SOL_SOZLUGU, SOL_ULASILAMADI], `sözlük dışı sonuç: ${k}`).toContain(k);
    }
    // Bir sonuç aynı anda hem açıcı hem kapatıcı olamaz.
    expect(URETIMI_ACAN_SOL.filter((k) => URETIMI_ACMAYAN_SOL.includes(k))).toEqual([]);
  });
});

describe('Dörtlü Masa — bağ kopmuyor, nüsha doğmuyor', () => {
  it.each(BAGLI_BELGELER)('%s kanona BAĞLANIR (yolu anar)', (belge) => {
    expect(oku(belge).includes(KANON), `${belge} → ${KANON} bağı yok`).toBe(true);
  });

  it.each(BAGLI_BELGELER)('%s tetikleyici listesini KOPYALAMAZ', (belge) => {
    const metin = oku(belge);
    for (const baslik of TETIKLEYICI_BASLIKLARI) {
      expect(
        metin.includes(baslik),
        `${belge} içinde "${baslik}" geçiyor — beş tetikleyicinin ikinci nüshası doğuyor. ` +
        'Yasa tek yerde yaşar; buraya yalnız bağ yazılır.',
      ).toBe(false);
    }
  });
});
