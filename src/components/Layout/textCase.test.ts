import { describe, expect, it } from 'vitest';
import { smartUpper } from './textCase';

describe('smartUpper — İ İngilizce loanword\'lere taşmaz', () => {
  it('İngilizce teknik terimler ASCII büyür (noktalı İ basmaz)', () => {
    expect(smartUpper('Ingest')).toBe('INGEST');
    expect(smartUpper('medium')).toBe('MEDIUM');
    expect(smartUpper('Brief')).toBe('BRIEF');
    expect(smartUpper('Timeline')).toBe('TIMELINE');
    expect(smartUpper('Cinematic')).toBe('CINEMATIC');
    expect(smartUpper('Animation')).toBe('ANIMATION');
  });

  it('Türkçe token\'lar diakritiğini korur (İ/ı doğru)', () => {
    expect(smartUpper('Kayıpsız')).toBe('KAYIPSIZ');
    expect(smartUpper('Reçete')).toBe('REÇETE');
    expect(smartUpper('Yönetmen')).toBe('YÖNETMEN');
    expect(smartUpper('İleri')).toBe('İLERİ');
    expect(smartUpper('Sahneler')).toBe('SAHNELER');
  });

  it('karışık cümlede her kelime kendi diline göre büyür', () => {
    expect(smartUpper('Decode + Kayıpsız Ingest')).toBe('DECODE + KAYIPSIZ INGEST');
    expect(smartUpper('World Master Detail')).toBe('WORLD MASTER DETAIL');
    expect(smartUpper('İleri → Timeline')).toBe('İLERİ → TIMELINE');
  });
});
