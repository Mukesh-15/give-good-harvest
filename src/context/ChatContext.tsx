
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  _id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'donor' | 'ngo' | 'admin';
  message: string;
  timestamp: Date;
  read: Array<{ userId: string; readAt: Date }>;
}

interface ChatParticipant {
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  role: 'donor' | 'ngo' | 'admin';
  joinedAt: Date;
}

interface Chat {
  _id: string;
  donationId: {
    _id: string;
    foodName: string;
    status: string;
  };
  participants: ChatParticipant[];
  messages: ChatMessage[];
  status: 'active' | 'closed';
  lastActivity: Date;
}

interface ChatContextType {
  socket: Socket | null;
  chats: Chat[];
  activeChat: Chat | null;
  isConnected: boolean;
  createOrJoinChat: (donationId: string) => Promise<Chat | null>;
  sendMessage: (chatId: string, message: string) => void;
  joinChat: (chatId: string) => void;
  setActiveChat: (chat: Chat | null) => void;
  markAsRead: (chatId: string) => void;
  fetchUserChats: () => void;
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  chats: [],
  activeChat: null,
  isConnected: false,
  createOrJoinChat: async () => null,
  sendMessage: () => {},
  joinChat: () => {},
  setActiveChat: () => {},
  markAsRead: () => {},
  fetchUserChats: () => {},
});

export const useChat = () => useContext(ChatContext);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user && token) {
      const newSocket = io(API_BASE, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to chat server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from chat server');
      });

      newSocket.on('new-message', (data) => {
        const { chatId, message } = data;
        
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === chatId 
              ? { 
                  ...chat, 
                  messages: [...chat.messages, message],
                  lastActivity: new Date()
                }
              : chat
          )
        );

        // Update active chat if it's the same chat
        setActiveChat(prevActive => 
          prevActive && prevActive._id === chatId
            ? {
                ...prevActive,
                messages: [...prevActive.messages, message],
                lastActivity: new Date()
              }
            : prevActive
        );

        // Show toast notification if message is not from current user
        if (message.senderId !== user.id) {
          toast({
            title: "New message",
            description: `${message.senderName}: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`,
          });
        }
      });

      newSocket.on('admin-joined', (data) => {
        toast({
          title: "Admin joined",
          description: data.message,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token, toast]);

  const fetchUserChats = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/chat/my-chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const userChats = await res.json();
        setChats(userChats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [token]);

  const createOrJoinChat = async (donationId: string): Promise<Chat | null> => {
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/api/chat/donation/${donationId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const chat = await res.json();
        
        // Update chats list
        setChats(prevChats => {
          const existingIndex = prevChats.findIndex(c => c._id === chat._id);
          if (existingIndex >= 0) {
            const updated = [...prevChats];
            updated[existingIndex] = chat;
            return updated;
          }
          return [chat, ...prevChats];
        });

        return chat;
      }
    } catch (error) {
      console.error('Error creating/joining chat:', error);
      toast({
        title: "Error",
        description: "Failed to access chat",
        variant: "destructive",
      });
    }
    
    return null;
  };

  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit('join-chat', chatId);
    }
  };

  const sendMessage = (chatId: string, message: string) => {
    if (socket && message.trim()) {
      socket.emit('send-message', { chatId, message: message.trim() });
    }
  };

  const markAsRead = async (chatId: string) => {
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/chat/${chatId}/mark-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Fetch user chats on mount
  useEffect(() => {
    if (user && token) {
      fetchUserChats();
    }
  }, [user, token, fetchUserChats]);

  return (
    <ChatContext.Provider value={{
      socket,
      chats,
      activeChat,
      isConnected,
      createOrJoinChat,
      sendMessage,
      joinChat,
      setActiveChat,
      markAsRead,
      fetchUserChats,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
