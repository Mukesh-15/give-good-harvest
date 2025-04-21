
import React, { useState } from 'react';
import { useDonation } from '@/context/DonationContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DonationCard from '@/components/DonationCard';
import { ListChecks } from 'lucide-react';

const AcceptedDonations = () => {
  const { acceptedDonations } = useDonation();
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter accepted donations based on active tab
  const filteredDonations = acceptedDonations.filter(donation => {
    if (activeTab === 'all') return true;
    if (activeTab === 'accepted') return donation.status === 'accepted';
    if (activeTab === 'picked-up') return donation.status === 'picked_up';
    return true;
  });
  
  // Count donations for each tab
  const counts = {
    all: acceptedDonations.length,
    accepted: acceptedDonations.filter(d => d.status === 'accepted').length,
    pickedUp: acceptedDonations.filter(d => d.status === 'picked_up').length,
  };
  
  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Accepted Donations</h1>
        <Link to="/browse">
          <Button>
            <ListChecks className="h-4 w-4 mr-2" />
            Browse More
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto bg-background border">
          <TabsTrigger value="all" className="flex gap-1">
            All <span className="text-xs ml-1 bg-muted px-1.5 py-0.5 rounded-full">{counts.all}</span>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex gap-1">
            To Pick Up <span className="text-xs ml-1 bg-muted px-1.5 py-0.5 rounded-full">{counts.accepted}</span>
          </TabsTrigger>
          <TabsTrigger value="picked-up" className="flex gap-1">
            Picked Up <span className="text-xs ml-1 bg-muted px-1.5 py-0.5 rounded-full">{counts.pickedUp}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderDonationsList(filteredDonations)}
        </TabsContent>
        
        <TabsContent value="accepted" className="mt-6">
          {renderDonationsList(filteredDonations)}
        </TabsContent>
        
        <TabsContent value="picked-up" className="mt-6">
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
          <Link to="/browse">
            <Button>Browse Available Donations</Button>
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

export default AcceptedDonations;
