/**
 * SocketContext.jsx — Real API-backed messaging context.
 *
 * Replaces the previous localStorage/mock implementation.
 * Provides:
 *   conversations         — list of all threads with last message + unread count
 *   activeMessages        — messages in the currently-open conversation
 *   loadingConversations  — boolean
 *   loadingMessages       — boolean
 *   openConversation(id)  — loads messages for a conversation
 *   sendMessage(convId, text) — sends a message and appends to activeMessages
 *   getOrCreateThread(otherUserId, propertyId) — returns conversationId
 *   markRead(convId)      — marks conversation as read
 *   reloadConversations() — manual refresh
 *
 * Polling: conversation list refreshes every 15 seconds while logged in.
 * Messages refresh every 8 seconds while a conversation is open.
 *
 * The legacy shape (threads / sendMockMessage / createNewThread) is preserved
 * via shim aliases so existing call-sites don't crash during transition.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { AuthContext } from "./AuthContext";
import {
  apiListConversations,
  apiGetOrCreateConversation,
  apiGetMessages,
  apiSendMessage,
  apiMarkConversationRead,
} from "../services/api";

export const SocketContext = createContext();

const CONV_POLL_MS    = 15_000;
const MSG_POLL_MS     = 8_000;

export const SocketProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const [conversations,        setConversations]        = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [activeConvId,         setActiveConvId]         = useState(null);
  const [activeMessages,       setActiveMessages]       = useState([]);
  const [loadingMessages,      setLoadingMessages]      = useState(false);

  const activeConvIdRef = useRef(null);

  // ── Load conversation list ─────────────────────────────────────────────
  const reloadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoadingConversations(true);
    try {
      const data = await apiListConversations();
      setConversations(data.conversations || []);
    } catch {
      // silent on poll failures
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUser]);

  // Fetch on login + poll
  useEffect(() => {
    if (!currentUser) { setConversations([]); return; }
    reloadConversations();
    const t = setInterval(reloadConversations, CONV_POLL_MS);
    return () => clearInterval(t);
  }, [currentUser, reloadConversations]);

  // ── Load messages for a conversation ───────────────────────────────────
  const loadMessages = useCallback(async (convId) => {
    if (!convId || !currentUser) return;
    setLoadingMessages(true);
    try {
      const data = await apiGetMessages(convId);
      setActiveMessages(data.messages || []);
      // Update unread count in conversations list
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c)
      );
    } catch {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUser]);

  // ── Open / switch conversation ─────────────────────────────────────────
  const openConversation = useCallback((convId) => {
    setActiveConvId(convId);
    activeConvIdRef.current = convId;
    setActiveMessages([]);
    loadMessages(convId);
  }, [loadMessages]);

  // Poll messages while a conversation is open
  useEffect(() => {
    if (!activeConvId || !currentUser) return;
    const t = setInterval(() => {
      if (activeConvIdRef.current) loadMessages(activeConvIdRef.current);
    }, MSG_POLL_MS);
    return () => clearInterval(t);
  }, [activeConvId, currentUser, loadMessages]);

  // ── Send a message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(async (convId, text) => {
    if (!convId || !text?.trim()) return;
    try {
      const data = await apiSendMessage(convId, text.trim());
      // Append optimistically so the sender sees it instantly
      setActiveMessages(prev => [...prev, data.message]);
      // Refresh conversation list to update last_message
      reloadConversations();
    } catch (err) {
      console.error("[MessageContext] sendMessage:", err.message);
    }
  }, [reloadConversations]);

  // ── Get or create a conversation thread ───────────────────────────────
  const getOrCreateThread = useCallback(async (otherUserId, propertyId = null) => {
    if (!currentUser) return null;
    try {
      const data = await apiGetOrCreateConversation(otherUserId, propertyId);
      const convId = data.conversation.id;
      // Add to list if new
      if (data.created) {
        setConversations(prev => [data.conversation, ...prev]);
      }
      return convId;
    } catch (err) {
      console.error("[MessageContext] getOrCreateThread:", err.message);
      return null;
    }
  }, [currentUser]);

  // ── Mark conversation as read ─────────────────────────────────────────
  const markRead = useCallback(async (convId) => {
    if (!convId) return;
    try {
      await apiMarkConversationRead(convId);
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c)
      );
    } catch {
      // silent
    }
  }, []);

  // ── Legacy shims (for any remaining call-sites that use old SocketContext shape) ──
  const sendMockMessage = useCallback((threadId, _senderId, text) => {
    sendMessage(threadId, text);
  }, [sendMessage]);

  const createNewThread = useCallback((otherUserId, propertyId = null) => {
    // Returns a Promise<convId> — callers that expect a sync string will get a promise
    return getOrCreateThread(otherUserId, propertyId);
  }, [getOrCreateThread]);

  // ── Legacy "messages as threads" shape ────────────────────────────────
  // Messages.jsx uses: threads (array), getThread(id), sendMessage, useMessages
  // Map conversations → thread shape the pages expect
  const threads = conversations.map(conv => ({
    id:           conv.id,
    participants: (conv.participants || []).map(p => p.id),
    propertyId:   conv.property_id,
    property:     conv.property,
    participants_data: conv.participants,
    unread_count: conv.unread_count,
    // messages are loaded separately via openConversation
    messages: conv.id === activeConvId
      ? activeMessages.map(m => ({
          id:        m.id,
          senderId:  m.sender_id,
          text:      m.body,
          timestamp: m.created_at,
          isRead:    m.is_read,
        }))
      : conv.last_message
        ? [{
            id:        conv.last_message.id,
            senderId:  conv.last_message.sender_id,
            text:      conv.last_message.body,
            timestamp: conv.last_message.created_at,
            isRead:    conv.last_message.is_read,
          }]
        : [],
  }));

  return (
    <SocketContext.Provider value={{
      // ── Real API surface ──────────────────────────────────────────────
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
      // ── Legacy shims ─────────────────────────────────────────────────
      messages:       threads,
      setMessages:    () => {},          // no-op — data is server-managed
      sendMockMessage,
      createNewThread,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
