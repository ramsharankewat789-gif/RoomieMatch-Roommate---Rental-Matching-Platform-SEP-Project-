import React, { useState, useContext, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";
import { useMessages } from "@shared/hooks/useMessages";
import { useProperties } from "@shared/hooks/useProperties";
import Avatar from "@shared/components/common/Avatar";
import Button from "@shared/components/common/Button";

export const Messages = () => {
  const { currentUser, users } = useContext(AuthContext);
  const { threads, getThread, sendMessage } = useMessages();
  const { properties } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeThreadId, setActiveThreadId] = useState("");
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  // Check URL query parameter 'thread' on load
  useEffect(() => {
    const threadParam = searchParams.get("thread");
    if (threadParam) {
      setActiveThreadId(threadParam);
    } else if (threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0].id);
    }
  }, [searchParams, threads]);

  const activeThread = getThread(activeThreadId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    sendMessage(activeThreadId, inputText);
    setInputText("");
  };

  const getRecipient = (thread) => {
    const otherId = thread.participants.find((p) => p !== currentUser?.id);
    return users.find((u) => u.id === otherId);
  };

  const getPropertyInfo = (thread) => {
    if (!thread.propertyId) return null;
    return properties.find((p) => p.id === thread.propertyId);
  };

  return (
    <div className="h-[calc(100vh-130px)] max-w-6xl mx-auto bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex overflow-hidden">
      
      {/* Thread List Sidebar */}
      <div className="w-80 border-r border-outline-variant flex flex-col shrink-0">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Messages</h2>
        </div>
        <div className="flex-grow overflow-y-auto divide-y divide-outline-variant/60">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-body-md text-on-surface-variant">
              No conversations started yet.
            </div>
          ) : (
            threads.map((thread) => {
              const recipient = getRecipient(thread);
              const isSel = thread.id === activeThreadId;
              const lastMsg = thread.messages[thread.messages.length - 1];
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setSearchParams({ thread: thread.id });
                  }}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                    isSel ? "bg-primary-container/20 border-r-4 border-primary" : "hover:bg-surface-container-low"
                  }`}
                >
                  <Avatar src={recipient?.avatar} name={recipient?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                        {recipient?.name || "User"}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-outline font-medium">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-outline font-semibold uppercase mt-0.5">
                      {recipient?.role}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate mt-1">
                      {lastMsg ? lastMsg.text : "No messages yet."}
                    </p>
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
            {/* Header */}
            <div className="px-6 py-3 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={getRecipient(activeThread)?.avatar}
                  name={getRecipient(activeThread)?.name}
                  size="md"
                />
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface font-bold">
                    {getRecipient(activeThread)?.name}
                  </h3>
                  <span className="text-xs text-outline uppercase font-bold">
                    {getRecipient(activeThread)?.role}
                  </span>
                </div>
              </div>

              {/* Linked Property Banner if applicable */}
              {getPropertyInfo(activeThread) && (
                <div className="hidden sm:flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">home</span>
                  <span className="font-bold text-on-surface truncate max-w-xs">
                    {getPropertyInfo(activeThread).title}
                  </span>
                  <span className="text-primary font-bold">
                    (${getPropertyInfo(activeThread).price})
                  </span>
                </div>
              )}
            </div>

            {/* Message Feed */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              {activeThread.messages.length === 0 ? (
                <div className="text-center text-body-md text-on-surface-variant py-8">
                  Start the conversation by sending a message below.
                </div>
              ) : (
                activeThread.messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm border ${
                          isMe
                            ? "bg-primary text-on-primary border-primary rounded-br-none"
                            : "bg-surface-container-lowest text-on-surface border-outline-variant/60 rounded-bl-none"
                        }`}
                      >
                        <p className="text-body-md whitespace-pre-line leading-relaxed">
                          {msg.text}
                        </p>
                        <span
                          className={`text-[9px] block text-right mt-1 font-semibold ${
                            isMe ? "text-primary-fixed/80" : "text-outline"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-outline-variant bg-surface-container-lowest flex items-center gap-3"
            >
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
              Choose a message thread from the sidebar or click 'Chat' on roommate search or properties to start talking.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
