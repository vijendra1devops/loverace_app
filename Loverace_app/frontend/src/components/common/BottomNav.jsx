import { NavLink } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';

const tabs = [
  { to: '/radar',   icon: '📡', label: 'Radar' },
  { to: '/swipe',   icon: '💕', label: 'Swipe' },
  { to: '/matches', icon: '💌', label: 'Matches' },
  { to: '/chat',    icon: '💬', label: 'Chat' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav() {
  const conversations = useChatStore((s) => s.conversations);
  const totalUnread = conversations.reduce((a, c) => a + (c.unread || 0), 0);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-[var(--border)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(64px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 relative
              ${isActive ? 'text-primary scale-105' : 'text-gray-400 hover:text-primary/70'}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`text-2xl leading-none transition-transform duration-200 ${isActive ? 'animate-heartbeat' : ''}`}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>

                {/* Active dot */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}

                {/* Unread badge on Chat */}
                {tab.to === '/chat' && totalUnread > 0 && (
                  <span className="absolute top-0 right-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
