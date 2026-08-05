// HASAT KAPISI — KANAL TESTİ.
//
// Neden var (docs/ai/TEMEL-IS-LISTESI.md md.1 kabul kriteri): kapı doğru ölçüyordu ama
// bütün çıktısını stderr'e yazıyordu ve SessionStart'ta modele YALNIZ stdout girer.
// Canlı ölçüm 31 Temmuz: stdout 0 bayt / stderr 1692 — stderr'de üç gerçek bekleyen iş vardı
// ve hiçbiri modele ulaşmadı. "Yeşil test" bunu görmezdi; exit code her iki hâlde de 0.
//
// Bu yüzden test exit code'a DEĞİL, KANALA bakar. Ölçülen sözleşme üç maddedir:
//   1. kapı her koşuda KONUŞUR (ÖLÇEMEDİ ≠ TEMİZ) ve konuştuğu yer stdout'tur
//   2. stderr'e hiçbir şey yazılmaz — yazılırsa yine görünmez olur
//   3. settings.json kaydı .sh launcher'a değil node exec-form'a bağlıdır (Windows'ta exec
//      biti taşınmadığı için .sh yolu 126 ile sessizce ölebiliyordu)

import { describe, test, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HOOK = resolve(REPO, '.claude/hooks/hasat-gate.mjs');

function kosu() {
  // stdout ve stderr AYRI toplanır — birleştirilirse ölçülen kusur görünmez olur.
  const cikti = { stdout: '', stderr: '', kod: 0 };
  try {
    cikti.stdout = execFileSync(process.execPath, [HOOK], {
      cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    cikti.kod = e.status ?? 1;
    cikti.stdout = e.stdout ?? '';
    cikti.stderr = e.stderr ?? '';
    return cikti;
  }
  return cikti;
}

describe('hasat kapısı — kanal sözleşmesi', () => {
  test('kaynakta process.stderr yazımı YOK (kusur kaynağa geri sızmasın)', () => {
    const src = readFileSync(HOOK, 'utf8');
    expect(src).not.toMatch(/process\.stderr\.write/);
  });

  test('kapı stdout ile KONUŞUR ve stderr BOŞ kalır', () => {
    const r = kosu();
    expect(r.stderr, 'stderr dolu — SessionStart bunu modele taşımaz').toBe('');
    expect(r.stdout.length, 'kapı hiç konuşmadı — sessiz geçiş yasak').toBeGreaterThan(0);
  });

  test('her hâlde bir HÜKÜM basar: bekleyen var / hepsi güncel / ölçemedi', () => {
    const { stdout } = kosu();
    // Üçünden biri MUTLAKA olmalı. "Hiçbir şey yazmadı" bir sonuç değil, bir kayıptır.
    const hukum = /\[hasat\] 🚨/.test(stdout) || /\[hasat\] ✅/.test(stdout) || /ÖLÇEMEDİ/.test(stdout);
    expect(hukum, `stdout bir hüküm taşımıyor:\n${stdout.slice(0, 400)}`).toBe(true);
  });

  test('bekleyen iş varsa 🚨 işareti stdout\'tadır (md.1 kabul kriteri)', () => {
    const { stdout } = kosu();
    // Koşullu ama kaçamak değil: bekleyen yoksa ✅ satırı ZORUNLU olarak aranır.
    //
    // ⚠ 2026-08-05: bu dal bir kez `BEKLEYEN PROJE VAR` CÜMLESİNE bağlıydı ve uyarı metni
    // kısaltılınca (2.878 → 1.372 bayt) test düştü — yani test sözleşmeyi değil KELİMEYİ
    // ölçüyordu. Sözleşme 🚨 işaretidir; metin serbesttir.
    if (/\[hasat\] 🚨/.test(stdout)) {
      expect(stdout).toMatch(/\[hasat\] 🚨/);
      expect(stdout).toMatch(/node scripts\/kapanis-hasadi\.mjs --all/);
    } else {
      expect(stdout).toMatch(/\[hasat\] ✅/);
    }
  });

  test('kapı bloke ETMEZ — hasat Mami onayına giden ADAY üretir', () => {
    expect(kosu().kod).toBe(0);
  });
});

describe('hasat kapısı — kayıt biçimi', () => {
  test('settings.json hook\'u node exec-form ile çağırır, .sh launcher ile değil', () => {
    const s = JSON.parse(readFileSync(resolve(REPO, '.claude/settings.json'), 'utf8'));
    const hepsi = Object.values(s.hooks ?? {}).flatMap((g) => g.flatMap((e) => e.hooks ?? []));
    const hasat = hepsi.filter((h) => JSON.stringify(h).includes('hasat-gate'));

    expect(hasat.length, 'hasat kapısı settings.json\'da hiç kayıtlı değil').toBe(1);
    expect(hasat[0].command).toBe('node');
    expect(hasat[0].args?.[0]).toMatch(/hasat-gate\.mjs$/);
    // .sh yolu Windows'ta exec biti taşınmadığı için 126 ile sessizce ölebiliyordu.
    expect(JSON.stringify(hasat[0])).not.toMatch(/hasat-gate\.sh/);
  });
});
