import clsx from 'clsx';
import { useBondProgress } from '../../hooks/useBondProgress';
import { triggerLevelUp } from '../swipe/SwipeEffects';
import { useEffect, useRef } from 'react';
import HeartFill from '../common/HeartFill';

const STAGE_LABELS = ['', 'Dating', 'Couples', 'Soulmate', 'Lovers'];
const STAGE_CLASSES = ['', 'badge-dating', 'badge-couples', 'badge-soulmate', 'badge-lovers'];
const STAGE_EMOJIS = ['', '💕', '👫', '🌟', '🔥'];

export default function BondProgressBar({ conversationId }) {
  const bp = useBondProgress(conversationId);
  const prevLevel = useRef(null);

  useEffect(() => {
    if (!bp) return;
    if (prevLevel.current != null && bp.level > prevLevel.current) {
      triggerLevelUp();
    }
    prevLevel.current = bp.level;
  }, [bp]);

  if (!bp) return null;

  const { stage, stageName, level, pct, progressXp, levelXp, totalWords } = bp;
  // Heart fill % = level / 101 — shows how full the bond heart is toward the next stage
  const heartPct = Math.round((level / 101) * 100);

  return (
    <div className="px-4 py-3 bg-white/90 backdrop-blur border-b border-[var(--border)]">
      <div className="flex items-start gap-3">

        {/* ── Heart: bond stage progress (fills as you climb from Lvl 1 → 101) ── */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <HeartFill level={heartPct} stage={stage} size={52} animated pulse />
          <span className="text-[9px] text-gray-400 font-medium leading-none">
            {level === 101 ? '🔓 Next bond!' : `${101 - level} lvls to bond`}
          </span>
        </div>

        {/* ── Right side: stage badge, level bar, XP text ── */}
        <div className="flex-1 min-w-0 space-y-2 pt-0.5">
          {/* Stage + level header */}
          <div className="flex items-center justify-between">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border',
                STAGE_CLASSES[stage] || 'badge-dating',
              )}
            >
              {STAGE_EMOJIS[stage]} {stageName || STAGE_LABELS[stage]}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-bold text-primary">Lvl {level}</span>
              <span>/ 101</span>
              <span className="text-gray-300">·</span>
              <span>{totalWords.toLocaleString()} words</span>
            </div>
          </div>

          {/* Level XP progress bar — shows progress within current level */}
          <div className="bond-bar-track h-2.5 w-full relative">
            <div className="bond-bar-fill h-full" style={{ width: `${pct}%` }} />
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((t) => (
              <div
                key={t}
                className="absolute top-0 bottom-0 w-px bg-white/30"
                style={{ left: `${t}%` }}
              />
            ))}
          </div>

          {/* Words needed for next level */}
          <p className="text-[10px] text-gray-400">
            {progressXp} / {levelXp} words this level · <span className="text-primary font-semibold">{levelXp - progressXp} more to level up</span>
          </p>
        </div>
      </div>

      {/* Pending confirmation badge */}
      {bp.pendingConfirmation && (
        <div className="text-center mt-2">
          <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            🎉 Stage upgrade ready — both must confirm!
          </span>
        </div>
      )}
    </div>
  );
}
