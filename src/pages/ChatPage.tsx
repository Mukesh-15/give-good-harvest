
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';

const ChatPage = () => {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to access your chats
              </p>
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Chat</h1>
            <p className="text-muted-foreground">
              Communicate with {user.role === 'donor' ? 'NGOs' : 'donors'} about donations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChatList 
            onChatSelect={(chatId) => {
              setSelectedChatId(chatId);
              // You might need to extract donation ID from chat data
            }} 
          />
        </div>

        <div className="lg:col-span-2">
          {selectedChatId && selectedDonationId ? (
            <ChatWindow 
              donationId={selectedDonationId}
              onClose={() => {
                setSelectedChatId(null);
                setSelectedDonationId(null);
              }}
            />
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <CardContent>
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a chat</h3>
                  <p className="text-muted-foreground">
                    Choose a chat from the list to start messaging
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
