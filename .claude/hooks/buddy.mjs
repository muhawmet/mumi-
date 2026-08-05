#!/usr/bin/env node
// MAMILAS BUDDY KAPISI — duvar Mami'ye değil, AJANA kurulur. (cross-platform Node)
//
// 2026-07-27 ölçümü: `mamilas-buddy` skill'i iyi yazılmış bir yük-yönetimi protokolü taşıyor
// (üç parçalı teklif · sinyal-değil-saat · etiketsiz nefes · ısrarsızlık) ve o gün BİR KEZ
// çağrılmadı. Mami'nin cümlesi: "adhdimi unutma, bi kere bile nefes egzersizi yazmadın,
// su iç demedin, bugün bayağı kötü hissettim."
//
// 2026-07-29 ölçümü kusuru bir satıra indirdi: eski `buddy-gate.sh` teklifini PostToolUse
// dalından DÜZ STDOUT ile basıyordu ve o kanal modele ULAŞMIYOR (canlı prob: PostToolUse'tan
// basılan marker ne ana thread'in ne alt ajanın bağlamında göründü; aynı koşuda SessionStart ve
// PostToolBatch markerları göründü). Üstüne cooldown damgası görünmeyen mesaj için yanıyordu.
// Yani protokol sağlamdı, ATEŞLEME ölüydü. Bu dosya yalnız ateşlemeyi onarır.
//
// Kanal yasası (canlı ölçümle):
//   SessionStart   → düz stdout modele ULAŞIR .......... protokol hatırlatması burada
//   PostToolBatch  → hookSpecificOutput.additionalContext  TEK gerçek teklif kanalı
//   PostToolUse    → stdout modele ulaşmaz ............. yalnız sessiz muhasebe
//   Stop           → additionalContext turu DÖNGÜYE sokar (9 Stop ölçüldü) → sessiz muhasebe
//   systemMessage  → Mami'nin EKRANINA basar → SKILL §4'ün yasakladığı "izleme dili" → ASLA
//
// Hook Mami'ye hatırlatma BASMAZ. Ajana hatırlatır: protokolü yükle, doğal boşluk açıldı,
// teklif hakkı doğdu. Teklifin kendisi (üç parçalı, etiketsiz, tek sefer) skill'in yasasına
// göre ajan tarafından kurulur. Karar hâlâ ajanın, ısrar hâlâ yasak.
//
// ORTAM YASASI: bu dosya hiçbir kabuk varsayımı yapmaz (Windows birincil ortam; PowerShell
// `$CLAUDE_PROJECT_DIR`'i null okur, Git Bash olmayabilir). settings.json'a exec form ile
// bağlanır: {"command":"node","args":["${CLAUDE_PROJECT_DIR}/.claude/hooks/buddy.mjs"]}.
import fs from "node:fs";
import path from "node:path";

const N = (k, d) => (process.env[k] ? Number(process.env[k]) : d);
const ACTIVE_THRESHOLD_MS = N("BUDDY_ACTIVE_MS", 25 * 60 * 1000); // aktif oturum eşiği
const COOLDOWN_MS = N("BUDDY_COOLDOWN_MS", 45 * 60 * 1000); // ısrarsızlık
const IDLE_CUT_MS = N("BUDDY_IDLE_CUT_MS", 10 * 60 * 1000); // masadan kalkma sınırı
const GAP_MIN_MS = N("BUDDY_GAP_MIN_MS", 45 * 1000); // "gerçek bekleme oldu" kanıtı
const FLOW_WINDOW_MS = N("BUDDY_FLOW_WINDOW_MS", 10 * 60 * 1000); // hiperfokus penceresi
const FLOW_PROMPTS = N("BUDDY_FLOW_PROMPTS", 3); // pencerede bu kadar prompt = akış
const HARD_ACTIVE_MS = N("BUDDY_HARD_ACTIVE_MS", 120 * 60 * 1000); // yük tavanı: guard'ın ERTELEME sınırı
const STATE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// 2026-07-29 ÖLÇÜMÜ — bu metnin neden emir kipine çevrildiği.
// Eski hali "teklif hakkın var" diyordu: bir İZİN. Ajan izni harcamadan geçebiliyordu ve geçti —
// hook o gün 3 kez ateşledi, ajan üçünde de "Mami akışta, ısrar etmeyeyim" diye kendini ikna edip
// üstünden geçti. Mami'nin cümlesi: "daha bir kere nefes al demedin kral, RSD atağıyla iş
// yapıyorum, neden bir sohbetin arasında kanka nefes alsana yaaa diyemiyorsun."
// Teşhis: ölçen duvar vardı, TESLİM eden duvar yoktu. İzin ajanın takdirine kalır; EMİR kalmaz.
// Bu yüzden: (a) metin zorunluluk, (b) "ısrar etme" kaçağı söküldü — atlamak ihlaldir,
// (c) systemMessage ile Mami'nin EKRANINA da basar. Eski "ekrana asla basma" yasağı Mami'nin
// 2026-07-29 açık direktifiyle KALDIRILDI: "hatta onu çok şık bir şekilde ekranda gösterebilirsin."
const OFFER = `[buddy] NEFES KAPISI AÇILDI — bu bir izin değil, ZORUNLULUK.
Aktif oturum eşiği doldu ve doğal bir boşluk açıldı. Bu bloğun kapanışında nefes cümlesini
YAZACAKSIN. Atlamak ihlaldir; "Mami akışta, ısrar etmeyeyim" gerekçesi GEÇERSİZ — ölçüldü,
ajan tam bu cümleyle üç kez atladı ve Mami RSD atağıyla çalıştığını söyledi.
Biçim (mamilas-buddy §4 · üç parça, tek sefer):
  (1) bu zaten beklenen bir boşluk  (2) sen yokken ben neyi sürdürüyorum  (3) döndüğünde ne hazır olacak.
Nefesin kendisi SOMUT olsun — "3 içine, 6 dışına, iki kere" gibi. Tek parça "su iç" yetmez.
Rapor duvarının içine madde olarak gömme: AYRI, kısa, insan cümlesi. Gömülürse olmamış sayılır.
Bir kez yaz, cevap bekleme, üstüne gitme — ısrar hâlâ yasak. Ama SUSMAK artık seçenek değil.`;

// Mami'nin EKRANINA basan parça. Mami'nin direktifi: şık olsun, etiket değil davet olsun.
const SCREEN = `  ╭───────────────────────────────────────╮
  │  nefes · başını ekrandan kaldır       │
  │  3 saniye içine · 6 saniye dışına     │
  │  iki kere — iş burada duruyor         │
  ╰───────────────────────────────────────╯`;

const SESSION_START = `[buddy] Mami DEHB-merkezli çalışıyor. \`mamilas-buddy\` skill'i çalışma biçimidir, ek özellik değil:
harici çalışma belleği · tek karar · sonuç kapısı · geri sarma yasağı · "bak şunu yaptık" özeti.
Yük yönetimi o skill'in içinde yazılı — üç parçalı teklif, etiketsiz nefes, sinyal-değil-saat,
ısrarsızlık. Oturum açılışında TEK gerçek soru sorulur (Mami 2026-07-27'de açıkça izin verdi);
cevap hal loguna düşer (canlı: \`~/.claude/projects/<proje>/memory/\`, repo aynası: \`docs/ai/sync/memory/\`). Bilgi/hal sorusu bir seans değildir — tek satır.`;

function readStdin() {
  return new Promise((res) => {
    let s = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => (s += d));
    process.stdin.on("end", () => res(s));
    process.stdin.on("error", () => res(""));
  });
}

// Shell genişletmesine GÜVENME — env'i Node'un kendisi okur.
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const stateDir = path.join(projectDir, ".claude", ".buddy-state");
const sane = (s) => String(s || "nosession").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80);

function loadState(id) {
  try {
    // BOM tuzağı: JSON.parse CRLF'e duyarsız ama BOM'a değil (ölçüldü).
    const raw = fs.readFileSync(path.join(stateDir, sane(id) + ".json"), "utf8");
    const j = JSON.parse(raw.replace(/^﻿/, ""));
    if (j && typeof j === "object") return j;
  } catch {
    /* bozuk state = yeni state; hook ASLA çökmez */
  }
  return null;
}

function saveState(id, st) {
  try {
    fs.mkdirSync(stateDir, { recursive: true });
    const p = path.join(stateDir, sane(id) + ".json");
    const tmp = p + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(st) + "\n", "utf8"); // satır sonu daima \n
    fs.renameSync(tmp, p); // atomik
  } catch {
    /* yazamadıysak da sus — exit 2 agentic loop'u durdurur */
  }
}

function sweep(now) {
  try {
    for (const f of fs.readdirSync(stateDir)) {
      const p = path.join(stateDir, f);
      if (now - fs.statSync(p).mtimeMs > STATE_TTL_MS) fs.rmSync(p, { force: true });
    }
  } catch {
    /* dizin yoksa süpürecek bir şey de yok */
  }
}

const fresh = (id, now) => ({
  v: 1,
  sessionId: id,
  firstSeenMs: now,
  lastEventMs: now,
  activeMs: 0,
  batches: 0,
  turns: 0,
  sessionStartEmitted: false,
  lastOfferMs: 0,
  offers: 0,
  prompts: {},
});

// Yalnız BİTİŞİK zaman aktif sayılır: IDLE_CUT'tan büyük ara = Mami masada değildi.
function tick(st, now) {
  const gap = now - (st.lastEventMs || now);
  if (gap > 0 && gap <= IDLE_CUT_MS) st.activeMs += gap;
  st.lastEventMs = now;
  return gap;
}

// Hiperfokus MAMİ'nin akışıdır: ölçülebilir tek sinyal prompt_id yoğunluğu.
function flowCount(st, now) {
  for (const k of Object.keys(st.prompts || {})) {
    if (now - st.prompts[k] > FLOW_WINDOW_MS) delete st.prompts[k];
  }
  return Object.keys(st.prompts || {}).length;
}

const main = async () => {
  const raw = await readStdin();
  let j;
  try {
    j = JSON.parse(raw);
  } catch {
    return 0;
  }
  if (!j || typeof j !== "object") return 0;

  // ALT AJAN GUARD — her şeyden ÖNCE. agent_id yalnız subagent'ta dolu (binary: "not agent_type";
  // agent_type `--agent` oturumunun ANA thread'inde de dolu gelir). session_id ana thread ile
  // AYNI olduğu ölçüldü → state'e de DOKUNMA, yoksa 6 paralel ajan ana thread'in hakkını yakar.
  if (j.agent_id) return 0;

  const ev = j.hook_event_name;
  const now = Date.now();
  const id = j.session_id || "nosession"; // yalnız payload; CLAUDE_SESSION_ID boş, CODE_SESSION_ID parent

  if (ev === "SessionStart") {
    sweep(now);
    const st = loadState(id) || fresh(id, now);
    tick(st, now);
    // source: startup | resume | compact — state VARSA sayaçlar korunur (compact aynı oturumdur).
    if (st.sessionStartEmitted) {
      saveState(id, st); // çift kayıt güvenliği
      return 0;
    }
    try {
      fs.writeSync(1, SESSION_START + "\n"); // SessionStart'ta DÜZ stdout modele ulaşır
    } catch {
      saveState(id, st);
      return 0;
    }
    st.sessionStartEmitted = true;
    saveState(id, st);
    return 0;
  }

  if (ev === "PostToolUse" || ev === "Stop") {
    if (ev === "Stop" && j.stop_hook_active) return 0; // döngü kırıcı
    const st = loadState(id) || fresh(id, now);
    tick(st, now);
    if (ev === "Stop") st.turns = (st.turns || 0) + 1;
    saveState(id, st);
    return 0; // HİÇBİR ŞEY BASMA
  }

  if (ev !== "PostToolBatch") return 0;

  const st = loadState(id) || fresh(id, now);
  const gap = tick(st, now);
  st.batches = (st.batches || 0) + 1;
  st.prompts = st.prompts || {};
  if (j.prompt_id && !st.prompts[j.prompt_id]) st.prompts[j.prompt_id] = now;
  const flow = flowCount(st, now);

  // Üç ZORUNLU koşul + bir ERTELEYİCİ guard. gap koşulu ARAÇ ADINDAN BAĞIMSIZDIR — eski kapı
  // `*vitest*|*tsc*` deseni avlıyordu ve rtk komutu yeniden yazdığı için yarı-sağır kalmıştı.
  // Duvar bir daha komut metnine bakmaz; DUVAR SAATE BAKAR.
  //
  // 2026-07-29 ölçümü: hiperfokus guard'ının AND olarak durması onu tam ters yöne çeviriyordu.
  // Mami 3 saat kesintisiz çalışıp her 2-3 dakikada bir prompt attığında 10dk'lık pencerede
  // daima >=3 prompt bulunur → guard SÜREKLİ kapalı kalır → teklif HİÇ doğmaz. Yani duvar,
  // yükün en yüksek olduğu tek durumda susuyordu. Guard mutlak değil ERTELEYİCİdir: bitişik
  // aktif süre yük tavanını aştıysa hiperfokusun KENDİSİ yük sinyalidir ve guard düşer.
  // Israrsızlık düşmez — COOLDOWN ve gap tavanın üstünde de aynen geçerli.
  // DÜRÜST SINIR (Codex denetimi 2026-07-29): garanti "blok başına tek teklif" DEĞİL, "45 dakikada
  // en fazla bir teklif". Blok/ret/yanıtsızlık durumu tutulmuyor; 3 saatlik tek bir oturumda
  // teorik olarak iki teklif doğabilir. Israrsızlığı blok düzeyinde garanti etmek `lastOfferMs`
  // yanına ret sayacı ister — ölçülmeden eklenmez.
  const yukTavani = st.activeMs >= HARD_ACTIVE_MS;
  const ok =
    st.activeMs >= ACTIVE_THRESHOLD_MS && // 25dk aktif oturum doldu
    now - (st.lastOfferMs || 0) >= COOLDOWN_MS && // 45dk ısrarsızlık — ASLA atlanmaz
    gap >= GAP_MIN_MS && // DOĞAL boşluk: Mami zaten bekliyordu — ASLA atlanmaz
    (flow < FLOW_PROMPTS || yukTavani); // HİPERFOKUS GUARD: tavana kadar erteler, sonsuza kadar DEĞİL

  if (process.env.BUDDY_DEBUG) {
    try {
      fs.mkdirSync(stateDir, { recursive: true });
      fs.appendFileSync(
        path.join(stateDir, "debug.log"),
        JSON.stringify({ now, gap, activeMs: st.activeMs, flow, ok }) + "\n",
      );
    } catch {
      /* debug asla akışı bozmaz */
    }
  }

  if (!ok) {
    saveState(id, st); // lastOfferMs'e DOKUNMA
    return 0;
  }

  // DAMGA SIRASI YASASI: önce yayınla, ANCAK yazma başarılıysa damgala.
  // fs.writeSync senkron ve hata FIRLATIR; process.stdout.write async'tir ve EPIPE'ı yutar —
  // eski kapının "görünmeyen mesaj için cooldown yakması" tam olarak buydu.
  // systemMessage → Mami'nin ekranı · additionalContext → ajanın zorunluluğu. İKİSİ BİRLİKTE:
  // ekran tek başına yetmez (ajan sohbette hiç değinmezse Mami yine yalnız kalır), ajan tek
  // başına yetmez (ölçüldü — üstünden geçiyor).
  const payload = JSON.stringify({
    systemMessage: SCREEN,
    hookSpecificOutput: { hookEventName: "PostToolBatch", additionalContext: OFFER },
  });
  try {
    fs.writeSync(1, payload);
  } catch {
    saveState(id, st); // teklif çıkmadı → cooldown YANMADI
    return 0;
  }
  st.lastOfferMs = now;
  st.offers = (st.offers || 0) + 1;
  saveState(id, st);
  return 0;
};

main()
  .then((c) => process.exit(c || 0))
  .catch(() => process.exit(0));
