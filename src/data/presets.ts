import {
  Box, GraduationCap, Clapperboard, Smartphone, User, Building2, CalendarDays, Gamepad2,
  UtensilsCrossed, School,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { normalizeMaterialId, normalizePaletteId, normalizeWorldId } from '../core/pure';

export interface Phase0PresetSets {
  projectClass?: string;
  selectedWorldId?: string;
  selectedRefIds?: string[];
  selectedPaletteId?: string;
  selectedPropId?: string;
  sceneCount?: number;
  cast?: string;
  mood?: string;
  cameraEnergy?: string;
  timeLight?: string;
  transition?: string;
  musicVibe?: string;
  pov?: string;
  signature?: string;
  leitmotif?: string;
  tempoCurve?: string;
}

export interface Phase0DirectorChoice {
  id: string;
  label: string;
  desc: string;
  sets: Phase0PresetSets;
}

export interface Phase0DirectorGroup {
  id: string;
  label: string;
  desc: string;
  defaultChoiceId: string;
  choices: Phase0DirectorChoice[];
}

export interface Phase0Preset {
  id: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  gradient: string;
  sets: Phase0PresetSets;
  refScope: { allow: string[]; warn: string[] };
  directorPanel: {
    eyebrow: string;
    thesis: string;
    groups: Phase0DirectorGroup[];
  };
}

export function directorChoiceMap(preset: Phase0Preset): Record<string, string> {
  return Object.fromEntries(
    preset.directorPanel.groups.map((group) => [group.id, group.defaultChoiceId || group.choices[0]?.id || '']),
  );
}

export function directorDefaultSets(preset: Phase0Preset): Phase0PresetSets {
  return preset.directorPanel.groups.reduce<Phase0PresetSets>((acc, group) => {
    const selected = group.choices.find((choice) => choice.id === group.defaultChoiceId) || group.choices[0];
    return selected ? { ...acc, ...selected.sets } : acc;
  }, {});
}

export function buildDirectorMandate(preset: Phase0Preset, choices: Record<string, string>): string {
  const decisions = preset.directorPanel.groups.flatMap((group) => {
    const choiceId = choices[group.id] || group.defaultChoiceId;
    const choice = group.choices.find((item) => item.id === choiceId) || group.choices[0];
    return choice ? [`${group.label}: ${choice.label} — ${choice.desc}`] : [];
  });
  return [
    `Phase 0 preset: ${preset.label}.`,
    `Director thesis: ${preset.directorPanel.thesis}`,
    decisions.length ? `Locked decisions: ${decisions.join(' | ')}` : '',
    'Anti-generic guard: never produce a generic preset look; every frame must prove the selected strategy through source meaning, physical staging, motivated light, and the selected world/ref DNA.',
  ].filter(Boolean).join(' ');
}

function normalizeSets(sets: Phase0PresetSets): Phase0PresetSets {
  const out: Phase0PresetSets = { ...sets };
  if (out.selectedWorldId !== undefined) out.selectedWorldId = normalizeWorldId(out.selectedWorldId);
  if (out.selectedPaletteId !== undefined) out.selectedPaletteId = normalizePaletteId(out.selectedPaletteId);
  if (out.selectedPropId !== undefined) out.selectedPropId = normalizeMaterialId(out.selectedPropId);
  return out;
}

function normalizePreset(preset: Phase0Preset): Phase0Preset {
  return {
    ...preset,
    sets: normalizeSets(preset.sets),
    directorPanel: {
      ...preset.directorPanel,
      groups: preset.directorPanel.groups.map((group) => ({
        ...group,
        choices: group.choices.map((choice) => ({
          ...choice,
          sets: normalizeSets(choice.sets),
        })),
      })),
    },
  };
}

export const PHASE0_VIDEO: Phase0Preset[] = ([
  {
    id: 'product_brand',
    icon: Box,
    label: 'Ürün / Marka Filmi',
    desc: 'Gerçek reklam, ürün kanıtı ve marka arzusu',
    gradient: 'linear-gradient(135deg,#1a1a2e,#16213e 60%,#0f3460)',
    sets: {
      projectClass: 'PRODUCT_HERO',
      selectedWorldId: 'product_brand_real',
      selectedRefIds: ['apple_object_worship', 'product_macro', 'setup_tabletop'],
      selectedPaletteId: 'native_world',
      selectedPropId: 'native_world',
      sceneCount: 6,
      mood: 'real_confident',
      cameraEnergy: 'locked_premium',
      timeLight: 'highkey_clean',
      transition: 'product_match',
      musicVibe: 'premium_commercial',
      pov: 'product_orbit',
      signature: 'product_reveal',
      tempoCurve: 'proof_buildup',
    },
    refScope: { allow: ['Commercial', 'Product / Macro', 'Real Setup'], warn: ['Anime / Cinematic'] },
    directorPanel: {
      eyebrow: 'REAL AD DIRECTOR',
      thesis: 'Reklamı jenerik TVC değil, ürün kanıtı olan gerçek bir film olarak kur.',
      groups: [
        {
          id: 'ad_format',
          label: 'Reklam formatı',
          desc: 'Sahne mimarisinin neyi ispatlayacağını seç.',
          defaultChoiceId: 'product_proof',
          choices: [
            {
              id: 'product_proof',
              label: 'Product proof',
              desc: 'Ürün merkezde; ışık, yüzey ve kullanım tek kanıt hattı.',
              sets: {
                projectClass: 'PRODUCT_HERO',
                selectedWorldId: 'product_brand_real',
                selectedRefIds: ['apple_object_worship', 'product_macro', 'setup_tabletop'],
                selectedPaletteId: 'native_world',
                sceneCount: 6,
                pov: 'product_orbit',
                signature: 'product_reveal',
                tempoCurve: 'proof_buildup',
              },
            },
            {
              id: 'lifestyle_use',
              label: 'Lifestyle use',
              desc: 'Ürünü gerçek mekanda, gerçek el/alışkanlık içinde kanıtla.',
              sets: {
                projectClass: 'ULTRAREAL_COMMERCIAL',
                selectedWorldId: 'kurumsal_brand_film',
                selectedRefIds: ['roger_deakins_naturalism', 'emmanuel_lubezki_long_take', 'cinedna_naturalkey'],
                selectedPaletteId: 'warm_autumn',
                sceneCount: 7,
                mood: 'human_trust',
                cameraEnergy: 'location_dolly',
                timeLight: 'window_natural',
                pov: 'customer_hand',
                signature: 'usage_payoff',
                tempoCurve: 'problem_solution',
              },
            },
            {
              id: 'social_proof',
              label: 'Social proof',
              desc: 'Gerçek insan, kısa kanıt beatleri ve native güven.',
              sets: {
                projectClass: 'SOCIAL_REELS_REALISM',
                selectedWorldId: 'product_brand_real',
                selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'],
                selectedPaletteId: 'desaturated_cinematic',
                sceneCount: 4,
                mood: 'social_native',
                cameraEnergy: 'social_phone',
                timeLight: 'window_natural',
                transition: 'social_cut',
                musicVibe: 'social_snap',
                pov: 'phone_native',
                signature: 'usage_payoff',
                tempoCurve: 'social_hook',
              },
            },
          ],
        },
        {
          id: 'ad_light',
          label: 'Gerçeklik ve ışık',
          desc: 'Reklamın fiziksel inandırıcılığını kilitle.',
          defaultChoiceId: 'studio_clean',
          choices: [
            {
              id: 'studio_clean',
              label: 'Controlled studio',
              desc: 'Apple temizliği, net ürün geometrisi, sakin premium alan.',
              sets: { selectedWorldId: 'product_brand_real', selectedPaletteId: 'native_world', cameraEnergy: 'locked_premium', timeLight: 'highkey_clean' },
            },
            {
              id: 'tabletop_macro',
              label: 'Tabletop macro',
              desc: 'Yüzey, temas gölgesi ve malzeme gerçekliği daha yakın.',
              sets: { selectedWorldId: 'product_brand_real', selectedRefIds: ['product_macro', 'setup_tabletop', 'luxury_watch_macro'], selectedPaletteId: 'native_world', cameraEnergy: 'macro_glide', timeLight: 'tabletop_control', signature: 'macro_truth' },
            },
            {
              id: 'human_location',
              label: 'Real location',
              desc: 'Mekan, el ve kullanım ürünü daha az steril ama daha güvenilir yapar.',
              sets: { selectedWorldId: 'kurumsal_brand_film', selectedRefIds: ['roger_deakins_naturalism', 'cinedna_naturalkey', 'setup_window'], selectedPaletteId: 'warm_autumn', cameraEnergy: 'location_dolly', timeLight: 'window_natural' },
            },
          ],
        },
        {
          id: 'ad_taste',
          label: 'Tat ve yasak hissi',
          desc: 'Final briefin reklam klişesine düşmesini engelle.',
          defaultChoiceId: 'confident_minimal',
          choices: [
            { id: 'confident_minimal', label: 'Confident minimal', desc: 'Az konuşur, ürünün kendisi kanıt olur.', sets: { mood: 'real_confident', musicVibe: 'premium_commercial', transition: 'product_match' } },
            { id: 'luxury_quiet', label: 'Luxury quiet', desc: 'Siyah, altın, az hareket, pahalı sessizlik.', sets: { mood: 'luxury_restraint', selectedPaletteId: 'deep_noir', timeLight: 'luxury_lowkey', musicVibe: 'luxury_minimal', transition: 'editorial_cut' } },
            { id: 'problem_solution', label: 'Problem çözümü', desc: 'Gerçek sürtünme → ürün davranışı → görünür sonuç.', sets: { mood: 'human_trust', pov: 'customer_hand', signature: 'usage_payoff', tempoCurve: 'problem_solution' } },
          ],
        },
      ],
    },
  },
  {
    id: 'edu_explainer',
    icon: GraduationCap,
    label: 'Eğitim / Açıklayıcı',
    desc: 'Pedagojik ritim, nesne-odaklı netlik',
    gradient: 'linear-gradient(135deg,#fbd786,#f7797d 60%,#c6ffdd)',
    sets: {
      projectClass: 'ANIMATION_EDU',
      selectedWorldId: 'pixar_3d_edu',
      selectedRefIds: ['pixar_dimensional', 'arcane_clay_hybrid', 'kurzgesagt_clarity'],
      selectedPaletteId: 'vibrant_edu',
      selectedPropId: 'clay',
      cast: '',
      sceneCount: 5,
      mood: 'joy_curiosity',
      cameraEnergy: 'explore_pov',
      timeLight: 'morning',
      musicVibe: 'education_light',
      pov: 'hidden_mech',
      signature: 'scale_hero',
      tempoCurve: 'educational_arc',
    },
    refScope: { allow: ['3D Animation', '2D Animation', 'Hybrid Edu'], warn: ['Game / Film'] },
    directorPanel: {
      eyebrow: 'LEARNING DIRECTOR',
      thesis: 'Konuyu çocukça basitleştirmeden, tek bakışta anlaşılır bir eğitim dünyasına çevir.',
      groups: [
        {
          id: 'edu_world',
          label: 'Öğrenme dünyası',
          desc: 'Kavramın hangi materyal ve açıklıkta görüneceğini seç.',
          defaultChoiceId: 'clay_diorama',
          choices: [
            { id: 'clay_diorama', label: 'Clay diorama', desc: 'Sıcak, dokunsal, Pixar eğitim netliği.', sets: { selectedWorldId: 'pixar_3d_edu', selectedPropId: 'clay', selectedRefIds: ['pixar_dimensional', 'arcane_clay_hybrid', 'kurzgesagt_clarity'], selectedPaletteId: 'vibrant_edu' } },
            { id: 'lightbox_lab', label: 'Lightbox lab', desc: 'Bilimsel sistem, cam/ışık ve süreç şeması.', sets: { selectedWorldId: 'pixar_3d_edu', selectedPropId: 'native_world', selectedRefIds: ['kurzgesagt_clarity', 'tech_glass', 'cinedna_highkey'], selectedPaletteId: 'cool_scientific', timeLight: 'clinical_white' } },
            { id: 'notebook_workshop', label: 'Notebook workshop', desc: 'Çizim, defter, adım adım açıklama.', sets: { selectedWorldId: 'paper_craft_popup', selectedPropId: 'native_world', selectedRefIds: ['vagabond_ink_brush', 'samurai_jack_minimal', 'kurzgesagt_clarity'], selectedPaletteId: 'pastel_soft' } },
          ],
        },
        {
          id: 'edu_method',
          label: 'Anlatım metodu',
          desc: 'Sahne beatleri nasıl öğretsin?',
          defaultChoiceId: 'hidden_mechanism',
          choices: [
            { id: 'hidden_mechanism', label: 'Mekanizma aç', desc: 'Sebep-sonuç içini göstererek öğrenilir.', sets: { pov: 'hidden_mech', signature: 'scale_hero', tempoCurve: 'educational_arc' } },
            { id: 'object_pov', label: 'Nesnenin içinden', desc: 'Öğrenci fikri içeriden deneyimler.', sets: { pov: 'object_pov', cameraEnergy: 'explore_pov', signature: 'macro_truth' } },
            { id: 'calm_lesson', label: 'Sakin ders', desc: 'Daha az oyun, daha çok net kavrayış.', sets: { mood: 'calm_focus', cameraEnergy: 'calm_clear', musicVibe: 'minimal', tempoCurve: 'gentle' } },
          ],
        },
      ],
    },
  },
  {
    id: 'cinematic_story',
    icon: Clapperboard,
    label: 'Sinematik Hikâye',
    desc: 'Film dili, duygu ve gerçek mekan ağırlığı',
    gradient: 'linear-gradient(135deg,#0d0d0d,#1a1a1a 50%,#330000)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'deakins_naturalist', selectedRefIds: ['roger_deakins_naturalism', 'emmanuel_lubezki_long_take', 'cinedna_naturalkey'], selectedPaletteId: 'warm_autumn', sceneCount: 8, mood: 'warm_emotional', cameraEnergy: 'location_dolly', timeLight: 'window_natural', musicVibe: 'doc_roomtone', signature: 'human_truth', tempoCurve: 'documentary_arc' },
    refScope: { allow: ['Live Action Cinema', 'Cinematography'], warn: [] },
    directorPanel: {
      eyebrow: 'FILM DIRECTOR',
      thesis: 'Duyguyu reklam parlatmasıyla değil, gerçek mekan ve sinema grameriyle taşı.',
      groups: [
        {
          id: 'story_mode',
          label: 'Hikaye modu',
          desc: 'Sinematik ağırlığın nereden geleceğini seç.',
          defaultChoiceId: 'naturalist_film',
          choices: [
            { id: 'naturalist_film', label: 'Naturalist film', desc: 'Deakins/Lubezki çizgisi: doğal ışık, uzun nefes.', sets: { selectedWorldId: 'deakins_naturalist', selectedRefIds: ['roger_deakins_naturalism', 'emmanuel_lubezki_long_take', 'cinedna_naturalkey'], selectedPaletteId: 'warm_autumn', cameraEnergy: 'location_dolly', timeLight: 'window_natural' } },
            { id: 'intimate_portrait', label: 'Intimate portrait', desc: 'Yüz, jest ve küçük hakikatler hikayeyi taşır.', sets: { selectedWorldId: 'chivo_naturalist_handheld', selectedRefIds: ['setup_window', 'rembrandt_portrait', 'cinedna_window'], selectedPaletteId: 'earth_natural', cameraEnergy: 'handheld_human', signature: 'human_truth' } },
            { id: 'dark_signature', label: 'Dark signature', desc: 'Daha az ışık, daha çok imza ve atmosfer.', sets: { selectedWorldId: 'chivo_naturalist_handheld', selectedPaletteId: 'warm_autumn', mood: 'luxury_restraint', timeLight: 'luxury_lowkey', signature: 'silhouette' } },
          ],
        },
        {
          id: 'story_arc',
          label: 'Duygu yayı',
          desc: 'Finalin nasıl kazanılacağını belirle.',
          defaultChoiceId: 'earned_resolve',
          choices: [
            { id: 'earned_resolve', label: 'Earned resolve', desc: 'Yavaş inşa, sessiz güven, finalde rahatlama.', sets: { tempoCurve: 'documentary_arc', musicVibe: 'doc_roomtone' } },
            { id: 'late_reveal', label: 'Late reveal', desc: 'Bilgiyi sakla, finalde tek büyük anlam aç.', sets: { tempoCurve: 'slow_burn', signature: 'light_shaft' } },
            { id: 'bold_peak', label: 'Bold peak', desc: 'Daha güçlü ölçek ve tek belirgin doruk.', sets: { mood: 'epic_excite', cameraEnergy: 'cinematic_dramatic', signature: 'scale_hero', tempoCurve: 'build_peak' } },
          ],
        },
      ],
    },
  },
  {
    id: 'social_short',
    icon: Smartphone,
    label: 'Sosyal / Kısa Form',
    desc: 'Hook, kanıt ve platform-native ritim',
    gradient: 'linear-gradient(135deg,#fc5c7d,#6a82fb)',
    sets: { projectClass: 'SOCIAL_REELS_REALISM', selectedWorldId: 'chivo_naturalist_handheld', selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'], selectedPaletteId: 'desaturated_cinematic', sceneCount: 4, mood: 'social_native', cameraEnergy: 'social_phone', timeLight: 'window_natural', transition: 'social_cut', musicVibe: 'social_snap', pov: 'phone_native', signature: 'usage_payoff', tempoCurve: 'social_hook' },
    refScope: { allow: ['Commercial', 'Stylized Premium', 'Documentary'], warn: [] },
    directorPanel: {
      eyebrow: 'SOCIAL DIRECTOR',
      thesis: 'Kısa formu ucuzlaştırmadan hızlı, kanıtlı ve izlenir yap.',
      groups: [
        {
          id: 'social_hook',
          label: 'Hook tipi',
          desc: 'İlk saniyenin ne vaat ettiğini seç.',
          defaultChoiceId: 'problem_hook',
          choices: [
            { id: 'problem_hook', label: 'Problem hook', desc: 'Gerçek sürtünme ilk karede görünür.', sets: { tempoCurve: 'problem_solution', signature: 'usage_payoff', pov: 'phone_native' } },
            { id: 'visual_hook', label: 'Visual hook', desc: 'Önce şaşırtıcı ama fiziksel bir görsel kanıt.', sets: { cameraEnergy: 'macro_glide', signature: 'macro_truth', transition: 'social_cut' } },
            { id: 'creator_proof', label: 'Creator proof', desc: 'İnsan deneyimi ve hızlı doğrulama önde.', sets: { selectedWorldId: 'chivo_naturalist_handheld', selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'], cameraEnergy: 'social_phone', mood: 'human_trust' } },
          ],
        },
        {
          id: 'social_finish',
          label: 'Bitiş hissi',
          desc: 'Son kare CTA öncesi nasıl dursun?',
          defaultChoiceId: 'clean_payoff',
          choices: [
            { id: 'clean_payoff', label: 'Clean payoff', desc: 'Net sonuç, kısa hold, okunur kapanış.', sets: { signature: 'usage_payoff', tempoCurve: 'social_hook' } },
            { id: 'brand_snap', label: 'Brand snap', desc: 'Marka/ürün tek imza vuruşuyla görünür.', sets: { signature: 'brand_mark', musicVibe: 'premium_commercial' } },
            { id: 'human_smile_no_stock', label: 'Human truth', desc: 'Gülümseme değil, gerçek rahatlama veya güven.', sets: { signature: 'human_truth', mood: 'human_trust', timeLight: 'window_natural' } },
          ],
        },
      ],
    },
  },
  {
    id: 'doc_human',
    icon: User,
    label: 'Belgesel / İnsan Hikâyesi',
    desc: 'Gözlemsel gerçekçilik, insan ölçeği',
    gradient: 'linear-gradient(135deg,#3a3a3a,#b98c5a)',
    sets: { projectClass: 'DOCUMENTARY_REALISM', selectedWorldId: 'chivo_naturalist_handheld', selectedRefIds: ['civic_doc', 'setup_verite', 'cinedna_handheld'], selectedPaletteId: 'desaturated_cinematic', sceneCount: 6, mood: 'human_trust', cameraEnergy: 'handheld_human', timeLight: 'overcast_doc', transition: 'doc_cut', musicVibe: 'doc_roomtone', pov: 'witness', signature: 'human_truth', tempoCurve: 'documentary_arc' },
    refScope: { allow: ['Documentary', 'Real Setup'], warn: ['Stylized Premium'] },
    directorPanel: {
      eyebrow: 'DOCUMENTARY DIRECTOR',
      thesis: 'İnsanı reklam figürü değil, tanık olunan gerçek bir özne olarak kur.',
      groups: [
        {
          id: 'doc_distance',
          label: 'Kamera mesafesi',
          desc: 'İnsanla arandaki etik mesafeyi seç.',
          defaultChoiceId: 'observed_close',
          choices: [
            { id: 'observed_close', label: 'Observed close', desc: 'Yakın ama müdahalesiz; jest ve oda sesi önemli.', sets: { selectedWorldId: 'chivo_naturalist_handheld', cameraEnergy: 'handheld_human', pov: 'witness', signature: 'human_truth' } },
            { id: 'place_first', label: 'Place first', desc: 'Önce mekan hakikati, sonra insan.', sets: { selectedWorldId: 'chivo_naturalist_handheld', selectedRefIds: ['roger_deakins_naturalism', 'cinedna_naturalkey', 'setup_verite'], cameraEnergy: 'location_dolly', signature: 'scale_hero' } },
            { id: 'testimonial_trust', label: 'Testimonial trust', desc: 'Yüz ve güven var; performans yok.', sets: { selectedWorldId: 'chivo_naturalist_handheld', selectedRefIds: ['setup_window', 'rembrandt_portrait', 'cinedna_window'], selectedPaletteId: 'earth_natural', timeLight: 'window_natural' } },
          ],
        },
      ],
    },
  },
  {
    id: 'corp_public',
    icon: Building2,
    label: 'Kurumsal / Kamu',
    desc: 'Civic gerçeklik, güven ve hizmet kanıtı',
    gradient: 'linear-gradient(135deg,#1e3c72,#2a5298)',
    sets: { projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'kurumsal_brand_film', selectedRefIds: ['civic_doc', 'story_civic_child_height', 'setup_verite'], selectedPaletteId: 'earth_natural', sceneCount: 5, mood: 'civic_honest', cameraEnergy: 'location_dolly', timeLight: 'overcast_doc', transition: 'doc_cut', musicVibe: 'doc_roomtone', pov: 'witness', signature: 'usage_payoff', tempoCurve: 'documentary_arc' },
    refScope: { allow: ['Documentary', 'Commercial'], warn: [] },
    directorPanel: {
      eyebrow: 'CIVIC DIRECTOR',
      thesis: 'Kurumsal tonu parlak broşür değil, hizmetin gerçek kanıtı yap.',
      groups: [
        {
          id: 'public_proof',
          label: 'Kanıt tipi',
          desc: 'Kurumsal/kamu anlatısı neyle güven kazansın?',
          defaultChoiceId: 'service_seen',
          choices: [
            { id: 'service_seen', label: 'Hizmet görülür', desc: 'Vatandaş, mekan ve işleyen süreç beraber.', sets: { selectedWorldId: 'kurumsal_brand_film', selectedRefIds: ['civic_doc', 'story_civic_child_height', 'setup_verite'], selectedPaletteId: 'earth_natural', signature: 'usage_payoff' } },
            { id: 'human_trust', label: 'İnsan güveni', desc: 'Çalışan/vatandaş yüzü ve dürüst pencere ışığı.', sets: { selectedWorldId: 'kurumsal_brand_film', selectedRefIds: ['setup_window', 'civic_doc', 'cinedna_overcast'], selectedPaletteId: 'earth_natural', signature: 'human_truth' } },
            { id: 'place_system', label: 'Mekan sistemi', desc: 'Bina, yönlendirme, hizmet akışı okunur.', sets: { selectedWorldId: 'kurumsal_brand_film', selectedRefIds: ['architectural_digest', 'architecture_window_light', 'cinedna_deepfocus'], selectedPaletteId: 'earth_natural', cameraEnergy: 'system_scan', signature: 'system_grid' } },
          ],
        },
      ],
    },
  },
  {
    id: 'event_campaign',
    icon: CalendarDays,
    label: 'Etkinlik / Kampanya',
    desc: 'Canlı mekan, kalabalık ve kampanya enerjisi',
    gradient: 'linear-gradient(135deg,#f7971e,#ffd200)',
    sets: { projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'civic_promo_real', selectedRefIds: ['setup_verite', 'cinedna_handheld', 'fifa_stadium_energy'], selectedPaletteId: 'warm_autumn', sceneCount: 5, mood: 'real_confident', cameraEnergy: 'handheld_human', timeLight: 'golden_commercial', transition: 'doc_cut', musicVibe: 'premium_commercial', pov: 'witness', signature: 'scale_hero', tempoCurve: 'proof_buildup' },
    refScope: { allow: ['Commercial', 'Cinematography', 'Real Setup'], warn: [] },
    directorPanel: {
      eyebrow: 'EVENT DIRECTOR',
      thesis: 'Etkinliği kalabalık görüntüsü değil, kampanya kanıtı olan anlara indir.',
      groups: [
        {
          id: 'event_scale',
          label: 'Ölçek tipi',
          desc: 'Etkinliğin büyüklüğü nasıl hissedilsin?',
          defaultChoiceId: 'coverage_truth',
          choices: [
            { id: 'coverage_truth', label: 'Coverage truth', desc: 'Gerçek coverage, el kamerası ve kalabalık parallax.', sets: { selectedWorldId: 'civic_promo_real', selectedRefIds: ['setup_verite', 'cinedna_handheld', 'fifa_stadium_energy'], cameraEnergy: 'handheld_human' } },
            { id: 'stage_reveal', label: 'Stage reveal', desc: 'Sahne/perde/marka reveal tek imza anı olur.', sets: { selectedWorldId: 'civic_promo_real', selectedRefIds: ['cinedna_golden', 'setup_threepoint', 'cinedna_deepfocus'], cameraEnergy: 'location_dolly', signature: 'brand_mark', transition: 'product_match' } },
            { id: 'campaign_energy', label: 'Campaign energy', desc: 'Daha hızlı, daha sosyal, daha paylaşılır.', sets: { selectedWorldId: 'sports_energy_real', selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'], cameraEnergy: 'social_phone', transition: 'social_cut', tempoCurve: 'social_hook' } },
          ],
        },
      ],
    },
  },
  {
    id: 'stylized_game',
    icon: Gamepad2,
    label: 'Stilize / Oyun-Kinematik',
    desc: 'IP güvenli stilize sinema ve oyun grameri',
    gradient: 'linear-gradient(135deg,#000428,#004e92)',
    sets: { projectClass: 'STYLIZED_PREMIUM', selectedWorldId: 'arcane_fortiche', selectedRefIds: ['arcane_texture', 'arcane_zaun_dna', 'league_arcane_bridge'], selectedPaletteId: 'deep_noir', sceneCount: 6, mood: 'epic_excite', cameraEnergy: 'cinematic_dramatic', timeLight: 'night', transition: 'hard_cut', musicVibe: 'epic', signature: 'silhouette', tempoCurve: 'build_peak' },
    refScope: { allow: ['Game Art Direction', 'Game / Film', 'Anime / Cinematic'], warn: [] },
    directorPanel: {
      eyebrow: 'STYLIZED DIRECTOR',
      thesis: 'Stilize kaliteyi IP kopyası değil, özgün render grameri olarak kur.',
      groups: [
        {
          id: 'style_engine',
          label: 'Stil motoru',
          desc: 'Hangi stilize sinema grameri baskın olsun?',
          defaultChoiceId: 'arcane_painterly',
          choices: [
            { id: 'arcane_painterly', label: 'Painterly 3D', desc: 'Fortiche/Arcane dokusu: boyalı 3D, sert rim light.', sets: { selectedWorldId: 'arcane_fortiche', selectedRefIds: ['arcane_texture', 'arcane_zaun_dna', 'league_arcane_bridge'], selectedPaletteId: 'deep_noir', timeLight: 'night' } },
            { id: 'anime_cel', label: 'Anime cel', desc: 'Cel anime, siluet, gökyüzü ve kontrollü action.', sets: { selectedWorldId: 'demon_slayer_ufotable', selectedRefIds: ['anime_silhouette', 'demon_slayer_dna', 'makoto_shinkai_sky_light'], selectedPaletteId: 'pastel_soft', cameraEnergy: 'cinematic_dramatic' } },
            { id: 'graphic_motion', label: 'Graphic motion', desc: 'Spider-Verse/graphic enerji, shape ve renk ritmi.', sets: { selectedWorldId: 'spiderverse_sony', selectedRefIds: ['spiderverse_graphic', 'verse_miles_dna', 'spiderverse_gwen_pastel'], selectedPaletteId: 'deep_noir', transition: 'match_cut' } },
            { id: 'mappa_dark', label: 'MAPPA Karanlık', desc: 'MAPPA-grade gece, lanet enerjisi, ağır atmosfer.', sets: { selectedWorldId: 'jjk_mappa', selectedRefIds: ['jujutsu_dark_ritual', 'akira_neon_impact', 'berserk_dark_engraving'], selectedPaletteId: 'deep_noir', timeLight: 'night', mood: 'epic_excite', cameraEnergy: 'cinematic_dramatic', transition: 'hard_cut', musicVibe: 'epic', tempoCurve: 'slow_burn' } },
            { id: 'bones_action', label: 'Bones Aksiyon', desc: 'Bones-stüdyo hassas aksiyon, temiz linework, dinamik.', sets: { selectedWorldId: 'jjk_mappa', selectedRefIds: ['mha_dna', 'dragon_ball_power_aura', 'naruto_chakra_motion'], selectedPaletteId: 'vibrant_edu', mood: 'epic_excite', cameraEnergy: 'cinematic_dramatic', transition: 'match_cut', musicVibe: 'epic', tempoCurve: 'build_peak' } },
            { id: 'toei_grand', label: 'Toei Macera', desc: 'Toei büyük macera enerjisi, cesur renkler, epik ölçek.', sets: { selectedWorldId: 'one_piece_toei', selectedRefIds: ['onepiece_grandline_scale', 'dragon_ball_power_aura', 'attack_titan_scale'], selectedPaletteId: 'vibrant_edu', mood: 'epic_excite', cameraEnergy: 'cinematic_dramatic', signature: 'scale_hero', tempoCurve: 'build_peak' } },
          ],
        },
      ],
    },
  },
  // İki reklam dünyası öksüz kalmıştı: appetite_tabletop_real (yemek/içecek tabletop)
  // ve edu_promo_real (eğitim reklamı). Yazılmışlardı ama hiçbir preset onlara bağlı
  // değildi — konsol o işleri ya ürün reklamına ya kurumsala zorluyordu. Artık kendi
  // arketipleri var; ikisi de amaca özel COMMERCIAL_REAL dünyasında.
  {
    id: 'food_beverage',
    icon: UtensilsCrossed,
    label: 'Yemek / İçecek',
    desc: 'İştah kanıtı: doku, buhar, çıtırtı ve ilk ısırık',
    gradient: 'linear-gradient(135deg,#3a1f0d,#8a4a1c 55%,#d98324)',
    sets: { projectClass: 'FOOD_MACRO', selectedWorldId: 'appetite_tabletop_real', selectedRefIds: ['food_macro', 'food_tabletop_macro', 'setup_tabletop'], selectedPaletteId: 'warm_autumn', sceneCount: 5, mood: 'editorial_desire', cameraEnergy: 'macro_glide', timeLight: 'tabletop_control', transition: 'product_match', musicVibe: 'premium_commercial', pov: 'customer_hand', signature: 'macro_truth', tempoCurve: 'proof_buildup' },
    refScope: { allow: ['Product / Macro', 'Real Setup', 'Commercial'], warn: ['Anime / Cinematic'] },
    directorPanel: {
      eyebrow: 'FOOD DIRECTOR',
      thesis: 'İştahı sıfattan değil fizikten kur: ısı, doku, akış ve ilk temas.',
      groups: [
        {
          id: 'appetite_proof',
          label: 'İştah kanıtı',
          desc: 'Yemeği neyin gerçek yaptığını seç — süsleme değil, fizik.',
          defaultChoiceId: 'texture_truth',
          choices: [
            { id: 'texture_truth', label: 'Doku gerçeği', desc: 'Kabuk, kesit, kırılma ve yüzey — makro ölçekte.', sets: { selectedWorldId: 'appetite_tabletop_real', selectedRefIds: ['food_macro', 'food_tabletop_macro', 'setup_tabletop'], cameraEnergy: 'macro_glide', signature: 'macro_truth', timeLight: 'tabletop_control' } },
            { id: 'heat_and_steam', label: 'Isı ve buhar', desc: 'Buhar, yağın parlaması, tereyağının erimesi — ısı görünür olur.', sets: { selectedWorldId: 'appetite_tabletop_real', selectedRefIds: ['food_macro', 'cinedna_macro', 'setup_tabletop'], timeLight: 'warm_home', signature: 'light_shaft', mood: 'warm_emotional' } },
            { id: 'first_bite', label: 'İlk temas', desc: 'El, çatal ya da ısırık — insan teması ürünü tamamlar.', sets: { selectedWorldId: 'appetite_tabletop_real', selectedRefIds: ['food_tabletop_macro', 'setup_tabletop', 'cinedna_macro'], pov: 'customer_hand', signature: 'usage_payoff', cameraEnergy: 'locked_premium' } },
          ],
        },
        {
          id: 'food_finish',
          label: 'Kapanış',
          desc: 'Son kare neyi bıraksın?',
          defaultChoiceId: 'clean_plate',
          choices: [
            { id: 'clean_plate', label: 'Temiz tabak', desc: 'Ürün kadraja tek başına oturur, hold nefes alır.', sets: { signature: 'macro_truth', tempoCurve: 'proof_buildup' } },
            { id: 'brand_mark_food', label: 'Marka vuruşu', desc: 'Ambalaj/marka tek imza anında görünür (kurgu marka).', sets: { signature: 'brand_mark', transition: 'product_match' } },
          ],
        },
      ],
    },
  },
  {
    id: 'edu_promo',
    icon: School,
    label: 'Eğitim Reklamı',
    desc: 'Okul, kurs, kampüs — gerçek çekim, gerçek ışık',
    gradient: 'linear-gradient(135deg,#0f2a3d,#1f5f7a 55%,#e0b256)',
    sets: { projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'edu_promo_real', selectedRefIds: ['story_civic_child_height', 'setup_window', 'cinedna_naturalkey'], selectedPaletteId: 'earth_natural', sceneCount: 5, mood: 'human_trust', cameraEnergy: 'location_dolly', timeLight: 'window_natural', transition: 'doc_cut', musicVibe: 'education_light', pov: 'child_eye', signature: 'human_truth', tempoCurve: 'educational_arc' },
    refScope: { allow: ['Documentary', 'Real Setup', 'Commercial'], warn: ['Anime / Cinematic'] },
    directorPanel: {
      eyebrow: 'EDUCATION AD DIRECTOR',
      thesis: 'Eğitimi slogan değil kanıt olarak sat: öğrenmenin gerçekten olduğu anı çek.',
      groups: [
        {
          id: 'edu_proof',
          label: 'Neyi ispat ediyoruz',
          desc: 'Reklamın taşıyacağı tek iddiayı seç.',
          defaultChoiceId: 'learning_moment',
          choices: [
            { id: 'learning_moment', label: 'Öğrenme anı', desc: 'Kavrayışın yüze düştüğü an — sahnelenmiş gülümseme değil.', sets: { selectedWorldId: 'edu_promo_real', selectedRefIds: ['story_civic_child_height', 'setup_window', 'cinedna_naturalkey'], pov: 'child_eye', signature: 'human_truth', mood: 'human_trust' } },
            { id: 'campus_system', label: 'Kampüs / sistem', desc: 'Mekân, ekipman ve işleyen düzen okunur.', sets: { selectedWorldId: 'edu_promo_real', selectedRefIds: ['architecture_window_light', 'setup_window', 'cinedna_deepfocus'], cameraEnergy: 'system_scan', signature: 'system_grid', pov: 'system_reader' } },
            { id: 'teacher_trust', label: 'Öğretmen güveni', desc: 'Öğreten insanın yetkinliği ve dürüst pencere ışığı.', sets: { selectedWorldId: 'edu_promo_real', selectedRefIds: ['setup_window', 'cinedna_naturalkey', 'story_civic_child_height'], mood: 'human_trust', cameraEnergy: 'locked_premium', timeLight: 'window_natural' } },
          ],
        },
        {
          id: 'edu_close',
          label: 'Kapanış',
          desc: 'Aileye/öğrenciye ne kalsın?',
          defaultChoiceId: 'earned_confidence',
          choices: [
            { id: 'earned_confidence', label: 'Kazanılmış güven', desc: 'Sonuç görünür: yapabilen bir öğrenci, sakin bir kapanış.', sets: { signature: 'human_truth', tempoCurve: 'educational_arc' } },
            { id: 'institution_mark', label: 'Kurum imzası', desc: 'Kurum kimliği tek dürüst vuruşla kapanır (kurgu marka).', sets: { signature: 'brand_mark', transition: 'doc_cut', mood: 'civic_honest' } },
          ],
        },
      ],
    },
  },
] as Phase0Preset[]).map(normalizePreset);
