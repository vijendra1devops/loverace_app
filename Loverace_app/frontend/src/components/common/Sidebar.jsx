import { NavLink } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';

const tabs = [
  { to: '/radar',   icon: '📡', label: 'Radar' },
  { to: '/swipe',   icon: '💕', label: 'Discover' },
  { to: '/matches', icon: '💌', label: 'Matches' },
  { to: '/chat',    icon: '💬', label: 'Chat' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const conversations = useChatStore((s) => s.conversations);
  const totalUnread = conversations.reduce((a, c) => a + (c.unread || 0), 0);

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 bg-white border-r border-[var(--border)] z-40">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-heartbeat">💕</span>
          <span className="text-xl font-black text-primary tracking-tight">Loverace</span>
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 relative group
              ${isActive
                ? 'bg-blush/60 text-primary font-bold'
                : 'text-gray-500 hover:bg-blush/30 hover:text-primary font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl leading-none transition-transform duration-200 ${isActive ? 'animate-heartbeat' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                <span className="text-sm">{tab.label}</span>

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}

                {/* Unread badge on Chat */}
                {tab.to === '/chat' && totalUnread > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--border)]">
        <p className="text-[10px] text-gray-400 text-center">Find your connection 💗</p>
      </div>
    </aside>
  );
}
