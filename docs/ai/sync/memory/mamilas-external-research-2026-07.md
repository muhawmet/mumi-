---
name: mamilas-external-research-2026-07
description: "MAMILAS beyin katmanı için dış araştırma (2025-2026 web) — per-shot alan ayrıştırması, i2v disiplini, author→critic mimarileri, prompt bakımı. Kanon DEĞİL, çapraz-kontrol."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0a5ff116-ea31-406d-b313-17ed40d2af52
---

Ajan beyni inşası için toplanan dış araştırma (2026-07-16). **Kanon Mami'nin ölçümü; bu çapraz-kontrol.**
Çelişkide eski-hat ölçümü kazanır ([[mamilas-brain-intelligence-mined]]).

## Çekirdek doğrulama: per-shot alan ayrıştırması ENDÜSTRİ STANDARDI
Bağımsız yakınsayan kaynaklar (Codex'in `dominantSubject==event==ham cümle` yapması tam "YAPMA" denen şey):
- **Josh English** (medium, 2025-09): DoP-ajanı 9 alan → Subject/Action/Scene/Framing/CameraMove/LensEffects/VisualStyle/Time/Audio → tek Veo prompt. + critic-ajan (aesthetics/fidelity/motion/artifact/subject-integrity).
- **Higgsfield "Santiago"** (higgsfield.ai/blog/Santiago-breakdown): SHOT#/SUBJECT/ACTION(beat-by-beat)/CAMERA/STYLE/CONSTRAINTS. Asset'ler @-tag'li Element.
- **MindStudio** (2026-03): shot-list = shot-type/subject+action/setting+lighting/camera-move/duration/emotional-purpose. Prompt = `[Subject]+[Action]+[Setting]+[Lighting]+[Camera]+[Style]`.
- **Seedance skill** (Emily2040 github): Subject+Action+Scene+Camera+Light&Style+Audio+Constraints; "single visible beat" kapalı küme (reveal/arrival/decision/transformation/contact/pursuit/disappearance); directing-coherence testi.
- **video-notation-schema** (context-notation, Apache-2.0, JSON Schema 2020-12, ÜRETİM-KALİTE): scene.narrative_role enum, shot_parameters (camera_motion/angle/framing/focus enum'ları, lens_mm, aperture `^f/`), subjects[].action_details. → En iyi yeniden-kullanılabilir referans şema.
- **OpenMontage** `scene_plan.schema.json`: id/type/shot_language(shot_size/camera_movement/lens_mm/lighting_key/dof)/shot_intent/narrative_role/character_actions[]. AGPL — FİKİR al, kod alma (Mami kararı).
- **Murch "Rule of Six"** (In the Blink of an Eye): shot=idea, cut=blink. Öncelik: Emotion(51%)>Story(23%)>Rhythm(10%)>Eye-trace(7%)>2D-plane(5%)>3D-space(4%). "one idea per shot"un en sağlam çıpası — mekanik continuity anlamdan SONRA gelir (MAMILAS authority hierarchy'sine paralel).
- Geleneksel shot-list (StudioBinder/Boords/Celtx): shot#/scene#/size(WS-ECU)/angle/movement(pan/tilt/dolly/crane)/subject/action/lens/sound/duration. Scene = kararlı parent ID, harf-suffix (5A/5B) = coverage child. Animasyon panelleri LIVE-ACTION'dan DAHA detaylı (fiziksel set "bedava" bilgi vermez → açık yaz).

## t2i prompting (2025-2026 — ESKİ tavsiyeyi ters çeviren noktalar)
- **Tag-list ÖLDÜ** (vendor-confirmed Flux/NanoBanana/MJv7): "masterpiece/8k/UE5" kapasiteyi yakıyor, yönlendirmiyor. Natural-language cümle, subject-first. → MAMILAS tag-boilerplate kullanıyorsa modele karşı savaşıyor.
- **Flux**: kelime SIRASI ağırlık (erken token daha ağır): subject→action→style→context→detail. 20-150 kelime. **Negatif prompt YOK** (guidance-distilled) → dışlamayı pozitife çevir ("empty street", "no cars" DEĞİL).
- **Nano Banana**: 5 slot Style/Subject/Setting/Action/Composition. Edit modunda **son referans görselin aspect'ini alır** (zincirlemede gözden kaçar). Drift olursa zinciri bırak, taze başla.
- **MJv7**: kısa yüksek-sinyal ifade. `--cref` GİTTİ → **`--oref`** (Omni Ref, 2x maliyet). Negatif = gerçek `--no` (kelimeleri bağımsız okur).
- **Kamera/lens gerçek** ama tam fotoğrafik cümle içinde: "Shot on Fujifilm X-T5, 35mm f/1.4" > "professional photo". Lens+etki: "85mm → bokeh".
- **Plastik-sheen çözümü web'de HİPOTEZ (vendor doğrulamıyor)** → ama eski-hat ÖLÇTÜ. Web counter'ları: doku adlandır (gözenek/ince çizgi), "flawless/perfect" YASAK, film-grain/ISO, yönlü ışık.
- **Negatif compiler motora göre:** MJ `--no` var · Flux/NanoBanana yok (pozitif çevir). → MAMILAS engine-dialect'i gerçek per-engine negation compiler'a ihtiyaç duyar, tek negatif string değil.

## i2v motion (Kling3/Runway Gen4/Seedance2/Veo3.1)
- **Tek-hareketli-öğe disiplini YAYINLANMIŞ + anti-warping birincil kaldıraç** (folklor değil): "iki hareket = karışık sonuç; iki klip üret kes." → `mamilas-motion-author` tasarımı GÜNCEL DOĞRU.
- Kamera vocab tüm motorlarda: dolly/pan/tilt/tracking/static/handheld/crane/orbit. Kling yavaşı iyi, hızlı → warp.
- Morph/drift kök neden: aşırı rotasyon, karışık ref ölçekleri (portre vs full-body koordinat karıştırır), eşzamanlı değişim, büyük kompozisyon sıçraması. **Küçük genlik kimliği korur** (yüzde genlik sınırla). First/last-frame keyframe anchoring tek-anchor'dan güçlü.
- Rigidity dili ("metal deforme olmaz") Kling/Veo'da çalışır ama **Runway no-negatives ile çelişir** — evrensel değil.
- Klip pencereleri: Runway 5/10s · Veo3.1 4/6/8s (zincir ~148s bozularak) · Kling API 10s cap · Seedance sabit {4,5,6,8,10,12,15}. **4-6s güvenli default; karmaşıklık = açık temporal sıra, ASLA eşzamanlılık.**
- **Native audio 3 AYRI mimari, HİÇBİRİ voice-clone desteklemiyor**: Seedance (joint tek-geçiş), Veo3.1 (katmanlı, diyalog ~8s/satır), Kling (togglable). → ElevenLabs VO ayrı katman kalması DOĞRU; native audio = ortam/diegetik, senaryolu anlatım değil.

## Author→critic mimarileri
- **Anthropic "Building Effective Agents"**: evaluator-optimizer = generate+evaluate loop; net kriter + iterasyon değeri + stopping condition (max iter) şart.
- **Anthropic multi-agent research (üretim case)**: LLM-judge TEK çağrı 0.0-1.0 + pass/fail, 5 rubric boyutu. Failure: basit görevde aşırı-spawn; **denetimsiz evaluator sistematik zevk-çöküşü** (SEO çöp > akademik) yalnız MANUEL testle yakalandı → "manual testing remains essential."
- **RLAC (en güçlü hit):** critic falsifiable rubric-item önerir, DIŞ validator (self-grade değil) hükmeder. Statik rubrik çürür (42.3%→33.9%); adaptif/adversarial çürümez. Kalibrasyon: kriter→elle-notla→uyum-doğrula→cevabı-adversarial-düzenle-verdict-dönmeli. → `mamilas-qa-jury`'ye doğrudan uygulanır.
- Loop-prevention: 3-5 iterasyon default, çok-katmanlı termination (iter+bütçe+progress+escalation). MAMILAS zaten "en fazla 1 revision" ile daha sıkı.
- Görsel-medyada üretim generator+critic mimarisi YAYINLANMAMIŞ (Adobe/MJ yok) → MAMILAS state-of-art'ın gerisinde değil, state-of-art yayınlanmamış.

## Prompt bakımı
- Versiyonla: "prompt as code" (YAML frontmatter id/version/owner/status/eval_suite) ya da registry.
- Test: **promptfoo** (declarative YAML, CI-gated, deterministik + LLM-rubric). Model-under-test VE judge model versiyonunu pinle.
- Non-determinizm: **pass@k / pass^k** (en-az-bir vs hepsi-k). Dış motor güncellendiği için MAMILAS'a birebir uygun.
- DRY: prompt partial / named-slot composition → MAMILAS per-engine dialect + per-world render-lock injection'a birebir map. (render-law her sahnede 4x tekrar = bloat, DRY adayı — ama incelmesin, [[mamilas-brain-intelligence-mined]] render-lock-inceltme yasası.)
- Objektif metrik: Anthropic 8-boyut, her boyut ayrı judge çağrısı + "Unknown" kaçışı. Görsel-prompt için first-party metrik YOK → MAMILAS deterministik-plumbing + jury-verdict mimarisi gerçek boşluğu dolduruyor.

## Kaynak dosya (tam URL'ler)
Scratchpad: `research_synthesis.md` + task çıktıları. Anahtar repo'lar: context-notation/video-notation-schema (Apache-2.0),
Emily2040/seedance-2.0, calesthio/OpenMontage (AGPL-fikir), HL-hanlin/VideoDirectorGPT, HITsz-TMG/FilmAgent.
