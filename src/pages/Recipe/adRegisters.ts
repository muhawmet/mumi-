// Reklam (COMMERCIAL_REAL) dünyalarının "register" seçicisi. Her dünyanın render_law'u
// 2-3'lü bir register tarif eder ("sahibinin palet + günün-saati seçimiyle belirlenir").
// Register = sabit bir `timeLight` (LIGHT_OPTS anahtarı). Palet native_world kalır (dünyanın
// kendi palette_lock'u — Translation Law); register yalnız IŞIK/saat rejimini kaydırır.
// Etiketler her dünyanın KENDİ authored register'ından (jenerik warm/temiz/azim dayatmaz).
export interface AdRegister {
  id: string;
  label: string;
  timeLight: string; // MUTLAKA geçerli bir LIGHT_OPTS anahtarı (adRegisters.test.ts kilitler)
}

export const AD_WORLD_REGISTERS: Record<string, AdRegister[]> = {
  edu_promo_real: [
    { id: 'warm', label: 'Sıcak Güven', timeLight: 'warm_home' },
    { id: 'temiz', label: 'High-Key Prestij', timeLight: 'highkey_clean' },
    { id: 'azim', label: 'Tek-Sert Azim', timeLight: 'night' },
  ],
  kurumsal_brand_film: [
    { id: 'dawn', label: 'Serin Şafak', timeLight: 'morning' },
    { id: 'daylight', label: 'Gün Işığı', timeLight: 'window_natural' },
    { id: 'dusk', label: 'Alacakaranlık', timeLight: 'golden_commercial' },
  ],
  civic_promo_real: [
    { id: 'dawn', label: 'Gururlu Şafak', timeLight: 'golden_commercial' },
    { id: 'midday', label: 'Sivil Öğlen', timeLight: 'highkey_clean' },
    { id: 'overcast', label: 'Ağırbaşlı Kapalı', timeLight: 'overcast_doc' },
  ],
  appetite_tabletop_real: [
    { id: 'bakery', label: 'Sıcak Sabah Fırın', timeLight: 'warm_home' },
    { id: 'caynight', label: 'Serin Gece Çay', timeLight: 'night' },
  ],
  product_brand_real: [
    { id: 'white', label: 'Temiz Beyaz', timeLight: 'highkey_clean' },
    { id: 'dark', label: 'Lüks Karanlık', timeLight: 'luxury_lowkey' },
    { id: 'window', label: 'Sıcak Yaşam', timeLight: 'warm_home' },
  ],
  automotive_hero_real: [
    { id: 'showroom', label: 'Stüdyo Karanlık Alan', timeLight: 'luxury_lowkey' },
    { id: 'dawnroad', label: 'Şafak Yolu', timeLight: 'golden_commercial' },
    { id: 'wetnight', label: 'Islak Gece Sokağı', timeLight: 'night' },
    { id: 'overcast', label: 'Kapalı Hava — Gövde Gradyanı', timeLight: 'highkey_clean' },
  ],
  sports_energy_real: [
    { id: 'warm', label: 'Sıcak İlham', timeLight: 'golden_commercial' },
    { id: 'gritty', label: 'Sert Ter', timeLight: 'night' },
    { id: 'bright', label: 'Temiz Fitness', timeLight: 'highkey_clean' },
  ],
};

export function registersFor(worldId: string): AdRegister[] {
  return AD_WORLD_REGISTERS[worldId] || [];
}
