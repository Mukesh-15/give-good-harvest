
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, MapPin, Calendar, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Donation } from '@/types';
import { format } from 'date-fns';

const DonationsManagement = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchDonations();
  }, [token]);

  const fetchDonations = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/donations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to fetch donations');
      
      const data = await res.json();
      setDonations(data.map((donation: any) => ({
        ...donation,
        id: donation._id || donation.id,
        expiryTime: new Date(donation.expiryTime),
        createdAt: new Date(donation.createdAt),
        pickupTime: donation.pickupTime ? new Date(donation.pickupTime) : undefined,
      })));
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load donations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDonation = async (donationId: string) => {
    if (!confirm('Are you sure you want to delete this donation?')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/donations/${donationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to delete donation');
      
      setDonations(donations.filter(donation => donation.id !== donationId));
      
      toast({
        title: "Success",
        description: "Donation deleted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete donation",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'accepted':
        return 'secondary';
      case 'picked_up':
        return 'default';
      case 'in_transit':
        return 'secondary';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading donations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donations Management</CardTitle>
        <CardDescription>
          Monitor and manage all food donations in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Food Item</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No donations found
                  </TableCell>
                </TableRow>
              ) : (
                donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{donation.foodName}</div>
                        <div className="text-sm text-muted-foreground">
                          <Package className="h-3 w-3 inline mr-1" />
                          {donation.quantity}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{donation.donorName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {donation.location.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(donation.status)}>
                        {donation.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {format(donation.createdAt, 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {format(donation.expiryTime, 'MMM dd, yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDonation(donation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationsManagement;
