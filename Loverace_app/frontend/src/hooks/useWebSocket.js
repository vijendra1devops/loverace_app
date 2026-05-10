import { useEffect, useRef } from 'react';
import ws from '../services/websocket';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useSwipeStore } from '../store/swipeStore';

export function useWebSocket() {
  const token = useAuthStore((s) => s.token);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const setBondProgress = useChatStore((s) => s.setBondProgress);
  const setTyping = useChatStore((s) => s.setTyping);
  const incrementUnread = useChatStore((s) => s.incrementUnread);
  const setLastMatch = useSwipeStore((s) => s.setLastMatch);
  const cleanupRefs = useRef([]);

  useEffect(() => {
    if (!token) return;

    ws.connect(token);

    const unsubs = [
      ws.on('message.received', (payload) => {
        appendMessage(payload.conversation_id, {
          id: payload.message_id,
          senderId: payload.sender_id,
          text: payload.text,
          createdAt: payload.created_at,
        });
        incrementUnread(payload.conversation_id);
      }),

      ws.on('bond.progress', (payload) => {
        setBondProgress(payload.conversation_id, {
          stage: payload.stage,
          level: payload.level,
          stageXp: payload.stage_xp,
          stageName: payload.stage_name,
          wordsNeeded: payload.words_needed,
          totalWords: payload.total_words,
          pendingConfirmation: payload.pending_confirmation,
        });
      }),

      ws.on('bond.stage_upgraded', (payload) => {
        setBondProgress(payload.conversation_id, {
          stage: payload.new_stage,
          level: 1,
          stageXp: 0,
          stageName: payload.new_stage_name,
          wordsNeeded: 10,
          totalWords: payload.total_words,
        });
      }),

      ws.on('match.created', (payload) => {
        // Realtime match notification
        setLastMatch({ id: payload.matched_user_id, name: payload.matched_user_name, avatarUrl: payload.avatar_url });
      }),

      ws.on('typing.indicator', (payload) => {
        setTyping(payload.conversation_id, payload.is_typing);
        if (payload.is_typing) {
          setTimeout(() => setTyping(payload.conversation_id, false), 4000);
        }
      }),
    ];

    cleanupRefs.current = unsubs;

    return () => {
      cleanupRefs.current.forEach((fn) => fn?.());
      ws.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return ws;
}
