import SURGERY_DATA from './SURGERY_DATA.json';

export type PreviewCategory = 'arcane' | 'verse' | 'edu' | 'anime' | 'real';

export function worldCategory(tokenString: string): PreviewCategory {
  const id = String(tokenString || '').toLowerCase();
  if (/arcane|arcane_clay|arcane_edu|arcane_undercity/.test(id)) return 'arcane';
  if (/verse|spiderverse|verse_paper|verse_edu|verse_miles|verse_gwen/.test(id)) return 'verse';
  if (/clay|pixar|paper|felt|chalk|ghibli|anime_edu|anime_chalk/.test(id)) return 'edu';
  if (/anime|demon_slayer|jjk|mha|graphic_comic|painterly|mappa|bones_action|toei/.test(id)) return 'anime';
  if (/commercial|real|photo|cinematic_real|documentary/.test(id)) return 'real';
  return 'edu';
}

export function buildPreviewState(state: any) {
  const pal = SURGERY_DATA.palettes.find((p: any) => p.id === state.palette) || ({} as any);
  const colors = [...(pal.colors || [])].slice(0, 4);
  while (colors.length < 4) colors.push('#2b2f3a');

  const world = SURGERY_DATA.worlds.find((w: any) => w.id === state.world) || ({} as any);
  const worldName = world.name || state.world || 'World';
  const matName = state.teachingMaterial || 'Malzeme';

  const token = [state.world, state.teachingMaterial, state.visualWorld, worldName, matName].join(' ').toLowerCase();
  
  let icon = '●';
  const matKey = String(state.teachingMaterial || '').toLowerCase();
  const matIcons: Record<string, string> = { clay: '⬤', paper: '◻', chalk: '✕', felt: '⬡' };
  const matIcon = matIcons[matKey] || '○';

  const wcat = worldCategory([state.world, state.visualWorld, state.teachingMaterial].join(' '));

  if (/paper|kag|kağ|origami/.test(token)) icon = '□';
  else if (/chalk|tebe/.test(token)) icon = '×';
  else if (/felt|fabric|kece|keçe|kuma/.test(token)) icon = '⬡';
  else if (/anime|verse|arcane|spider/.test(token)) icon = '★';
  else if (/real|commercial|studio|documentary|editorial|macro/.test(token)) icon = '◆';

  return {
    category: wcat,
    colors,
    worldName,
    matName,
    icon,
    matIcon,
    activePreset: state.presetName || 'Özel Reçete'
  };
}
