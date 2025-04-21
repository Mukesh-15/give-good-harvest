
import React, { useState } from 'react';
import { useDonation } from '@/context/DonationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DonationCard from '@/components/DonationCard';
import DonationMap from '@/components/DonationMap';
import { Search, MapPin, ListChecks } from 'lucide-react';

const BrowseDonations = () => {
  const { donations } = useDonation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('expiry');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Filter donations - only show pending ones
  const availableDonations = donations.filter(donation => 
    donation.status === 'pending' &&
    (searchTerm === '' || 
     donation.foodName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     donation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Sort donations
  const sortedDonations = [...availableDonations].sort((a, b) => {
    if (sortBy === 'expiry') {
      return new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime();
    } else if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
  
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold mb-6">Browse Available Donations</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expiry">Expiring Soon</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <ListChecks className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('map')}
          >
            <MapPin className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {viewMode === 'map' ? (
        <div className="rounded-lg overflow-hidden border border-border">
          <DonationMap donations={sortedDonations} className="h-[70vh]" />
        </div>
      ) : (
        <>
          {sortedDonations.length === 0 ? (
            <div className="text-center py-16 bg-muted/40 rounded-lg">
              <p className="text-muted-foreground mb-2">No donations found</p>
              <p className="text-sm">Try adjusting your search or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDonations.map(donation => (
                <DonationCard key={donation.id} donation={donation} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseDonations;
