
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, X, User } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  donationId: string;
  onClose?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ donationId, onClose }) => {
  const { user } = useAuth();
  const { 
    activeChat, 
    setActiveChat, 
    createOrJoinChat, 
    sendMessage, 
    joinChat, 
    markAsRead,
    isConnected 
  } = useChat();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Initialize chat for donation
  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      const chat = await createOrJoinChat(donationId);
      if (chat) {
        setActiveChat(chat);
        joinChat(chat._id);
        markAsRead(chat._id);
      }
      setLoading(false);
    };

    initChat();
  }, [donationId]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (activeChat) {
      markAsRead(activeChat._id);
    }
  }, [activeChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activeChat) {
      sendMessage(activeChat._id, message);
      setMessage('');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'donor':
        return 'default';
      case 'ngo':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading chat...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeChat) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unable to load chat</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg">
            Chat: {activeChat.donationId.foodName}
          </CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {activeChat.participants.map((participant, index) => (
              <div key={participant.userId._id} className="relative">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback>
                    {participant.userId.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge 
                  variant={getRoleBadgeColor(participant.role)}
                  className="absolute -bottom-1 -right-1 text-xs px-1 py-0 h-4"
                >
                  {participant.role}
                </Badge>
              </div>
            ))}
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {activeChat.messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === user?.id;
              const unreadCount = msg.read?.length || 0;
              
              return (
                <div
                  key={index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : msg.senderRole === 'admin'
                          ? 'bg-red-100 border border-red-200'
                          : 'bg-muted'
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium">
                            {msg.senderName}
                          </span>
                          <Badge 
                            variant={getRoleBadgeColor(msg.senderRole)}
                            className="text-xs px-1 py-0 h-4"
                          >
                            {msg.senderRole}
                          </Badge>
                        </div>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${
                          isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatDistanceToNow(new Date(msg.timestamp))} ago
                        </span>
                        {isOwnMessage && (
                          <span className={`text-xs ${
                            unreadCount > 1 ? 'text-primary-foreground/70' : 'text-primary-foreground/50'
                          }`}>
                            {unreadCount > 1 ? 'Read' : 'Sent'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={!isConnected}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || !isConnected}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
