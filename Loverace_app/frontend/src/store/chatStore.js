import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  conversations: [],      // match list
  activeId: null,         // active conversationId
  messages: {},           // { [conversationId]: Message[] }
  bondProgress: {},       // { [conversationId]: BondProgress }
  typingUsers: {},        // { [conversationId]: bool }
  unreadCounts: {},       // { [conversationId]: number }

  setConversations: (convs) => set({ conversations: convs }),

  setActiveId: (id) => set({ activeId: id }),

  setMessages: (convId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [convId]: msgs } })),

  appendMessage: (convId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [convId]: [...(s.messages[convId] || []), msg],
      },
      // bump conversation last message
      conversations: s.conversations.map((c) =>
        c.conversationId === convId
          ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt }
          : c,
      ),
    })),

  setBondProgress: (convId, bp) =>
    set((s) => ({ bondProgress: { ...s.bondProgress, [convId]: bp } })),

  setTyping: (convId, isTyping) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [convId]: isTyping } })),

  markRead: (convId) =>
    set((s) => ({
      unreadCounts: { ...s.unreadCounts, [convId]: 0 },
      conversations: s.conversations.map((c) =>
        c.conversationId === convId ? { ...c, unread: 0 } : c,
      ),
    })),

  incrementUnread: (convId) =>
    set((s) => {
      if (s.activeId === convId) return {};
      return {
        unreadCounts: {
          ...s.unreadCounts,
          [convId]: (s.unreadCounts[convId] || 0) + 1,
        },
        conversations: s.conversations.map((c) =>
          c.conversationId === convId ? { ...c, unread: (c.unread || 0) + 1 } : c,
        ),
      };
    }),

  totalUnread: () =>
    Object.values(get().unreadCounts).reduce((a, b) => a + b, 0),
}));
