
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin } from 'lucide-react';
import { Donation } from '@/types';
import { useDonation } from '@/context/DonationContext';
import { useAuth } from '@/context/AuthContext';

interface DonationCardProps {
  donation: Donation;
  showActions?: boolean;
}

const DonationCard: React.FC<DonationCardProps> = ({ donation, showActions = true }) => {
  const { updateDonationStatus } = useDonation();
  const { user } = useAuth();
  
  const formatExpiryTime = (date: Date) => {
    const now = new Date();
    const expiryDate = new Date(date);
    const hoursRemaining = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursRemaining <= 0) return 'Expired';
    if (hoursRemaining < 1) return 'Less than 1 hour';
    return `${hoursRemaining} hours`;
  };
  
  const getStatusBadge = (status: Donation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Available</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-500">Accepted</Badge>;
      case 'picked_up':
        return <Badge className="bg-green-600">Picked Up</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  const handleAccept = () => {
    if (!user) return;
    updateDonationStatus(donation.id, 'accepted', user.id, user.name);
  };
  
  const handlePickup = () => {
    updateDonationStatus(donation.id, 'picked_up');
  };
  
  const handleCancel = () => {
    updateDonationStatus(donation.id, 'cancelled');
  };
  
  return (
    <Card className="donation-card animate-fade-in">
      <div className="relative">
        <img 
          src={donation.image || '/placeholder.svg'} 
          alt={donation.foodName} 
          className="food-image"
        />
        <div className="absolute top-2 right-2">
          {getStatusBadge(donation.status)}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{donation.foodName}</h3>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" /> 
            {formatExpiryTime(donation.expiryTime)}
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" /> 
          {donation.location.address}
        </p>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm">
          {donation.description.length > 100 
            ? `${donation.description.substring(0, 100)}...` 
            : donation.description}
        </p>
        <div className="mt-2 text-sm">
          <span className="font-medium">Quantity:</span> {donation.quantity}
        </div>
        <div className="mt-1 text-sm">
          <span className="font-medium">Donor:</span> {donation.donorName}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <Link to={`/donation/${donation.id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
        
        {showActions && user && (
          <div className="w-full space-y-2">
            {user.role === 'ngo' && donation.status === 'pending' && (
              <Button className="w-full" onClick={handleAccept}>Accept Donation</Button>
            )}
            
            {user.role === 'ngo' && donation.status === 'accepted' && 
              donation.acceptedBy?.id === user.id && (
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handlePickup}>
                  Mark as Picked Up
                </Button>
              )}
              
            {user.role === 'donor' && donation.status === 'pending' && 
              donation.donorId === user.id && (
                <Button variant="destructive" className="w-full" onClick={handleCancel}>
                  Cancel Donation
                </Button>
              )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default DonationCard;
