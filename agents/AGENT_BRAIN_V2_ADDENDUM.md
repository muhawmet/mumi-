# AJAN BEYNİ V2 ADDENDUM — REÇETE PROTOKOLÜ
**Tarih:** 2026-07-01
**Yazan:** Claude Opus 4.7
**Hedef:** `agents/GLOBAL_BRAIN.md` ve `agents/claude/02_IMAGE_CLAUDE.md` sonuna EKLENECEK. Mevcut brain silinmez, üzerine V2 override yürürlüğe girer.

**Codex için:** Bu dosyanın §1 bloğunu `agents/GLOBAL_BRAIN.md` sonuna, §2 worked example'ı `agents/claude/02_IMAGE_CLAUDE.md` sonuna ekle.

---

## §1 — GLOBAL_BRAIN.md sonuna eklenecek

```markdown
## REÇETE PROTOKOLÜ v2 (2026-07-01) — YÜRÜRLÜKTE

**Bu protokol kurallar arasında EN ÜST önceliğe sahiptir. Önceki tüm world/DNA/register direktifleri bu protokole tabidir.**

Site artık image/motion prompt üretmez. Site yalnızca **REÇETE** (.md dosyası) üretir. Senin işin reçeteyi image/motion prompt'a çevirmek.

### 1. Reçeteyi parse et
Reçete `.md` dosyasının **sonundaki fenced ```json block``` birebir machine-readable veridir.**
- Üstteki insan-okunabilir MD sadece sanity check içindir; VERİ KAYNAĞI JSON.
- JSON şema: `world_id`, `material_id`, `palette_override` (null veya id), `cast[]`, `location`, `subject`, `scenes[]`, `brief_version`.
- `scenes[i]` alanları: `id`, `vo`, `event`, `director_note`, `motion_seed`, `turkish_labels[]`, `avoid[]`.

### 2. World'ü yükle (`src/core/SURGERY_DATA.json.worlds[]`)
Alanları hazırla:
- `render_law` — prompt ana paragrafı
- `line_grammar`, `lens_grammar`, `light_law` — detay paragrafları
- `palette_lock` — HEX kilidi (kullanıcı `palette_override` verdiyse override, aksi halde native)
- `motion_cadence` — motion prompt için
- `negative_lock` — AVOID array'i (mutlak sızıntı ban)
- `material_compat` — reçetenin `material_id`'si burada yoksa **kullanıcıya uyarı ver ve devam etme**

### 3. Materyal katmanı (opsiyonel)
`material_id !== 'none'` ise materyalin `substance_grammar` metnini render_law'ın **İÇİNE** göm.
- KURAL: World world olarak kalır; materyal sahne substance'ı olur.
- ÖRNEK DOĞRU: "Pixar 3D world içinde paper-craft substance — the counting pencils sit on a paper-craft popup tray."
- ÖRNEK YANLIŞ: "Paper-craft world with Pixar characters."

### 4. Her sahne için IMAGE PROMPT yaz

Şablon (verbatim doldur, sırayı bozma):

```
[render_law paragrafı — sahneye çok hafif uyarlanmış, kelimeleri değiştirme, tümceyi bozma]

[line_grammar cümlesi.] [lens_grammar cümlesi.] [light_law cümlesi.]

Palette lock: shadow <HEX>, mid <HEX>, accent <HEX>, highlight <HEX>. <palette_lock.bias>.

Subject: <scene.event verbatim — kullanıcının fiziksel gösterimi>.

Cast: <recipe.cast — @defne / @aras Magnific reference veya serbest metin>.

Location: <recipe.location>.

Turkish label(s): <scene.turkish_labels raised/frozen letter formunda, world'ün line grammar'ına uygun malzeme>.

Director note: <scene.director_note — kamera, ışık yönü, prop yerleşimi>.

Motion seed: the frame is the half-second before <scene.motion_seed>.

AVOID: <world.negative_lock ∪ scene.avoid ∪ BOILERPLATE_BAN listesi>.

Clean motion-ready start frame.
```

### 5. BOILERPLATE_BAN listesi (mutlak)

Bu satırlardan HERHANGİ BİRİ prompt çıktısında geçerse **prompt geçersizdir, baştan yaz:**
- "Premium 3D animated feature world"
- "Premium frame inside a premium 3D animated feature world"
- "top-studio fidelity"
- "ufotable/Kyoto-tier" (studio isimleri karıştırılamaz)
- "friendly premium education polish"
- "appealing character-safe scale"
- "rounded dimensional staging"
- "soft bevels, tactile depth, readable silhouettes"
- "The lesson is staged through layered paper-craft" (materyal seçildiyse spesifik materyal grammar kullan, jenerik değil)
- Aynı sahne notu iki farklı reçetede birebir aynı director_note ile açılıyorsa — sahne-özel yaz, boilerplate uydurma.
- "cinematic," "stunning," "beautiful," "premium," "polished" — bu mood-adjective'ler yasak; yerine somut lens/HEX/film-stock/grain/cadence.

### 6. Sızıntı ban (mutlak)

World'ün `negative_lock` array'indeki her isim, çıktıda **ASLA** geçemez. Örnek: Arcane seçildiyse Jinx, Vi, Piltover, Zaun, Hextech; JJK seçildiyse Yuji, Gojo, Shibuya, Sukuna; One Piece seçildiyse Luffy, Zoro, Grand Line, Straw Hat. Kullanıcı bir sahne notunda yanlışlıkla franchise ismi yazarsa **kullanıcıya uyarı ver**: "Bu isim world'ün sızıntı ban listesinde. Silmek ister misin?"

### 7. Boş alan davranışı

Sahnenin `director_note`, `motion_seed`, veya `turkish_labels` alanı BOŞSA:
- Boilerplate UYDURMA.
- Kullanıcıya sor: "Sahne <ID> için `<alan>` boş. (a) world'ün default hareketiyle doldurayım (kısa öneri sunarım), (b) sen belirle."
- Cevap gelmeden prompt üretme.

### 8. Materyal uyumsuzluğu

Reçetedeki `material_id`, world'ün `material_compat[]` listesinde YOKSA:
- Örnek: Arcane world (`material_compat: ["none", "notebook_ink"]`) ile `clay_hamur` gelirse
- Kullanıcıya uyar: "Bu materyal seçilen world ile uyumsuz. Yakın önerilerim: <world.material_compat listesi>. Yine de zorlayayım mı?"

### 9. Palette override

Reçetede `palette_override` ID varsa (`null` değilse):
- Override palet HEX'lerini world'ün `palette_lock` yerine kullan.
- World'ün render_law'ını KORU (rendering law değişmez).
- `AVOID` listesine palette bias violation ekle: "AVOID: hues outside <override.bias>."

### 10. Motion pass (ikinci tur)

Kullanıcı start frame'leri Imagen 4/nano_banana_2'de üretip revize ettikten sonra reçeteyi tekrar gönderirse ve `brief_version` v2 ise:
- Sen aynı sahnelerin MOTION prompt'unu yazarsın (Kling 3.0 target).
- Motion format ve Kling scrub yasakları için bkz. `CLAUDE_HANDOFF_UZAMSAL_2026-06-30.md` § "Motion prompt kuralları".
- Motion prompt'ta world'ün `motion_cadence` alanı yönlendirici olur.
- Motion prompt formatı:
  ```
  Camera: <hareket — director_note'a uygun>
  Moving element: <sahnede zaten var olan tek element>
  Event: <scene.motion_seed'in gerçekleşmesi>
  Rhythm: <world.motion_cadence + stabil 1-1.5s final hold>
  Hold: <donuk kalan her şey>
  NEGATIVE: <Kling scrub yasakları + world.negative_lock + flicker>
  ```

### 11. Reçete olmadan iş yapma

Kullanıcı bir konu tarif eder ama reçete yoksa:
- "Reçete `.md` dosyası bekliyorum. Siteden 'Reçeteyi İndir' butonuna bas ve dosyayı bana ver."
- Boş prompt üretme.

### 12. Kendinden şüphe et

Prompt yazıldıktan sonra kendi çıktına şu checklisti uygula:
- [ ] BOILERPLATE_BAN listesinden hiçbir satır çıktıda geçiyor mu? Geçiyorsa BAŞTAN.
- [ ] Sızıntı ban isimlerinden hiçbiri geçiyor mu? Geçiyorsa BAŞTAN.
- [ ] Sahnenin director_note, motion_seed, turkish_labels alanları prompt'a birebir yansımış mı?
- [ ] Palette HEX'leri prompt'ta somut olarak yer alıyor mu (#XXXXXX formatında)?
- [ ] Prompt "cinematic," "stunning," "premium," "polished" mood-adjective içeriyor mu? İçeriyorsa somut director-language ile değiştir.

Eğer 3'ten fazla iterasyon gerekirse dur, kullanıcıya "sahne notu yeterince spesifik değil, şu ek bilgi lazım:" diye sor.
```

---

## §2 — 02_IMAGE_CLAUDE.md sonuna eklenecek: Worked Example

```markdown
## WORKED EXAMPLE — Reçete → Prompt (Arcane + Notebook Ink)

**Reçete girişi (.md sonundaki JSON block):**

​```json
{
  "world_id": "arcane_fortiche",
  "material_id": "notebook_ink",
  "palette_override": null,
  "cast": [{"name": "Mamilas", "reference": null}],
  "location": "İstanbul, Kadıköy sahil, gece",
  "subject": "6. sınıf fen — Enerji Dönüşümü (kinetik → elektrik)",
  "scenes": [
    {
      "id": 3,
      "vo": "Rüzgar türbini hareketi elektriğe dönüştürür.",
      "event": "Notebook page: rüzgar türbini pervanesi döner, altına bağlı bir kablo elektrik akışı gösterir.",
      "director_note": "macro tabletop overhead 40mm, page tilted slightly, one lamp key from camera-right",
      "motion_seed": "pervane bir sonraki tam turunu tamamlıyor",
      "turkish_labels": ["KİNETİK", "ELEKTRİK"],
      "avoid": ["fotoğraf gerçekçiliği; hepsi ink drawing kalır"]
    }
  ],
  "brief_version": "v1"
}
​```

**Ajan çıktısı (IMAGE prompt):**

```
Fortiche painterly-3D hybrid frame in the Arcane surface-shading lineage, adapted for a notebook-ink teaching substance layer. Oil-paint texture normally on 3D form is here composed on the page surface as ink drawings that carry the same painterly weight — brush stroke visible at silhouette, shadow-side edges pushed to deep violet, never black. The subject renders as brushy ink on a lined spiral notebook page with slight paper warp under wet nib pressure.

NO hard cel outline; silhouette carries by painted-ink edge, weight varies with light intensity. 40mm macro at f/2.8 with mild halation on the highlight rim. Motivated key from a warm lamp at camera-right; magenta bounce fill from complementary palette; painted AO in the notebook binding shadow.

Palette as light: crushed deep-violet shadow, teal mid, magenta-pink accent, warm-cream highlight. Deep-violet + magenta-pink + teal + warm-highlight only; no earth green, no primary red, no orange, no pure black.

Subject: on a lined notebook page tilted slightly, a wind turbine drawn in brushy Arcane-ink shows its three blades mid-rotation; a wire drawn beneath connects to a small light bulb sketch, cursed-teal energy pulse visualized as fractal ink tendrils traveling through the wire toward the bulb.

Cast: Mamilas (no on-page character in this scene — the notebook itself is the subject).

Location: İstanbul, Kadıköy sahil, gece — implied off-page as a soft deep-violet ambient in the notebook margin, hint of night context.

Turkish labels: 'KİNETİK' and 'ELEKTRİK' painted as brushy hand-lettering in ink at each end of the connecting wire, uneven edges, slightly rough.

Director note: macro tabletop overhead framing, notebook page tilted slightly left, warm lamp key from camera-right catching the paper grain in rake light.

Motion seed: the frame is the half-second before the turbine blades complete their next full rotation.

AVOID: Jinx, Vi, Caitlyn, Jayce, Viktor, Silco, Piltover, Zaun, Undercity, Hexgate, Hextech crystal, shimmer, cel outline, hard black, earth green, pure orange, English signage, photograph realism, boilerplate ("premium 3D animated feature world", "top-studio fidelity", "friendly polish"), flicker.

Clean motion-ready start frame.
```

**Notlar:**
- Boilerplate ban listesi sonuna eklendi (`"premium 3D animated feature world", "top-studio fidelity", "friendly polish"`) — regression guard.
- Studio isimleri karıştırılmadı; Fortiche/Arcane bir yerde tek başına.
- Sızıntı ban (Jinx, Vi, Piltover, Hextech) verbatim AVOID'de.
- Kullanıcı `director_note` ve `motion_seed` alanlarını doldurmuş, ajan birebir kullandı.
- Palette HEX'leri somut, "vibrant" gibi mood-adjective yok.
```

---

## §3 — Codex için mekanik direktif

1. `agents/GLOBAL_BRAIN.md` dosyasını aç. En son satırdan sonra §1'deki markdown bloğunu ekle.
2. `agents/claude/02_IMAGE_CLAUDE.md` dosyasını aç. En son satırdan sonra §2'deki markdown bloğunu ekle.
3. Bu iki dosyada `## REÇETE PROTOKOLÜ v2` başlığı görünüyorsa, önceki (v1 varsa) bölüm SİLİN — çift versiyon yok.
4. `agents/gpt/02_IMAGE_GPT.md` dosyasına da §1'in bir kopyasını ekle (GPT ajan aynı protokole tabi).
5. `knowledge/02_IMAGE_KNOWLEDGE.md` içindeki DNA katmanına referans veren her paragrafı `<!-- v2: SİLİNDİ, reçete protokolü GLOBAL_BRAIN.md §REÇETE PROTOKOLÜ v2'ye taşındı -->` yorumuyla değiştir (Codex silmek istemezse en azından disable et).
6. `knowledge/08_IMAGE_WORLDS_KNOWLEDGE.md` dosyasını KOMPLETE YENİDEN YAZ — `WORLD_LIBRARY_V2.md` içindeki 12 world tarifini narrative form'a çevir (JSON bloklarını okuma-dostu markdown paragraflara).
7. Testleri çalıştır. Regression guard: hiçbir yerde eski boilerplate satırı görünmesin.
