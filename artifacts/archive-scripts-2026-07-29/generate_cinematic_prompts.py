# -*- coding: utf-8 -*-
import math

input_md = "/Users/Muhammet/.gemini/antigravity-ide/brain/6d66b1b0-5fc6-4bdf-b664-b3a245fad42f/69_sahne_kuvvet_promptlari.md"
output_md = "/Users/Muhammet/.gemini/antigravity-ide/brain/6d66b1b0-5fc6-4bdf-b664-b3a245fad42f/69_sahne_kuvvet_motion_promptlari.md"

with open(input_md, "r", encoding="utf-8") as f:
    lines = f.readlines()

scenes = []
for line in lines:
    if line.startswith("### Sahne"):
        scenes.append(line.strip())

story = [
    "Bu Mira. Her sabah olduğu gibi bugün de okula gitmek için yola çıktı.", 
    "Kapıyı itti, ağır çantasını omzuna aldı ve otobüse yetişmek için koştu.",
    "Aslında Mira farkında değildi ama o sabah yaptığı her hareketin arkasında görünmez bir güç vardı: Kuvvet!",
    "Kapıyı açarken, topa vururken ya da market arabasını iterken hep kuvvet uygularız.",
    "Peki bir cismi her zaman tek bir kuvvet mi etkiler? Tabii ki hayır.",
    "Bazen birden fazla kuvvet bir araya gelir ve güçlerini birleştirir.",
    "İki kuvvet birleşince neler olur?",
    "Mira bugün işte bu gizemli gücü, yani bileşke kuvveti keşfedecek.",
    "Hazırsanız, Mira'nın yolculuğuna biz de katılalım!",
    "Mira'nın ilk dersi fendi."
]

# Custom cinematic prompts for the first 10 scenes to show harmony
cinematic_prompts = [
    "Dynamic low-angle tracking shot. Camera starts low behind the heavy wooden door, pulling back smoothly as the girl pushes it open and steps out, leading her motion into the bright morning sun. Cinematic depth of field, dust motes in the air. High-quality 3D feature-animation.",
    "Fast-paced side-profile tracking pan, picking up the momentum from the previous shot. The camera sprints alongside the girl as she runs rightward towards the bus, background cobblestones blurring with speed. Squash and stretch on her stride. No morphing.",
    "Slow-motion orbit shot. As she runs, the camera smoothly arcs around her lower body, slowing time. Glowing cyan and golden force-vector arrows radiate from her sneakers, illuminating the cobblestones. Ethereal, suspended momentum.",
    "Locked static camera with internal compositional motion. The three split-screen panels remain perfectly stable. Within each panel, subtle slow-motion impact: the door swings, the soccer ball compresses, the cart rolls forward. Vector arrows glow dynamically without melting the subjects.",
    "Macro probe-lens push in. The camera glides intimately close across the oak table toward the crimson cube. The four colored translucent arrows slowly pulse with internal light. The golden question mark above shimmers gently. Seamless, continuous forward momentum.",
    "Quick reaction shot. Subtle rack focus from the background to her eyes. Camera holds steady as her expression shifts to an excited grin, hair bouncing naturally. Emotional hold, clear facial acting, no identity drift or warping.",
    "Slow sweeping arc shot. The camera sweeps around the merging force vectors. As the blue and cyan arrows fuse into the radiant golden arrow, the camera pushes forward along the arrow's path, matching the momentum of the heavy stone block moving across the grid.",
    "Low-angle tilt up. Camera starts on her awestruck face and tilts slowly up to reveal the glowing golden 'BİLEŞKE KUVVET' hologram. Volumetric light rays wash over the lens. Cinematic awe, maintaining perfect text clarity without distortion.",
    "Smooth pedestal up. Camera rises gently from waist level to eye level as she extends her hand in a welcoming gesture. Soft bokeh in the background foliage shifting smoothly. Warm, inviting, and stable composition.",
    "Wide establishing pan. Camera pans slowly and smoothly from left to right across the sunlit classroom, establishing the geography, the students, and landing on the teacher at the Smartboard. Rich environmental storytelling, zero morphing on background characters."
]

with open(output_md, "w", encoding="utf-8") as f:
    f.write("# 69 Sahne Kuvvet Serisi - Phase B Motion Prompts (Sinematik Kurgu)\n\n")
    
    for i, scene in enumerate(scenes):
        idx = i + 1
        
        motion = "TBD - Manuel Sinematik Kurgu Yazılacak"
        if i < len(cinematic_prompts):
            motion = cinematic_prompts[i]
            
        vo = "Bu sahnede dış ses konuyu destekler."
        if i < len(story):
            vo = story[i]
            
        word_count = len(vo.split())
        duration = max(4, math.ceil(word_count / 2.0))
        if duration > 8: duration = 8
        
        f.write(f"### {scene}\n")
        f.write(f"- **Voice Over:** \"{vo}\"\n")
        f.write(f"- **Duration:** {duration}s\n")
        f.write(f"- **Image Ref:** `{idx}.png`\n")
        f.write(f"- **Motion Prompt:** `{motion}`\n")
        f.write("---\n\n")

print("Generated " + output_md)
