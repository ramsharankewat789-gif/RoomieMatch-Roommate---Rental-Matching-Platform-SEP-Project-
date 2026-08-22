/**
 * OwnerMessages.jsx
 *
 * Identical to Messages.jsx in structure — both use the same real-API hook.
 * Kept as a separate page so it can sit inside the owner route group.
 */
import React, { useState, useContext, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useMessages } from "@shared/hooks/useMessages";
import Avatar from "@shared/components/common/Avatar";
import Button from "@shared/components/common/Button";

export const OwnerMessages = () => {
  const { currentUser } = useContext(AuthContext);
  const {
    threads,
    loadingConversations,
    activeConvId,
    activeMessages,
    loadingMessages,
    openConversation,
    sendMessage,
    getThread,
  } = useMessages();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeThreadId, setActiveThreadId] = useState("");
  const [inputText, setInputText]           = useState("");
  const messagesEndRef                      = useRef(null);

  useEffect(() => {
    const threadParam = searchParams.get("thread");
    if (threadParam && threadParam !== activeThreadId) {
      setActiveThreadId(threadParam);
      openConversation(threadParam);
    } else if (!threadParam && threads.length > 0 && !activeThreadId) {
      const firstId = threads[0].id;
      setActiveThreadId(firstId);
      openConversation(firstId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSelectThread = (threadId) => {
    setActiveThreadId(threadId);
    setSearchParams({ thread: threadId });
    openConversation(threadId);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;
    await sendMessage(activeThreadId, inputText);
    setInputText("");
  };

  const getRecipient = (thread) => {
    const data = thread.participants_data || [];
    return data.find(p => p.id !== currentUser?.id) || null;
  };

  const activeThread   = getThread(activeThreadId);
  const displayMessages = activeConvId === activeThreadId ? activeMessages : [];

  return (
    <div className="h-[calc(100vh-130px)] max-w-6xl mx-auto bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex overflow-hidden">

      {/* Thread List Sidebar */}
      <div className="w-80 border-r border-outline-variant flex flex-col shrink-0">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Messages</h2>
        </div>
        <div className="flex-grow overflow-y-auto divide-y divide-outline-variant/60">
          {loadingConversations && threads.length === 0 ? (
            <div className="p-8 text-center text-body-md text-on-surface-variant flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Loading...
            </div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center text-body-md text-on-surface-variant">
              No conversations yet.
            </div>
          ) : (
            threads.map((thread) => {
              const recipient = getRecipient(thread);
              const isSel     = thread.id === activeThreadId;
              const lastMsg   = thread.messages?.[thread.messages.length - 1];
              return (
                <button
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                    isSel ? "bg-primary-container/20 border-r-4 border-primary" : "hover:bg-surface-container-low"
                  }`}
                >
                  <Avatar src={recipient?.profile_image} name={recipient?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                        {recipient?.name || "User"}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-outline font-medium">
                          {new Date(lastMsg.timestamp || lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-outline font-semibold uppercase mt-0.5">
                      {recipient?.role || ""}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-on-surface-variant truncate flex-1">
                        {lastMsg ? (lastMsg.text || lastMsg.body) : "No messages yet."}
                      </p>
                      {thread.unread_count > 0 && (
                        <span className="ml-2 bg-primary text-on-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-grow flex flex-col justify-between bg-surface">
        {activeThread ? (
          <>
            <div className="px-6 py-3 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={getRecipient(activeThread)?.profile_image} name={getRecipient(activeThread)?.name} size="md" />
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface font-bold">
                    {getRecipient(activeThread)?.name || "User"}
                  </h3>
                  <span className="text-xs text-outline uppercase font-bold">
                    {getRecipient(activeThread)?.role || ""}
                  </span>
                </div>
              </div>
              {activeThread.property && (
                <div className="hidden sm:flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">home</span>
                  <span className="font-bold text-on-surface truncate max-w-xs">{activeThread.property.title}</span>
                  <span className="text-primary font-bold">(${activeThread.property.price})</span>
                </div>
              )}
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              {loadingMessages && displayMessages.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-on-surface-variant gap-2 text-sm">
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Loading messages...
                </div>
              ) : displayMessages.length === 0 ? (
                <div className="text-center text-body-md text-on-surface-variant py-8">
                  Start the conversation by sending a message below.
                </div>
              ) : (
                displayMessages.map((msg) => {
                  const senderId = msg.sender_id || msg.senderId;
                  const body     = msg.body      || msg.text;
                  const time     = msg.created_at || msg.timestamp;
                  const isMe     = senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm border ${
                        isMe
                          ? "bg-primary text-on-primary border-primary rounded-br-none"
                          : "bg-surface-container-lowest text-on-surface border-outline-variant/60 rounded-bl-none"
                      }`}>
                        <p className="text-body-md whitespace-pre-line leading-relaxed">{body}</p>
                        <span className={`text-[9px] block text-right mt-1 font-semibold ${isMe ? "text-primary-fixed/80" : "text-outline"}`}>
                          {new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-outline-variant bg-surface-container-lowest flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
              <Button type="submit" variant="primary" className="py-3 px-6">
                <span>Send</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface-container-low">
            <span className="material-symbols-outlined text-[64px] text-outline mb-4">chat</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Select a Conversation</h3>
            <p className="text-body-md text-on-surface-variant max-w-sm mt-2">
              Choose a message thread from the sidebar or click 'Chat' on an application to start talking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMessages;
