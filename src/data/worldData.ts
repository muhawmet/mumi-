// ── worldData — component gövdelerinden çıkarılan world-lookup sabitleri ─────
// Salt literal veri + pure detectArc. Component/core importu YOK (cycle riski sıfır).
// Kaynaklar: PreviewStage.tsx (ARC_MAP/detectArc/GROUP_COLOR), CanvasPreview.tsx (IP_ICONIC).

// ── Arc detection (UI-only, zero business logic) ──────────────────────────────
export const ARC_MAP: Record<string, Array<{ re: RegExp; label: string; sub: string }>> = {
  one_piece_toei: [
    { re: /elbaf|elbaph|viking|fjord/i, label: 'Elbaf arc', sub: 'Norse giant grammar active' },
    { re: /wano|samuray|ukiyo|sakura/i, label: 'Wano arc', sub: 'Ukiyo-e samurai grammar active' },
    { re: /dressrosa|birdcage|kafes/i, label: 'Dressrosa arc', sub: 'Spanish Mediterranean active' },
    { re: /fishman|balık.?adam|sualtı|mercan/i, label: 'Fishman Island', sub: 'Bioluminescent deep-sea active' },
    { re: /marineford|donmuş.*okyanus/i, label: 'Marineford arc', sub: 'Naval war epic grammar active' },
    { re: /egghead|vegapunk/i, label: 'Egghead arc', sub: 'Futurist sci-fi grammar active' },
    { re: /alabasta|piramit|çöl krallığı/i, label: 'Alabasta arc', sub: 'Desert kingdom grammar active' },
    { re: /thriller|hayalet.*gemi/i, label: 'Thriller Bark', sub: 'Gothic ghost ship grammar active' },
  ],
  demon_slayer_ufotable: [
    { re: /mugen|tren\b|train/i, label: 'Mugen Train arc', sub: 'Steam locomotive nightmare active' },
    { re: /eğlence.*bölge|yoshiwara|gece.*mahalle/i, label: 'Entertainment District', sub: 'Yoshiwara night grammar active' },
    { re: /kılıç.*köy|swordsmith|saklı.*köy/i, label: 'Swordsmith Village', sub: 'Hidden mountain grammar active' },
    { re: /sonsuz.*kale|infinity.*castle|muzan/i, label: 'Infinity Castle', sub: 'Demonic architecture active' },
  ],
  naruto_shinobi_world: [
    { re: /chunin|ölüm.*orman|sınav/i, label: 'Chunin Exam arc', sub: 'Forest of Death grammar active' },
    { re: /pain|yıkım|krater/i, label: "Pain's Assault arc", sub: 'Ruined village grammar active' },
    { re: /ninja.*savaş|büyük.*savaş|birleşik/i, label: 'Great Ninja War', sub: 'Epic battlefield grammar active' },
    { re: /vadi.*son|valley.*end|şelale.*düello/i, label: 'Valley of the End', sub: 'Legendary duel grammar active' },
  ],
  bleach_soul_world: [
    { re: /hueco.*mundo|beyaz.*çöl|hollow/i, label: 'Hueco Mundo arc', sub: 'White desert grammar active' },
    { re: /tybw|thousand.*year|bin.*yıl|quincy/i, label: 'Thousand-Year Blood War', sub: 'Fallen Seireitei active' },
    { re: /soul.*king|kral.*saray/i, label: 'Soul King Palace', sub: 'Celestial palace grammar active' },
  ],
  jjk_mappa: [
    { re: /shibuya|metro.*olay/i, label: 'Shibuya Incident arc', sub: 'Urban catastrophe active' },
    { re: /culling.*game|koloni/i, label: 'Culling Game arc', sub: 'Colony arena grammar active' },
    { re: /antik.*mekan|star.*plasma|mezar/i, label: 'Ancient sites arc', sub: 'Stone corridor grammar active' },
  ],
  aot_wall_world: [
    { re: /marley|liberio|liman.*şehir/i, label: 'Marley arc', sub: 'Port city Liberio grammar active' },
    { re: /okyanus|kıyı.*uçurum|dünya.*sonu/i, label: 'Ocean coast arc', sub: 'World boundary grammar active' },
    { re: /yeraltı|bodrum.*şehir/i, label: 'Underground city', sub: 'Lamp-lit cavern grammar active' },
  ],
  solo_leveling_gate: [
    { re: /s.rank.*dungeon|kırmızı.*gate|red.*gate/i, label: 'S-Rank Red Gate', sub: 'Volcanic dungeon grammar active' },
    { re: /shadow.*monarch|gölge.*kral|mutlak.*karanlık/i, label: 'Shadow Monarch realm', sub: 'Absolute void active' },
    { re: /zindan|dungeon|kristal.*mağara/i, label: 'Dungeon arc', sub: 'Crystal cave grammar active' },
  ],
};

export function detectArc(worldId: string, source: string): { label: string; sub: string } | null {
  const arcs = ARC_MAP[worldId];
  if (!arcs || !source.trim()) return null;
  for (const arc of arcs) {
    if (arc.re.test(source)) return { label: arc.label, sub: arc.sub };
  }
  return null;
}

export const GROUP_COLOR: Record<string, string> = {
  ANIMATION_EDU: '#8fa3c2',
  ANIMATION_PAINTERLY: '#8fa3c2',
  ANIMATION_STYLIZED: '#f6c862',
  ANIMATION_DARK: '#d6a84f',
  ANIMATION_BOLD_CEL: '#f6c862',
  ANIMATION_CEL_3D_HYBRID: '#f6c862',
  CINEMATIC_REAL: '#93c9a8',
  COMMERCIAL_REAL: '#e0a63c',
};

// ── IP World iconic colours — added to quantisation palette ─
// Keeps character-specific hues (hat yellow, vest red, etc.)
// alive after palette snap. Background still uses the active
// palette; characters keep their recognisable iconic colours.
// NOT: one_piece_grand_line / demon_slayer_taisho / jjk_cursed_domain
// legacy world-id, DATA'da yok — bilinçli ölü anahtar (ayrı triage konusu).
export const IP_ICONIC: Record<string, [number, number, number][]> = {
  one_piece_grand_line: [[232, 200, 16], [192, 16, 32], [232, 168, 96]],
  demon_slayer_taisho: [[200, 48, 48], [80, 184, 255], [232, 184, 120]],
  solo_leveling_gate: [[128, 64, 255], [206, 200, 192]],
  jjk_cursed_domain: [[255, 17, 85], [232, 184, 112]],
  jjk_mappa: [[255, 17, 85], [170, 80, 255], [232, 184, 112]],
  demon_slayer_ufotable: [[200, 48, 48], [80, 184, 255], [232, 184, 120]],
  one_piece_toei: [[232, 200, 16], [192, 16, 32], [232, 168, 96]],
  aot_wall_world: [[96, 104, 72], [222, 184, 128]],
  naruto_shinobi_world: [[244, 208, 24], [224, 72, 8], [236, 192, 104]],
  bleach_soul_world: [[208, 88, 16], [232, 184, 136]],
};
