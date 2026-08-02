// BAĞ DENETİMİ TESTLERİ — denetçinin kendisi denetlenir.
//
// Neden bu test var: bir doğrulayıcının en tehlikeli hâli sessizce yanlış cevap vermesidir
// (ölçüldü — teslim-denetim.mjs 17 projenin 16'sına yanlış sayı bastı ve hiç uyarmadı).
// Burada iki yön birden kilitlenir: gerçek kırığı BULUYOR mu, ve sağlam atıfa yanlış alarm
// vermiyor mu. İkincisi daha önemli: yanlış alarm veren denetçiye insan bakmayı bırakır.

import { describe, test, expect } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { yolMu, ayir, atiflariCikar, cozumle, denetle } from './baglar.mjs';

function sahneKur() {
  const kok = mkdtempSync(join(tmpdir(), 'baglar-'));
  mkdirSync(join(kok, 'scripts'), { recursive: true });
  mkdirSync(join(kok, 'docs'), { recursive: true });
  mkdirSync(join(kok, 'bos'), { recursive: true });
  writeFileSync(join(kok, 'scripts', 'var.mjs'), 'a\nb\nc\n');   // 3 satır + son boş = 4
  writeFileSync(join(kok, 'CLAUDE.md'), 'kök dosya\n');
  return kok;
}

describe('yolMu — laf ile yolu ayırır', () => {
  test('diyafram, oran ve ürün adı YOL DEĞİLDİR (ilk koşuda 70 yanlış alarmın kaynağı)', () => {
    for (const laf of ['f/2.8', 'f/5.6', '0.28/0.82', '12.5px/1.55', 'Vite/React/Three.js', 'ffmpeg/Playwright/Three.js', '.glb/.gltf']) {
      expect(yolMu(laf), `${laf} yol sayıldı`).toBe(false);
    }
  });

  test('kökte olmayan tek parçalı kısaltma yol sayılmaz', () => {
    for (const k of ['MOTION/', 'PROMPTLAR/', 'Biten/', 'knowledge/']) {
      expect(yolMu(k), `${k} yol sayıldı`).toBe(false);
    }
  });

  test('elenmiş yol ölçülemez sayılır, kırık DEĞİL', () => {
    expect(yolMu('~/.claude/projects/-Users-…-modern/memory/')).toBe(false);
    expect(yolMu('agents/done/.../vo_script.md')).toBe(false);
  });

  test('gerçek repo yolları ve import sözdizimi yol sayılır', () => {
    expect(yolMu('scripts/prompt-lint.mjs')).toBe(true);
    expect(yolMu('@docs/ai/faz-icraat.md')).toBe(true);
    expect(yolMu('CLAUDE.md')).toBe(true);
    expect(yolMu('~/.codex/config.toml')).toBe(true);
  });

  test('http bağı ve sayfa içi çapa kapsam dışı', () => {
    expect(yolMu('https://example.com/a.md')).toBe(false);
    expect(yolMu('#baslik')).toBe(false);
  });
});

describe('ayir — satır ve aralık', () => {
  test('tek satır', () => expect(ayir('a/b.ts:42')).toEqual(['a/b.ts', '42']));
  test('aralıkta SON satır ölçülür', () => expect(ayir('a/b.ts:12-24')).toEqual(['a/b.ts', '24']));
  test('en-dash aralığı da okunur', () => expect(ayir('a/b.ts:12–24')).toEqual(['a/b.ts', '24']));
  test('satırsız yol', () => expect(ayir('a/b.ts')).toEqual(['a/b.ts', null]));
  test('import @ ön eki soyulur', () => expect(ayir('@docs/x.md')).toEqual(['docs/x.md', null]));
});

describe('atiflariCikar — üç desen', () => {
  test('md bağı, kod çiti ve çıplak yol birlikte yakalanır', () => {
    const atif = atiflariCikar(
      'bak [şuna](docs/a.md) ve `scripts/b.mjs:12` ile birlikte docs/c.md dosyası.\n',
    ).map((a) => a.yol);
    expect(atif).toContain('docs/a.md');
    expect(atif).toContain('scripts/b.mjs:12');
    expect(atif).toContain('docs/c.md');
  });

  test('kod bloğunun İÇİ de taranır — kırık atıfların ikisi oradaydı', () => {
    const atif = atiflariCikar('```bash\nnode scripts/yok.mjs --all\n```\n').map((a) => a.yol);
    expect(atif).toContain('scripts/yok.mjs');
  });

  test('satır numarası atfın GEÇTİĞİ satırdır', () => {
    const [a] = atiflariCikar('bir\niki\n`scripts/x.mjs`\n');
    expect(a.satir).toBe(3);
  });
});

describe('cozumle — üç kırık sınıfı', () => {
  test('YOK · SATIR-YOK · BOŞ-DİZİN ayrı ayrı yakalanır, sağlam atıf OK', () => {
    const kok = sahneKur();
    try {
      const md = join(kok, 'docs', 'x.md');
      const c = (yol) => cozumle({ yol, satir: 1 }, md, kok);

      expect(c('scripts/yok.mjs').durum).toBe('YOK');
      expect(c('scripts/var.mjs').durum).toBe('OK');
      expect(c('scripts/var.mjs:2').durum).toBe('OK');
      expect(c('bos/').durum).toBe('BOŞ-DİZİN');

      const asan = c('scripts/var.mjs:900');
      expect(asan.durum).toBe('SATIR-YOK');
      expect(asan.dosyaSatir).toBe(4);
    } finally {
      rmSync(kok, { recursive: true, force: true });
    }
  });
});

describe('denetle — bütün', () => {
  test('sağlam belgede sıfır kırık, kırık belgede tam sayı', () => {
    const kok = sahneKur();
    try {
      const temiz = join(kok, 'docs', 'temiz.md');
      writeFileSync(temiz, 'sağlam `scripts/var.mjs:2` ve `CLAUDE.md`\n');
      expect(denetle([temiz], kok).kirik).toHaveLength(0);

      const bozuk = join(kok, 'docs', 'bozuk.md');
      writeFileSync(bozuk, '`scripts/yok.mjs` ve `scripts/var.mjs:900` ve `f/2.8`\n');
      const r = denetle([bozuk], kok);
      expect(r.kirik).toHaveLength(2);                       // f/2.8 sayılmaz
      expect(r.kirik.map((k) => k.durum).sort()).toEqual(['SATIR-YOK', 'YOK']);
    } finally {
      rmSync(kok, { recursive: true, force: true });
    }
  });
});

describe('gerekçeli istisna — susturma değil, kayıt', () => {
  test('markör PARAGRAFI kapsar, boş satırda DÜŞER', () => {
    const kok = sahneKur();
    try {
      const md = join(kok, 'docs', 'g.md');
      writeFileSync(md,
        '<!-- bag-yok: bu dosya bilerek yok -->\n' +
        'birinci satır `scripts/yok1.mjs`\n' +
        'ikinci satır `scripts/yok2.mjs`\n' +
        '\n' +                                   // ← gerekçe burada düşer
        'gerekçesiz `scripts/yok3.mjs`\n');
      const r = denetle([md], kok);
      expect(r.gerekceli.map((k) => k.yol).sort()).toEqual(['scripts/yok1.mjs', 'scripts/yok2.mjs']);
      expect(r.kirik.map((k) => k.yol)).toEqual(['scripts/yok3.mjs']);
      expect(r.gerekceli[0].gerekce).toBe('bu dosya bilerek yok');
    } finally {
      rmSync(kok, { recursive: true, force: true });
    }
  });

  test('gerekçe sayfanın kalanına sızmaz (iki paragraf arası)', () => {
    const kok = sahneKur();
    try {
      const md = join(kok, 'docs', 'h.md');
      writeFileSync(md, '<!-- bag-yok: sebep -->\na `scripts/yok1.mjs`\n\nb\n\nc `scripts/yok2.mjs`\n');
      const r = denetle([md], kok);
      expect(r.kirik.map((k) => k.yol)).toEqual(['scripts/yok2.mjs']);
    } finally {
      rmSync(kok, { recursive: true, force: true });
    }
  });
});

describe('sömürü kapıları — Terra 5.6 ikinci gözünün gösterdikleri', () => {
  test('tek markör sınırsız susturamaz: tavan aşılınca gerekçe DÜŞER', async () => {
    const { ISTISNA_TAVAN } = await import('./baglar.mjs');
    const kok = sahneKur();
    try {
      const md = join(kok, 'docs', 'somuru.md');
      const satirlar = ['<!-- bag-yok: tek gerekçe -->'];
      for (let i = 1; i <= ISTISNA_TAVAN + 3; i++) satirlar.push(`satır \`scripts/yok${i}.mjs\``);
      writeFileSync(md, `${satirlar.join('\n')}\n`);
      const r = denetle([md], kok);
      expect(r.gerekceli).toHaveLength(ISTISNA_TAVAN);
      expect(r.kirik).toHaveLength(3);          // tavandan sonrakiler KIRIK sayılır
    } finally {
      rmSync(kok, { recursive: true, force: true });
    }
  });

  test('memory/ atıfları artık ÖLÇÜLÜYOR — çapa kuralı onları eleyip saklıyordu', async () => {
    const { yolMu } = await import('./baglar.mjs');
    // Repoda `memory/` diye bir dizin YOK; çapa kuralı bu atıfları "yol bile değil" diye
    // atıyordu, yani KIRIK 0 onları hiç ölçmemişti. Kapsam dışı ≠ temiz.
    expect(yolMu('memory/mamilas-hal-logu.md')).toBe(true);
  });
});

describe('tarihli kayıt — arşiv sınıfı taranmaz', () => {
  test('adında tarih olan dosya ve CANDIDATES-/HASAT- atlanır, atlananlar SAYILIR', async () => {
    const { TARIHLI } = await import('./baglar.mjs');
    expect(TARIHLI.test('/docs/DEGISIM-GUNLUGU-2026-07-10.md')).toBe(true);
    expect(TARIHLI.test('/agents/lessons/CANDIDATES-plastik.md')).toBe(true);
    expect(TARIHLI.test('/agents/lessons/HASAT-5-surtunme.md')).toBe(true);
    expect(TARIHLI.test('/docs/ai/faz-icraat.md')).toBe(false);
    expect(TARIHLI.test('/CLAUDE.md')).toBe(false);
  });
});

describe('canlı repo — ölçüm gerçekten koşuyor', () => {
  test('canlı belgelerde KIRIK atıf YOK (kapı bu satıra bağlı)', async () => {
    const { mdDosyalari, denetle: d, ROOT } = await import('./baglar.mjs');
    const r = d(mdDosyalari(ROOT), ROOT);
    const liste = r.kirik.map((k) => `${k.kaynak}:${k.satir} → ${k.yol} [${k.durum}]`).join('\n');
    expect(r.kirik, `kırık atıf:\n${liste}`).toHaveLength(0);
  });

  test('canlı belgeler taranıyor ve atıf sayısı sıfır değil (tarama sessizce boşalmasın)', async () => {
    const { mdDosyalari, denetle: d, ROOT } = await import('./baglar.mjs');
    const dosyalar = mdDosyalari(ROOT);
    expect(dosyalar.length).toBeGreaterThan(50);
    const r = d(dosyalar, ROOT);
    expect(r.toplamAtif).toBeGreaterThan(200);
  });
});
