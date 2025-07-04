import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDonation } from '@/context/DonationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, User, Phone, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const DonationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getDonationById, updateDonationStatus, reload } = useDonation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const donation = getDonationById(id || '');
  
  // Reload donation data when component mounts to ensure we have latest status
  useEffect(() => {
    if (id) {
      reload();
    }
  }, [id, reload]);

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
      case 'in_transit':
        return <Badge className="bg-orange-500">In Transit</Badge>;
      case 'picked_up':
        return <Badge className="bg-green-600">Picked Up</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  const handleAccept = async () => {
    if (!user) return;
    try {
      await updateDonationStatus(donation.id, 'accepted', user.id, user.name);
      toast({
        title: "Success!",
        description: "You have successfully accepted this donation. You can now chat with the donor.",
      });
      setTimeout(() => {
        reload();
      }, 1000);
    } catch (error) {
      console.error('Error accepting donation:', error);
      toast({
        title: "Error",
        description: "Failed to accept donation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleTransit = async () => {
    try {
      await updateDonationStatus(donation.id, 'in_transit');
      toast({
        title: "Success!",
        description: "Donation marked as in transit.",
      });
      setTimeout(() => {
        reload();
      }, 1000);
    } catch (error) {
      console.error('Error marking as in transit:', error);
      toast({
        title: "Error",
        description: "Failed to mark as in transit. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handlePickup = async () => {
    try {
      await updateDonationStatus(donation.id, 'picked_up');
      toast({
        title: "Success!",
        description: "Donation marked as picked up successfully.",
      });
      setTimeout(() => {
        reload();
      }, 1000);
    } catch (error) {
      console.error('Error marking as picked up:', error);
      toast({
        title: "Error",
        description: "Failed to mark as picked up. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = async () => {
    try {
      await updateDonationStatus(donation.id, 'cancelled');
      toast({
        title: "Cancelled",
        description: "Donation has been cancelled.",
      });
      setTimeout(() => {
        reload();
      }, 1000);
    } catch (error) {
      console.error('Error cancelling donation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel donation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const canAccept = user?.role === 'ngo' && donation.status === 'pending';
  const canTransit = user?.role === 'ngo' && donation.status === 'accepted' && 
                     donation.acceptedBy?.id === user.id;
  const canPickup = user?.role === 'ngo' && 
                    (donation.status === 'accepted' || donation.status === 'in_transit') && 
                    donation.acceptedBy?.id === user.id;
  const canCancel = user?.role === 'donor' && donation.status === 'pending' && 
                    donation.donorId === user.id;
  const canChat = (user?.role === 'donor' && donation.donorId === user.id) ||
                  (user?.role === 'ngo' && donation.acceptedBy?.id === user.id) ||
                  user?.role === 'admin';
  
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
                        : donation.status === 'in_transit'
                        ? `In transit - ${donation.acceptedBy?.name}`
                        : donation.status === 'picked_up'
                        ? `Picked up by ${donation.acceptedBy?.name}`
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
                  <span className="text-muted-foreground">
                    {donation.status === 'accepted' || donation.status === 'in_transit' || donation.status === 'picked_up' 
                      ? 'Contact available in chat' 
                      : 'Contact details available after accepting'}
                  </span>
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
                
                {canTransit && (
                  <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleTransit}>
                    Mark as In Transit
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
                
                {canChat && donation.status !== 'pending' && (
                  <Link to={`/chat?donation=${donation.id}`} className="w-full block">
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Open Chat
                    </Button>
                  </Link>
                )}
                
                {donation.status === 'accepted' && donation.acceptedBy && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-sm text-center text-blue-800 dark:text-blue-300">
                      This donation has been accepted by <span className="font-medium">{donation.acceptedBy.name}</span>
                    </p>
                    {canChat && (
                      <div className="mt-2">
                        <Link to={`/chat?donation=${donation.id}`} className="w-full block">
                          <Button size="sm" className="w-full">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat Now
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                {donation.status === 'in_transit' && donation.acceptedBy && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                    <p className="text-sm text-center text-orange-800 dark:text-orange-300">
                      This donation is in transit with <span className="font-medium">{donation.acceptedBy.name}</span>
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
