import React, { useEffect, useRef } from 'react';

/* ============================================================
   AntigravityBackground — cinematic ambient field.
   Layered golden dust motes (3 depth planes, parallax) drifting
   through slow-moving soft light blooms (gold + ember stage
   lights). Reacts gently to the cursor. No constellation lines,
   no O(n²) work — premium, calm, performant.
   Honours prefers-reduced-motion (renders a single static frame).
   ============================================================ */
export const AntigravityBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    const resizeBuffer = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeBuffer();

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // pointer (smoothed) for gentle parallax
    let px = width / 2, py = height / 2;
    let tx = width / 2, ty = height / 2;

    // ── depth-layered dust motes ──
    type Mote = { x: number; y: number; z: number; r: number; vx: number; vy: number; tw: number; warm: boolean };
    const motes: Mote[] = [];
    const COUNT = Math.min(150, Math.round((width * height) / 14000));
    for (let i = 0; i < COUNT; i++) {
      const z = Math.random();               // 0 = far, 1 = near
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        r: 0.5 + z * 2.2,
        vx: (Math.random() - 0.5) * (0.06 + z * 0.18),
        vy: -(0.05 + z * 0.22) - Math.random() * 0.1,   // slow drift up
        tw: Math.random() * Math.PI * 2,                // twinkle phase
        warm: Math.random() > 0.4,
      });
    }

    // ── slow drifting light blooms (stage lights) ──
    type Bloom = { bx: number; by: number; r: number; hue: 'gold' | 'ember'; sx: number; sy: number; ph: number };
    const blooms: Bloom[] = [
      { bx: 0.26, by: 0.30, r: 0.55, hue: 'gold',  sx: 0.00007, sy: 0.00005, ph: 0 },
      { bx: 0.78, by: 0.68, r: 0.5,  hue: 'ember', sx: -0.00005, sy: 0.00006, ph: 2 },
      { bx: 0.6,  by: 0.12, r: 0.42, hue: 'gold',  sx: 0.00004, sy: -0.00004, ph: 4 },
    ];

    let t = 0;
    let raf = 0;

    const render = () => {
      // Guard: before first layout the canvas can be 0×0, which would make the
      // parallax drivers NaN and blow up createRadialGradient. Skip until sized.
      if (width < 2 || height < 2) { raf = requestAnimationFrame(render); return; }
      t += 1;
      // ease pointer
      px += (tx - px) * 0.04; py += (ty - py) * 0.04;
      const pdx = px / width - 0.5;     // -0.5..0.5 parallax driver
      const pdy = py / height - 0.5;

      ctx.clearRect(0, 0, width, height);

      // 1) soft drifting blooms (additive, very low alpha)
      ctx.globalCompositeOperation = 'lighter';
      for (const b of blooms) {
        const cx = (b.bx + Math.sin(t * b.sx * 1000 + b.ph) * 0.04 - pdx * 0.06) * width;
        const cy = (b.by + Math.cos(t * b.sy * 1000 + b.ph) * 0.04 - pdy * 0.06) * height;
        const rad = b.r * Math.min(width, height);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const col = b.hue === 'gold' ? '246,200,98' : '255,157,77';
        g.addColorStop(0, `rgba(${col},0.10)`);
        g.addColorStop(0.4, `rgba(${col},0.035)`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      }

      // 2) dust motes with depth parallax + twinkle
      for (const m of motes) {
        if (!reduced) {
          m.x += m.vx; m.y += m.vy; m.tw += 0.02 + m.z * 0.02;
          if (m.y < -4) { m.y = height + 4; m.x = Math.random() * width; }
          if (m.x < -4) m.x = width + 4; if (m.x > width + 4) m.x = -4;
        }
        const par = (m.z - 0.4) * 26;          // near layers shift more with pointer
        const sx = m.x - pdx * par;
        const sy = m.y - pdy * par;
        const twinkle = 0.55 + Math.sin(m.tw) * 0.45;
        const baseA = (0.12 + m.z * 0.5) * twinkle;
        const col = m.warm ? '255,219,150' : '210,224,255';
        ctx.beginPath();
        ctx.fillStyle = `rgba(${col},${baseA})`;
        ctx.arc(sx, sy, m.r, 0, Math.PI * 2);
        ctx.fill();
        // near, bright motes get a tiny glow
        if (m.z > 0.7) {
          const gg = ctx.createRadialGradient(sx, sy, 0, sx, sy, m.r * 6);
          gg.addColorStop(0, `rgba(${col},${baseA * 0.5})`);
          gg.addColorStop(1, `rgba(${col},0)`);
          ctx.fillStyle = gg;
          ctx.fillRect(sx - m.r * 6, sy - m.r * 6, m.r * 12, m.r * 12);
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      if (!reduced) raf = requestAnimationFrame(render);
    };
    render();

    const onResize = () => resizeBuffer();
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
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
