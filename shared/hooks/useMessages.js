import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";

export const useMessages = () => {
  const { currentUser } = useContext(AuthContext);
  const { messages, sendMockMessage, createNewThread } = useContext(SocketContext);

  const getThread = (threadId) => {
    return messages.find(t => t.id === threadId);
  };

  const getActiveThreads = () => {
    if (!currentUser) return [];
    return messages.filter(thread => thread.participants.includes(currentUser.id));
  };

  const sendMessage = (threadId, text) => {
    if (!currentUser) return;
    sendMockMessage(threadId, currentUser.id, text);
  };

  const getOrCreateThread = (otherUserId, propertyId = null) => {
    return createNewThread(otherUserId, propertyId);
  };

  return {
    threads: getActiveThreads(),
    getThread,
    sendMessage,
    getOrCreateThread
  };
};
