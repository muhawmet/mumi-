// MAMILAS PRO - Audio Engine
// Elite Cinematic UI Sounds using Web Audio API
// Recommendations implemented from Sensory Director Agent 4

const AudioEngine = (() => {
  let ctx = null;
  let masterCompressor = null;
  let reverbNode = null;
  let noiseBuffer = null;
  let enabled = true;

  // Create a quick, synthetic impulse response for the reverb (Glass Chamber feel)
  function createImpulseResponse(context, duration, decay) {
    const length = context.sampleRate * duration;
    const impulse = context.createBuffer(2, length, context.sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const n = (i / length);
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
    }
    return impulse;
  }

  // Create a reusable white noise buffer
  function createNoiseBuffer(context) {
    const bufferSize = context.sampleRate * 2; // 2 seconds
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function init() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        ctx = new AudioContext();
        
        // Master Bus
        masterCompressor = ctx.createDynamicsCompressor();
        masterCompressor.threshold.setValueAtTime(-10, ctx.currentTime);
        masterCompressor.knee.setValueAtTime(40, ctx.currentTime);
        masterCompressor.ratio.setValueAtTime(12, ctx.currentTime);
        masterCompressor.attack.setValueAtTime(0, ctx.currentTime);
        masterCompressor.release.setValueAtTime(0.25, ctx.currentTime);
        masterCompressor.connect(ctx.destination);

        // Reverb Bus
        reverbNode = ctx.createConvolver();
        reverbNode.buffer = createImpulseResponse(ctx, 0.5, 3.0);
        const reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.15; // Reverb send amount
        reverbNode.connect(reverbGain);
        reverbGain.connect(masterCompressor);

        // Noise Buffer
        noiseBuffer = createNoiseBuffer(ctx);
      }
    }
  }

  function playNoise(duration, filterFreq, q, vol) {
    if (!enabled || !ctx) return;
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = q;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(masterCompressor);
    gain.connect(reverbNode); // Send to reverb
    
    noiseSource.start();
    noiseSource.stop(ctx.currentTime + duration);
  }

  return {
    init,
    toggle: (state) => { enabled = state; },
    
    hover: () => {
      if (!enabled || !ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      
      // Cinematic Glassy Shimmer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2500, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(masterCompressor);
      gain.connect(reverbNode);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
      
      // Layer with noise
      playNoise(0.04, 3000, 10, 0.02);
    },
    
    click: () => {
      if (!enabled || !ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      
      // Weighty Mechanical Confirmation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      
      // Rapid pitch drop (transient)
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.03);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(masterCompressor);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
      
      // Layer with lowpass filtered noise snap
      playNoise(0.05, 1200, 1, 0.05);
    },
    
    selectWorld: () => {
      if (!enabled || !ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      
      // Cinematic Detuned Swell
      const playDetunedOsc = (freq, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.3);
        filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.8);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterCompressor);
        gain.connect(reverbNode); // Heavy reverb send
        
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      };
      
      playDetunedOsc(220, 0.03);
      playDetunedOsc(221.5, 0.03);
      playDetunedOsc(110, 0.04); // Sub octave
    },
    
    generate: () => {
      if (!enabled || !ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      
      // Futuristic Computing Spool-Up
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const lfoGain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      lfo.type = 'sine';
      
      osc1.frequency.setValueAtTime(150, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
      osc2.frequency.setValueAtTime(75, ctx.currentTime); // Octave down
      osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
      
      lfo.frequency.value = 16; // 16Hz flutter
      lfoGain.gain.value = 400; // Modulate filter by 400Hz
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      
      filter.type = 'lowpass';
      filter.Q.value = 5; // High resonance
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(masterCompressor);
      gain.connect(reverbNode);
      
      osc1.start();
      osc2.start();
      lfo.start();
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
      lfo.stop(ctx.currentTime + 0.5);
    },
    
    error: () => {
      if (!enabled || !ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      
      // Digital Glitch
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.value = 100;
      osc2.frequency.value = 141; // Tritone dissonance
      
      filter.type = 'lowpass';
      filter.frequency.value = 400; // Muffled
      
      // Tremolo stutter
      lfo.type = 'square';
      lfo.frequency.value = 20; // Fast stutter
      lfoGain.gain.value = 1;
      
      // Create a specific gain node just for amplitude modulation
      const amGain = ctx.createGain();
      amGain.gain.value = 0; // Baseline
      lfo.connect(amGain.gain);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(amGain);
      amGain.connect(gain);
      gain.connect(masterCompressor);
      
      osc1.start();
      osc2.start();
      lfo.start();
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
      lfo.stop(ctx.currentTime + 0.3);
    }
  };
})();

window.AudioEngine = AudioEngine;

window.generateAudioBrief = function(scenes, world) {
  if (!scenes || !world) return '';

  const worldName = world.name || 'Untitled World';
  const musicGen = world.musicMapping || 'Premium commercial bed';
  
  let md = `# AUDIO PRODUCTION BRIEF: ${worldName}\n\n`;
  
  md += `## 🎵 SUNO v5.5 MUSIC GENERATION PROMPT\n`;
  md += `**Audio Architecture:** ${musicGen}\n`;
  md += `**Style Tags:** Cinematic, immersive, high-end commercial, ${world.musicGenre || 'ambient'}\n\n`;
  
  md += `### Prompt Syntax:\n`;
  md += `\`\`\`text\n`;
  md += `[Style: ${world.musicGenre || 'Cinematic Ambient, Corporate Tech, Emotional'}, Tempo: 90-120 BPM]\n`;
  md += `[Instrumentation: ${musicGen}]\n`;
  md += `[Structure: Intro, Build-up, Climax, Outro]\n`;
  md += `\`\`\`\n\n`;

  md += `## 🎙️ ELEVENLABS VOICEOVER SCRIPT & PACING\n`;
  md += `**Voice Profile:** Deep, authoritative, clear, engaging cinematic voice.\n`;
  md += `**Settings:** Stability 0.40 | Similarity 0.80 | Style Exaggeration 0.0\n\n`;
  md += `### SCENE BY SCENE PACING\n\n`;

  scenes.forEach((scene, index) => {
    md += `#### SCENE ${index + 1}\n`;
    md += `* **Duration:** ~4s\n`;
    md += `* **Visual Context:** ${scene.topic || scene.title || 'Visual imagery'}\n`;
    
    // Check if there is VO data, otherwise generic or empty
    const voText = scene.voiceOver || '';
    if (voText) {
      md += `* **Voiceover Script:**\n`;
      md += `  > "${voText}"\n`;
      md += `* **Delivery Notes:** Clear, measured pace. Allow for natural pauses to let the visuals and music breathe.\n`;
    } else {
      md += `* **Voiceover Script:** (No voiceover for this scene, music only)\n`;
    }
    md += `\n---\n\n`;
  });

  md += `## 🎛️ MASTER MIXING NOTES\n`;
  md += `- **EQ:** Roll off low-end below 40Hz on music. Boost 2-4kHz slightly on VO for clarity.\n`;
  md += `- **Compression:** Gentle glue compression on master bus (ratio 2:1, slow attack, fast release).\n`;
  md += `- **Reverb:** Subtle room reverb on VO to sit naturally in the mix.\n`;
  md += `- **Ducking:** Automate music volume down by 3-4dB when VO is speaking.\n`;

  return md;
};
