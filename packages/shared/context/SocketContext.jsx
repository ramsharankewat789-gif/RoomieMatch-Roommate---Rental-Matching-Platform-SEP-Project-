import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { NotificationContext } from "./NotificationContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("roomiematch_messages");
    return saved ? JSON.parse(saved) : [];
  });

  // Load from data file if localStorage is empty
  useEffect(() => {
    if (messages.length === 0) {
      import("../data/mockMessages").then((mod) => {
        setMessages(mod.mockMessages);
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("roomiematch_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Simulate an automated bot response for roommate / landlord chats
  const sendMockMessage = (threadId, senderId, text) => {
    const messageId = "msg_" + Date.now();
    const newMsg = {
      id: messageId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages(prevThreads => {
      return prevThreads.map(thread => {
        if (thread.id === threadId) {
          const updatedMessages = [...thread.messages, newMsg];
          
          // Trigger automatic reply after 3 seconds from the other participant
          const otherUserId = thread.participants.find(p => p !== senderId);
          setTimeout(() => {
            simulateReply(threadId, otherUserId, text);
          }, 3000);

          return { ...thread, messages: updatedMessages };
        }
        return thread;
      });
    });
  };

  const simulateReply = (threadId, responderId, lastText) => {
    let replyText = "Thanks for your message! I will look into it and get back to you soon.";
    
    // Customize reply based on message keywords
    const lower = lastText.toLowerCase();
    if (lower.includes("available") || lower.includes("rent")) {
      replyText = "Yes, it's still available! Would you like to schedule a viewing sometime this week?";
    } else if (lower.includes("price") || lower.includes("cost") || lower.includes("deposit")) {
      replyText = "The rent is as listed, and we require a one-month security deposit. Utilities are split evenly.";
    } else if (lower.includes("compatibility") || lower.includes("roommate")) {
      replyText = "I saw our compatibility score is great! I'm free to chat or meet up on campus this Friday.";
    } else if (lower.includes("tour") || lower.includes("visit")) {
      replyText = "I can show you the place this Saturday afternoon around 2 PM. Let me know if that works for you!";
    }

    const replyMsg = {
      id: "reply_" + Date.now(),
      senderId: responderId,
      text: replyText,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages(prevThreads => {
      const updated = prevThreads.map(thread => {
        if (thread.id === threadId) {
          return { ...thread, messages: [...thread.messages, replyMsg] };
        }
        return thread;
      });
      return updated;
    });

    // Also trigger notification
    addNotification(
      currentUser?.id,
      "New Message",
      `You received a reply: "${replyText.substring(0, 40)}..."`,
      "message",
      threadId
    );
  };

  const createNewThread = (otherUserId, propertyId = null) => {
    if (!currentUser) return null;
    
    // Check if thread already exists
    const existing = messages.find(thread => 
      thread.participants.includes(currentUser.id) && 
      thread.participants.includes(otherUserId) &&
      thread.propertyId === propertyId
    );

    if (existing) return existing.id;

    const newThreadId = "m_" + Date.now();
    const newThread = {
      id: newThreadId,
      participants: [currentUser.id, otherUserId],
      propertyId,
      messages: []
    };

    setMessages(prev => [newThread, ...prev]);
    return newThreadId;
  };

  return (
    <SocketContext.Provider value={{ messages, setMessages, sendMockMessage, createNewThread }}>
      {children}
    </SocketContext.Provider>
  );
};
