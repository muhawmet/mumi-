# MAMILAS 3D Shell — "AI Yönetmen Vizörü" Görsel Dil Kilidi (2026-07-11)

Fable ile 6 demoluk keşif turunun sonucu. Bu doküman **entegrasyon fazının kaynağıdır.**
Demolar: `docs/superpowers/specs/2026-07-11-shell-demos/` (a–f `.jpg` görsel kayıt; c/e/f `.html` teknik referans).

## Yolculuk (elenen yönler — tekrar deneme)
- **A/B** ("içine girdiğin oda" / "ışık masası", CSS painterly) → **RED: "çok demode + işimle alakasız"** (sıcak atölye / yağlıboya galeri metaforu). *inherited-humming-petal "Işıklı Atölye" planı da bu redle ÖLDÜ.*
- **C/D/E** ("AI yönetmen konsolu / komuta güvertesi / tam-ekran 3D", gerçek three.js) → **RED: "çok Mr. Robot"** (terminal HUD, monospace, otorite-hiyerarşi listeleri, motor-zinciri chip'leri = techy/hacker dashboard). E "çok daha 3D"yi verdi ama yine techy.
- **F** ("sanat işi" pivot, Turner golden-hour tableau) → **DİL KİLİTLENDİ.** Ama Mami: *"F inanılmaz AMA daha kullanışlı olsun."* F poster/kapak tarafına savurdu, çalışma yoğunluğu yok.

## KİLİTLİ GÖRSEL DİL (F'den — kuzey yıldızı)
- **Painterly / museum-grade / "tablo gibi"** — dashboard/terminal DEĞİL, bir sanat eseri gibi okunur.
- **Altın saat sıcak palet** (Turner golden-hour: kehribar→altın→sıcak alacakaranlık). Vizyon+renk C'den beri sabit.
- **Editorial serif tipografi** (Fraunces vb. italik display), cömert boşluk, sessiz zarafet. Monospace/HUD YOK.
- **Işık = medyum.** Felsefe cümlesi: *"Işıktan bir film doğar. Makine yalnızca fırçadır; el, yönetmenindir."*
- **Gerçek 3D derinlik** (three.js): tam-ekran dünya, parallax, DOF, atmosferik sis, god-ray, ön-plan bokeh occluder. Düz SVG/karikatür DEĞİL.
- **AI-yönetmen ruhu** ELEGAN ifade edilir (techy değil): worldlar = ışıkta süzülen minyatür tablolar/aylar; "AI seti dokuyor" anı (wireframe→materyalize) sanatsal.

## YASAKLAR (kilit)
- ❌ Techy/Mr.Robot: terminal HUD, monospace veri dökümü, otorite-listesi, motor-chip'leri dekor olarak.
- ❌ Demode-antika: ahşap atölye, yağlıboya galeri duvarı, pirinç aplik.
- ❌ Disco Elysium estetiği (Mami kalıcı yasak).

## ENTEGRASYON HEDEFİ (asıl iş — "daha kullanışlı")
F'nin dilini **gerçek çalışma ekranlarına** giydir: **yoğun AMA sanatsal** (güzel bir sanat-kitabı sayfası gibi — bilgi dolu ama zarif; terminal değil). Her çalışma ekranı gezilebilir/işlevsel kalmalı.

### Bozulmayacak (determinizm — Mami sert kuralı)
- Karar akışı SABİT: **Brief → Reçete → Sahneler → Timeline → QA** (wizard→recipe→brief→export pipeline; decode/generateBatch akışı). Sadece görsel/3D katman değişir, fonksiyonel karar akışı AYNEN korunur.
- Palet = fiziksel ışık dili (ham hex prompta/ekrana sızmaz). TR UI. Telif firewall'u. On-screen text yasası.
- 943 test tabanı düşmez; tsc 0; build OK; `.command` syntax OK (mamilas-gate her commit).

### Teknik plan (taslak — writing-plans ile detaylandırılacak)
1. three.js sahnesini **R3F**'e çevir (mevcut `src/scene/` SceneLayer/DioramaStage/CameraRig/PostFX/lookConfig otoritesini kullan; F/C/E HTML'leri referans).
2. Mevcut `lookConfig.ts` LOOK'u altın-saat painterly banda taşı (fog/ambient/clearColor/god-ray/DOF).
3. Panelleri (Recipe/Director/Scenes/Timeline/QA) F-diline giydir — editorial serif, sessiz, painterly cam; techy HUD sökül. GERÇEK veriyle bağlı kalsın (Zustand store, worldCovers, DNA, gates).
4. Sahne-sahne: **Reçete'den başla** (hero, en olgun demo C/E'de). Sonra Brief giriş, Sahneler, Timeline, QA.
5. Her sahne: subagent-driven (implementer→spec→quality) → mamilas-gate + `?scene=force` ekran kanıtı → commit (spesifik dosya, push YOK) → Mami'ye screenshot.

## Model/usage disiplini
- **Fable DURDU** (dil kilitlendi; pencere ~17 Tem; usage yakında resetlenecek — Mami rahat). Bundan sonrası **Opus orkestra + Sonnet mekanik alt-ajan.** Fable'a dönme (drift + pahalı).
- Entegrasyonu **yalın context**'te koş (mikro-adımda 1M context yakma). Screenshot aracı: `scratchpad/shoot-demo.mjs` (playwright abs-import, swiftshader WebGL) — repoya `scripts/`e alınabilir.
- Yedek dal: `backup/pre-fable-3d-ui-20260710` @ `9541913`.

## Mevcut UI gerçeği (baseline)
"Işıklı Atölye" T0–T6 zaten inmiş (commit `e08568b`→`8378b93`); site bugün düzgün amber stüdyo konsolu — ama 3D karanlık/görünmez, sağ ray her ekranda statik, techy değil ama "görsel şölen" de değil. Bu redesign onun ÜSTÜNE gelir (sıfırdan değil).
