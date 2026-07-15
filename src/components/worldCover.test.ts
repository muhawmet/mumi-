import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = readFileSync(new URL('./WorldCover.tsx', import.meta.url), 'utf8');

describe('WorldCover kaynak sözleşmesi', () => {
  it('kapağı worlds klasöründen okur ve onError fallback taşır', () => {
    expect(src).toContain("worldCoverUrl(");
    expect(src).toContain('onError');
    expect(src).toMatch(/objectFit:\s*'cover'/);
  });
  it('worldId değişince failed state sıfırlanır (bayat fallback yasağı)', () => {
    // Whitespace'e duyarsız iki bağımsız kontrol: formatter değişikliği sözleşmeyi kırmasın (review bulgusu)
    expect(src).toContain('setFailed(false)');
    expect(src).toMatch(/useEffect\([\s\S]*?setFailed\(false\)[\s\S]*?\[worldId\]\s*\)/);
  });
});
