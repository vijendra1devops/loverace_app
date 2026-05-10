import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';
import Avatar from '../components/common/Avatar';
import { useChatStore } from '../store/chatStore';
import { getMatches } from '../services/api';
import { getUserById, isDummy } from '../services/dummyData';
import { formatDistanceToNow } from '../utils/time';

const STAGE_BADGES = ['', '💕', '👫', '🌟', '🔥'];
const STAGE_NAMES = ['', 'Dating', 'Couples', 'Soulmate', 'Lovers'];

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const setActiveId = useChatStore((s) => s.setActiveId);

  useEffect(() => {
    getMatches().then((m) => setConversations(m || [])).catch(() => {});
  }, [setConversations]);

  useEffect(() => {
    setActiveId(conversationId || null);
    return () => setActiveId(null);
  }, [conversationId, setActiveId]);

  const activeConv = conversations.find((c) => c.conversationId === conversationId);
  const activePartner = isDummy()
    ? getUserById(activeConv?.userId)
    : { display_name: activeConv?.userId };

  // Conversation list panel (shared between mobile list view and desktop left pane)
  const ConvList = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 bg-white border-b border-[var(--border)]">
        <h1 className="font-bold text-xl text-primary">Chat 💬</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <span className="text-6xl">💬</span>
          <h3 className="font-bold text-lg text-gray-700">No conversations yet</h3>
          <p className="text-sm text-gray-500">Match with someone to start chatting!</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          {conversations.map((conv) => {
            const partner = isDummy() ? getUserById(conv.userId) : null;
            const name = partner?.name || conv.userId;
            const avatar = partner?.photos?.[0]?.url || null;
            const stage = conv.bondStage || 1;
            const isActive = conv.conversationId === conversationId;

            return (
              <Link
                key={conv.id}
                to={`/chat/${conv.conversationId}`}
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-blush
                  ${isActive ? 'bg-blush/60' : 'hover:bg-blush/40'}`}
              >
                <Avatar src={avatar} name={name} size="md" stage={stage} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold truncate ${conv.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {name}
                    </h3>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {STAGE_BADGES[stage]} {STAGE_NAMES[stage]} · Lv {conv.bondLevel || 1}
                  </p>
                  <p className={`text-xs mt-0.5 truncate ${conv.unread > 0 ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                    {conv.lastMessage || 'Say hello!'}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="min-w-[20px] h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── DESKTOP layout: always show both list + chat pane side by side ──
  // ── MOBILE layout: show either list OR detail (original behaviour) ──

  // Mobile: detail view
  if (conversationId) {
    return (
      <>
        {/* Mobile: full-screen chat */}
        <div className="flex flex-col h-full md:hidden" style={{ paddingBottom: 'var(--nav-height)' }}>
          <ChatWindow conversationId={conversationId} partner={activePartner} />
        </div>

        {/* Desktop: split pane */}
        <div className="hidden md:flex h-full">
          {/* Left: conversation list */}
          <div className="w-80 flex-none border-r border-[var(--border)] overflow-hidden">
            {ConvList}
          </div>
          {/* Right: chat window */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatWindow conversationId={conversationId} partner={activePartner} />
          </div>
        </div>
      </>
    );
  }

  // Mobile: list only
  return (
    <>
      {/* Mobile: list only */}
      <div className="flex flex-col h-full md:hidden" style={{ paddingBottom: 'var(--nav-height)' }}>
        {ConvList}
      </div>

      {/* Desktop: split pane — list on left, placeholder on right */}
      <div className="hidden md:flex h-full">
        <div className="w-80 flex-none border-r border-[var(--border)] overflow-hidden">
          {ConvList}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-300 gap-4">
          <span className="text-6xl">💬</span>
          <p className="text-sm font-medium">Select a conversation to start chatting</p>
        </div>
      </div>
    </>
  );
}
