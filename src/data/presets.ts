import {
  Box, GraduationCap, Clapperboard, Smartphone, User, Building2, CalendarDays, Gamepad2,
  Image as ImageIcon, Package, Share2, BookOpen, SwatchBook, Presentation, MonitorSmartphone
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  kind: 'video' | 'design';
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

export const PHASE0_VIDEO: Phase0Preset[] = [
  {
    id: 'product_brand',
    icon: Box,
    label: 'Ürün / Marka Filmi',
    desc: 'Gerçek reklam, ürün kanıtı ve marka arzusu',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#1a1a2e,#16213e 60%,#0f3460)',
    sets: {
      projectClass: 'PRODUCT_HERO',
      selectedWorldId: 'product_macro_tabletop',
      selectedRefIds: ['apple_object_worship', 'product_macro', 'setup_tabletop'],
      selectedPaletteId: 'commercial_neutral',
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
                selectedWorldId: 'product_macro_tabletop',
                selectedRefIds: ['apple_object_worship', 'product_macro', 'setup_tabletop'],
                selectedPaletteId: 'commercial_neutral',
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
                selectedWorldId: 'photoreal_location',
                selectedRefIds: ['roger_deakins_naturalism', 'emmanuel_lubezki_long_take', 'cinedna_naturalkey'],
                selectedPaletteId: 'warm_commercial_gold',
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
                selectedWorldId: 'social_reels_real',
                selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'],
                selectedPaletteId: 'muted_documentary',
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
              sets: { selectedWorldId: 'commercial_studio', selectedPaletteId: 'commercial_neutral', cameraEnergy: 'locked_premium', timeLight: 'highkey_clean' },
            },
            {
              id: 'tabletop_macro',
              label: 'Tabletop macro',
              desc: 'Yüzey, temas gölgesi ve malzeme gerçekliği daha yakın.',
              sets: { selectedWorldId: 'product_macro_tabletop', selectedRefIds: ['product_macro', 'setup_tabletop', 'luxury_watch_macro'], selectedPaletteId: 'commercial_neutral', cameraEnergy: 'macro_glide', timeLight: 'tabletop_control', signature: 'macro_truth' },
            },
            {
              id: 'human_location',
              label: 'Real location',
              desc: 'Mekan, el ve kullanım ürünü daha az steril ama daha güvenilir yapar.',
              sets: { selectedWorldId: 'photoreal_location', selectedRefIds: ['roger_deakins_naturalism', 'cinedna_naturalkey', 'setup_window'], selectedPaletteId: 'warm_commercial_gold', cameraEnergy: 'location_dolly', timeLight: 'window_natural' },
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
            { id: 'luxury_quiet', label: 'Luxury quiet', desc: 'Siyah, altın, az hareket, pahalı sessizlik.', sets: { mood: 'luxury_restraint', selectedPaletteId: 'luxury_black_gold', timeLight: 'luxury_lowkey', musicVibe: 'luxury_minimal', transition: 'editorial_cut' } },
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
    kind: 'video',
    gradient: 'linear-gradient(135deg,#fbd786,#f7797d 60%,#c6ffdd)',
    sets: {
      projectClass: 'ANIMATION_EDU',
      selectedWorldId: 'clay',
      selectedRefIds: ['pixar_dimensional', 'arcane_clay_hybrid', 'kurzgesagt_clarity'],
      selectedPaletteId: 'vibrant_clean_education',
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
            { id: 'clay_diorama', label: 'Clay diorama', desc: 'Sıcak, dokunsal, Pixar eğitim netliği.', sets: { selectedWorldId: 'clay', selectedPropId: 'clay', selectedRefIds: ['pixar_dimensional', 'arcane_clay_hybrid', 'kurzgesagt_clarity'], selectedPaletteId: 'vibrant_clean_education' } },
            { id: 'lightbox_lab', label: 'Lightbox lab', desc: 'Bilimsel sistem, cam/ışık ve süreç şeması.', sets: { selectedWorldId: 'lightbox', selectedPropId: 'native_world', selectedRefIds: ['kurzgesagt_clarity', 'tech_glass', 'cinedna_highkey'], selectedPaletteId: 'clinical_blue', timeLight: 'clinical_white' } },
            { id: 'notebook_workshop', label: 'Notebook workshop', desc: 'Çizim, defter, adım adım açıklama.', sets: { selectedWorldId: 'notebook', selectedPropId: 'native_world', selectedRefIds: ['vagabond_ink_brush', 'samurai_jack_minimal', 'kurzgesagt_clarity'], selectedPaletteId: 'pastel_soft' } },
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
    kind: 'video',
    gradient: 'linear-gradient(135deg,#0d0d0d,#1a1a1a 50%,#330000)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'cinematic_real', selectedRefIds: ['roger_deakins_naturalism', 'emmanuel_lubezki_long_take', 'cinedna_naturalkey'], selectedPaletteId: 'warm_commercial_gold', sceneCount: 8, mood: 'warm_emotional', cameraEnergy: 'location_dolly', timeLight: 'window_natural', musicVibe: 'doc_roomtone', signature: 'human_truth', tempoCurve: 'documentary_arc' },
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
            { id: 'naturalist_film', label: 'Naturalist film', desc: 'Deakins/Lubezki çizgisi: doğal ışık, uzun nefes.', sets: { selectedWorldId: 'cinematic_real', selectedRefIds: ['roger_deakins_naturalism', 'emmanuel_lubezki_long_take', 'cinedna_naturalkey'], selectedPaletteId: 'warm_commercial_gold', cameraEnergy: 'location_dolly', timeLight: 'window_natural' } },
            { id: 'intimate_portrait', label: 'Intimate portrait', desc: 'Yüz, jest ve küçük hakikatler hikayeyi taşır.', sets: { selectedWorldId: 'human_portrait_real', selectedRefIds: ['setup_window', 'rembrandt_portrait', 'cinedna_window'], selectedPaletteId: 'skin_realism', cameraEnergy: 'handheld_human', signature: 'human_truth' } },
            { id: 'dark_signature', label: 'Dark signature', desc: 'Daha az ışık, daha çok imza ve atmosfer.', sets: { selectedWorldId: 'photoreal_location', selectedPaletteId: 'rembrandt_amber', mood: 'luxury_restraint', timeLight: 'luxury_lowkey', signature: 'silhouette' } },
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
    kind: 'video',
    gradient: 'linear-gradient(135deg,#fc5c7d,#6a82fb)',
    sets: { projectClass: 'SOCIAL_REELS_REALISM', selectedWorldId: 'social_reels_real', selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'], selectedPaletteId: 'muted_documentary', sceneCount: 4, mood: 'social_native', cameraEnergy: 'social_phone', timeLight: 'window_natural', transition: 'social_cut', musicVibe: 'social_snap', pov: 'phone_native', signature: 'usage_payoff', tempoCurve: 'social_hook' },
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
            { id: 'creator_proof', label: 'Creator proof', desc: 'İnsan deneyimi ve hızlı doğrulama önde.', sets: { selectedWorldId: 'social_reels_real', selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'], cameraEnergy: 'social_phone', mood: 'human_trust' } },
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
    kind: 'video',
    gradient: 'linear-gradient(135deg,#3a3a3a,#b98c5a)',
    sets: { projectClass: 'DOCUMENTARY_REALISM', selectedWorldId: 'real_human_doc', selectedRefIds: ['civic_doc', 'setup_verite', 'cinedna_handheld'], selectedPaletteId: 'muted_documentary', sceneCount: 6, mood: 'human_trust', cameraEnergy: 'handheld_human', timeLight: 'overcast_doc', transition: 'doc_cut', musicVibe: 'doc_roomtone', pov: 'witness', signature: 'human_truth', tempoCurve: 'documentary_arc' },
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
            { id: 'observed_close', label: 'Observed close', desc: 'Yakın ama müdahalesiz; jest ve oda sesi önemli.', sets: { selectedWorldId: 'real_human_doc', cameraEnergy: 'handheld_human', pov: 'witness', signature: 'human_truth' } },
            { id: 'place_first', label: 'Place first', desc: 'Önce mekan hakikati, sonra insan.', sets: { selectedWorldId: 'photoreal_location', selectedRefIds: ['roger_deakins_naturalism', 'cinedna_naturalkey', 'setup_verite'], cameraEnergy: 'location_dolly', signature: 'scale_hero' } },
            { id: 'testimonial_trust', label: 'Testimonial trust', desc: 'Yüz ve güven var; performans yok.', sets: { selectedWorldId: 'human_portrait_real', selectedRefIds: ['setup_window', 'rembrandt_portrait', 'cinedna_window'], selectedPaletteId: 'skin_realism', timeLight: 'window_natural' } },
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
    kind: 'video',
    gradient: 'linear-gradient(135deg,#1e3c72,#2a5298)',
    sets: { projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'documentary_civic', selectedRefIds: ['civic_doc', 'story_civic_child_height', 'setup_verite'], selectedPaletteId: 'civic_morning', sceneCount: 5, mood: 'civic_honest', cameraEnergy: 'location_dolly', timeLight: 'overcast_doc', transition: 'doc_cut', musicVibe: 'doc_roomtone', pov: 'witness', signature: 'usage_payoff', tempoCurve: 'documentary_arc' },
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
            { id: 'service_seen', label: 'Hizmet görülür', desc: 'Vatandaş, mekan ve işleyen süreç beraber.', sets: { selectedWorldId: 'documentary_civic', selectedRefIds: ['civic_doc', 'story_civic_child_height', 'setup_verite'], selectedPaletteId: 'civic_morning', signature: 'usage_payoff' } },
            { id: 'human_trust', label: 'İnsan güveni', desc: 'Çalışan/vatandaş yüzü ve dürüst pencere ışığı.', sets: { selectedWorldId: 'human_portrait_real', selectedRefIds: ['setup_window', 'civic_doc', 'cinedna_overcast'], selectedPaletteId: 'skin_realism', signature: 'human_truth' } },
            { id: 'place_system', label: 'Mekan sistemi', desc: 'Bina, yönlendirme, hizmet akışı okunur.', sets: { selectedWorldId: 'architecture_real', selectedRefIds: ['architectural_digest', 'architecture_window_light', 'cinedna_deepfocus'], selectedPaletteId: 'architecture_daylight', cameraEnergy: 'system_scan', signature: 'system_grid' } },
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
    kind: 'video',
    gradient: 'linear-gradient(135deg,#f7971e,#ffd200)',
    sets: { projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'real_event_coverage', selectedRefIds: ['setup_verite', 'cinedna_handheld', 'fifa_stadium_energy'], selectedPaletteId: 'warm_commercial_gold', sceneCount: 5, mood: 'real_confident', cameraEnergy: 'handheld_human', timeLight: 'golden_commercial', transition: 'doc_cut', musicVibe: 'premium_commercial', pov: 'witness', signature: 'scale_hero', tempoCurve: 'proof_buildup' },
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
            { id: 'coverage_truth', label: 'Coverage truth', desc: 'Gerçek coverage, el kamerası ve kalabalık parallax.', sets: { selectedWorldId: 'real_event_coverage', selectedRefIds: ['setup_verite', 'cinedna_handheld', 'fifa_stadium_energy'], cameraEnergy: 'handheld_human' } },
            { id: 'stage_reveal', label: 'Stage reveal', desc: 'Sahne/perde/marka reveal tek imza anı olur.', sets: { selectedWorldId: 'photoreal_location', selectedRefIds: ['cinedna_golden', 'setup_threepoint', 'cinedna_deepfocus'], cameraEnergy: 'location_dolly', signature: 'brand_mark', transition: 'product_match' } },
            { id: 'campaign_energy', label: 'Campaign energy', desc: 'Daha hızlı, daha sosyal, daha paylaşılır.', sets: { selectedWorldId: 'social_reels_real', selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'], cameraEnergy: 'social_phone', transition: 'social_cut', tempoCurve: 'social_hook' } },
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
    kind: 'video',
    gradient: 'linear-gradient(135deg,#000428,#004e92)',
    sets: { projectClass: 'STYLIZED_PREMIUM', selectedWorldId: 'arcane', selectedRefIds: ['arcane_texture', 'arcane_zaun_dna', 'league_arcane_bridge'], selectedPaletteId: 'deep_space_blue', sceneCount: 6, mood: 'epic_excite', cameraEnergy: 'cinematic_dramatic', timeLight: 'night', transition: 'hard_cut', musicVibe: 'epic', signature: 'silhouette', tempoCurve: 'build_peak' },
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
            { id: 'arcane_painterly', label: 'Painterly 3D', desc: 'Fortiche/Arcane dokusu: boyalı 3D, sert rim light.', sets: { selectedWorldId: 'arcane', selectedRefIds: ['arcane_texture', 'arcane_zaun_dna', 'league_arcane_bridge'], selectedPaletteId: 'deep_space_blue', timeLight: 'night' } },
            { id: 'anime_cel', label: 'Anime cel', desc: 'Cel anime, siluet, gökyüzü ve kontrollü action.', sets: { selectedWorldId: 'anime_cel', selectedRefIds: ['anime_silhouette', 'demon_slayer_dna', 'makoto_shinkai_sky_light'], selectedPaletteId: 'pastel_soft', cameraEnergy: 'cinematic_dramatic' } },
            { id: 'graphic_motion', label: 'Graphic motion', desc: 'Spider-Verse/graphic enerji, shape ve renk ritmi.', sets: { selectedWorldId: 'spiderverse', selectedRefIds: ['spiderverse_graphic', 'verse_miles_dna', 'spiderverse_gwen_pastel'], selectedPaletteId: 'deep_space_blue', transition: 'match_cut' } },
          ],
        },
      ],
    },
  },
];

export const PHASE0_DESIGN: Phase0Preset[] = [
  {
    id: 'campaign_kv',
    icon: ImageIcon,
    label: 'Kampanya Key Visual',
    desc: 'Tek kare kampanya fikri ve marka imzası',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#ee0979,#ff6a00)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'commercial_studio', selectedRefIds: ['apple_object_worship', 'setup_threepoint', 'cinedna_highkey'], selectedPaletteId: 'commercial_neutral', sceneCount: 1, mood: 'real_confident', cameraEnergy: 'locked_premium', timeLight: 'highkey_clean', signature: 'brand_mark', tempoCurve: 'system_arc' },
    refScope: { allow: ['Commercial', 'Fine Art Lighting'], warn: [] },
    directorPanel: {
      eyebrow: 'KV DIRECTOR',
      thesis: 'Kampanya görselini poster değil, tek kare stratejik fikir olarak kilitle.',
      groups: [
        {
          id: 'kv_role',
          label: 'KV rolü',
          desc: 'Ana görsel neyi taşısın?',
          defaultChoiceId: 'brand_anchor',
          choices: [
            { id: 'brand_anchor', label: 'Brand anchor', desc: 'Marka/ürün tek sakin imza ile yerleşir.', sets: { selectedWorldId: 'commercial_studio', selectedRefIds: ['apple_object_worship', 'setup_threepoint', 'cinedna_highkey'], selectedPaletteId: 'commercial_neutral', signature: 'brand_mark' } },
            { id: 'emotional_key', label: 'Emotional key', desc: 'İnsan/atmosfer fikri taşır, marka bağırmaz.', sets: { selectedWorldId: 'photoreal_location', selectedRefIds: ['roger_deakins_naturalism', 'setup_window', 'cinedna_naturalkey'], selectedPaletteId: 'warm_commercial_gold', mood: 'human_trust', signature: 'human_truth' } },
            { id: 'luxury_key', label: 'Luxury key', desc: 'Az unsur, siyah/altın, pahalı sessizlik.', sets: { selectedWorldId: 'luxury_editorial', selectedRefIds: ['vogue_editorial', 'setup_highkey', 'chanel_bw_luxury'], selectedPaletteId: 'luxury_black_gold', mood: 'luxury_restraint', timeLight: 'luxury_lowkey', signature: 'product_reveal' } },
          ],
        },
      ],
    },
  },
  {
    id: 'product_launch',
    icon: Package,
    label: 'Ürün Lansmanı',
    desc: 'Net ve iddialı ürün sahnesi',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#1d976c,#93f9b9)',
    sets: { projectClass: 'PRODUCT_HERO', selectedWorldId: 'product_macro_tabletop', selectedRefIds: ['product_macro', 'setup_tabletop', 'luxury_watch_macro'], selectedPaletteId: 'commercial_neutral', sceneCount: 1, mood: 'real_confident', cameraEnergy: 'macro_glide', timeLight: 'tabletop_control', signature: 'product_reveal', tempoCurve: 'launch_tease' },
    refScope: { allow: ['Product / Macro', 'Commercial'], warn: [] },
    directorPanel: {
      eyebrow: 'LAUNCH DIRECTOR',
      thesis: 'Ürünü havada uçuran yapay render değil, fiziksel lansman kanıtı yap.',
      groups: [
        {
          id: 'launch_surface',
          label: 'Ürün yüzeyi',
          desc: 'Malzeme ve ışık hangi vaadi taşısın?',
          defaultChoiceId: 'macro_truth',
          choices: [
            { id: 'macro_truth', label: 'Macro truth', desc: 'Yüzey, kenar, temas gölgesi ve malzeme.', sets: { selectedWorldId: 'product_macro_tabletop', selectedRefIds: ['product_macro', 'setup_tabletop', 'luxury_watch_macro'], cameraEnergy: 'macro_glide', timeLight: 'tabletop_control', signature: 'macro_truth' } },
            { id: 'clean_reveal', label: 'Clean reveal', desc: 'Minimal stüdyo, net ürün formu.', sets: { selectedWorldId: 'commercial_studio', selectedRefIds: ['apple_object_worship', 'setup_threepoint', 'cinedna_highkey'], timeLight: 'highkey_clean', signature: 'product_reveal' } },
            { id: 'tech_precision', label: 'Tech precision', desc: 'Cam, metal, klinik güven.', sets: { selectedWorldId: 'tech_clinical_real', selectedRefIds: ['tech_glass', 'setup_highkey', 'cinedna_highkey'], selectedPaletteId: 'clinical_blue', mood: 'clinical_precision', timeLight: 'clinical_white', musicVibe: 'tech_precision' } },
          ],
        },
      ],
    },
  },
  {
    id: 'social_content',
    icon: Share2,
    label: 'Sosyal İçerik Sistemi',
    desc: 'Çoklu kart, post serisi, hızlı okunur yapı',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#8e2de2,#4a00e0)',
    sets: { projectClass: 'SOCIAL_REELS_REALISM', selectedWorldId: 'social_reels_real', selectedRefIds: ['street_doc', 'setup_verite', 'cinedna_handheld'], selectedPaletteId: 'muted_documentary', sceneCount: 3, mood: 'social_native', cameraEnergy: 'social_phone', transition: 'social_cut', signature: 'system_grid', tempoCurve: 'social_hook' },
    refScope: { allow: ['Commercial', 'Stylized Premium'], warn: [] },
    directorPanel: {
      eyebrow: 'CONTENT SYSTEM',
      thesis: 'Sosyal tasarımı tek post değil, tekrar edilebilir içerik sistemi olarak kur.',
      groups: [
        {
          id: 'content_shape',
          label: 'İçerik şekli',
          desc: 'Serinin taşıyıcı mantığını seç.',
          defaultChoiceId: 'proof_cards',
          choices: [
            { id: 'proof_cards', label: 'Proof cards', desc: 'Her kart bir kanıt/sonuç taşır.', sets: { signature: 'system_grid', tempoCurve: 'system_arc', mood: 'system_clarity' } },
            { id: 'creator_native', label: 'Creator native', desc: 'Telefon gerçekliği ve hızlı insan güveni.', sets: { selectedWorldId: 'social_reels_real', cameraEnergy: 'social_phone', pov: 'phone_native', mood: 'social_native' } },
            { id: 'premium_carousel', label: 'Premium carousel', desc: 'Daha rafine, daha editorial, daha az bağıran seri.', sets: { selectedWorldId: 'commercial_studio', selectedRefIds: ['apple_object_worship', 'setup_threepoint', 'cinedna_highkey'], selectedPaletteId: 'commercial_neutral', mood: 'luxury_restraint', cameraEnergy: 'locked_premium' } },
          ],
        },
      ],
    },
  },
  {
    id: 'editorial_cover',
    icon: BookOpen,
    label: 'Editorial / Kapak',
    desc: 'Lüks ve dergi kapağı kalitesi',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#2c1810,#5a3921)',
    sets: { projectClass: 'FASHION_EDITORIAL', selectedWorldId: 'luxury_editorial', selectedRefIds: ['vogue_editorial', 'setup_highkey', 'chanel_bw_luxury'], selectedPaletteId: 'editorial_monochrome', sceneCount: 1, mood: 'editorial_desire', cameraEnergy: 'editorial_locked', timeLight: 'editorial_flash', signature: 'silhouette', tempoCurve: 'editorial_arc' },
    refScope: { allow: ['Fashion / Editorial', 'Fine Art Lighting'], warn: [] },
    directorPanel: {
      eyebrow: 'EDITORIAL DIRECTOR',
      thesis: 'Kapak görselini dekor değil, duruş, crop ve ışık kararı yap.',
      groups: [
        {
          id: 'editorial_taste',
          label: 'Editorial tat',
          desc: 'Kapak hangi arzuyla çalışsın?',
          defaultChoiceId: 'fashion_flash',
          choices: [
            { id: 'fashion_flash', label: 'Fashion flash', desc: 'Net poz, sert ama kontrollü editorial ışık.', sets: { selectedWorldId: 'luxury_editorial', selectedPaletteId: 'editorial_monochrome', timeLight: 'editorial_flash', cameraEnergy: 'editorial_locked' } },
            { id: 'quiet_luxury', label: 'Quiet luxury', desc: 'Daha az ışık, daha pahalı negatif alan.', sets: { selectedPaletteId: 'luxury_black_gold', mood: 'luxury_restraint', timeLight: 'luxury_lowkey', signature: 'product_reveal' } },
            { id: 'portrait_gravity', label: 'Portrait gravity', desc: 'Yüz/figür hikayenin merkezi olur.', sets: { selectedWorldId: 'human_portrait_real', selectedRefIds: ['setup_window', 'rembrandt_portrait', 'cinedna_window'], selectedPaletteId: 'skin_realism', signature: 'human_truth' } },
          ],
        },
      ],
    },
  },
  {
    id: 'brand_kit',
    icon: SwatchBook,
    label: 'Marka Kiti',
    desc: 'Kurumsal kimlik varlıkları ve sistem dili',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#3a7bd5,#3a6073)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'commercial_studio', selectedRefIds: ['apple_object_worship', 'setup_threepoint', 'cinedna_highkey'], selectedPaletteId: 'commercial_neutral', sceneCount: 1, mood: 'system_clarity', cameraEnergy: 'system_scan', timeLight: 'highkey_clean', signature: 'system_grid', tempoCurve: 'system_arc' },
    refScope: { allow: ['Commercial'], warn: [] },
    directorPanel: {
      eyebrow: 'BRAND SYSTEM',
      thesis: 'Marka kitini logo yığını değil, kullanılabilir görsel sistem olarak kur.',
      groups: [
        {
          id: 'brand_system',
          label: 'Sistem türü',
          desc: 'Kimlik hangi yüzeyde ispatlansın?',
          defaultChoiceId: 'identity_grid',
          choices: [
            { id: 'identity_grid', label: 'Identity grid', desc: 'Logo, renk, tipografi ve modül hizası.', sets: { mood: 'system_clarity', cameraEnergy: 'system_scan', signature: 'system_grid' } },
            { id: 'premium_mockups', label: 'Premium mockups', desc: 'Gerçek yüzeyler, temas gölgesi, materyal kalite.', sets: { selectedWorldId: 'commercial_studio', selectedRefIds: ['apple_object_worship', 'setup_tabletop', 'cinedna_highkey'], cameraEnergy: 'locked_premium', timeLight: 'highkey_clean' } },
            { id: 'human_brand', label: 'Human brand', desc: 'Kimlik gerçek kullanım ve insan temasında görünür.', sets: { selectedWorldId: 'photoreal_location', selectedRefIds: ['setup_window', 'cinedna_naturalkey', 'roger_deakins_naturalism'], selectedPaletteId: 'warm_commercial_gold', mood: 'human_trust', signature: 'usage_payoff' } },
          ],
        },
      ],
    },
  },
  {
    id: 'pitch_deck',
    icon: Presentation,
    label: 'Sunum / Pitch Deck',
    desc: 'Kurumsal bilgi, anlatı ve slayt dizilimi',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#ff6b6b,#feca57)',
    sets: { projectClass: 'ANIMATION_EDU', selectedWorldId: 'notebook', selectedRefIds: ['vagabond_ink_brush', 'samurai_jack_minimal', 'kurzgesagt_clarity'], selectedPaletteId: 'pastel_soft', sceneCount: 6, mood: 'system_clarity', cameraEnergy: 'system_scan', signature: 'system_grid', tempoCurve: 'system_arc' },
    refScope: { allow: ['Commercial', 'Stylized Premium'], warn: [] },
    directorPanel: {
      eyebrow: 'DECK DIRECTOR',
      thesis: 'Sunumu slayt dekoru değil, ikna eden bilgi mimarisi yap.',
      groups: [
        {
          id: 'deck_mode',
          label: 'Deck modu',
          desc: 'Bilgi nasıl taşınsın?',
          defaultChoiceId: 'clear_system',
          choices: [
            { id: 'clear_system', label: 'Clear system', desc: 'Grid, hiyerarşi, sakin bilgi akışı.', sets: { selectedWorldId: 'notebook', selectedPaletteId: 'pastel_soft', mood: 'system_clarity', signature: 'system_grid' } },
            { id: 'premium_pitch', label: 'Premium pitch', desc: 'Daha ticari, daha temiz, daha yatırımcı dili.', sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'commercial_studio', selectedRefIds: ['apple_object_worship', 'setup_threepoint', 'cinedna_highkey'], selectedPaletteId: 'commercial_neutral', mood: 'real_confident' } },
            { id: 'explainer_deck', label: 'Explainer deck', desc: 'Karmaşık konuyu diagram dünyasına indir.', sets: { selectedWorldId: 'lightbox', selectedRefIds: ['kurzgesagt_clarity', 'tech_glass', 'cinedna_highkey'], selectedPaletteId: 'clinical_blue', pov: 'hidden_mech' } },
          ],
        },
      ],
    },
  },
  {
    id: 'ui_product',
    icon: MonitorSmartphone,
    label: 'UI / Ürün Görseli',
    desc: 'Arayüz ve cihaz odaklı çerçeveler',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#11998e,#38ef7d)',
    sets: { projectClass: 'TECH_MEDICAL_PRECISION', selectedWorldId: 'tech_clinical_real', selectedRefIds: ['tech_glass', 'setup_highkey', 'cinedna_highkey'], selectedPaletteId: 'clinical_blue', sceneCount: 1, mood: 'clinical_precision', cameraEnergy: 'system_scan', timeLight: 'clinical_white', signature: 'system_grid', tempoCurve: 'system_arc' },
    refScope: { allow: ['Product / Macro', 'Commercial', 'Tech / Medical'], warn: [] },
    directorPanel: {
      eyebrow: 'PRODUCT UI DIRECTOR',
      thesis: 'Arayüzü parlak mockup değil, okunur ürün kanıtı olarak göster.',
      groups: [
        {
          id: 'ui_surface',
          label: 'UI yüzeyi',
          desc: 'Ekran/cihaz nasıl inandırıcı kalsın?',
          defaultChoiceId: 'screen_safe',
          choices: [
            { id: 'screen_safe', label: 'Screen-safe', desc: 'Düzgün ekran, az yansıma, okunur UI.', sets: { selectedWorldId: 'tech_clinical_real', selectedRefIds: ['tech_glass', 'setup_highkey', 'cinedna_highkey'], cameraEnergy: 'system_scan', timeLight: 'clinical_white', pov: 'system_reader' } },
            { id: 'device_macro', label: 'Device macro', desc: 'Cam, kenar, parmak izi yok; premium cihaz gerçekliği.', sets: { selectedWorldId: 'product_macro_tabletop', selectedRefIds: ['product_macro', 'setup_tabletop', 'tech_glass'], cameraEnergy: 'macro_glide', timeLight: 'tabletop_control', signature: 'macro_truth' } },
            { id: 'use_context', label: 'Use context', desc: 'Ekran gerçek kullanıcı bağlamında anlam kazanır.', sets: { selectedWorldId: 'photoreal_location', selectedRefIds: ['setup_window', 'cinedna_naturalkey', 'roger_deakins_naturalism'], selectedPaletteId: 'warm_commercial_gold', pov: 'customer_hand', signature: 'usage_payoff' } },
          ],
        },
      ],
    },
  },
];
