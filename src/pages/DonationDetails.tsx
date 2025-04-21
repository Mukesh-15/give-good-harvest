
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDonation } from '@/context/DonationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, User, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const DonationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getDonationById, updateDonationStatus } = useDonation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const donation = getDonationById(id || '');
  
  if (!donation) {
    return (
      <div className="page-container">
        <div className="text-center py-16 bg-muted/40 rounded-lg">
          <p className="text-muted-foreground mb-4">Donation not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };
  
  const getStatusBadge = (status: string) => {
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
  
  const canAccept = user?.role === 'ngo' && donation.status === 'pending';
  const canPickup = user?.role === 'ngo' && donation.status === 'accepted' && 
                    donation.acceptedBy?.id === user.id;
  const canCancel = user?.role === 'donor' && donation.status === 'pending' && 
                    donation.donorId === user.id;
  
  return (
    <div className="page-container max-w-5xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex flex-wrap justify-between items-start gap-4">
          <h1 className="text-3xl font-bold">{donation.foodName}</h1>
          {getStatusBadge(donation.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <img 
                src={donation.image || '/placeholder.svg'} 
                alt={donation.foodName} 
                className="w-full h-72 object-cover rounded-t-lg" 
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-foreground">{donation.description}</p>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                    <p className="text-foreground">{donation.quantity}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Donation Date</h3>
                    <p className="text-foreground">{formatDate(donation.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Expires By</h3>
                    <p className="text-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {formatDate(donation.expiryTime)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="text-foreground">
                      {donation.status === 'accepted' 
                        ? `Accepted by ${donation.acceptedBy?.name}` 
                        : donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Pickup Location</h3>
                  <p className="text-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {donation.location.address}
                  </p>
                  <div className="h-48 bg-muted rounded-md mt-2 flex items-center justify-center">
                    <p className="text-muted-foreground">Map view would be shown here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Donor Information</h2>
              <div className="flex items-center gap-3">
                <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{donation.donorName}</p>
                  <p className="text-sm text-muted-foreground">Donor</p>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" /> 
                  <span className="text-muted-foreground">(Contact details available after accepting)</span>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                {canAccept && (
                  <Button className="w-full" onClick={handleAccept}>
                    Accept Donation
                  </Button>
                )}
                
                {canPickup && (
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handlePickup}>
                    Mark as Picked Up
                  </Button>
                )}
                
                {canCancel && (
                  <Button variant="destructive" className="w-full" onClick={handleCancel}>
                    Cancel Donation
                  </Button>
                )}
                
                {donation.status === 'pending' && user?.role === 'donor' && donation.donorId === user.id && (
                  <Link to={`/edit-donation/${donation.id}`} className="w-full block">
                    <Button variant="outline" className="w-full">
                      Edit Donation
                    </Button>
                  </Link>
                )}
                
                {donation.status === 'accepted' && donation.acceptedBy && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-center">
                      This donation has been accepted by <span className="font-medium">{donation.acceptedBy.name}</span>
                    </p>
                  </div>
                )}
                
                {donation.status === 'picked_up' && donation.acceptedBy && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <p className="text-sm text-center text-green-800 dark:text-green-300">
                      This donation has been picked up by <span className="font-medium">{donation.acceptedBy.name}</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DonationDetails;
