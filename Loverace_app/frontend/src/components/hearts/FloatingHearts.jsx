import { useEffect, useRef } from 'react';

const COLORS = ['#C0002A', '#FF4D6D', '#FFE4EC', '#FF0A54', '#FF6B9D', '#FFB3C6'];
const HEART_COUNT = 22;

function drawHeart(ctx, cx, cy, r, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const x = cx - r;
  const y = cy - r * 0.75;
  ctx.moveTo(cx, y + r * 1.5);
  ctx.bezierCurveTo(cx, y + r, x, y + r, x, cy);
  ctx.bezierCurveTo(x, cy - r * 0.55, cx - r * 0.45, cy - r, cx, cy - r * 0.5);
  ctx.bezierCurveTo(cx + r * 0.45, cy - r, cx + r * 2, cy - r * 0.55, cx + r * 2, cy);
  ctx.bezierCurveTo(cx + r * 2, y + r, cx + r, y + r, cx, y + r * 1.5);
  ctx.fill();
  ctx.restore();
}

function makeHeart(canvas, spawn = false) {
  return {
    x: Math.random() * canvas.width,
    y: spawn ? canvas.height + 30 : Math.random() * canvas.height,
    r: Math.random() * 14 + 6,
    alpha: Math.random() * 0.35 + 0.08,
    speed: Math.random() * 1.2 + 0.4,
    drift: (Math.random() - 0.5) * 0.6,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.03 + 0.008,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export default function FloatingHearts() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const hearts = Array.from({ length: HEART_COUNT }, () => makeHeart(canvas));

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hearts.forEach((h, i) => {
        h.wobble += h.wobbleSpeed;
        h.y -= h.speed;
        h.x += h.drift + Math.sin(h.wobble) * 0.4;
        if (h.y < -50) hearts[i] = makeHeart(canvas, true);
        drawHeart(ctx, h.x, h.y, h.r, h.color, h.alpha);
      });
      animId = requestAnimationFrame(tick);
    }

    tick();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, mixBlendMode: 'multiply' }}
    />
  );
}
