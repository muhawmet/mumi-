const fs = require('fs');
let music = JSON.parse(fs.readFileSync('public/music-registry.json', 'utf8'));

// Add mappings for the new world IDs based on the old ones
music.mappings['clay'] = music.mappings['clay_diorama'] || { "sourceRef": "brain/04_SUNO.md:115", "text": "muted plucked strings (toy piano, music box, glockenspiel). Hand-made warmth." };
music.mappings['paper'] = music.mappings['paper_diorama'] || { "sourceRef": "brain/04_SUNO.md:117", "text": "light guitar or piano, paper-rustle sound design optional, quiet and revealing." };
music.mappings['wood'] = music.mappings['wood_diorama'] || { "sourceRef": "brain/04_SUNO.md:116", "text": "single marimba or prepared piano with clear attack. Mechanical and precise, each note timed to a mechanism click." };
music.mappings['museum'] = music.mappings['oil_painted_classic'] || { "sourceRef": "brain/04_SUNO.md:99", "text": "sparse strings or period ensemble (harpsichord, lute, solo violin). Dignified, legato, no percussion. Museum gravity." };
music.mappings['fabric'] = music.mappings['felt_diorama'] || { "sourceRef": "brain/04_SUNO.md:115", "text": "muted plucked strings (toy piano, music box, glockenspiel). Hand-made warmth." };
music.mappings['painterly_shadow'] = music.mappings['arcane_painterly'] || { "sourceRef": "brain/04_SUNO.md:100", "text": "low brass undertone, tense string col legno, amber harmonic warmth over a dark bass. Cinematic pressure without trailer cliché." };

fs.writeFileSync('public/music-registry.json', JSON.stringify(music, null, 2));
console.log('Fixed music-registry.json!');
