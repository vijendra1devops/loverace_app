import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import BondProgressBar from './BondProgressBar';
import MessageBubble from './MessageBubble';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useBondProgress } from '../../hooks/useBondProgress';
import { getMessages, getBondProgress } from '../../services/api';
import ws from '../../services/websocket';

export default function ChatWindow({ conversationId, partner }) {
  const navigate = useNavigate();
  const myId = useAuthStore((s) => s.user?.id);
  const messages = useChatStore((s) => s.messages[conversationId] || []);
  const isTyping = useChatStore((s) => s.typingUsers[conversationId] || false);
  const { setMessages, setBondProgress, appendMessage, markRead } = useChatStore();
  const bp = useBondProgress(conversationId);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Load history
  useEffect(() => {
    if (!conversationId) return;
    markRead(conversationId);
    Promise.all([
      getMessages(conversationId),
      getBondProgress(conversationId),
    ]).then(([msgs, bond]) => {
      setMessages(conversationId, msgs);
      if (bond) setBondProgress(conversationId, bond);
    }).catch(() => {});
  }, [conversationId, setMessages, setBondProgress, markRead]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    setSending(true);

    // Optimistic append
    const optimistic = {
      id: `opt_${Date.now()}`,
      senderId: myId,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    appendMessage(conversationId, optimistic);

    // Send via WebSocket
    ws.send('message.send', { conversation_id: conversationId, text: trimmed });
    setSending(false);
  }, [text, sending, myId, conversationId, appendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    ws.send('typing.start', { conversation_id: conversationId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {}, 3000);
  };

  const handleConfirmUpgrade = () => {
    ws.send('bond.confirm', { conversation_id: conversationId });
    setConfirmModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface-alt)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[var(--border)] shadow-sm z-10">
        <button
          onClick={() => navigate('/chat')}
          className="text-primary p-1 rounded-lg hover:bg-blush transition-colors mr-1"
          aria-label="Back"
        >
          ←
        </button>
        <Avatar
          src={partner?.photos?.[0]?.url || partner?.avatar_url}
          name={partner?.display_name || partner?.name || '?'}
          size="sm"
          stage={bp?.stage}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {partner?.display_name || partner?.name}
          </h3>
          {isTyping ? (
            <p className="text-xs text-primary animate-pulse">typing…</p>
          ) : (
            bp && (
              <p className="text-xs text-gray-400">
                {bp.stageName} · Lv {bp.level}
              </p>
            )
          )}
        </div>
      </div>

      {/* Bond progress bar */}
      <BondProgressBar conversationId={conversationId} />

      {/* Stage upgrade prompt */}
      {bp?.pendingConfirmation && (
        <button
          className="mx-4 mt-2 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-rose rounded-xl animate-pulse"
          onClick={() => setConfirmModal(true)}
        >
          🎉 Upgrade to {['', 'Couples', 'Soulmate', 'Lovers', '🔥'][bp.stage + 1] || 'next stage'}!
        </button>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            <p className="text-3xl mb-2">💬</p>
            <p>Say hello and start building your Bond!</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble message={msg} isMe={msg.senderId === myId} />
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <div className="flex justify-start">
            <div className="bubble-them px-4 py-2.5 flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex items-end gap-2 px-4 py-3 bg-white border-t border-[var(--border)]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          placeholder="Send a message…"
          rows={1}
          className="flex-1 input-field resize-none min-h-[44px] max-h-28 py-2.5 leading-relaxed"
          style={{ overflowY: text.includes('\n') ? 'auto' : 'hidden' }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={!text.trim() || sending}
          onClick={sendMessage}
          className="w-11 h-11 flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary to-rose text-white flex items-center justify-center shadow-glow-red disabled:opacity-50"
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </motion.button>
      </div>

      {/* Stage confirm modal */}
      <Modal open={confirmModal} onClose={() => setConfirmModal(false)} title="💕 Stage Upgrade!">
        <div className="text-center space-y-4">
          <p className="text-4xl animate-match-burst">🎉</p>
          <p className="text-gray-700">
            You've reached <strong>Level 101</strong> in{' '}
            <strong className="text-primary">{bp?.stageName}</strong>!<br />
            Ready to advance to the next stage together?
          </p>
          <p className="text-xs text-gray-400">Both of you must confirm to upgrade.</p>
          <Button onClick={handleConfirmUpgrade}>Yes, upgrade! 🚀</Button>
          <Button variant="ghost" onClick={() => setConfirmModal(false)}>Not yet</Button>
        </div>
      </Modal>
    </div>
  );
}
