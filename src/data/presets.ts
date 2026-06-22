import { 
  Box, GraduationCap, Clapperboard, Smartphone, User, Building2, CalendarDays, Gamepad2, 
  Image as ImageIcon, Package, Share2, BookOpen, SwatchBook, Presentation, MonitorSmartphone 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Phase0Preset {
  id: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  kind: 'video' | 'design';
  gradient: string;
  sets: {
    projectClass?: string;
    selectedWorldId?: string;
    selectedRefIds?: string[];
    selectedPaletteId?: string;
    selectedPropId?: string;
    sceneCount?: number;
    cast?: string;
  };
  refScope: { allow: string[]; warn: string[] };
}

export const PHASE0_VIDEO: Phase0Preset[] = [
  {
    id: 'product_brand',
    icon: Box,
    label: 'Ürün / Marka Filmi',
    desc: 'Yüksek kaliteli ürün/marka vizyonu, ticari ışık',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#1a1a2e,#16213e 60%,#0f3460)',
    sets: { projectClass: 'PRODUCT_HERO', selectedWorldId: 'product_macro_tabletop', sceneCount: 6 },
    refScope: { allow: ['Commercial', 'Product / Macro'], warn: ['Anime / Cinematic'] },
  },
  {
    id: 'edu_explainer',
    icon: GraduationCap,
    label: 'Eğitim / Açıklayıcı',
    desc: 'Net ve anlaşılır, pedagojik ritim, nesne-odaklı',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#fbd786,#f7797d 60%,#c6ffdd)',
    sets: { projectClass: 'ANIMATION_EDU', selectedWorldId: 'clay', selectedPropId: 'clay', cast: '', sceneCount: 5 },
    refScope: { allow: ['3D Animation', '2D Animation'], warn: ['Game / Film'] },
  },
  {
    id: 'cinematic_story',
    icon: Clapperboard,
    label: 'Sinematik Hikâye',
    desc: 'Film kalitesinde, duygu odaklı anlatı',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#0d0d0d,#1a1a1a 50%,#330000)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'cinematic_real', sceneCount: 8 },
    refScope: { allow: ['Live Action Cinema', 'Cinematography'], warn: [] },
  },
  {
    id: 'social_short',
    icon: Smartphone,
    label: 'Sosyal / Kısa Form',
    desc: 'Sosyal medya ritmi, hızlı ve dinamik kurgu',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#fc5c7d,#6a82fb)',
    sets: { projectClass: 'SOCIAL_REELS_REALISM', selectedWorldId: 'social_reels_real', sceneCount: 4 },
    refScope: { allow: ['Commercial', 'Stylized Premium'], warn: [] },
  },
  {
    id: 'doc_human',
    icon: User,
    label: 'Belgesel / İnsan Hikâyesi',
    desc: 'Gözlemsel gerçekçilik, insan ölçeği',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#3a3a3a,#b98c5a)',
    sets: { projectClass: 'DOCUMENTARY_REALISM', selectedWorldId: 'real_human_doc', sceneCount: 6 },
    refScope: { allow: ['Documentary'], warn: ['Stylized Premium'] },
  },
  {
    id: 'corp_public',
    icon: Building2,
    label: 'Kurumsal / Kamu',
    desc: 'Kurumsal dil, ağırbaşlı ve kamuya uygun',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#1e3c72,#2a5298)',
    sets: { projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'documentary_civic', sceneCount: 5 },
    refScope: { allow: ['Documentary', 'Commercial'], warn: [] },
  },
  {
    id: 'event_campaign',
    icon: CalendarDays,
    label: 'Etkinlik / Kampanya',
    desc: 'Geniş katılımlı event/kampanya filmi',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#f7971e,#ffd200)',
    sets: { projectClass: 'LIVE_ACTION_CORPORATE', selectedWorldId: 'real_event_coverage', sceneCount: 5 },
    refScope: { allow: ['Commercial', 'Cinematography'], warn: [] },
  },
  {
    id: 'stylized_game',
    icon: Gamepad2,
    label: 'Stilize / Oyun-Kinematik',
    desc: 'Anime veya CGI kalitesinde, IP güvenli stiller',
    kind: 'video',
    gradient: 'linear-gradient(135deg,#000428,#004e92)',
    sets: { projectClass: 'STYLIZED_PREMIUM', selectedWorldId: 'arcane', sceneCount: 6 },
    refScope: { allow: ['Game Art Direction', 'Game / Film', 'Anime / Cinematic'], warn: [] },
  },
];

export const PHASE0_DESIGN: Phase0Preset[] = [
  {
    id: 'campaign_kv',
    icon: ImageIcon,
    label: 'Kampanya Key Visual',
    desc: 'Ana kampanya görseli',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#ee0979,#ff6a00)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'commercial_studio', sceneCount: 1 },
    refScope: { allow: ['Commercial', 'Fine Art Lighting'], warn: [] },
  },
  {
    id: 'product_launch',
    icon: Package,
    label: 'Ürün Lansmanı',
    desc: 'Net ve iddialı ürün sahnesi',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#1d976c,#93f9b9)',
    sets: { projectClass: 'PRODUCT_HERO', selectedWorldId: 'product_macro_tabletop', sceneCount: 1 },
    refScope: { allow: ['Product / Macro', 'Commercial'], warn: [] },
  },
  {
    id: 'social_content',
    icon: Share2,
    label: 'Sosyal İçerik Sistemi',
    desc: 'Çoklu kart, post serisi',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#8e2de2,#4a00e0)',
    sets: { projectClass: 'SOCIAL_REELS_REALISM', selectedWorldId: 'social_reels_real', sceneCount: 3 },
    refScope: { allow: ['Commercial', 'Stylized Premium'], warn: [] },
  },
  {
    id: 'editorial_cover',
    icon: BookOpen,
    label: 'Editorial / Kapak',
    desc: 'Lüks ve dergi kapağı kalitesi',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#2c1810,#5a3921)',
    sets: { projectClass: 'FASHION_EDITORIAL', selectedWorldId: 'luxury_editorial', sceneCount: 1 },
    refScope: { allow: ['Fashion / Editorial', 'Fine Art Lighting'], warn: [] },
  },
  {
    id: 'brand_kit',
    icon: SwatchBook,
    label: 'Marka Kiti',
    desc: 'Kurumsal kimlik varlıkları',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#3a7bd5,#3a6073)',
    sets: { projectClass: 'ULTRAREAL_COMMERCIAL', selectedWorldId: 'commercial_studio', sceneCount: 1 },
    refScope: { allow: ['Commercial'], warn: [] },
  },
  {
    id: 'pitch_deck',
    icon: Presentation,
    label: 'Sunum / Pitch Deck',
    desc: 'Kurumsal bilgi ve slayt dizilimi',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#ff6b6b,#feca57)',
    sets: { projectClass: 'ANIMATION_EDU', selectedWorldId: 'notebook', sceneCount: 6 },
    refScope: { allow: ['Commercial', 'Stylized Premium'], warn: [] },
  },
  {
    id: 'ui_product',
    icon: MonitorSmartphone,
    label: 'UI / Ürün Görseli',
    desc: 'Arayüz ve cihaz odaklı çerçeveler',
    kind: 'design',
    gradient: 'linear-gradient(135deg,#11998e,#38ef7d)',
    sets: { projectClass: 'TECH_MEDICAL_PRECISION', selectedWorldId: 'tech_clinical_real', sceneCount: 1 },
    refScope: { allow: ['Product / Macro', 'Commercial'], warn: [] },
  },
];
