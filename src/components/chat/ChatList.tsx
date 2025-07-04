
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Users } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect }) => {
  const { user } = useAuth();
  const { chats, joinChat, setActiveChat } = useChat();

  const handleChatClick = (chat: any) => {
    setActiveChat(chat);
    joinChat(chat._id);
    onChatSelect(chat._id);
  };

  const getUnreadCount = (chat: any) => {
    if (!user) return 0;
    
    return chat.messages.filter((message: any) => 
      message.senderId !== user.id && 
      !message.read.some((r: any) => r.userId === user.id)
    ).length;
  };

  if (chats.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No active chats</h3>
            <p className="text-muted-foreground text-sm">
              Start chatting by accepting or creating a donation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Your Chats</span>
          <Badge variant="secondary">{chats.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {chats.map((chat) => {
            const unreadCount = getUnreadCount(chat);
            const lastMessage = chat.messages[chat.messages.length - 1];
            
            return (
              <Button
                key={chat._id}
                variant="ghost"
                className="w-full justify-start p-4 h-auto"
                onClick={() => handleChatClick(chat)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex -space-x-2">
                    {chat.participants.slice(0, 2).map((participant) => (
                      <Avatar key={participant.userId._id} className="h-8 w-8 border border-background">
                        <AvatarFallback className="text-xs">
                          {participant.userId.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {chat.participants.length > 2 && (
                      <div className="h-8 w-8 rounded-full bg-muted border border-background flex items-center justify-center">
                        <Users className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {chat.donationId.foodName}
                      </h4>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    {lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        <span className="font-medium">{lastMessage.senderName}:</span>{' '}
                        {lastMessage.message}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-xs">
                        {chat.donationId.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.lastActivity))} ago
                      </span>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatList;
