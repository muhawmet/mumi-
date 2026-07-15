import React, { useEffect, useRef } from 'react';
import { CHARACTER_SPRITES, getCharacterSprite, getPlateCharacter, type PlateCharacter } from './characterSprites';

interface CharacterStageProps {
  worldId?: string;
  spriteId?: string;
  width?: number;
  height?: number;
  glow?: boolean;
  mode?: 'avatar' | 'plate';
  accentColor?: string;
}

const PLATE_W = 48;
const PLATE_H = 64;

function block(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function lineBlock(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, thick: number, color: string) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    block(ctx, x1 + (x2 - x1) * k, y1 + (y2 - y1) * k, thick, thick, color);
  }
}

function face(ctx: CanvasRenderingContext2D, skin: string, outline: string, y = 16) {
  block(ctx, 18, y, 13, 13, outline);
  block(ctx, 19, y + 1, 11, 11, skin);
  block(ctx, 20, y + 4, 2, 2, outline);
  block(ctx, 27, y + 4, 2, 2, outline);
}

function legs(ctx: CanvasRenderingContext2D, left: string, right = left, boots = '#050507') {
  block(ctx, 19, 47, 4, 11, left);
  block(ctx, 26, 47, 4, 11, right);
  block(ctx, 17, 58, 7, 3, boots);
  block(ctx, 25, 58, 7, 3, boots);
}

function drawCheckers(ctx: CanvasRenderingContext2D, x: number, y: number, cols: number, rows: number, a: string, b: string) {
  for (let yy = 0; yy < rows; yy++) {
    for (let xx = 0; xx < cols; xx++) block(ctx, x + xx * 3, y + yy * 3, 3, 3, (xx + yy) % 2 ? a : b);
  }
}

function humanoidBase(ctx: CanvasRenderingContext2D, p: Record<string, string>, coat: string, accent: string) {
  face(ctx, p.P || '#d0a083', p.K || '#060608');
  block(ctx, 16, 30, 17, 19, p.K || '#060608');
  block(ctx, 18, 31, 13, 17, coat);
  block(ctx, 22, 31, 4, 17, accent);
  block(ctx, 14, 32, 5, 14, p.P || '#d0a083');
  block(ctx, 31, 32, 5, 14, p.P || '#d0a083');
  legs(ctx, coat, coat, p.K || '#060608');
}

function drawPlateCharacter(ctx: CanvasRenderingContext2D, character: PlateCharacter, t: number, paletteAccent: string) {
  const p = character.palette;
  const k = p.K || '#060608';
  const skin = p.P || '#d0a083';
  const cycle = Math.floor(t / 120) % 8;
  const bob = Math.round(Math.sin(t * 0.006) * 1.2);
  const pulse = Math.sin(t * 0.004) > 0 ? 1 : 0;

  block(ctx, 12, 60, 24, 3, 'rgba(0,0,0,0.28)');

  ctx.save();
  ctx.translate(0, bob);
  switch (character.kind) {
    case 'luffy':
      {
        const gum = cycle < 5 ? 7 + cycle * 4 : 27 - (cycle - 5) * 6;
        lineBlock(ctx, 33, 32, Math.min(46, 33 + gum), 29 - pulse, 4, skin);
        block(ctx, Math.min(45, 34 + gum), 27 - pulse, 4, 6, skin);
        lineBlock(ctx, 34, 30, Math.min(47, 36 + gum), 26 - pulse, 1, p.Y);
      }
      block(ctx, 11, 11, 27, 4, p.Y);
      block(ctx, 16, 6, 17, 8, p.Y);
      block(ctx, 17, 12, 15, 2, p.R);
      face(ctx, skin, k, 17);
      block(ctx, 18, 15, 12, 3, k);
      block(ctx, 17, 30, 15, 17, p.R);
      block(ctx, 22, 31, 4, 16, skin);
      block(ctx, 14, 31, 5, 13, skin);
      block(ctx, 31, 31, 4, 7, skin);
      legs(ctx, '#2457a6', '#2457a6', p.S);
      break;
    case 'naruto':
      for (let i = 0; i < 7; i++) block(ctx, 15 + i * 3, 8 + (i % 2), 4, 8 - (i % 2) * 2, p.Y);
      face(ctx, skin, k, 17);
      block(ctx, 17, 17, 15, 3, p.B);
      block(ctx, 21, 16, 7, 4, p.S || '#a6adb7');
      block(ctx, 16, 30, 18, 18, p.O);
      block(ctx, 23, 30, 4, 18, p.B);
      block(ctx, 13, 34, 5, 12, p.O);
      block(ctx, 32, 34, 5, 12, p.O);
      block(ctx, 36, 33, 5 + pulse, 5 + pulse, p.C);
      ctx.strokeStyle = p.C;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(39, 36, 5 + (cycle % 3), 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(39, 36, 7, 2 + pulse, t * 0.006, 0, Math.PI * 2); ctx.stroke();
      legs(ctx, p.O, p.O, k);
      break;
    case 'itadori':
      lineBlock(ctx, 31, 34, 43, 32 + (cycle % 3), 4, p.B);
      block(ctx, 42, 30 + (cycle % 3), 5, 5, p.R);
      lineBlock(ctx, 36, 28, 46, 20 + (cycle % 4), 1, paletteAccent);
      block(ctx, 17, 10, 15, 8, p.H);
      block(ctx, 15, 13, 5, 7, p.H);
      block(ctx, 29, 13, 5, 7, p.H);
      face(ctx, skin, k, 18);
      block(ctx, 16, 31, 18, 18, p.B);
      block(ctx, 19, 31, 11, 6, p.R);
      block(ctx, 14, 33, 5, 12, p.B);
      block(ctx, 31, 33, 4, 9, p.B);
      block(ctx, 35, 38, 6, 6, paletteAccent);
      legs(ctx, p.B, p.B, k);
      break;
    case 'tanjiro':
      ctx.strokeStyle = p.B;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(33, 32, 13 + (cycle % 3), Math.PI * 0.08, Math.PI * 1.15);
      ctx.stroke();
      block(ctx, 16, 9, 17, 9, k);
      block(ctx, 18, 12, 4, 4, p.R);
      face(ctx, skin, k, 17);
      drawCheckers(ctx, 14, 30, 7, 6, p.G, p.D);
      block(ctx, 21, 31, 7, 16, k);
      lineBlock(ctx, 35, 23, 39, 54, 1, p.W);
      lineBlock(ctx, 37, 29, 44, 42, 2, p.B);
      legs(ctx, k, k, k);
      break;
    case 'ichigo':
      {
        const slash = cycle % 4;
        lineBlock(ctx, 8 + slash * 2, 14, 44 - slash, 54, 1, p.O);
        lineBlock(ctx, 10 + slash, 17, 39, 56, 2, k);
        block(ctx, 8, 45 + pulse, 4, 8, p.O);
        block(ctx, 36, 41 - pulse, 4, 11, p.O);
      }
      for (let i = 0; i < 6; i++) block(ctx, 15 + i * 3, 9 + (i % 2) * 2, 5, 9, p.O);
      face(ctx, skin, k, 18);
      block(ctx, 15, 31, 20, 19, k);
      block(ctx, 22, 31, 4, 17, p.W);
      lineBlock(ctx, 35, 18, 39, 57, 2, p.W);
      lineBlock(ctx, 37, 17, 41, 56, 1, k);
      legs(ctx, k, k, k);
      break;
    case 'levi':
      ctx.strokeStyle = p.S;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(25, 34, 20 - (cycle % 3), Math.PI * 1.1, Math.PI * 1.85); ctx.stroke();
      lineBlock(ctx, 7, 41 - pulse, 41, 22 + pulse, 1, p.S);
      block(ctx, 17, 10, 15, 8, p.H);
      face(ctx, skin, k, 18);
      block(ctx, 14, 30, 21, 18, p.G);
      block(ctx, 21, 31, 7, 17, p.W);
      lineBlock(ctx, 12, 27, 5, 49, 1, p.S);
      lineBlock(ctx, 36, 27, 43, 49, 1, p.S);
      legs(ctx, p.H, p.H, k);
      break;
    case 'jinwoo':
      for (let i = 0; i < 4; i++) block(ctx, 6 + i * 10, 54 - ((cycle + i) % 3), 3, 6, p.M);
      ctx.strokeStyle = p.M;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(25, 35, 19, 24, 0, 0, Math.PI * 2); ctx.stroke();
      block(ctx, 17, 9, 15, 10, k);
      face(ctx, skin, k, 18);
      block(ctx, 20, 22, 2, 2, p.M);
      block(ctx, 27, 22, 2, 2, p.M);
      block(ctx, 14, 30, 21, 24, p.D);
      block(ctx, 21, 31, 7, 20, k);
      block(ctx, 9, 52, 5, 7, p.M);
      block(ctx, 36, 52, 5, 7, p.M);
      legs(ctx, p.D, p.D, k);
      break;
    case 'jinx':
      lineBlock(ctx, 33, 35, 46, 32 + pulse, 3, p.V);
      block(ctx, 44, 30 + pulse, 3, 3, p.M);
      block(ctx, 39 + (cycle % 4), 27, 3, 2, paletteAccent);
      block(ctx, 17, 9, 15, 9, p.B);
      face(ctx, skin, k, 18);
      lineBlock(ctx, 15, 16, 7, 54, 3, p.B);
      lineBlock(ctx, 32, 16, 41, 54, 3, p.B);
      block(ctx, 16, 31, 18, 16, p.M);
      block(ctx, 11, 36, 8, 4, p.V);
      block(ctx, 30, 35, 12, 4, p.V);
      legs(ctx, p.D, p.D, k);
      break;
    case 'miles':
      lineBlock(ctx, 31, 27, 46, 9 + (cycle % 4), 1, p.W);
      lineBlock(ctx, 12, 43, 2, 33 - (cycle % 3), 1, p.C);
      block(ctx, 35, 29 + pulse, 7, 3, p.R);
      block(ctx, 17, 12, 15, 16, k);
      block(ctx, 20, 17, 3, 5, p.W);
      block(ctx, 26, 17, 3, 5, p.W);
      block(ctx, 14, 29, 21, 21, k);
      block(ctx, 22, 33, 6, 7, p.R);
      lineBlock(ctx, 16, 31, 9, 45, 3, p.R);
      lineBlock(ctx, 33, 31, 40, 45, 3, p.R);
      legs(ctx, k, k, p.R);
      break;
    case 'totoro':
      block(ctx, 8, 35 - pulse, 5, 2, p.W);
      block(ctx, 35, 32 + pulse, 6, 2, p.W);
      block(ctx, 39, 20 + (cycle % 4), 2, 2, p.W);
      block(ctx, 16, 9, 4, 9, p.G);
      block(ctx, 29, 9, 4, 9, p.G);
      block(ctx, 13, 16, 23, 36, p.G);
      block(ctx, 17, 28, 15, 18, p.W);
      block(ctx, 19, 20, 2, 2, k);
      block(ctx, 28, 20, 2, 2, k);
      block(ctx, 23, 24, 3, 2, k);
      for (let i = 0; i < 3; i++) block(ctx, 19 + i * 5, 34, 3, 2, p.D);
      block(ctx, 12, 50, 9, 7, p.G);
      block(ctx, 29, 50, 9, 7, p.G);
      break;
    case 'cowboy':
      block(ctx, 12, 10, 25, 4, p.S);
      block(ctx, 17, 5, 15, 8, p.S);
      face(ctx, skin, k, 17);
      block(ctx, 15, 30, 19, 17, p.Y);
      block(ctx, 15, 31, 6, 17, p.W);
      block(ctx, 28, 31, 6, 17, p.W);
      block(ctx, 21, 31, 7, 17, p.R);
      legs(ctx, p.B, p.B, k);
      break;
    case 'paper_explorer':
      block(ctx, 14, 9, 21, 5, p.Y);
      block(ctx, 18, 5, 13, 8, p.Y);
      face(ctx, skin, p.K, 17);
      block(ctx, 16, 30, 18, 18, p.B);
      block(ctx, 21, 31, 6, 17, p.R);
      block(ctx, 35, 28, 3, 18, p.K);
      block(ctx, 36, 26, 5, 4, p.W);
      legs(ctx, p.B, p.B, p.K);
      break;
    case 'camera_operator':
      humanoidBase(ctx, p, p.H, p.Y);
      block(ctx, 7, 24, 14, 8, p.K);
      block(ctx, 8, 25, 10, 6, p.S);
      block(ctx, 20, 26, 7, 4, p.K);
      break;
    case 'detective':
      block(ctx, 13, 12, 24, 4, p.K);
      block(ctx, 18, 7, 14, 7, p.H);
      face(ctx, skin, p.K, 18);
      block(ctx, 14, 30, 21, 24, p.H);
      block(ctx, 20, 31, 8, 22, p.W);
      block(ctx, 12, 34, 5, 16, p.H);
      block(ctx, 32, 34, 5, 16, p.H);
      legs(ctx, p.K, p.K, p.K);
      break;
    case 'lobby_boy':
      block(ctx, 17, 8, 15, 7, p.R);
      face(ctx, skin, p.K, 17);
      block(ctx, 14, 30, 21, 20, p.R);
      block(ctx, 22, 31, 4, 18, p.Y);
      block(ctx, 18, 35, 3, 3, p.Y);
      block(ctx, 28, 35, 3, 3, p.Y);
      legs(ctx, p.R, p.R, p.K);
      break;
    case 'traveler':
      block(ctx, 15, 10, 20, 5, p.Y);
      face(ctx, skin, p.K, 17);
      block(ctx, 15, 30, 19, 18, p.B);
      block(ctx, 29, 29, 6, 14, p.K);
      block(ctx, 10, 35, 5, 13, p.S);
      legs(ctx, p.H, p.H, p.K);
      break;
    case 'kurz_bird':
      block(ctx, 14, 18, 21, 17, p.B);
      block(ctx, 17, 14, 16, 12, p.B);
      block(ctx, 21, 16, 2, 2, p.W);
      block(ctx, 27, 16, 2, 2, p.W);
      block(ctx, 24, 21, 5, 3, p.Y);
      block(ctx, 10, 25, 8, 9, p.C);
      block(ctx, 32, 25, 8, 9, p.C);
      block(ctx, 18, 36, 5, 14, p.Y);
      block(ctx, 27, 36, 5, 14, p.Y);
      break;
    case 'marker_teacher':
      face(ctx, skin, p.K, 16);
      block(ctx, 16, 30, 18, 18, p.W);
      block(ctx, 22, 31, 5, 17, p.B);
      block(ctx, 34, 26, 4, 20, p.K);
      block(ctx, 34, 24, 4, 4, p.B);
      legs(ctx, p.K, p.K, p.K);
      break;
    case 'retro_biker':
      block(ctx, 15, 9, 19, 10, p.R);
      block(ctx, 18, 15, 13, 4, p.C);
      block(ctx, 14, 30, 21, 19, p.B);
      block(ctx, 21, 30, 7, 19, p.W);
      block(ctx, 9, 49, 30, 5, p.R);
      legs(ctx, p.B, p.B, p.K);
      break;
    case 'geo_mascot':
      block(ctx, 16, 12, 18, 18, p.B);
      block(ctx, 20, 16, 3, 3, p.W);
      block(ctx, 27, 16, 3, 3, p.W);
      block(ctx, 14, 32, 22, 18, p.M);
      block(ctx, 20, 36, 10, 10, p.Y);
      legs(ctx, p.G, p.G, p.K);
      break;
    case 'samurai':
      block(ctx, 18, 8, 13, 8, p.K);
      face(ctx, skin, p.K, 17);
      block(ctx, 14, 30, 21, 19, p.B);
      block(ctx, 20, 31, 8, 18, p.R);
      lineBlock(ctx, 35, 18, 40, 55, 1, p.W);
      legs(ctx, p.K, p.K, p.K);
      break;
    case 'stopmotion_kid':
      block(ctx, 18, 8, 13, 8, p.B);
      face(ctx, skin, p.K, 17);
      block(ctx, 15, 30, 19, 18, p.Y);
      block(ctx, 18, 31, 13, 17, p.B);
      block(ctx, 13, 34, 5, 12, p.W);
      block(ctx, 32, 34, 5, 12, p.W);
      legs(ctx, p.B, p.B, p.K);
      break;
    case 'neon_runner':
      lineBlock(ctx, 9, 46, 2, 56, 2, p.C);
      lineBlock(ctx, 31, 46, 45, 55, 2, p.M);
      block(ctx, 17, 10, 15, 15, p.K);
      block(ctx, 19, 17, 11, 3, p.C);
      block(ctx, 15, 29, 20, 20, p.B);
      block(ctx, 22, 31, 4, 17, p.M);
      lineBlock(ctx, 34, 34, 41, 43, 3, p.C);
      legs(ctx, p.K, p.K, p.M);
      break;
    case 'comic_hero':
      block(ctx, 17, 12, 15, 15, p.B);
      block(ctx, 20, 17, 2, 2, p.W);
      block(ctx, 27, 17, 2, 2, p.W);
      block(ctx, 14, 29, 21, 21, p.B);
      block(ctx, 21, 32, 7, 10, p.R);
      block(ctx, 11, 31, 5, 22, p.R);
      block(ctx, 33, 31, 5, 22, p.R);
      legs(ctx, p.B, p.B, p.R);
      break;
    case 'clay_inventor':
      face(ctx, skin, p.K, 16);
      block(ctx, 18, 14, 13, 3, p.K);
      block(ctx, 16, 30, 18, 18, p.W);
      block(ctx, 20, 31, 9, 17, p.G || '#6c8f55');
      block(ctx, 34, 29, 5, 14, p.Y);
      legs(ctx, p.S, p.S, p.K);
      break;
    case 'storybook_child':
      block(ctx, 17, 9, 15, 9, p.Y);
      face(ctx, skin, p.K, 17);
      block(ctx, 14, 30, 21, 20, p.G || '#5f9e73');
      block(ctx, 20, 31, 9, 18, p.B);
      block(ctx, 33, 26, 7, 6, p.Y);
      legs(ctx, p.B, p.B, p.K);
      break;
    case 'astronaut':
      block(ctx, 6, 18 + (cycle % 5), 2, 2, p.C);
      block(ctx, 40, 12 + (cycle % 4), 2, 2, p.C);
      block(ctx, 15, 10, 19, 18, p.S || '#c8d2e0');
      block(ctx, 18, 15, 13, 7, p.C);
      block(ctx, 14, 30, 21, 21, p.S || '#c8d2e0');
      block(ctx, 20, 33, 9, 8, p.B);
      block(ctx, 11, 33, 5, 18, p.W);
      block(ctx, 33, 33, 5, 18, p.W);
      legs(ctx, p.S || '#c8d2e0', p.S || '#c8d2e0', p.K);
      break;
    case 'visor_biker':
      lineBlock(ctx, 6, 52, 42, 52, 2, p.M);
      block(ctx, 36 + (cycle % 4), 46, 5, 3, p.C);
      block(ctx, 15, 9, 19, 14, p.K);
      block(ctx, 17, 15, 15, 4, p.M);
      block(ctx, 14, 30, 21, 19, p.B);
      block(ctx, 21, 31, 7, 18, p.C);
      block(ctx, 8, 50, 31, 5, p.M);
      legs(ctx, p.K, p.K, p.C);
      break;
    case 'block_adventurer':
    default:
      block(ctx, 16, 9, 17, 10, p.Y || '#f0c04a');
      face(ctx, skin, p.K || '#09090b', 18);
      block(ctx, 15, 31, 19, 19, p.G || '#5d9c59');
      block(ctx, 21, 32, 7, 18, p.B || '#2960b8');
      block(ctx, 34, 31, 5, 10, p.S || '#6b4a2b');
      legs(ctx, p.B || '#2960b8', p.B || '#2960b8', p.K || '#09090b');
      break;
  }
  ctx.restore();
}

function renderPlate(
  ctx: CanvasRenderingContext2D,
  character: PlateCharacter,
  width: number,
  height: number,
  t: number,
  glow: boolean,
  accentColor?: string,
) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);

  const accent = accentColor || character.accent || '#d6a84f';
  if (glow) {
    const halo = ctx.createRadialGradient(width * 0.42, height * 0.58, 0, width * 0.42, height * 0.58, Math.min(width, height) * 0.62);
    halo.addColorStop(0, `${accent}42`);
    halo.addColorStop(0.58, `${accent}16`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);
  }

  const low = document.createElement('canvas');
  low.width = PLATE_W;
  low.height = PLATE_H;
  const lowCtx = low.getContext('2d');
  if (!lowCtx) return;
  lowCtx.imageSmoothingEnabled = false;
  drawPlateCharacter(lowCtx, character, t, accent);

  const sx = 4;
  const sy = 2;
  const sw = 40;
  const sh = 62;
  const scale = Math.max(1, Math.min(width / sw, height / sh) * 0.98);
  const drawW = Math.round(sw * scale);
  const drawH = Math.round(sh * scale);
  const x = Math.round((width - drawW) * 0.32);
  const y = Math.round(height - drawH - 1);

  ctx.filter = 'drop-shadow(0 16px 18px rgba(0,0,0,0.72))';
  ctx.drawImage(low, sx, sy, sw, sh, x + scale, y + scale, drawW, drawH);
  ctx.filter = 'none';
  ctx.drawImage(low, sx, sy, sw, sh, x, y, drawW, drawH);
}

export const CharacterStage: React.FC<CharacterStageProps> = ({
  worldId,
  spriteId,
  width = 200,
  height = 200,
  glow = false,
  mode = 'avatar',
  accentColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    if (mode === 'plate') {
      const character = getPlateCharacter(worldId || '');
      let animationFrameId = 0;
      const render = (time: number) => {
        renderPlate(ctx, character, width, height, time, glow, accentColor);
        animationFrameId = requestAnimationFrame(render);
      };
      animationFrameId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animationFrameId);
    }

    const sprite = spriteId ? (CHARACTER_SPRITES[spriteId] || CHARACTER_SPRITES.default) : getCharacterSprite(worldId || '');
    let frameIdx = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const render = (time: number) => {
      const dt = time - lastTime;
      if (dt > sprite.speed) {
        frameIdx = (frameIdx + 1) % sprite.frames.length;
        lastTime = time;
      }

      ctx.clearRect(0, 0, width, height);
      if (glow) {
        const colors = Object.values(sprite.palette);
        const accent = colors[Math.min(2, colors.length - 1)] || '#d6a84f';
        const halo = ctx.createRadialGradient(width / 2, height * 0.58, 0, width / 2, height * 0.58, Math.min(width, height) * 0.62);
        halo.addColorStop(0, `${accent}44`);
        halo.addColorStop(0.56, `${accent}18`);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, width, height);
      }

      const frame = sprite.frames[frameIdx];
      const pxSize = sprite.scale;
      const startX = (width - frame[0].length * pxSize) / 2 + sprite.offsetX;
      const startY = (height - frame.length * pxSize) / 2 + sprite.offsetY;

      for (let y = 0; y < frame.length; y++) {
        const row = frame[y];
        for (let x = 0; x < row.length; x++) {
          const char = row[x];
          if (char !== ' ') {
            ctx.fillStyle = sprite.palette[char] || '#fff';
            ctx.fillRect(startX + x * pxSize, startY + y * pxSize, pxSize, pxSize);
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [worldId, spriteId, width, height, glow, mode, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', margin: mode === 'plate' ? 0 : '0 auto', pointerEvents: 'none', imageRendering: 'pixelated' }}
    />
  );
};
