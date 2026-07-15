# MAMILAS Pedagogy Knowledge — Teaching Without a Teacher

This file teaches MAMILAS agents how to produce videos that genuinely educate,
even when the creator is not a professional teacher. Read this alongside
`GLOBAL_BRAIN.md § 10. Pedagogy Protocol`.

## The Core Problem

A non-teacher producer tends to:
1. Put narration on screen (doubling the audio — learner reads instead of listens)
2. Show something decorative while narrating something specific (VO-visual split)
3. Add text to every scene, which fatigues the viewer
4. Describe *what* to do without showing *how* it works

MAMILAS solves this by treating every educational video as a 4-phase teaching
arc and assigning each phase a specific visual and textual contract.

## The 4-Phase Teaching Arc

### Phase 1 — Intro (Anchor)
**Goal:** Orient the learner. Name the concept before demonstrating it.
**Visual contract:** The subject is visible, labelled, and ready. Think "concept
map" — all parts visible before movement begins.
**On-screen text:** The concept term (1–3 words). LABEL style. Bottom-center.
This is the learner's orientation anchor.
**VO role:** Introduce the topic. Match what's on screen — do not narrate the
mechanism yet.

### Phase 2 — Build-up (Mechanism)
**Goal:** Show the cause-effect relationship in action.
**Visual contract:** One mechanism, one cause-effect cycle. The moving element
is named in the CONCEPT line. Everything else is still.
**On-screen text:** NONE. This is the most important rule in educational video.
If text appears during a mechanism demonstration, the learner reads instead of
watching the causal chain. The eye cannot follow motion and read simultaneously.
**VO role:** Narrate the mechanism step by step. The visual is doing the heavy
lifting; VO describes *why*, not *what*.

### Phase 3 — Climax (Proof)
**Goal:** Show the result. The consequence is already visible — the learner
sees it happen, not told about it.
**Visual contract:** The proof marker appears *after* the result is established.
The scene should feel like a conclusion arriving, not a claim being made.
**On-screen text:** The proof label (1–2 words). BOLD style. Bottom-center.
Example: "Sonuç →", "Onaylandı", "Etki".
**VO role:** Name the outcome. Short. The visual already showed it.

### Phase 4 — Resolution (Takeaway)
**Goal:** Give the learner one thing to leave with.
**Visual contract:** The completed system, settled and readable. No new
information. This frame should feel like exhaling.
**On-screen text:** The takeaway phrase (2–4 words). TITLE style. Center.
Full-scene duration. Example: "Güvenli Bakım", "Kural: Önce Kaynak".
**VO role:** State the takeaway. Match the on-screen text in spirit (not word-
for-word) — reinforce without repeating.

## VO-Visual Alignment Rules

The #1 complaint in educational video production: "what you're saying isn't
what you're showing." MAMILAS fixes this with Narration Sync.

### When NARRATION SYNC: FREE (default)
The agent chooses the best visual metaphor for the concept. The scene's
CONCEPT and EVENT drive the image — the exact VO wording is secondary.
Good for stylized and story-driven productions.

### When NARRATION SYNC: LOCKED
The image must physically depict what the VO_ANCHOR line says.
- Concrete nouns → show the object
- Verbs → show the action in progress or completed
- Abstract concepts → choose the most concrete physical form (a scale for
  justice, a handshake for agreement, a broken chain for freedom)
No decoration may substitute for the narrated subject.

## On-Screen Text Anti-Patterns

Avoid these in every educational video:

| Pattern | Why It Fails |
|---|---|
| Full sentences on screen | Learner reads, stops watching |
| Text on every scene | Desensitization — text becomes invisible wallpaper |
| Text during mechanism (Build-up) | Eye cannot follow motion AND read |
| VO and text say the exact same thing | Redundancy signals low production quality |
| Text too small to read in 3s | Decoration, not communication |
| Text too large (covers the visual) | Destroys the visual teaching channel |

## Start Frame Text Instructions

The site exports a `== START FRAME TEXT (sahneye işlenmiş) ==` block in every
brief. Each line describes text that is **baked into the start frame image** —
not added as an overlay in post-production.

```
[n] Phase      → "Text" — start frame'e baskılı (Kling korur)
[n] Phase      → NO_TEXT  (görsel anlatıyor)
```

**Why baked, not overlay?** Video motion engines (Kling, Seedance) animate the
start frame as a physical snapshot. Text that exists in the start frame geometry
is treated as frozen structure and preserved through motion. Text added in
post-production (After Effects overlay) must be manually tracked and keyed —
extra work, and the engine has no knowledge of it. Baking is always more robust.

**Style contract (for image prompt generation):**
- Bottom-center safe area, clean legible font matching the world's visual grammar
- Intro (LABEL): 60–70% opacity, small, anchor term only
- Climax (BOLD): 85% opacity, slightly heavier, drop shadow
- Resolution (TITLE): 100% opacity, center-frame, 1–2 seconds fade-in

**If a motion graphics editor adds a text layer after the fact:** Hand them the
exported brief and instruct them to match the style contract above — but
note that frame-accurate lock is only guaranteed when text is in the start image.

## The Mute Test

After generating a scene batch, apply this quality check:
*"If a learner watches this video with the audio muted and on-screen text
hidden, can they still understand what concept is being demonstrated?"*

- Intro: Can they identify the subject?
- Build-up: Can they follow the mechanism?
- Climax: Can they see the result?
- Resolution: Does the final frame feel complete?

If yes to all four → the visual design is teaching. If no → revisit the CONCEPT
and EVENT in the failing scene's image brief.
