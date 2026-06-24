import React, { useEffect, useRef } from 'react';

type GlowSprite = {
  canvas: HTMLCanvasElement;
  size: number;
};

type BiolumeParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  depth: number;
  color: BiolumeColor;
};

type BiolumeFish = {
  kind: FishKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  depth: number;
  phase: number;
  color: BiolumeColor;
  direction: 1 | -1;
  calmSpeed: number;
};

type Jelly = {
  kind: JellyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  phase: number;
  color: BiolumeColor;
};

type AbyssGiant = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  phase: number;
  color: BiolumeColor;
  direction: 1 | -1;
};

type KrakenTentacle = {
  anchorX: number;
  anchorY: number;
  reach: number;
  currentReach: number;
  scale: number;
  phase: number;
  color: BiolumeColor;
  side: 'bottom' | 'left' | 'right';
};

type BiolumeColor = 'cyan' | 'blue' | 'violet' | 'pink' | 'gold';
type FishKind = 'lantern' | 'angler' | 'dragon' | 'hatchet' | 'flashlight' | 'viper';
type JellyKind = 'comb' | 'atolla' | 'siphonophore';

const TAU = Math.PI * 2;
const TARGET_FRAME_MS = 1000 / 60;
const COLORS: Record<BiolumeColor, { core: string; glow: string; body: string }> = {
  cyan: { core: 'rgba(136, 255, 248, 1)', glow: 'rgba(47, 232, 255, ALPHA)', body: 'rgba(24, 108, 128, 0.74)' },
  blue: { core: 'rgba(93, 182, 255, 1)', glow: 'rgba(39, 133, 255, ALPHA)', body: 'rgba(28, 72, 142, 0.74)' },
  violet: { core: 'rgba(181, 132, 255, 1)', glow: 'rgba(132, 72, 255, ALPHA)', body: 'rgba(73, 42, 142, 0.74)' },
  pink: { core: 'rgba(255, 119, 223, 1)', glow: 'rgba(255, 63, 203, ALPHA)', body: 'rgba(138, 36, 111, 0.74)' },
  gold: { core: 'rgba(255, 214, 111, 1)', glow: 'rgba(255, 175, 49, ALPHA)', body: 'rgba(138, 88, 28, 0.72)' },
};

const colorOrder: BiolumeColor[] = ['cyan', 'blue', 'violet', 'pink', 'gold'];
const fishKinds: FishKind[] = ['angler', 'lantern', 'dragon', 'hatchet', 'flashlight', 'viper', 'lantern', 'dragon', 'hatchet'];
const jellyKinds: JellyKind[] = ['comb', 'atolla', 'siphonophore'];

const seededRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const wrap = (value: number, min: number, max: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

const biolumeBreath = (t: number, phase: number, speed = 1) => {
  const slow = 0.5 + Math.sin(t * speed + phase) * 0.5;
  const quick = 0.5 + Math.sin(t * speed * 3.7 + phase * 1.9) * 0.5;
  const blink = Math.max(0, Math.sin(t * speed * 1.65 + phase * 2.4)) ** 8;
  return 0.12 + slow * 0.34 + quick * quick * 0.2 + blink * 0.64;
};

const createGlowSprite = (color: BiolumeColor, radius: number): GlowSprite => {
  const size = radius * 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const glow = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    glow.addColorStop(0, COLORS[color].glow.replace('ALPHA', '0.72'));
    glow.addColorStop(0.18, COLORS[color].glow.replace('ALPHA', '0.42'));
    glow.addColorStop(1, COLORS[color].glow.replace('ALPHA', '0'));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
  }

  return { canvas, size };
};

const drawSprite = (
  ctx: CanvasRenderingContext2D,
  sprite: GlowSprite,
  x: number,
  y: number,
  scale: number,
  alpha: number,
) => {
  ctx.globalAlpha = alpha;
  const size = sprite.size * scale;
  ctx.drawImage(sprite.canvas, x - size / 2, y - size / 2, size, size);
  ctx.globalAlpha = 1;
};

const drawAtmosphere = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  parallaxX: number,
  parallaxY: number,
) => {
  const washes = [
    { x: 0.18, y: 0.25, r: 0.58, color: 'rgba(33, 94, 255, ALPHA)', alpha: 0.13, phase: 0 },
    { x: 0.68, y: 0.18, r: 0.48, color: 'rgba(164, 75, 255, ALPHA)', alpha: 0.15, phase: 2.2 },
    { x: 0.82, y: 0.72, r: 0.44, color: 'rgba(255, 66, 204, ALPHA)', alpha: 0.11, phase: 4.4 },
    { x: 0.42, y: 0.8, r: 0.5, color: 'rgba(255, 185, 67, ALPHA)', alpha: 0.07, phase: 1.4 },
  ];

  for (const wash of washes) {
    const radius = Math.min(width, height) * wash.r;
    const x = (wash.x + Math.sin(t * 0.08 + wash.phase) * 0.025) * width + parallaxX * 24;
    const y = (wash.y + Math.cos(t * 0.07 + wash.phase) * 0.025) * height + parallaxY * 20;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, wash.color.replace('ALPHA', String(wash.alpha)));
    glow.addColorStop(0.44, wash.color.replace('ALPHA', String(wash.alpha * 0.24)));
    glow.addColorStop(1, wash.color.replace('ALPHA', '0'));
    ctx.fillStyle = glow;
    ctx.fillRect(Math.max(0, x - radius), Math.max(0, y - radius), radius * 2, radius * 2);
  }
};

const repelFromPointer = (
  x: number,
  y: number,
  pointerX: number,
  pointerY: number,
  active: boolean,
  radius: number,
) => {
  if (!active) return { forceX: 0, forceY: 0, intensity: 0 };

  const dx = x - pointerX;
  const dy = y - pointerY;
  const dist = Math.hypot(dx, dy) || 0.001;
  if (dist > radius) return { forceX: 0, forceY: 0, intensity: 0 };

  const intensity = 1 - dist / radius;
  return {
    forceX: (dx / dist) * intensity,
    forceY: (dy / dist) * intensity,
    intensity,
  };
};

const drawFish = (
  ctx: CanvasRenderingContext2D,
  fish: BiolumeFish,
  sprites: Record<BiolumeColor, GlowSprite>,
  t: number,
  flash: number,
) => {
  const color = COLORS[fish.color];
  const swim = Math.sin(t * 5 + fish.phase);
  const lureSwing = Math.sin(t * 4.2 + fish.phase) * (7 + flash * 10);
  const internalPulse = biolumeBreath(t, fish.phase, fish.kind === 'flashlight' ? 1.8 : 0.85);
  const lurePulse = 0.42 + internalPulse * 0.5 + flash * 0.55;
  const lureX = fish.kind === 'dragon' ? 12 + Math.sin(t * 2.2 + fish.phase) * 7 : 28 + Math.sin(t * 2.2 + fish.phase) * 5;
  const lureY = fish.kind === 'dragon' ? 22 + lureSwing * 0.8 : -17 + lureSwing;

  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.rotate(Math.atan2(fish.vy, fish.vx || fish.direction) * 0.22);
  ctx.scale(fish.direction * fish.scale, fish.scale);

  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, sprites[fish.color], 0, 4, fish.kind === 'hatchet' ? 0.72 : 1 + flash * 0.8, 0.22 + internalPulse * 0.18 + flash * 0.32);

  ctx.globalCompositeOperation = 'source-over';
  const bodyGradient = ctx.createLinearGradient(-24, 0, 24, 0);
  bodyGradient.addColorStop(0, 'rgba(3, 7, 14, 0.72)');
  bodyGradient.addColorStop(0.42, color.body);
  bodyGradient.addColorStop(1, color.glow.replace('ALPHA', '0.5'));
  ctx.fillStyle = bodyGradient;

  if (fish.kind === 'dragon' || fish.kind === 'viper') {
    ctx.beginPath();
    ctx.ellipse(-2, 0, 31, fish.kind === 'viper' ? 6.5 : 5.2, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(21, -4);
    ctx.lineTo(34, -9);
    ctx.lineTo(31, 5);
    ctx.lineTo(20, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(25, 4);
    ctx.lineTo(29, 10);
    ctx.moveTo(29, 2);
    ctx.lineTo(34, 8);
    ctx.stroke();
  } else if (fish.kind === 'hatchet') {
    ctx.beginPath();
    ctx.moveTo(-18, -4);
    ctx.quadraticCurveTo(-4, -19, 17, -8);
    ctx.quadraticCurveTo(14, 16, -8, 21);
    ctx.quadraticCurveTo(-20, 12, -18, -4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(-31, -7 + swim * 2);
    ctx.lineTo(-29, 8 + swim * 2);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, fish.kind === 'angler' ? 25 : 22, fish.kind === 'angler' ? 10 : 8.5, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-17, 0);
    ctx.lineTo(-32, -8 + swim * 3);
    ctx.lineTo(-27, 0);
    ctx.lineTo(-32, 8 + swim * 3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4, -7);
    ctx.lineTo(-7, -18 - swim * 2);
    ctx.lineTo(13, -8);
    ctx.closePath();
    ctx.fillStyle = color.glow.replace('ALPHA', '0.22');
    ctx.fill();
  }

  if (fish.kind === 'angler' || fish.kind === 'dragon') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = color.glow.replace('ALPHA', String(0.32 + flash * 0.3));
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (fish.kind === 'dragon') {
      ctx.moveTo(20, 5);
      ctx.quadraticCurveTo(23, 21 + swim * 4, lureX, lureY);
    } else {
      ctx.moveTo(8, -5);
      ctx.quadraticCurveTo(20, -22 - swim * 4, lureX, lureY);
    }
    ctx.stroke();

    drawSprite(ctx, sprites[fish.color], lureX, lureY, 0.26 + internalPulse * 0.18 + flash * 0.32, 0.36 + internalPulse * 0.42 + flash * 0.28);
    ctx.fillStyle = color.core;
    ctx.globalAlpha = Math.min(1, lurePulse);
    ctx.beginPath();
    ctx.arc(lureX, lureY, 1.8 + internalPulse * 1.2 + flash * 1.4, 0, TAU);
    ctx.fill();
  }

  ctx.fillStyle = color.core;
  const dotCount = fish.kind === 'hatchet' ? 8 : fish.kind === 'flashlight' ? 3 : 6;
  for (let i = 0; i < dotCount; i += 1) {
    const pulse = biolumeBreath(t, fish.phase + i * 0.41, fish.kind === 'hatchet' ? 1.35 : 1);
    ctx.globalAlpha = Math.min(1, 0.32 + pulse * 0.58 + flash * 0.22);
    ctx.beginPath();
    const dotX = fish.kind === 'hatchet' ? -13 + i * 4 : fish.kind === 'flashlight' ? 12 + i * 5 : -10 + i * 5;
    const dotY = fish.kind === 'flashlight' ? -3 + i * 2 : fish.kind === 'dragon' ? 4.5 : 6.2;
    ctx.arc(dotX, dotY, (fish.kind === 'flashlight' ? 1.7 : 1.2) + pulse * 0.75, 0, TAU);
    ctx.fill();
  }

  if (fish.kind !== 'hatchet') {
    ctx.strokeStyle = color.glow.replace('ALPHA', String(0.68 + flash * 0.28));
    ctx.lineWidth = fish.kind === 'dragon' || fish.kind === 'viper' ? 1.2 : 1.8;
    ctx.beginPath();
    ctx.moveTo(-13, -1.5);
    ctx.quadraticCurveTo(1, -5, 16, -1);
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
};

const drawJelly = (
  ctx: CanvasRenderingContext2D,
  jelly: Jelly,
  sprites: Record<BiolumeColor, GlowSprite>,
  t: number,
  flash: number,
) => {
  const color = COLORS[jelly.color];
  const pulse = 1 + Math.sin(t * 2 + jelly.phase) * 0.08;

  ctx.save();
  ctx.translate(jelly.x, jelly.y);
  ctx.scale(jelly.scale * pulse, jelly.scale * pulse);

  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, sprites[jelly.color], 0, -2, jelly.kind === 'siphonophore' ? 0.72 : 1.16 + flash * 0.7, 0.34 + flash * 0.28);

  ctx.strokeStyle = color.glow.replace('ALPHA', String(0.5 + flash * 0.28));
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';

  if (jelly.kind === 'siphonophore') {
    ctx.beginPath();
    for (let p = 0; p < 10; p += 1) {
      const x = Math.sin(t * 1.2 + jelly.phase + p * 0.7) * 10;
      const y = p * 11;
      if (p === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let p = 0; p < 7; p += 1) {
      const nodeX = Math.sin(t * 1.2 + jelly.phase + p * 0.9) * 10;
      const nodeY = p * 15;
      drawSprite(ctx, sprites[colorOrder[(p + 1) % colorOrder.length]], nodeX, nodeY, 0.16, 0.48);
    }
  } else {
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 8, 10);
      for (let p = 1; p <= 5; p += 1) {
        const wave = Math.sin(t * 2 + jelly.phase + p * 0.7 + i) * 6;
        ctx.lineTo(i * 8 + wave, 10 + p * 13);
      }
      ctx.stroke();
    }

    const cap = ctx.createRadialGradient(0, -5, 0, 0, -3, jelly.kind === 'atolla' ? 38 : 34);
    cap.addColorStop(0, color.glow.replace('ALPHA', String(0.34 + flash * 0.2)));
    cap.addColorStop(0.58, color.glow.replace('ALPHA', '0.12'));
    cap.addColorStop(1, color.glow.replace('ALPHA', '0'));
    ctx.fillStyle = cap;
    ctx.beginPath();
    if (jelly.kind === 'atolla') {
      ctx.arc(0, 0, 24, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = COLORS[colorOrder[(colorOrder.indexOf(jelly.color) + 2) % colorOrder.length]].glow.replace('ALPHA', String(0.44 + flash * 0.18));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 17 + Math.sin(t * 3 + jelly.phase) * 2, 0, TAU);
      ctx.stroke();
    } else {
      ctx.ellipse(0, 0, 32, 20, 0, Math.PI, TAU);
      ctx.fill();
      ctx.strokeStyle = COLORS[colorOrder[(colorOrder.indexOf(jelly.color) + 1) % colorOrder.length]].glow.replace('ALPHA', '0.38');
      ctx.lineWidth = 1.2;
      for (let rib = -2; rib <= 2; rib += 1) {
        ctx.beginPath();
        ctx.moveTo(rib * 7, -8);
        ctx.lineTo(rib * 4, 10);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
};

const drawAbyssGiant = (
  ctx: CanvasRenderingContext2D,
  giant: AbyssGiant,
  sprites: Record<BiolumeColor, GlowSprite>,
  t: number,
) => {
  const color = COLORS[giant.color];
  const swim = Math.sin(t * 1.4 + giant.phase);

  ctx.save();
  ctx.translate(giant.x, giant.y + swim * 7);
  ctx.scale(giant.direction * giant.scale, giant.scale);
  ctx.globalAlpha = 0.78;

  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, sprites[giant.color], 4, 4, 2.4, 0.14);

  ctx.globalCompositeOperation = 'source-over';
  const body = ctx.createLinearGradient(-76, 0, 72, 0);
  body.addColorStop(0, 'rgba(0, 3, 8, 0.58)');
  body.addColorStop(0.48, 'rgba(8, 14, 24, 0.54)');
  body.addColorStop(1, color.glow.replace('ALPHA', '0.13'));
  ctx.fillStyle = body;

  ctx.beginPath();
  ctx.ellipse(0, 0, 76, 19, 0, 0, TAU);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-62, 0);
  ctx.lineTo(-96, -18 + swim * 4);
  ctx.lineTo(-86, 0);
  ctx.lineTo(-96, 18 + swim * 4);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = color.core;
  ctx.globalAlpha = 0.22 + biolumeBreath(t, giant.phase, 0.72) * 0.22;
  for (let i = 0; i < 9; i += 1) {
    const pulse = biolumeBreath(t, giant.phase + i * 0.3, 0.9);
    ctx.beginPath();
    ctx.arc(-32 + i * 8, 13, 0.9 + pulse * 0.9, 0, TAU);
    ctx.fill();
  }

  ctx.strokeStyle = color.glow.replace('ALPHA', '0.18');
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-44, -8);
  ctx.quadraticCurveTo(3, -18, 55, -6);
  ctx.stroke();

  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
};

const drawKrakenTentacle = (
  ctx: CanvasRenderingContext2D,
  tentacle: KrakenTentacle,
  sprites: Record<BiolumeColor, GlowSprite>,
  t: number,
) => {
  const color = COLORS[tentacle.color];
  const reach = tentacle.currentReach;
  const sway = Math.sin(t * 0.55 + tentacle.phase);
  const curl = Math.cos(t * 0.42 + tentacle.phase) * reach * 0.12;
  const tipX =
    tentacle.side === 'left'
      ? tentacle.anchorX + reach * 0.72
      : tentacle.side === 'right'
        ? tentacle.anchorX - reach * 0.72
        : tentacle.anchorX + sway * reach * 0.24;
  const tipY =
    tentacle.side === 'bottom'
      ? tentacle.anchorY - reach
      : tentacle.anchorY + sway * reach * 0.38;
  const controlX =
    tentacle.side === 'bottom'
      ? tentacle.anchorX + curl
      : (tentacle.anchorX + tipX) / 2 + sway * 48 * tentacle.scale;
  const controlY =
    tentacle.side === 'bottom'
      ? tentacle.anchorY - reach * 0.48
      : (tentacle.anchorY + tipY) / 2 - reach * 0.22;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.9;

  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(7, 5, 16, 0.44)';
  ctx.lineWidth = 26 * tentacle.scale;
  ctx.beginPath();
  ctx.moveTo(tentacle.anchorX, tentacle.anchorY);
  ctx.quadraticCurveTo(controlX, controlY, tipX, tipY);
  ctx.stroke();

  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = color.glow.replace('ALPHA', '0.2');
  ctx.lineWidth = 7 * tentacle.scale;
  ctx.beginPath();
  ctx.moveTo(tentacle.anchorX, tentacle.anchorY);
  ctx.quadraticCurveTo(controlX, controlY, tipX, tipY);
  ctx.stroke();

  for (let i = 1; i <= 6; i += 1) {
    const progress = i / 7;
    const oneMinus = 1 - progress;
    const x = oneMinus * oneMinus * tentacle.anchorX + 2 * oneMinus * progress * controlX + progress * progress * tipX;
    const y = oneMinus * oneMinus * tentacle.anchorY + 2 * oneMinus * progress * controlY + progress * progress * tipY;
    const sideOffset = (i % 2 === 0 ? 1 : -1) * 7 * tentacle.scale;
    const pulse = biolumeBreath(t, tentacle.phase + i * 0.55, 0.75);
    drawSprite(ctx, sprites[tentacle.color], x + sideOffset, y, 0.1 + progress * 0.07 + pulse * 0.05, 0.12 + pulse * 0.26);
    ctx.fillStyle = color.core;
    ctx.globalAlpha = 0.08 + progress * 0.08 + pulse * 0.22;
    ctx.beginPath();
    ctx.arc(x + sideOffset, y, 0.8 + progress * 0.9 + pulse * 0.9, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
};

export const AntigravityBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const sessionSeed = Math.floor(Math.random() * 100000);
    const sprites = colorOrder.reduce(
      (next, color) => ({ ...next, [color]: createGlowSprite(color, 56) }),
      {} as Record<BiolumeColor, GlowSprite>,
    );
    const atmosphereCanvas = document.createElement('canvas');
    const atmosphereCtx = atmosphereCanvas.getContext('2d');

    let width = 0;
    let height = 0;
    let raf = 0;
    let lastFrame = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let pointerActive = false;
    let parallaxX = 0;
    let parallaxY = 0;

    let particles: BiolumeParticle[] = [];
    let fish: BiolumeFish[] = [];
    let jellies: Jelly[] = [];
    let giants: AbyssGiant[] = [];
    let krakenTentacles: KrakenTentacle[] = [];

    const populate = () => {
      const rand = seededRandom(sessionSeed + 0x5ea + Math.round(width) * 31 + Math.round(height) * 17);
      const particleCount = Math.min(76, Math.max(34, Math.round((width * height) / 33000)));
      const fishCount = width > 1180 ? 8 : 5;
      const jellyCount = width > 1180 ? 3 : 2;

      particles = Array.from({ length: particleCount }, (_, index) => ({
        x: rand() * width,
        y: rand() * height,
        vx: (rand() - 0.5) * 0.28,
        vy: -0.18 - rand() * 0.28,
        radius: 0.8 + rand() * 1.8,
        phase: rand() * TAU,
        depth: 0.35 + rand() * 0.9,
        color: colorOrder[index % colorOrder.length],
      }));

      fish = Array.from({ length: fishCount }, (_, index) => {
        const kind = fishKinds[index % fishKinds.length];
        const direction: 1 | -1 = index % 2 === 0 ? -1 : 1;
        const depth = index === 0 ? 1.48 : index === 5 ? 1.24 : 0.54 + rand() * 0.62;
        const baseScale = kind === 'hatchet' ? 0.5 : kind === 'dragon' || kind === 'viper' ? 0.62 : kind === 'angler' ? 0.68 : 0.58;
        return {
          kind,
          x: width * (0.18 + rand() * 0.68),
          y: height * (0.2 + rand() * 0.62),
          vx: direction * ((kind === 'dragon' || kind === 'viper' ? 0.14 : 0.1) + rand() * 0.12) * depth,
          vy: (rand() - 0.5) * 0.12,
          scale: (baseScale + rand() * 0.24) * depth,
          depth,
          phase: rand() * TAU,
          color: colorOrder[(index + (kind === 'flashlight' ? 1 : 0)) % colorOrder.length],
          direction,
          calmSpeed: (0.105 + rand() * 0.13) * depth,
        };
      }).sort((a, b) => a.depth - b.depth);

      jellies = Array.from({ length: jellyCount }, (_, index) => ({
        kind: jellyKinds[index % jellyKinds.length],
        x: width * (0.16 + rand() * 0.72),
        y: height * (0.15 + rand() * 0.58),
        vx: (rand() - 0.5) * 0.12,
        vy: -0.06 - rand() * 0.08,
        scale: 0.42 + rand() * 0.46,
        phase: rand() * TAU,
        color: colorOrder[(index * 2 + 2) % colorOrder.length],
      }));

      giants = width > 1000
        ? [
            {
              x: width * (0.2 + rand() * 0.16),
              y: height * (0.8 + rand() * 0.1),
              vx: 0.016 + rand() * 0.012,
              vy: 0,
              scale: 2.15 + rand() * 0.35,
              phase: rand() * TAU,
              color: colorOrder[Math.floor(rand() * colorOrder.length)],
              direction: 1,
            },
          ]
        : [];

      krakenTentacles = width > 1000
        ? [
            {
              anchorX: width * 0.78,
              anchorY: height + 72,
              reach: Math.min(height * 0.34, 260),
              currentReach: Math.min(height * 0.34, 260),
              scale: 1.08,
              phase: rand() * TAU,
              color: 'violet',
              side: 'bottom',
            },
            {
              anchorX: width + 58,
              anchorY: height * 0.66,
              reach: Math.min(width * 0.14, 240),
              currentReach: Math.min(width * 0.14, 240),
              scale: 0.82,
              phase: rand() * TAU,
              color: 'pink',
              side: 'right',
            },
            {
              anchorX: -46,
              anchorY: height * 0.26,
              reach: Math.min(width * 0.12, 210),
              currentReach: Math.min(width * 0.12, 210),
              scale: 0.72,
              phase: rand() * TAU,
              color: 'blue',
              side: 'left',
            },
          ]
        : [
            {
              anchorX: width * 0.78,
              anchorY: height + 62,
              reach: Math.min(height * 0.28, 180),
              currentReach: Math.min(height * 0.28, 180),
              scale: 0.78,
              phase: rand() * TAU,
              color: 'violet',
              side: 'bottom',
            },
          ];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      atmosphereCanvas.width = Math.max(1, Math.floor(width));
      atmosphereCanvas.height = Math.max(1, Math.floor(height));
      if (atmosphereCtx) {
        atmosphereCtx.clearRect(0, 0, width, height);
        atmosphereCtx.globalCompositeOperation = 'lighter';
        drawAtmosphere(atmosphereCtx, width, height, 0, 0, 0);
        atmosphereCtx.globalCompositeOperation = 'source-over';
      }
      populate();
    };

    const render = (now = 0) => {
      const dt = lastFrame === 0 ? 1 : Math.min(2.2, Math.max(0.45, (now - lastFrame) / TARGET_FRAME_MS));
      lastFrame = now;

      const t = now * 0.001;
      const targetParallaxX = pointerActive ? pointerX / Math.max(width, 1) - 0.5 : 0;
      const targetParallaxY = pointerActive ? pointerY / Math.max(height, 1) - 0.5 : 0;
      parallaxX += (targetParallaxX - parallaxX) * 0.06;
      parallaxY += (targetParallaxY - parallaxY) * 0.06;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      if (atmosphereCtx) ctx.drawImage(atmosphereCanvas, 0, 0, width, height);

      for (const particle of particles) {
        const repel = repelFromPointer(particle.x, particle.y, pointerX, pointerY, pointerActive, 170);
        if (!reduced) {
          particle.vx += repel.forceX * 0.055 * dt;
          particle.vy += repel.forceY * 0.055 * dt;
          particle.vx += Math.sin(t + particle.phase) * 0.002;
          particle.vx *= 0.992;
          particle.vy *= 0.992;
          particle.x += particle.vx * particle.depth * dt;
          particle.y += particle.vy * particle.depth * dt;
          particle.x = wrap(particle.x, -20, width + 20);
          particle.y = wrap(particle.y, -20, height + 20);
        }

        const twinkle = 0.46 + Math.sin(t * 3 + particle.phase) * 0.28 + repel.intensity * 0.5;
        ctx.fillStyle = COLORS[particle.color].glow.replace('ALPHA', String(0.12 + twinkle * 0.22));
        ctx.beginPath();
        ctx.arc(
          particle.x - parallaxX * 18 * particle.depth,
          particle.y - parallaxY * 14 * particle.depth,
          particle.radius * (1 + repel.intensity * 1.4),
          0,
          TAU,
        );
        ctx.fill();
      }

      if (pointerActive) {
        const wave = 36 + Math.sin(t * 5) * 8;
        const gradient = ctx.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, 180 + wave);
        gradient.addColorStop(0, 'rgba(255, 119, 223, 0.12)');
        gradient.addColorStop(0.34, 'rgba(79, 225, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(79, 225, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(pointerX - 220, pointerY - 220, 440, 440);
      }

      for (const tentacle of krakenTentacles) {
        const tipX =
          tentacle.side === 'left'
            ? tentacle.anchorX + tentacle.currentReach * 0.72
            : tentacle.side === 'right'
              ? tentacle.anchorX - tentacle.currentReach * 0.72
              : tentacle.anchorX;
        const tipY = tentacle.side === 'bottom' ? tentacle.anchorY - tentacle.currentReach : tentacle.anchorY;
        const retreat = repelFromPointer(tipX, tipY, pointerX, pointerY, pointerActive, 340);
        if (!reduced) {
          const targetReach = tentacle.reach * (1 - retreat.intensity * 0.72);
          tentacle.currentReach += (targetReach - tentacle.currentReach) * 0.16 * dt;
        }
        drawKrakenTentacle(ctx, tentacle, sprites, t);
      }

      for (const giant of giants) {
        const repel = repelFromPointer(giant.x, giant.y, pointerX, pointerY, pointerActive, 520);
        if (!reduced) {
          giant.vx += repel.forceX * 0.2 * dt;
          giant.vy += repel.forceY * 0.14 * dt;
          giant.vx += 0.0025 * dt;
          giant.vx *= 0.988;
          giant.vy *= 0.98;
          giant.x += giant.vx * dt;
          giant.y += giant.vy * dt;
          giant.y = Math.max(height * 0.58, Math.min(height + 40, giant.y));
          if (giant.x > width + 260 * giant.scale) giant.x = -260 * giant.scale;
          if (giant.x < -280 * giant.scale) giant.x = width + 240 * giant.scale;
        }
        drawAbyssGiant(ctx, giant, sprites, t);
      }

      for (const jelly of jellies) {
        const repel = repelFromPointer(jelly.x, jelly.y, pointerX, pointerY, pointerActive, 260);
        if (!reduced) {
          jelly.vx += repel.forceX * 0.12 * dt;
          jelly.vy += repel.forceY * 0.1 * dt;
          jelly.vx += Math.sin(t * 0.8 + jelly.phase) * 0.004 * dt;
          jelly.vx *= 0.988;
          jelly.vy = jelly.vy * 0.99 - 0.0014 * dt;
          jelly.x += jelly.vx * dt;
          jelly.y += jelly.vy * dt;
          jelly.x = wrap(jelly.x, -90, width + 90);
          jelly.y = wrap(jelly.y, -100, height + 120);
        }
        drawJelly(ctx, jelly, sprites, t, repel.intensity);
      }

      for (const swimmer of fish) {
        const repel = repelFromPointer(swimmer.x, swimmer.y, pointerX, pointerY, pointerActive, 310 * swimmer.depth);
        if (!reduced) {
          const slowTurn = Math.sin(t * (0.22 + swimmer.depth * 0.08) + swimmer.phase);
          const microTurn = Math.sin(t * (1.1 + swimmer.depth * 0.3) + swimmer.phase * 1.7);
          const desiredVx = swimmer.direction * swimmer.calmSpeed * (0.86 + slowTurn * 0.18);
          const desiredVy = slowTurn * 0.18 + microTurn * 0.08;

          swimmer.vx += (desiredVx - swimmer.vx) * 0.018 * dt;
          swimmer.vy += (desiredVy - swimmer.vy) * 0.022 * dt;
          swimmer.vx += repel.forceX * (0.42 + swimmer.depth * 0.18) * dt;
          swimmer.vy += repel.forceY * (0.34 + swimmer.depth * 0.12) * dt;
          swimmer.vx *= 0.982;
          swimmer.vy *= 0.978;

          if (Math.abs(swimmer.vx) > 0.1) swimmer.direction = swimmer.vx >= 0 ? 1 : -1;
          swimmer.x += swimmer.vx * dt;
          swimmer.y += swimmer.vy * dt;

          const margin = 120 * swimmer.depth;
          if (swimmer.x < -margin) swimmer.x = width + margin;
          if (swimmer.x > width + margin) swimmer.x = -margin;
          if (swimmer.y < 54) {
            swimmer.y = 54;
            swimmer.vy = Math.abs(swimmer.vy) * 0.55;
          }
          if (swimmer.y > height - 46) {
            swimmer.y = height - 46;
            swimmer.vy = -Math.abs(swimmer.vy) * 0.55;
          }
        }
        drawFish(ctx, swimmer, sprites, t, repel.intensity);
      }

      ctx.globalCompositeOperation = 'source-over';
      if (!reduced) raf = requestAnimationFrame(render);
    };

    const onMove = (event: MouseEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerActive = true;
    };

    const onLeave = () => {
      pointerActive = false;
    };

    resize();
    render(0);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};
