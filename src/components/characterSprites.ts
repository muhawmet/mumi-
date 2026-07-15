export type SpriteFrame = string[];

export interface CharacterSprite {
  id: string;
  palette: Record<string, string>;
  frames: SpriteFrame[];
  speed: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export type PlateCharacterKind =
  | 'luffy'
  | 'tanjiro'
  | 'ichigo'
  | 'naruto'
  | 'itadori'
  | 'levi'
  | 'jinwoo'
  | 'jinx'
  | 'miles'
  | 'totoro'
  | 'cowboy'
  | 'paper_explorer'
  | 'camera_operator'
  | 'detective'
  | 'lobby_boy'
  | 'traveler'
  | 'kurz_bird'
  | 'marker_teacher'
  | 'retro_biker'
  | 'geo_mascot'
  | 'samurai'
  | 'stopmotion_kid'
  | 'neon_runner'
  | 'comic_hero'
  | 'clay_inventor'
  | 'storybook_child'
  | 'astronaut'
  | 'visor_biker'
  | 'block_adventurer';

export interface PlateCharacter {
  id: string;
  label: string;
  kind: PlateCharacterKind;
  palette: Record<string, string>;
  accent?: string;
}

const PALETTES = {
  luffy: { K: '#09090b', W: '#f7f7f0', S: '#d8d8d0', P: '#f0b78f', R: '#d94b3d', Y: '#f7c948' },
  tanjiro: { K: '#08090a', G: '#1f7a4d', D: '#0b3d2a', P: '#e9b28d', R: '#8f2431', B: '#59a8ff', W: '#f2eee6' },
  ichigo: { K: '#050507', O: '#f38b22', P: '#e7b28d', W: '#f2eee6', R: '#b51f35', G: '#202027' },
  naruto: { K: '#08090a', Y: '#f3c83f', O: '#e8782f', P: '#e8b28f', B: '#2d5ad9', C: '#6edfff', W: '#f2eee6' },
  itadori: { K: '#06070a', W: '#f2f4f8', P: '#e5b89a', H: '#ef7898', B: '#171a22', R: '#d9475f', C: '#3fd9ff' },
  gojo: { K: '#06070a', W: '#f2f4f8', P: '#e5b89a', M: '#9b5cf2', B: '#171a22', C: '#3fd9ff', R: '#ff4f83' },
  levi: { K: '#070809', H: '#20242a', G: '#536343', P: '#e0ae8f', W: '#f2eee6', S: '#a6adb7' },
  jinwoo: { K: '#040406', D: '#141419', P: '#d4a98d', M: '#7c3cff', V: '#bf7bff', W: '#f2eee6' },
  killua: { K: '#08090c', W: '#eef4ff', P: '#e3b292', N: '#202a50', E: '#70d7ff', L: '#93a7c7' },
  jinx: { K: '#06070a', P: '#e5b89a', B: '#38bdf8', M: '#ff5ba7', V: '#6d4aff', W: '#f2eee6', D: '#191827' },
  miles: { K: '#050508', R: '#e2263f', W: '#f2eee6', C: '#44d6ff', D: '#11131c' },
  totoro: { K: '#09090b', G: '#7f8b83', D: '#4a5550', W: '#eee7d4', S: '#cdd4c8' },
  toy: { K: '#09090b', Y: '#f0c04a', B: '#2960b8', R: '#d94837', P: '#dfad86', W: '#f6f0dc', S: '#6b4a2b' },
  paper: { K: '#24201c', W: '#f2e6c8', B: '#5ba3d9', R: '#dd6b4b', Y: '#e3b84d', P: '#d7a783' },
  real: { K: '#07080a', H: '#1c2128', W: '#f1ead8', Y: '#d6a84f', P: '#d0a083', R: '#7f2433', S: '#9ca3af', B: '#355c7d' },
  neon: { K: '#06070a', C: '#38f1ff', M: '#f43f9c', Y: '#facc15', W: '#f7f7f0', B: '#172554', P: '#d8a48f' },
  noir: { K: '#060608', H: '#1a1a24', W: '#e7dfcf', Y: '#d6a84f', P: '#d0a083', R: '#7f2433', S: '#9ca3af' },
  skill: { K: '#060608', W: '#e7dfcf', Y: '#d6a84f', B: '#4bb8e8', M: '#9f5cc2', R: '#c7598c', G: '#3f9e7c', C: '#6edfff' },
};

function frame(lines: string[]): SpriteFrame {
  const width = Math.max(...lines.map((line) => line.length));
  return lines.map((line) => line.padEnd(width, ' '));
}

const LUFFY_FRAMES = [
  frame([
    '        WWWWWW        ',
    '      WWWWWWWWWW      ',
    '     WWPWWWWPWWW      ',
    '     WPPKPWWKPPW      ',
    '      WPPPRPPPW       ',
    '       WWWWWWW        ',
    '       WWRRWWW        ',
    '      WWWRRWWWW       ',
    '     WWWWPPWWWWW      ',
    '    KWWWPPPPWWWK      ',
    '       WPPPPW         ',
    '       WPPPPW         ',
    '      WWW  WWW        ',
    '      WW    WW        ',
  ]),
  frame([
    '        WWWWWW        ',
    '      WWWWWWWWWW      ',
    '     WWPWWWWPWWW      ',
    '     WPPKPWWKPPW      ',
    '      WPPPYPPR        ',
    '       WWWWWWW        ',
    '       WWRRWWW        ',
    '      WWWRRWWWWWWWW   ',
    '     WWWWPPWWWWWWWWW  ',
    '    KWWWPPPPWWWK      ',
    '       WPPPPW         ',
    '       WPPPPW         ',
    '      WWW  WWW        ',
    '      WW    WW        ',
  ]),
];

const TANJIRO_FRAMES = [
  frame([
    '        KKKKKK        ',
    '      KKKRKKKKK       ',
    '     KKPPPPPPPK       ',
    '     KPPKPPKPPK W     ',
    '      KPPPPPPK  W     ',
    '       KKKKKK   W     ',
    '      GDGDGDG   B     ',
    '     DGDGDGDG  BB     ',
    '     GDGDGDGD BBB     ',
    '     DGDGDGDG BB      ',
    '       KK  KK         ',
    '      KKK  KKK        ',
  ]),
  frame([
    '        KKKKKK        ',
    '      KKKRKKKKK       ',
    '     KKPPPPPPPK       ',
    '     KPPKPPKPPK W     ',
    '      KPPPPPPK  W  B  ',
    '       KKKKKK BBBBBB  ',
    '      GDGDGDGBBB W    ',
    '     DGDGDGDG   W     ',
    '     GDGDGDGD         ',
    '     DGDGDGDG         ',
    '       KK  KK         ',
    '      KKK  KKK        ',
  ]),
];

const ICHIGO_FRAMES = [
  frame([
    '       OOOOOOO        ',
    '      OOOOOOOOO       ',
    '     OOPPPPPPOO       ',
    '     OPPKPPKPO        ',
    '      OPPPPPO     W   ',
    '       OOOOO     WW   ',
    '      KKKKKK    WWW   ',
    '     KKKGGKKK  WWW    ',
    '     KKKGGKKK RRR     ',
    '      KKKKKK RR       ',
    '       KK KK          ',
    '      KKK KKK         ',
  ]),
  frame([
    '       OOOOOOO        ',
    '      OOOOOOOOO       ',
    '     OOPPPPPPOO       ',
    '     OPPKPPKPO        ',
    '      OPPPPPO         ',
    '       OOOOO     WWW  ',
    '      KKKKKK   WWW R  ',
    '     KKKGGKKK WWW RRR ',
    '     KKKGGKKK    RRR  ',
    '      KKKKKK      R   ',
    '       KK KK          ',
    '      KKK KKK         ',
  ]),
];

const NARUTO_FRAMES = [
  frame([
    '       YYYYYYY        ',
    '      YYYYYYYYY       ',
    '     YYKKKKKKKYY      ',
    '     YPPKPPKPPY       ',
    '     YP KP KP Y       ',
    '      YPPPPPY         ',
    '       OOOOOO      C  ',
    '      OOOBBOOO    CCC ',
    '     OOOOBBOOOO    C  ',
    '      OOOOOOOO        ',
    '       OO  OO         ',
    '      OOO  OOO        ',
  ]),
  frame([
    '       YYYYYYY        ',
    '      YYYYYYYYY       ',
    '     YYKKKKKKKYY      ',
    '     YPPKPPKPPY       ',
    '     YP KP KP Y    C  ',
    '      YPPPPPY    CCCC ',
    '       OOOOOO   CCCCC ',
    '      OOOBBOOO   CCCC ',
    '     OOOOBBOOOO    C  ',
    '      OOOOOOOO        ',
    '       OO  OO         ',
    '      OOO  OOO        ',
  ]),
];

const GOJO_FRAMES = [
  frame([
    '       WWWWWWWW       ',
    '      WWWWWWWWWW      ',
    '     WWKKKKKKKWW      ',
    '     WPPPPPPPPW       ',
    '      WPPPPPPW     M  ',
    '       BBBBBB     MMM ',
    '      BBBBBBBB     M  ',
    '     BBBBBBBBBB       ',
    '      BBBBBBBB        ',
    '       BB  BB         ',
    '      BBB  BBB        ',
  ]),
  frame([
    '       WWWWWWWW       ',
    '      WWWWWWWWWW      ',
    '     WWKKKKKKKWW      ',
    '     WPPPPPPPPW   C M ',
    '      WPPPPPPW   CMMMM',
    '       BBBBBB     R M ',
    '      BBBBBBBB       ',
    '     BBBBBBBBBB      ',
    '      BBBBBBBB       ',
    '       BB  BB        ',
    '      BBB  BBB       ',
  ]),
];

const LEVI_FRAMES = [
  frame([
    '        HHHHH         ',
    '      HHHHHHHH        ',
    '     HPPPPPPPH        ',
    '     HPKPPKPPH        ',
    '      HPPPPPH   S   S ',
    '       WWWWW    S  S  ',
    '      GGGGGGG  S S    ',
    '     GGGKGGGG S       ',
    '      GGGGGG          ',
    '       SS SS          ',
    '      SSS SSS         ',
  ]),
  frame([
    '        HHHHH      S  ',
    '      HHHHHHHH    S   ',
    '     HPPPPPPPH   S    ',
    '     HPKPPKPPH        ',
    '      HPPPPPH   S   S ',
    '       WWWWW     S S  ',
    '    S GGGGGGG     S   ',
    '   S GGGKGGGG         ',
    '      GGGGGG          ',
    '       SS SS          ',
    '      SSS SSS         ',
  ]),
];

const JINWOO_FRAMES = [
  frame([
    '        KKKKK         ',
    '      KKKKKKKK        ',
    '     KKPMKPMKK        ',
    '     KPPPPPPPK        ',
    '      KPPPPPK         ',
    '       DDDDDD         ',
    '      DDDDDDDD        ',
    '     DDDDDDDDDD       ',
    '      DDDDDDDD        ',
    '       DD  DD         ',
    '     M DD  DD M       ',
    '    MM        MM      ',
  ]),
  frame([
    '        KKKKK         ',
    '      KKKKKKKK        ',
    '     KKPMKPMKK        ',
    '     KPPPPPPPK        ',
    '      KPPPPPK         ',
    '       DDDDDD         ',
    '      DDDDDDDD        ',
    '     DDDDDDDDDD       ',
    '      DDDDDDDD        ',
    '     M DD  DD M       ',
    '    MM  M  M  MM      ',
    '   MMM        MMM     ',
  ]),
];

const KILLUA_FRAMES = [
  frame([
    '     E  WWWWWW   E    ',
    '      WWWWWWWWW       ',
    '     WWPPPPPPWW       ',
    '   E WPPKPPKPW E      ',
    '      WPPPPPW         ',
    '       NNNNNN     E   ',
    '      NNNNNNNN        ',
    '     NNNNNNNNNN       ',
    '      NNNNNNNN        ',
    '       NN  NN         ',
    '      NNN  NNN        ',
  ]),
  frame([
    '        WWWWWW     E  ',
    '   E  WWWWWWWWW       ',
    '     WWPPPPPPWW   E   ',
    '     WPPKPPKPW        ',
    '   E  WPPPPPW         ',
    '       NNNNNN  E      ',
    '      NNNNNNNN        ',
    '     NNNNNNNNNN       ',
    '      NNNNNNNN    E   ',
    '       NN  NN         ',
    '      NNN  NNN        ',
  ]),
];

const MASCOT_FRAMES = [
  frame([
    '       YYYYYY        ',
    '      YKKKKKY        ',
    '     YKWWWWKY        ',
    '    YKWWKKWWKY       ',
    '    YKWWWWWWKY       ',
    '     YKKKKKKY        ',
    '       Y  Y          ',
  ]),
  frame([
    '       YYYYYY        ',
    '      YKKKKKY        ',
    '     YKWWWWKY        ',
    '    YKWWKKWWKY       ',
    '    YKWWWWWWKY       ',
    '     YKKKKKKY        ',
    '      Y    Y         ',
  ]),
];

const LEDGER_FRAMES = [
  frame([
    '       HHHHHHH       ',
    '      HHHHHHHHH      ',
    '      KPPPPPPPK      ',
    '      KPKPPKPPK      ',
    '      KPPPPPPPK      ',
    '       KWWWWWK       ',
    '      KKKYYYKKK      ',
    '     KKKKKKKKKKK     ',
    '     KKKKKKKKKKK     ',
  ]),
  frame([
    '       HHHHHHH       ',
    '      HHHHHHHHH      ',
    '      KPPPPPPPK      ',
    '      KPPPPKPPK      ',
    '      KPPPPPPPK      ',
    '       KWWWWWK       ',
    '      KKKYYYKKK      ',
    '     KKKKKKKKKKK     ',
    '     KKKKKKKKKKK     ',
  ]),
];

function portrait(symbol: string, accent: string): SpriteFrame[] {
  return [
    frame([
      '       KKKKK        ',
      '     KKKKKKKKK      ',
      '    KKKWWWWWKKK     ',
      `    KKW${symbol}${symbol}${symbol}WKK     `,
      `    KKW${symbol}${accent}${symbol}WKK     `,
      '    KKKWWWWWKKK     ',
      '      KKKKKKK       ',
      '     KKKYYYKKK      ',
      '    KKKKKKKKKKK     ',
    ]),
    frame([
      '       KKKKK        ',
      '     KKKKKKKKK      ',
      '    KKKWWWWWKKK     ',
      `    KKW${symbol}${accent}${symbol}WKK     `,
      `    KKW${symbol}${symbol}${symbol}WKK     `,
      '    KKKWWWWWKKK     ',
      '      KKKKKKK       ',
      '     KKKYYYKKK      ',
      '    KKKKKKKKKKK     ',
    ]),
  ];
}

const ZORO_FRAMES = portrait('G', 'S');
const SANJI_FRAMES = portrait('Y', 'R');
const RENGOKU_FRAMES = portrait('R', 'Y');
const TENGEN_FRAMES = portrait('W', 'C');
const VISUAL_CALCULUS_FRAMES = portrait('B', 'W');
const CONCEPTUALIZATION_FRAMES = portrait('M', 'Y');
const DRAMA_FRAMES = portrait('R', 'W');
const ENCYCLOPEDIA_FRAMES = portrait('G', 'W');
const INLAND_EMPIRE_FRAMES = portrait('M', 'C');
const VOLITION_FRAMES = portrait('Y', 'R');

const worldAliases = {
  one_piece_grand_line: 'one_piece_toei',
  one_piece_sunny_adventure: 'one_piece_toei',
  onepiece_grandline_scale: 'one_piece_toei',
  demon_slayer_infinity: 'demon_slayer_ufotable',
  bleach_soul_society: 'bleach_soul_world',
  naruto_shippuden: 'naruto_shinobi_world',
  naruto_chakra_motion: 'naruto_shinobi_world',
  dragon_ball_power_aura: 'naruto_shinobi_world',
  jujutsu_kaisen_tokyo: 'jjk_mappa',
  aot_paradis: 'aot_wall_world',
  solo_leveling_korea: 'solo_leveling_gate',
  hxh_yorknew: 'hxh_madhouse',
} as const;

export const PLATE_CHARACTERS: Record<string, PlateCharacter> = {
  pixar_3d_edu: { id: 'cowboy_toy', label: 'Cowboy Toy', kind: 'cowboy', palette: PALETTES.toy, accent: '#f0c04a' },
  paper_craft_popup: { id: 'paper_explorer', label: 'Paper Explorer', kind: 'paper_explorer', palette: PALETTES.paper, accent: '#dd6b4b' },
  ghibli_hayao: { id: 'totoro', label: 'Totoro', kind: 'totoro', palette: PALETTES.totoro, accent: '#cdd4c8' },
  arcane_fortiche: { id: 'jinx', label: 'Jinx', kind: 'jinx', palette: PALETTES.jinx, accent: '#ff5ba7' },
  spiderverse_sony: { id: 'miles', label: 'Miles', kind: 'miles', palette: PALETTES.miles, accent: '#e2263f' },
  jjk_mappa: { id: 'itadori', label: 'Itadori', kind: 'itadori', palette: PALETTES.itadori, accent: '#d9475f' },
  demon_slayer_ufotable: { id: 'tanjiro', label: 'Tanjiro', kind: 'tanjiro', palette: PALETTES.tanjiro, accent: '#59a8ff' },
  one_piece_toei: { id: 'luffy', label: 'Luffy', kind: 'luffy', palette: PALETTES.luffy, accent: '#f7c948' },
  deakins_naturalist: { id: 'camera_operator', label: 'Camera Operator', kind: 'camera_operator', palette: PALETTES.real, accent: '#d6a84f' },
  fincher_precision: { id: 'cold_detective', label: 'Cold Detective', kind: 'detective', palette: PALETTES.real, accent: '#355c7d' },
  wes_anderson_symmetric: { id: 'lobby_boy', label: 'Lobby Boy', kind: 'lobby_boy', palette: { ...PALETTES.real, R: '#b64645', P: '#dca18a', Y: '#e9c46a' }, accent: '#e9c46a' },
  chivo_naturalist_handheld: { id: 'handheld_traveler', label: 'Handheld Traveler', kind: 'traveler', palette: { ...PALETTES.real, B: '#446f5c', Y: '#f0b35f' }, accent: '#f0b35f' },
  kurzgesagt_edu: { id: 'kurz_bird', label: 'Kurz Bird', kind: 'kurz_bird', palette: { ...PALETTES.neon, B: '#2763d8', Y: '#f6a623' }, accent: '#f6a623' },
  whiteboard_explainer: { id: 'marker_teacher', label: 'Marker Teacher', kind: 'marker_teacher', palette: { ...PALETTES.paper, B: '#2f80ed', K: '#1f2933' }, accent: '#2f80ed' },
  retro_anime_film: { id: 'retro_biker', label: 'Retro Biker', kind: 'retro_biker', palette: { ...PALETTES.neon, R: '#e95d3c', B: '#25304f' }, accent: '#e95d3c' },
  motion_design_flat: { id: 'geo_mascot', label: 'Geo Mascot', kind: 'geo_mascot', palette: PALETTES.skill, accent: '#4bb8e8' },
  ukiyo_e_print: { id: 'woodblock_samurai', label: 'Woodblock Samurai', kind: 'samurai', palette: { ...PALETTES.real, B: '#2f5f8f', R: '#b74333', W: '#e8d8ad' }, accent: '#2f5f8f' },
  laika_stopmotion: { id: 'stopmotion_kid', label: 'Stop-Motion Kid', kind: 'stopmotion_kid', palette: { ...PALETTES.paper, B: '#33415c', Y: '#d99a4e' }, accent: '#d99a4e' },
  naruto_shinobi_world: { id: 'naruto', label: 'Naruto', kind: 'naruto', palette: PALETTES.naruto, accent: '#6edfff' },
  aot_wall_world: { id: 'levi', label: 'Levi', kind: 'levi', palette: PALETTES.levi, accent: '#a6adb7' },
  solo_leveling_gate: { id: 'jinwoo', label: 'Sung Jin-Woo', kind: 'jinwoo', palette: PALETTES.jinwoo, accent: '#7c3cff' },
  bleach_soul_world: { id: 'ichigo', label: 'Ichigo', kind: 'ichigo', palette: PALETTES.ichigo, accent: '#f38b22' },
  cyberpunk_neon_noir: { id: 'neon_runner', label: 'Neon Runner', kind: 'neon_runner', palette: PALETTES.neon, accent: '#38f1ff' },
  vintage_comic_book: { id: 'comic_hero', label: 'Comic Hero', kind: 'comic_hero', palette: { ...PALETTES.neon, B: '#2563eb', R: '#dc2626', Y: '#facc15' }, accent: '#dc2626' },
  claymation_aardman: { id: 'clay_inventor', label: 'Clay Inventor', kind: 'clay_inventor', palette: { ...PALETTES.toy, G: '#6c8f55' }, accent: '#f0c04a' },
  noir_high_contrast: { id: 'noir_detective', label: 'Noir Detective', kind: 'detective', palette: PALETTES.noir, accent: '#e7dfcf' },
  watercolor_storybook: { id: 'storybook_child', label: 'Storybook Child', kind: 'storybook_child', palette: { ...PALETTES.paper, G: '#5f9e73', B: '#7bb7d9' }, accent: '#7bb7d9' },
  sci_fi_hard_surface: { id: 'armored_astronaut', label: 'Armored Astronaut', kind: 'astronaut', palette: { ...PALETTES.neon, S: '#c8d2e0' }, accent: '#38f1ff' },
  synthwave_retro_80s: { id: 'visor_biker', label: 'Visor Biker', kind: 'visor_biker', palette: PALETTES.neon, accent: '#f43f9c' },
  low_poly_ps1: { id: 'block_adventurer', label: 'Block Adventurer', kind: 'block_adventurer', palette: { ...PALETTES.toy, G: '#5d9c59' }, accent: '#5d9c59' },
};

export const CHARACTER_SPRITES: Record<string, CharacterSprite> = {
  one_piece_toei: { id: 'luffy', palette: PALETTES.luffy, frames: LUFFY_FRAMES, speed: 220, scale: 4, offsetX: 0, offsetY: 0 },
  demon_slayer_ufotable: { id: 'tanjiro', palette: PALETTES.tanjiro, frames: TANJIRO_FRAMES, speed: 180, scale: 4, offsetX: 0, offsetY: 0 },
  bleach_soul_world: { id: 'ichigo', palette: PALETTES.ichigo, frames: ICHIGO_FRAMES, speed: 190, scale: 4, offsetX: 0, offsetY: 0 },
  naruto_shinobi_world: { id: 'naruto', palette: PALETTES.naruto, frames: NARUTO_FRAMES, speed: 180, scale: 4, offsetX: 0, offsetY: 0 },
  jjk_mappa: { id: 'gojo', palette: PALETTES.gojo, frames: GOJO_FRAMES, speed: 210, scale: 4, offsetX: 0, offsetY: 0 },
  aot_wall_world: { id: 'levi', palette: PALETTES.levi, frames: LEVI_FRAMES, speed: 170, scale: 4, offsetX: 0, offsetY: 0 },
  solo_leveling_gate: { id: 'jinwoo', palette: PALETTES.jinwoo, frames: JINWOO_FRAMES, speed: 230, scale: 4, offsetX: 0, offsetY: 0 },
  hxh_madhouse: { id: 'killua', palette: PALETTES.killua, frames: KILLUA_FRAMES, speed: 120, scale: 4, offsetX: 0, offsetY: 0 },
  default: { id: 'mascot', palette: PALETTES.noir, frames: MASCOT_FRAMES, speed: 360, scale: 5, offsetX: 0, offsetY: 0 },
  case_ledger: { id: 'case_ledger', palette: PALETTES.noir, frames: LEDGER_FRAMES, speed: 430, scale: 5, offsetX: 0, offsetY: 0 },
  noir_director: { id: 'noir_director', palette: PALETTES.noir, frames: LEDGER_FRAMES, speed: 430, scale: 5, offsetX: 0, offsetY: 0 },
  silver_director: { id: 'silver_director', palette: PALETTES.noir, frames: LEDGER_FRAMES, speed: 430, scale: 5, offsetX: 0, offsetY: 0 },
  zoro: { id: 'zoro', palette: { ...PALETTES.noir, G: '#42c764', S: '#d7dde7' }, frames: ZORO_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  sanji: { id: 'sanji', palette: { ...PALETTES.noir, Y: '#f0d35a', R: '#e8594f' }, frames: SANJI_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  rengoku: { id: 'rengoku', palette: { ...PALETTES.noir, R: '#f15b35', Y: '#ffd166' }, frames: RENGOKU_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  tengen: { id: 'tengen', palette: { ...PALETTES.noir, W: '#f2f4f8', C: '#63e6ff' }, frames: TENGEN_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  visual_calculus: { id: 'visual_calculus', palette: PALETTES.skill, frames: VISUAL_CALCULUS_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  conceptualization: { id: 'conceptualization', palette: PALETTES.skill, frames: CONCEPTUALIZATION_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  drama: { id: 'drama', palette: PALETTES.skill, frames: DRAMA_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  encyclopedia: { id: 'encyclopedia', palette: PALETTES.skill, frames: ENCYCLOPEDIA_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  inland_empire: { id: 'inland_empire', palette: PALETTES.skill, frames: INLAND_EMPIRE_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
  volition: { id: 'volition', palette: PALETTES.skill, frames: VOLITION_FRAMES, speed: 420, scale: 5, offsetX: 0, offsetY: 0 },
};

for (const [alias, target] of Object.entries(worldAliases)) {
  CHARACTER_SPRITES[alias] = CHARACTER_SPRITES[target];
  PLATE_CHARACTERS[alias] = PLATE_CHARACTERS[target];
}

export function getCharacterSprite(worldId: string): CharacterSprite {
  return CHARACTER_SPRITES[worldId] || CHARACTER_SPRITES.default;
}

export function getPlateCharacter(worldId: string): PlateCharacter {
  return PLATE_CHARACTERS[worldId] || PLATE_CHARACTERS.default || {
    id: 'default_mascot',
    label: 'World Mascot',
    kind: 'geo_mascot',
    palette: PALETTES.skill,
    accent: '#d6a84f',
  };
}
