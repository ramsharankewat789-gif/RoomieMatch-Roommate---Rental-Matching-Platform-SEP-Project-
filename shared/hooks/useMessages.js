/**
 * useMessages.js — Real API-backed messages hook.
 *
 * Wraps SocketContext for use in Messages.jsx and OwnerMessages.jsx.
 *
 * Returned shape matches what the existing pages expect:
 *   threads          — array of conversation objects
 *   getThread(id)    — returns a single thread (with messages loaded if active)
 *   sendMessage(id, text)
 *   getOrCreateThread(otherUserId, propertyId?) → Promise<convId>
 *   openConversation(id) — sets the active conversation and loads its messages
 *   loadingConversations / loadingMessages
 */
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";

export const useMessages = () => {
  const { currentUser } = useContext(AuthContext);
  const {
    messages,           // threads (legacy shape)
    conversations,
    loadingConversations,
    activeConvId,
    activeMessages,
    loadingMessages,
    openConversation,
    sendMessage,
    getOrCreateThread,
    markRead,
    reloadConversations,
  } = useContext(SocketContext);

  const getThread = (threadId) => {
    return messages.find(t => t.id === threadId) || null;
  };

  const getActiveThreads = () => {
    if (!currentUser) return [];
    return messages.filter(thread =>
      Array.isArray(thread.participants) && thread.participants.includes(currentUser.id)
    );
  };

  const handleSendMessage = async (threadId, text) => {
    if (!currentUser || !text?.trim()) return;
    await sendMessage(threadId, text);
  };

  return {
    // ── Primary API ────────────────────────────────────────────────────
    conversations,
    loadingConversations,
    activeConvId,
    activeMessages,
    loadingMessages,
    openConversation,
    getOrCreateThread,
    markRead,
    reloadConversations,
    // ── Legacy shape for existing pages ───────────────────────────────
    threads:          getActiveThreads(),
    getThread,
    sendMessage:      handleSendMessage,
  };
};
