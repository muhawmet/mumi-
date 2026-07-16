/**
 * CANONICAL VERİ SÖZLEŞMESİ — TASK 2 + MACRO 1 (Manual World Studio).
 *
 * `DeliveryPromise`: karar anında KİLİTLENİR, taşınabilir kimliğin parçasıdır (hash'lenir).
 *
 * ── MACRO 1 KARARI (Mami, 2026-07-15): kaynak metinden text NİYETİ ÇIKARILMAZ ──
 * MAMILAS otomasyon değildir. Site, Mami'nin düzyazısını okuyup "burada metin isteniyor"
 * diye TAHMİN ETMEZ, regex/NLP ile analiz etmez ve üretimi bloke etmez. Kaynağın metin
 * niyetini KARE için yazacak olan, command içindeki AJAN'dır — Mami ona sohbet içinde
 * "buraya şunu yaz" dediğinde uygular; site araya girmez.
 *
 * Bu yüzden `ON_SCREEN_TEXT_INTENT`/`DELIVERY_PROMISE_BROKEN` üretim kapıları KALDIRILDI.
 * Söz yalnız iki AÇIK kaynaktan doğar:
 *   • Mami'nin açık BEYANI (`DeliveryDeclaration`) — sohbette değil, yapısal alanda verirse,
 *   • Mami'nin `osTextMode: CLEAN` kilidi.
 * Beyan yoksa söz `pedagogy_auto`'dur (Mami'nin 2026-07-05 kilidi: temiz plaka + VO). Hiçbir
 * düzyazı taraması, hiçbir blok. Eski niyet-dedektörü tarihçedir; üretim yolunda yaşamaz.
 */

/**
 * Mami'nin ekran-metni beyanı. Söz BUNDAN doğar — düzyazıdan değil.
 * (Etkileşimli cevap kanalı TASK 3'te tamamlanır; burada yapısal giriş olarak yaşar.)
 */
export type DeliveryDeclaration =
  | { kind: 'baked'; items: Array<{ exactText: string; surface: string; language?: 'tr' | 'en' }> }
  | { kind: 'clean' };

/** Temiz plaka sözünün GEREKÇESİ. Sessiz varsayılan değil, kayıtlı karar. */
export type CleanPlateReason =
  /** Dünya yasası yazıyı yasaklıyor. */
  | 'world_forbids'
  /** Mami açıkça temiz plaka dedi (`osTextMode: CLEAN`). */
  | 'mami_lock';

// ============================================================
// TYPED FACT REQUIRED — handoff §6 (TASK 3)
//
// Bir blocker, ajanın Mami adına DOLDURAMAYACAĞI eksik gerçeği tiplendirir. Site, runner,
// Claude ve Codex AYNI blocker'ı görür. Blocker'lı shot prompt üretmez; bağımsız shot ilerler;
// project source/hash sorunu TÜM projeyi durdurur. Ajan `allowedResolutions`'tan birini
// Mami adına SEÇEMEZ — yalnız Mami'nin ÖNCEDEN onayladığı `approved_fallback` uygulanabilir.
// ============================================================

/** Blocker'ın kapsamı: bir shot mu durur, tüm proje mi? */
export type BlockerScope = 'shot' | 'project';

/** Handoff §6'nın blocker sınıfları — her biri ajanın uyduramayacağı bir gerçek türü. */
export type BlockerCode =
  | 'BRAND_GEOMETRY'          // marka/logo/product geometry kaynakta yok
  | 'IDENTITY_UNRESOLVED'     // belirli/tekrar eden identity kilidi eksik
  | 'PERIOD_REGION_TRADITION' // dönem/bölge/gelenek bilgisi yok
  | 'EXACT_TEXT_REQUIRED'     // exact görünür text kararı verilmedi (DeliveryPromise ile köprülenir)
  | 'SOURCE_CLAIM_CHANGED'    // source iddiasını değiştiren eksik/çelişen gerçek
  | 'MAMI_LOCK_CONFLICT'      // iki Mami kilidi çelişiyor
  | 'DOSSIER_HASH_MISMATCH';  // eksik/değişmiş dossier veya approval hash'i

/** Bir blocker'ın çözüm yolu. Ajan bunu SEÇEMEZ — Mami'ye sunulur. */
export interface AllowedResolution {
  id: string;
  /** İnsan-okur açıklama: bu yolu seçmek ne demek. */
  label: string;
  /** Bu yol Mami'nin ÖNCEDEN onayladığı bir fallback mı? (approved_fallback) */
  preApproved: boolean;
}

/** Typed FACT REQUIRED — handoff §6 biçimi, birebir. */
export interface Blocker {
  scope: BlockerScope;
  code: BlockerCode;
  /** Hangi alan eksik/çelişkili (ör. 'cast', 'brandKitLock', 'deliveryPromise', 'sourceBeats'). */
  field: string;
  /** Neden durduğu — tek cümle, uydurma değil. */
  reason: string;
  /** Bu blocker'ı kaldırmak için Mami'den gereken TAM gerçek. */
  requiredEvidence: string;
  /** Mami'nin seçebileceği çözümler. Ajan SEÇEMEZ. */
  allowedResolutions: AllowedResolution[];
  /** Bu blocker neyi durduruyor: shot id'leri, ya da 'ALL' (tüm proje). */
  blocks: number[] | 'ALL';
}

/**
 * ⚠️ MAMİ KARARI (2026-07-15, kesin ve ürün-niyeti düzeyinde): **hiçbir ajan Mami adına seçim
 * yapmaz.** Bu yüzden otomatik `approved_fallback` YOKTUR; kritik/kozmetik ayrımı da yoktur.
 * HER blocker Mami'yi bekler. Ajanın rolü eksik gerçeği TİPLENDİRMEK ve DURMAK — doldurmak değil.
 */
export interface ConflictResolution {
  /** Üretim ilerleyebilir mi? (hiç blocker yoksa) */
  cleared: boolean;
  /** Mami'yi bekleyen TÜM blocker'lar — ajan hiçbirini kendi çözmez. */
  pending: Blocker[];
  /** Tüm projeyi durduran project-kapsamlı blocker var mı? */
  projectHalted: boolean;
  /** İlerleyebilecek bağımsız shot id'leri (yalnız shot-kapsamlı blocker'lar varken). */
  clearedShotIds: number[];
}

/**
 * Mevcut düz `{code, message}` bulgularını typed blocker'a köprüler. Her gerçek kapının
 * kodu handoff §6 sınıfına, kapsamına ve gereken kanıtına eşlenir. Eşlenmemiş bir kod
 * güvenli tarafta kalır: shot-kapsamlı, exact-text sınıfı değil, kritik kabul edilir.
 */
export function toBlockers(
  findings: Array<{ code: string; message: string; sceneId?: number }>,
  sceneIds: number[] = [],
): Blocker[] {
  const MAP: Record<string, { scope: BlockerScope; code: BlockerCode; field: string; evidence: string }> = {
    // DeliveryPromise — YALNIZ Mami'nin açık beyanının kendi içindeki tutarsızlığı (MACRO 1:
    // kaynak düzyazısından niyet çıkarılmaz; `ON_SCREEN_TEXT_INTENT` kodu kaldırıldı).
    DELIVERY_PROMISE_BROKEN: { scope: 'shot', code: 'EXACT_TEXT_REQUIRED', field: 'deliveryPromise', evidence: 'Beyanın her öğesi TAM metin + yüzey taşımalı; ya da beyanı düzeltin.' },
    DELIVERY_PROMISE_CONFLICT: { scope: 'shot', code: 'MAMI_LOCK_CONFLICT', field: 'osTextMode', evidence: 'CLEAN kilidini kaldırın ya da baked metin beyanını geri çekin.' },
    // Telif / kimlik (validateBriefCompatibility)
    CAST_IP_LEAK: { scope: 'shot', code: 'IDENTITY_UNRESOLVED', field: 'cast', evidence: 'Kadroyu özgün bir karakter olarak yeniden yazın (franchise adı çıkar).' },
    RECIPE_IP_LEAK: { scope: 'shot', code: 'IDENTITY_UNRESOLVED', field: 'recipeScenes', evidence: 'Korumalı eser/karakter adını dünyanın kendi diliyle değiştirin.' },
    CAST_REQUIRED: { scope: 'shot', code: 'IDENTITY_UNRESOLVED', field: 'cast', evidence: 'Kim görünüyor, nasıl giyinmiş — kadro alanını doldurun.' },
    // Kaynak
    SOURCE_NOT_INGESTED: { scope: 'project', code: 'SOURCE_CLAIM_CHANGED', field: 'sourceBeats', evidence: 'Raw Source Vault kayıpsız ingest edilmeli.' },
    // Dünya/path/malzeme uyumu (üretilebilirlik — dönem/gelenek sınıfına yakın)
    MATERIAL_WORLD_MISMATCH: { scope: 'shot', code: 'PERIOD_REGION_TRADITION', field: 'recipe', evidence: 'World ile uyumlu malzeme seçin (world-native).' },
    REGISTER_CONTAMINATION: { scope: 'shot', code: 'PERIOD_REGION_TRADITION', field: 'recipe', evidence: 'REAL path tactile malzeme kullanamaz.' },
    WORLD_PATH_MISMATCH: { scope: 'shot', code: 'PERIOD_REGION_TRADITION', field: 'selectedWorldId', evidence: 'Path ile uyumlu bir dünya seçin.' },
    RECIPE_RAW_HEX: { scope: 'shot', code: 'BRAND_GEOMETRY', field: 'recipeScenes', evidence: 'Ham hex yerine ışığın davranışını yazın.' },
    NO_WORLD: { scope: 'project', code: 'DOSSIER_HASH_MISMATCH', field: 'selectedWorldId', evidence: 'Bir vizyonel dünya seçin.' },
  };

  return findings.map((f) => {
    const m = MAP[f.code] ?? { scope: 'shot' as BlockerScope, code: 'DOSSIER_HASH_MISMATCH' as BlockerCode, field: 'unknown', evidence: 'Eksik gerçeği tamamlayın.' };
    return {
      scope: m.scope,
      code: m.code,
      field: m.field,
      reason: f.message,
      requiredEvidence: m.evidence,
      // Ajan hiçbirini Mami adına seçemez. Çözümler Mami'ye SUNULUR, ajan uygulayamaz.
      allowedResolutions: [
        { id: 'mami_provide', label: 'Mami gereken gerçeği verir', preApproved: false },
        { id: 'mami_withdraw', label: 'Mami isteği/kilidi geri çeker', preApproved: false },
      ],
      // Bloklanan sahne(ler):
      //   • project-kapsamlı → 'ALL' (tüm proje durur)
      //   • bulgu bir sahneye AİT (per-sahne ölçüm, f.sceneId var) → yalnız o sahne (Codex 5. tur:
      //     her bulguyu her sahneye atamak yanlıştı)
      //   • sahne id'si yok (kapı sahneler üretilmeden çalıştı, ör. contractGate) → 'ALL'
      blocks:
        m.scope === 'project'
          ? ('ALL' as const)
          : f.sceneId != null
            ? [f.sceneId]
            : sceneIds.length === 0
              ? ('ALL' as const)
              : sceneIds,
    };
  });
}

/**
 * Blocker'ları Mami'ye sunmak için düzenler. Otomatik geçiş YOKTUR (ajan Mami adına seçmez).
 * Yalnız kapsam ayrımı yapılır: bağımsız shot ilerleyebilir; project sorunu tüm projeyi durdurur.
 */
export function resolveBlockers(blockers: Blocker[], allShotIds: number[] = []): ConflictResolution {
  const projectHalted = blockers.some((b) => b.scope === 'project');
  const blockedShotIds = new Set<number>();
  for (const b of blockers) {
    if (b.scope === 'shot' && Array.isArray(b.blocks)) for (const id of b.blocks) blockedShotIds.add(id);
  }
  const clearedShotIds = projectHalted ? [] : allShotIds.filter((id) => !blockedShotIds.has(id));

  return {
    cleared: blockers.length === 0,
    pending: blockers,
    projectHalted,
    clearedShotIds,
  };
}

// ============================================================
// ŞEMALAR — handoff §5'in altı kanonik veri sözleşmesi
//
// "Canonical veri sözleşmesi" TASK 2'nin teslimidir: prodüksiyonun her aşamasının TİPLİ,
// hash'lenebilir, sınırları belli bir gövdesi olur. base-decision üretim anında yazılır
// (`commandExport`); diğerleri boru hattının sonraki kapılarında (storyboard onayı, frame
// receipt, state, closeout) bu tiplerle doldurulur. Şekiller burada — tek gerçek kaynak.
// ============================================================

export const SCHEMA_IDS = {
  baseDecision: 'mamilas.base-decision.v1',
  storyboardProposal: 'mamilas.storyboard-proposal.v1',
  decision: 'mamilas.decision.v1',
  receipt: 'mamilas.receipt.v1',
  state: 'mamilas.state.v1',
  closeout: 'mamilas.closeout.v1',
} as const;

export type SchemaId = (typeof SCHEMA_IDS)[keyof typeof SCHEMA_IDS];

/** Kaynak beat — sırası SEMANTİK (storyboard sırası), asla sıralanmaz. */
export interface DecisionSourceBeat {
  sourceId: string;
  exactText: string;
  hash: string;
}

/**
 * `mamilas.base-decision.v1` — prodüksiyonun KİMLİĞİ. Ne OLDUĞUNU taşır (kaynak, path, world,
 * material, palette, ref, model, kilitler, verilen söz); ne TÜRETİLDİĞİNİ (prompt, ajan görevi)
 * ya da NE ZAMAN olduğunu (timestamp) TAŞIMAZ. Aynı karar → aynı byte → aynı hash.
 */
export interface BaseDecision {
  schema: typeof SCHEMA_IDS.baseDecision;
  source: { authority: string; rawSource: string; rawHash: string; beats: DecisionSourceBeat[] };
  locks: {
    topic: string;
    productionPath: string;
    projectClass: string;
    projectId: string;
    musicId: string;
    world: string;
    material: string;
    palette: string;
    refs: string[];
    cast: string;
    brandKitLock: string;
    sceneCount: number;
  };
  engine: { imageModel: string; videoModel: string };
  mode: { workingMode: string; beatMode: string; osTextMode: string; voSyncMode: string };
  creativeControls: Record<string, string>;
  authored: { subject: string; location: string; sceneNotes: unknown[] };
  overrides: Array<{ sceneId: number; userImagePrompt?: string }>;
  deliveryPromise: DeliveryPromise;
}

/** `mamilas.storyboard-proposal.v1` — onay ÖNCESİ önerilen sahneler. Henüz karar değil. */
export interface StoryboardProposal {
  schema: typeof SCHEMA_IDS.storyboardProposal;
  baseDecisionHash: string;
  scenes: Array<{ id: number; sourceBeat: string; phaseName: string; onScreenText: string | null; durationSec: number }>;
}

/** `mamilas.decision.v1` — base-decision + ONAYLI storyboard. Üretime giden bağlayıcı karar. */
export interface Decision {
  schema: typeof SCHEMA_IDS.decision;
  base: BaseDecision;
  approvedStoryboardHash: string;
  commandId: string;
}

/** `mamilas.receipt.v1` — bir kareye/çıktıya bağlı makbuz. Frame gate'in hash'ine bağlanır. */
export interface FrameReceipt {
  schema: typeof SCHEMA_IDS.receipt;
  commandId: string;
  sceneId: number;
  frameHash: string | null;
  juryVerdict: 'PASS' | 'FAIL' | 'PENDING';
  mamiApproval: 'APPROVE' | 'REJECT' | 'PENDING';
}

/** `mamilas.state.v1` — yürütme durumu. Tek gerçek kayıt (markdown state'in tipli hâli). */
export interface StateEnvelope {
  schema: typeof SCHEMA_IDS.state;
  commandId: string;
  activeSceneId: number | null;
  receipts: FrameReceipt[];
}

/** `mamilas.closeout.v1` — nihai teslim. Tüm karar/receipt/verdict'lerin kapanışı. */
export interface Closeout {
  schema: typeof SCHEMA_IDS.closeout;
  commandId: string;
  decisionHash: string;
  receipts: FrameReceipt[];
  allFramesApproved: boolean;
}

/** Bir gövdenin beklenen şemayı taşıyıp taşımadığını söyler. */
export function isSchema<T extends { schema: SchemaId }>(value: unknown, id: T['schema']): value is T {
  return !!value && typeof value === 'object' && (value as { schema?: unknown }).schema === id;
}

// ============================================================
// CANONICAL HASH — kimlik karardan doğar, saatten değil
// ============================================================

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/**
 * Senkron, bağımlılıksız SHA-256 (UTF-8). `crypto.subtle` async'tir ve saf/senkron karar
 * yolunu kırar; `sourceHash` ise 32-bit FNV'dir — bir prodüksiyon kararının KİMLİĞİ için
 * çakışma payı fazla. Handoff §5 açıkça SHA-256 istiyor.
 */
export function sha256Hex(text: string): string {
  return sha256HexBytes(new TextEncoder().encode(text));
}

/**
 * Binary-safe SHA-256 (MACRO 5 — frame piksel hash'i). `sha256Hex` bunun UTF-8 sarmalayıcısıdır.
 * Mami'nin yüklediği PNG'nin gerçek bayt kimliği için gereklidir: `crypto.subtle` async'tir ve
 * test/saf yolu kırar; bu senkron ve bağımlılıksızdır.
 */
export function sha256HexBytes(bytes: Uint8Array): string {
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  new DataView(padded.buffer).setUint32(padded.length - 4, bitLen >>> 0, false);
  new DataView(padded.buffer).setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);

  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  const view = new DataView(padded.buffer);

  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15];
      const b = w[i - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
      const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e;
      e = (d + t1) >>> 0;
      d = c; c = b; b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }
  return h.map((x) => x.toString(16).padStart(8, '0')).join('');
}

/**
 * Kararı tek biçime indirger: stabil anahtar sırası · NFC · `undefined` düşer.
 *
 * Dizi sırası **semantikse korunur** (beat sırası anlamlıdır). Sırası anlam taşımayan
 * kümeler (ref seçimi) çağıran tarafından sıralanarak verilir — burada körlemesine
 * sıralamak beat sırasını bozardı.
 */
export function canonicalize(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value.normalize('NFC'));
  if (typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value === 'object') {
    // Anahtarlar SIRALAMADAN ÖNCE normalize edilir. Tersi yapılırsa NFD ve NFC yazılmış
    // aynı anahtar farklı sıraya düşer ve AYNI karar iki farklı hash üretir (Codex REJECT).
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k.normalize('NFC'), v] as const)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const seen = new Set<string>();
    for (const [k] of entries) {
      // Normalizasyon sonrası çakışan anahtar, kararın kendisinin belirsiz olduğu anlamına
      // gelir. Sessizce birini seçmek yerine durulur.
      if (seen.has(k)) throw new Error(`canonicalize: NFC sonrası çakışan anahtar: ${k}`);
      seen.add(k);
    }
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`).join(',')}}`;
  }
  return 'null';
}

/**
 * Karar setinin İÇERİK kimliği. Aynı kararlar → aynı byte → aynı hash.
 * Timestamp buraya GİRMEZ: `generatedAt` ayrı audit alanında yaşar.
 */
export function canonicalHash(decision: unknown): string {
  return sha256Hex(canonicalize(decision));
}

/** Kaynağın metni TALEP ETTİĞİ yerin makbuzu. Uydurulamaz — kaynakta yoksa promise doğmaz. */
export interface SourceSpan {
  sourceId: string;
  start: number;
  end: number;
  /** Talebi taşıyan cümlenin kendisi — karakter karakter. */
  exactText: string;
  hash: string;
}

export interface BakedTextItem {
  /** Karakter karakter. ASLA scrub, ASLA çeviri, ASLA kısaltma. */
  exactText: string;
  /** Metnin PİŞECEĞİ gerçek nesne. Yüzey yoksa bu bir overlay'dir → ihlal. */
  surface: string;
  /** Glif kilidi. 'tr' → ç Ç ğ ı İ ö Ö ş Ş ü Ü karakter karakter korunur. */
  language: 'tr' | 'en';
  /** Unicode normalizasyonu — hash ve karşılaştırma için tek biçim. */
  normalization: 'NFC';
  /** Kaynağın TAM YERİ — makbuz. */
  sourceSpan: SourceSpan;
}

/**
 * Karar anında kilitlenen söz. Yalnız Mami'nin AÇIK kaynaklarından doğar — düzyazıdan değil.
 *
 * `pedagogy_auto`: Mami beyan vermediğinde varsayılan. AUTO hiçbir source kelimesinden
 * görünür yazı çıkarmaz; yalnız açık Mami directive'i veya DENSE modu yazıyı açabilir.
 * `clean_plate`: dünya yasası ya da Mami'nin CLEAN kilidi. `baked_text`: Mami'nin açık beyanı.
 *
 * MACRO 1: `intent_pending` KALDIRILDI — "kaynak metin taşıyor olabilir" demek düzyazıdan
 * niyet çıkarmaktı; site bunu yapmaz. Kaynağın metin isteği AJAN'a brief içinde taşınır,
 * kare için orada uygulanır.
 */
export type DeliveryPromise =
  | { kind: 'clean_plate'; reason: CleanPlateReason }
  | { kind: 'pedagogy_auto' }
  | { kind: 'baked_text'; items: BakedTextItem[] };

export interface PromiseFinding {
  /** Yalnız Mami'nin AÇIK beyanının kendi içindeki tutarsızlığı/çelişkisi. Düzyazı niyeti DEĞİL. */
  code: 'DELIVERY_PROMISE_BROKEN' | 'DELIVERY_PROMISE_CONFLICT';
  message: string;
  /** Hangi sahneyi ihlal ediyor (per-sahne ölçüm). Yoksa batch-geneli (çelişki). */
  sceneId?: number;
}

// ============================================================
// Söz türetme — söz YALNIZ Mami'nin açık beyanından ya da CLEAN kilidinden doğar.
//
// MACRO 1 (Mami, 2026-07-15): kaynak DÜZYAZISINDAN text niyeti çıkaran her şey kaldırıldı —
// `fold`/`BAKE_AFTER`/`NEGATED`/`QUOTED`/`UNQUOTED_ON_SURFACE`/`splitClauses`/
// `detectOnScreenTextIntent`/`extractBakedTextRequests`. Site regex/NLP ile source'u analiz
// etmez ve üretimi bloke etmez. Kaynağın metin isteğini KARE'ye AJAN yazar (brief içinde,
// Mami'nin doğrudan talimatıyla). Aşağıdaki hash/glif yardımcıları YALNIZ beyandan söz
// üretirken kullanılır.
// ============================================================

/** Beyan edilen metnin makbuz hash'i — FNV-1a, `source.ts`'in `sourceHash` deseniyle aynı. */
function spanHash(text: string): string {
  let h = 0x811c9dc5;
  for (const ch of text.normalize('NFC')) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Metin Türkçe glif taşıyorsa dil kilidi 'tr' olur — Ç/Ş/Ğ/İ karakter karakter korunur. */
function languageOf(text: string): 'tr' | 'en' {
  return /[çÇğĞıİöÖşŞüÜ]/u.test(text) ? 'tr' : 'en';
}

/**
 * Sahnenin sözünü Mami'nin BEYANINDAN türetir — düzyazıdan DEĞİL (MACRO 1).
 *
 * - Mami CLEAN dediyse → temiz plaka (kilit).
 * - Mami baked beyanı verdiyse → baked_text (beyandan, karakter karakter).
 * - Mami clean beyanı verdiyse → temiz plaka (beyan).
 * - Beyan yok → `pedagogy_auto`: Mami'nin 2026-07-05 kilidi konuşur. Kaynak düzyazısı
 *   TARANMAZ; kaynağın metin isteği brief içinde AJAN'a taşınır, kare için orada uygulanır.
 *
 * `sourceText`/`sourceId` yalnız beyan makbuzunun kaydı için tutulur — hiçbir tarama yapılmaz.
 */
export function deriveDeliveryPromise(args: {
  sourceText: string;
  sourceId?: string;
  osTextMode?: 'AUTO' | 'DENSE' | 'CLEAN';
  declaration?: DeliveryDeclaration;
}): DeliveryPromise {
  const sourceId = args.sourceId ?? 'SOURCE';
  if (args.osTextMode === 'CLEAN') return { kind: 'clean_plate', reason: 'mami_lock' };

  if (args.declaration) {
    if (args.declaration.kind === 'clean') return { kind: 'clean_plate', reason: 'mami_lock' };
    // Yalnız GEÇERLİ öğeler söze girer: boş metin ya da boş yüzey bir söz değildir.
    const validItems = args.declaration.items.filter((it) => it.exactText.trim() && it.surface.trim());
    // GEÇERSİZ/BOŞ baked beyan içi boş `baked_text[]` ÜRETMEZ (Codex 4. tur: commandExport bunu
    // ihraç ediyordu). Beyan yokmuş gibi davranılır → pedagogy. `lockDeliveryPromise` ayrıca
    // `DELIVERY_PROMISE_BROKEN` ile beyanın kendi içindeki tutarsızlığı görünür kılar.
    if (!validItems.length) return { kind: 'pedagogy_auto' };
    return {
      kind: 'baked_text',
      items: validItems
        .map((it) => ({
          exactText: it.exactText.normalize('NFC'),
          surface: it.surface.trim(),
          language: it.language ?? languageOf(it.exactText),
          normalization: 'NFC',
          sourceSpan: {
            sourceId,
            start: 0,
            end: 0,
            exactText: it.exactText.normalize('NFC'),
            hash: spanHash(it.exactText.normalize('NFC')),
          },
        })),
    };
  }

  return { kind: 'pedagogy_auto' };
}

/**
 * Sözü KİLİTLER ve YALNIZ Mami'nin BEYANININ kendi içindeki tutarsızlığı görünür kılar:
 *  • `DELIVERY_PROMISE_CONFLICT` — Mami CLEAN kilidi verirken AYNI ZAMANDA baked beyanı da verdi.
 *  • `DELIVERY_PROMISE_BROKEN` — baked beyanı verildi ama geçerli tek bir öğe (tam metin+yüzey) yok.
 *
 * Kaynak DÜZYAZISI hiç taranmaz (MACRO 1). İki çelişki de yalnız Mami'nin kendi verdiği iki
 * açık kararın çeliştiği durumdur — ajanın Mami adına çözemeyeceği şey.
 */
export function lockDeliveryPromise(args: {
  sourceText: string;
  sourceId?: string;
  osTextMode?: 'AUTO' | 'DENSE' | 'CLEAN';
  declaration?: DeliveryDeclaration;
}): { promise: DeliveryPromise; findings: PromiseFinding[] } {
  const promise = deriveDeliveryPromise(args);

  // CLEAN kilidi ile açık baked beyanı Mami'nin AYNI ANDA verdiği iki çelişik karardır. Bu
  // çelişki, "beyan geçersiz" (BROKEN) kontrolünden ÖNCE gelir: CLEAN + baked'de promise zaten
  // clean_plate'e düşer, yani BROKEN dalı yanlış tetiklenirdi. Çelişkinin kendisi bildirilir.
  // (Kaynak düzyazısı taranmaz — yalnız iki açık Mami kararı çeliştiğinde tetiklenir.)
  if (args.osTextMode === 'CLEAN' && args.declaration?.kind === 'baked') {
    return {
      promise,
      findings: [
        {
          code: 'DELIVERY_PROMISE_CONFLICT',
          message:
            `Ekran metni kilidi CLEAN (temiz plaka), ama aynı zamanda baked metin beyanı verildi. ` +
            `İki söz aynı sahnede yaşayamaz — ya CLEAN kilidini kaldırın ya da metin beyanını geri çekin.`,
        },
      ],
    };
  }

  // Baked beyanı verildi ama GEÇERLİ tek bir öğe bile yok (boş liste / boş metin / boş yüzey).
  // Bu bir söz değildir — ölçülecek bir şey taşımaz. Sessizce geçemez (Codex 3. tur).
  if (args.declaration?.kind === 'baked' && (promise.kind !== 'baked_text' || promise.items.length === 0)) {
    return {
      promise,
      findings: [
        {
          code: 'DELIVERY_PROMISE_BROKEN',
          message:
            `Baked metin beyanı verildi ama geçerli tek bir öğe yok: her öğe hem TAM METİN hem de ` +
            `YÜZEY taşımalı (boş metin ya da yüzeysiz beyan bir overlay'dir, söz değildir).`,
        },
      ],
    };
  }

  return { promise, findings: [] };
}

// ============================================================
// Sözün ÖLÇÜLMESİ — prose uyarı değil, kapı
// ============================================================

/**
 * Verilen sözü İPTAL eden cümleler. Bunlar ölçüldü (gerçek `generateBatch`, TASK 1B):
 * termos prompt'u kaynağın baked-text isteğini bu iki bantla iptal ediyor.
 *
 * `NO floating UI or overlay text` BURAYA GİRMEZ — prompt hemen ardından
 * "any text is real printed diegetic matter" diyor, yani diegetik metni iptal etmiyor.
 * (Codex 5.6 Sol düzeltmesi, TASK 1B.)
 */
const CANCELLERS: Array<{ probe: RegExp; label: string }> = [
  { probe: /clean plate/iu, label: 'clean plate' },
  { probe: /do not render as on-screen text/iu, label: '[SOURCE — do not render as on-screen text]' },
  { probe: /carries no on-screen text/iu, label: 'this scene carries no on-screen text' },
];

/**
 * Sözü çıktıya karşı ölçer. İhlalde `DELIVERY_PROMISE_BROKEN` — `generateBatch`
 * bunu görünce SIFIR sahne döndürür (`validateBriefCompatibility` deseni).
 *
 * Prompt'un içine "DUR" cümlesi yazmak kapı DEĞİLDİR.
 */
export function validateDeliveryPromise(
  promise: DeliveryPromise,
  prompt: string,
  sceneId: number,
  onScreenText: string | null = null,
): PromiseFinding[] {
  const findings: PromiseFinding[] = [];

  // Söz yok (pedagogy) — ölçülecek bir şey yok. Ölçüm YALNIZ Mami açık beyan verdiyse çalışır
  // (clean_plate / baked_text). Kaynak düzyazısı üzerinden söz doğmaz (MACRO 1).
  if (promise.kind === 'pedagogy_auto') return findings;

  // Temiz plaka SÖZÜ de bir sözdür: verildiyse kareye metin pişemez.
  if (promise.kind === 'clean_plate') {
    if (onScreenText) {
      findings.push({
        code: 'DELIVERY_PROMISE_BROKEN',
        sceneId,
        message:
          `Sahne ${sceneId}: söz temiz plaka (${promise.reason}), ama sahne "${onScreenText}" metnini kareye pişiriyor.`,
      });
    }
    return findings;
  }

  const text = prompt.normalize('NFC');
  for (const item of promise.items) {
    // 1) Sözü TAŞIYOR MU? "İptal eden cümle yok" ile "söz tutuldu" aynı şey değildir —
    //    metni hiç anmayan bir prompt da sözü kırar (Codex REJECT).
    if (!text.includes(item.exactText)) {
      findings.push({
        code: 'DELIVERY_PROMISE_BROKEN',
        sceneId,
        message:
          `Sahne ${sceneId}: kaynak "${item.exactText}" metnini${item.surface ? ` "${item.surface}" yüzeyine` : ''} ` +
          `baked-in istiyor, ama prompt bu metni hiç taşımıyor.`,
      });
      continue;
    }
    // 2) Taşıyor ama İPTAL mi ediyor? Bugünkü hâl tam olarak budur.
    const cancelled = CANCELLERS.filter((c) => c.probe.test(text)).map((c) => c.label);
    if (cancelled.length) {
      findings.push({
        code: 'DELIVERY_PROMISE_BROKEN',
        sceneId,
        message:
          `Sahne ${sceneId}: kaynak "${item.exactText}" metnini${item.surface ? ` "${item.surface}" yüzeyine` : ''} ` +
          `baked-in istiyor, ama prompt bu sözü iptal ediyor (${cancelled.join(' · ')}). ` +
          `Kaynağın istediği metin sessizce düşürülemez — sözü tutan bir prompt üretilmeli ya da kaynak değiştirilmeli.`,
      });
    }
  }
  return findings;
}

// ============================================================================
// FABLE canlı bulgusu (Mami yaşadı, 2026-07-16): Reçete'nin "Subject/Konu" alanı
// doluysa projectTopic'i eziyordu — ama alanın VARSAYILANI da DEFAULT_PROJECT_TOPIC
// olduğu için hiç dokunulmamış alan, Mami'nin gerçek projesini ("Uzaya Giden
// Muhammet") sessizce ezdi: export dosya adı, locks.topic, projectId hepsi yanlış
// konudan türedi. Kural: yalnız Mami'nin GERÇEKTEN yazdığı subject ezer;
// dokunulmamış varsayılan asla ezmez. İki ezme noktası (commandExport.ts +
// pure.ts generateBatch) bu tek kanonu kullanır — ayrışırlarsa command ile batch
// farklı konu taşırdı.
// ============================================================================

export const DEFAULT_PROJECT_TOPIC = 'Su Döngüsü';

export function effectiveTopic(subject: string | undefined, projectTopic: string): string {
  const trimmed = (subject || '').trim();
  if (!trimmed || trimmed === DEFAULT_PROJECT_TOPIC) return projectTopic;
  return trimmed;
}
