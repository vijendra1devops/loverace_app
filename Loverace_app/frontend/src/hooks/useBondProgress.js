import { useMemo } from 'react';
import { useChatStore } from '../store/chatStore';
import { xpToLevel, wordsNeeded } from '../services/dummyData';

export function useBondProgress(conversationId) {
  const bondProgress = useChatStore((s) => s.bondProgress[conversationId]);

  const computed = useMemo(() => {
    if (!bondProgress) return null;
    const { stage, stageXp, stageName, totalWords } = bondProgress;
    const { level, progressXp, levelXp } = xpToLevel(stageXp, stage);
    const pct = levelXp > 0 ? Math.min(100, Math.round((progressXp / levelXp) * 100)) : 0;
    const nextWordTarget = wordsNeeded(level, stage);

    return {
      stage,
      stageName: stageName || ['', 'Dating', 'Couples', 'Soulmate', 'Lovers'][stage],
      level,
      pct,
      progressXp,
      levelXp: nextWordTarget,
      totalWords: totalWords || 0,
      isMaxLevel: level >= 101,
      pendingConfirmation: bondProgress.pendingConfirmation || false,
    };
  }, [bondProgress]);

  return computed;
}
