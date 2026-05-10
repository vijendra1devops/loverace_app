import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from '../components/common/Avatar';
import HeartFill from '../components/common/HeartFill';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { getMatches } from '../services/api';
import { getUserById, isDummy } from '../services/dummyData';
import { formatDistanceToNow } from '../utils/time';

const STAGE_NAMES = ['', 'Dating', 'Couples', 'Soulmate', 'Lovers'];
const STAGE_BADGES = ['', '💕', '👫', '🌟', '🔥'];

export default function MatchesPage() {
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);

  useEffect(() => {
    getMatches().then((matches) => {
      setConversations(matches || []);
    }).catch(() => {});
  }, [setConversations]);

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: 'var(--nav-height)' }}>
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-[var(--border)] md:px-8">
        <div className="md:max-w-3xl md:mx-auto">
          <h1 className="font-bold text-xl text-primary">Matches 💌</h1>
          <p className="text-xs text-gray-500 mt-0.5">{conversations.length} connections</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <span className="text-6xl animate-heartbeat">💌</span>
          <h3 className="font-bold text-lg text-gray-700">No matches yet</h3>
          <p className="text-sm text-gray-500">Start swiping to find your connections!</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          <div className="md:max-w-3xl md:mx-auto">
          {conversations.map((conv, i) => {
            const partner = isDummy() ? getUserById(conv.userId) : null;
            const name = partner?.name || conv.userId;
            const avatar = partner?.photos?.[0]?.url || null;
            const stage = conv.bondStage || 1;
            const level = conv.bondLevel || 1;

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
              >
                <Link
                  to={`/chat/${conv.conversationId}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-blush/40 transition-colors active:bg-blush"
                >
                  <div className="relative">
                    <Avatar src={avatar} name={name} size="md" stage={stage} />
                    {conv.unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {conv.unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-semibold truncate ${conv.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {name}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(conv.lastMessageAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <HeartFill level={level} stage={stage} size={32} animated={false} pulse={false} />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px]">{STAGE_BADGES[stage]}</span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {STAGE_NAMES[stage]} · Lv&nbsp;{level}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${conv.unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                          {conv.lastMessage || 'Say hello!'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
