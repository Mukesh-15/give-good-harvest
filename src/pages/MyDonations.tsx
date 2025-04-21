
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDonation } from '@/context/DonationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DonationCard from '@/components/DonationCard';
import { Plus } from 'lucide-react';

const MyDonations = () => {
  const { userDonations } = useDonation();
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter donations based on active tab
  const filteredDonations = userDonations.filter(donation => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return donation.status === 'pending';
    if (activeTab === 'accepted') return donation.status === 'accepted';
    if (activeTab === 'picked-up') return donation.status === 'picked_up';
    if (activeTab === 'expired-cancelled') 
      return donation.status === 'expired' || donation.status === 'cancelled';
    return true;
  });
  
  // Count donations for each tab
  const counts = {
    all: userDonations.length,
    pending: userDonations.filter(d => d.status === 'pending').length,
    accepted: userDonations.filter(d => d.status === 'accepted').length,
    pickedUp: userDonations.filter(d => d.status === 'picked_up').length,
    expiredCancelled: userDonations.filter(d => 
      d.status === 'expired' || d.status === 'cancelled'
    ).length,
  };
  
  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Donations</h1>
        <Link to="/donate">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Donation
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto bg-background border">
          <TabsTrigger value="all" className="flex gap-1">
            All <span className="text-xs ml-1 bg-muted px-1.5 py-0.5 rounded-full">{counts.all}</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex gap-1">
            Pending <span className="text-xs ml-1 bg-muted px-1.5 py-0.5 rounded-full">{counts.pending}</span>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex gap-1">
            Accepted <span className="text-xs ml-1 bg-muted px-1.5 py-0.5 rounded-full">{counts.accepted}</span>
          </TabsTrigger>
          <TabsTrigger value="picked-up" className="flex gap-1">
            Picked Up <span className="text-xs ml-1 bg-muted px-1.5 py-0.5 rounded-full">{counts.pickedUp}</span>
          </TabsTrigger>
          <TabsTrigger value="expired-cancelled" className="flex gap-1">
            Expired/Cancelled <span className="text-xs ml-1 bg-muted px-1.5 py-0.5 rounded-full">{counts.expiredCancelled}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderDonationsList(filteredDonations)}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          {renderDonationsList(filteredDonations)}
        </TabsContent>
        
        <TabsContent value="accepted" className="mt-6">
          {renderDonationsList(filteredDonations)}
        </TabsContent>
        
        <TabsContent value="picked-up" className="mt-6">
          {renderDonationsList(filteredDonations)}
        </TabsContent>
        
        <TabsContent value="expired-cancelled" className="mt-6">
          {renderDonationsList(filteredDonations)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderDonationsList = (donations: any[]) => {
  if (donations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">No donations in this category</p>
          <Link to="/donate">
            <Button>Add a Donation</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {donations.map(donation => (
        <DonationCard key={donation.id} donation={donation} />
      ))}
    </div>
  );
};

export default MyDonations;
