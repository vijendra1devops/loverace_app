import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import { useRadarStore } from '../../store/radarStore';
import { formatDistance, DEMO_CENTER_LAT, DEMO_CENTER_LNG } from '../../services/dummyData';

const RING_RADII_M = [100, 250, 500, 1000, 2000, 5000];

// Map the radar radius (metres) to a sensible MapLibre zoom level
const RADIUS_ZOOM_MAP = [[100, 18], [250, 17], [500, 16], [1000, 15], [2000, 14], [5000, 13]];
function radiusToZoom(r) {
  for (const [rm, z] of RADIUS_ZOOM_MAP) if (r <= rm) return z;
  return 13;
}
const COLORS = {
  ring: 'rgba(192,0,42,0.28)',
  ringBright: 'rgba(192,0,42,0.65)',
  sweepEdge: 'rgba(255,75,109,0.95)',
  grid: 'rgba(255,100,130,0.10)',
  center: '#C0002A',
  text: 'rgba(255,180,200,0.85)',
};

// Project a geo point to canvas pixels relative to centre
function geoToCanvas(userLat, userLng, centerLat, centerLng, radarRadiusPx, radarRadiusM) {
  const EARTH_R = 6_371_000;
  const dLat = (userLat - centerLat) * (Math.PI / 180) * EARTH_R;
  const dLng = (userLng - centerLng) * (Math.PI / 180) * EARTH_R * Math.cos(centerLat * (Math.PI / 180));
  const scale = radarRadiusPx / radarRadiusM;
  return { px: dLng * scale, py: -dLat * scale };
}

function clampToBubble(px, py, maxR, margin = 30) {
  const dist = Math.sqrt(px * px + py * py);
  const limit = maxR - margin;
  if (dist <= limit) return { px, py };
  return { px: (px / dist) * limit, py: (py / dist) * limit };
}

function UserBubble({ user, x, y, visible, onClick }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key={user.user_id}
          className="absolute flex flex-col items-center gap-1 no-select"
          style={{ left: x - 28, top: y - 28 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={() => onClick?.(user)}
          aria-label={user.display_name}
        >
          <span
            className="absolute w-14 h-14 rounded-full border-2 border-primary/50 animate-pulse-ring"
            style={{ left: 0, top: 0 }}
          />
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary bg-blush shadow-glow-red">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                {user.display_name?.[0] || '?'}
              </div>
            )}
          </div>
          <span className="text-[10px] font-semibold text-white bg-primary/80 rounded-full px-2 py-0.5 mt-0.5 shadow backdrop-blur-sm whitespace-nowrap">
            {formatDistance(user.fuzzy_distance_m)}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function RadarMap({ onUserClick }) {
  const canvasRef  = useRef(null);
  const mapDivRef  = useRef(null);
  const mapRef     = useRef(null);
  const animIdRef  = useRef(null);
  const sweepAngleRef = useRef(0);

  // Must come before the useState that references radius
  const { users, radius, userLat, userLng } = useRadarStore();

  const [mapZoom, setMapZoom] = useState(() => radiusToZoom(radius));

  // Stable position cache — updated only when users/radius/centre change
  const stablePosRef = useRef({});
  const [visibleUsers, setVisibleUsers] = useState({});
  const [bubbleTick, setBubbleTick]     = useState(0); // triggers re-render after positions settle

  // Use demo centre if store hasn't received a position yet
  const centerLat = userLat ?? DEMO_CENTER_LAT;
  const centerLng = userLng ?? DEMO_CENTER_LNG;

  // ── Recompute stable positions (NOT inside draw loop) ───────────────
  const recomputePositions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radarR = Math.min(cx, cy) - 20;
    const next = {};
    users.forEach((u) => {
      const uLat = u.lat ?? centerLat;
      const uLng = u.lng ?? centerLng;
      const { px, py } = geoToCanvas(uLat, uLng, centerLat, centerLng, radarR, radius);
      const clamped = clampToBubble(px, py, radarR);
      next[u.user_id] = { x: cx + clamped.px, y: cy + clamped.py };
    });
    stablePosRef.current = next;
    setBubbleTick((t) => t + 1);
  }, [users, radius, centerLat, centerLng]);

  // Recompute whenever data dependencies change
  useEffect(() => { recomputePositions(); }, [recomputePositions]);

  // ── Canvas draw loop ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width  = parent.clientWidth;
      canvas.height = parent.clientHeight;
      recomputePositions();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();

    function draw() {
      const { width: W, height: H } = canvas;
      const cx = W / 2, cy = H / 2;
      const radarR = Math.min(cx, cy) - 20;

      // ── Transparent canvas — map shows through ─────────────────────
      ctx.clearRect(0, 0, W, H);

      // ── Clipping circle ────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radarR, 0, Math.PI * 2);
      ctx.clip();

      // ── Grid lines ─────────────────────────────────────────────────
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      for (let a = 0; a < 360; a += 30) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const rad = (a * Math.PI) / 180;
        ctx.lineTo(cx + Math.cos(rad) * radarR, cy + Math.sin(rad) * radarR);
        ctx.stroke();
      }

      // ── Distance rings ─────────────────────────────────────────────
      RING_RADII_M.forEach((rm, i) => {
        if (rm > radius) return;
        const rPx = (rm / radius) * radarR;
        ctx.beginPath();
        ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
        ctx.strokeStyle = i === 0 ? COLORS.ringBright : COLORS.ring;
        ctx.lineWidth = i === 0 ? 1.5 : 1;
        ctx.stroke();
        ctx.fillStyle = COLORS.text;
        ctx.font = `bold ${i === 0 ? 10 : 9}px Poppins, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(rm >= 1000 ? `${rm / 1000}km` : `${rm}m`, cx + rPx + 4, cy - 3);
      });

      // ── Sweep beam ─────────────────────────────────────────────────
      sweepAngleRef.current = (sweepAngleRef.current + 0.018) % (Math.PI * 2);
      const sweep = sweepAngleRef.current;
      const sweepSpan = Math.PI * 0.45;

      // Trailing glow wedge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radarR, sweep - sweepSpan, sweep);
      const swGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radarR);
      swGrad.addColorStop(0, 'rgba(192,0,42,0.0)');
      swGrad.addColorStop(0.5, 'rgba(192,0,42,0.10)');
      swGrad.addColorStop(1, 'rgba(255,75,109,0.0)');
      ctx.fillStyle = swGrad;
      ctx.fill();

      // Leading edge line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * radarR, cy + Math.sin(sweep) * radarR);
      ctx.strokeStyle = COLORS.sweepEdge;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#FF4D6D';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore(); // end clip

      // ── Center dot ────────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.center;
      ctx.shadowColor = '#FF0A54';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 10px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', cx, cy - 12);

      // ── Outer border ───────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, radarR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192,0,42,0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── Reveal users as sweep passes — READ from stablePosRef ──────
      setVisibleUsers((prev) => {
        let changed = false;
        const next = { ...prev };
        users.forEach((u) => {
          if (next[u.user_id]) return;
          const p = stablePosRef.current[u.user_id];
          if (!p) return;
          const angle = Math.atan2(p.y - cy, p.x - cx);
          const normalised = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const sw = ((sweep % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const diff = Math.abs(normalised - sw);
          if (diff < 0.14 || diff > Math.PI * 2 - 0.14) {
            next[u.user_id] = true;
            changed = true;
          }
        });
        return changed ? next : prev;
      });

      animIdRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animIdRef.current);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, radius]);

  // Force-reveal all users after 4 s
  useEffect(() => {
    const t = setTimeout(() => {
      const all = {};
      users.forEach((u) => { all[u.user_id] = true; });
      setVisibleUsers(all);
    }, 4000);
    return () => clearTimeout(t);
  }, [users]);

  // ── MapLibre GL initialisation ──────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current) return;
    if (mapRef.current) return; // already initialised

    const styleUrl =
      import.meta.env.VITE_MAP_STYLE_URL ||
      'https://tiles.openfreemap.org/styles/liberty';

    mapRef.current = new maplibregl.Map({
      container: mapDivRef.current,
      style: styleUrl,
      center: [centerLng, centerLat],
      zoom: radiusToZoom(radius),
      interactive: false,  // radar handles all interaction
      attributionControl: false,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan map when centre changes
  useEffect(() => {
    mapRef.current?.flyTo({ center: [centerLng, centerLat], duration: 800 });
  }, [centerLat, centerLng]);

  // Sync map zoom when radar radius changes
  useEffect(() => {
    const z = radiusToZoom(radius);
    setMapZoom(z);
    mapRef.current?.setZoom(z);
  }, [radius]);

  return (
    <div className="radar-container w-full h-full" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Layer 1: MapLibre tile map — clipped to circle */}
      <div
        ref={mapDivRef}
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: 'circle(48% at 50% 50%)',
          WebkitClipPath: 'circle(48% at 50% 50%)',
        }}
      />

      {/* Layer 2: Dark vignette ring so radar overlay reads clearly */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle, rgba(13,0,16,0.15) 38%, rgba(13,0,16,0.65) 72%, rgba(10,0,8,0.97) 100%)',
          pointerEvents: 'none',
          clipPath: 'circle(48% at 50% 50%)',
          WebkitClipPath: 'circle(48% at 50% 50%)',
        }}
      />

      {/* Layer 3: Canvas — transparent, draws rings/sweep/labels only */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }} />

      {/* Layer 4: User bubbles */}
      {users.map((u) => {
        const pos = stablePosRef.current[u.user_id];
        if (!pos) return null;
        return (
          <UserBubble
            key={u.user_id}
            user={u}
            x={pos.x}
            y={pos.y}
            visible={!!visibleUsers[u.user_id]}
            onClick={onUserClick}
          />
        );
      })}

      {users.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
          <p className="text-rose-soft/60 text-sm font-medium text-center px-6">
            No one nearby yet.<br />Move the range slider or check back later.
          </p>
        </div>
      )}

      {/* Zoom controls — bottom-right, outside the circle clip area */}
      <div className="absolute bottom-4 right-3 z-20 flex flex-col gap-1.5" style={{ pointerEvents: 'auto' }}>
        <button
          onClick={() => {
            const z = Math.min(mapZoom + 1, 20);
            setMapZoom(z);
            mapRef.current?.setZoom(z);
          }}
          className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-md text-gray-700 text-base font-bold flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => {
            const z = Math.max(mapZoom - 1, 10);
            setMapZoom(z);
            mapRef.current?.setZoom(z);
          }}
          className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-md text-gray-700 text-base font-bold flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  );
}
