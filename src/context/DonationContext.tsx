
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Donation } from '../types';
import { donations as mockDonations } from '../data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

interface DonationContextType {
  donations: Donation[];
  userDonations: Donation[];
  acceptedDonations: Donation[];
  addDonation: (donation: Omit<Donation, 'id' | 'donorId' | 'donorName' | 'createdAt' | 'status'>) => void;
  updateDonationStatus: (id: string, status: Donation['status'], acceptedById?: string, acceptedByName?: string) => void;
  getDonationById: (id: string) => Donation | undefined;
}

export const DonationContext = createContext<DonationContextType>({
  donations: [],
  userDonations: [],
  acceptedDonations: [],
  addDonation: () => {},
  updateDonationStatus: () => {},
  getDonationById: () => undefined,
});

export const useDonation = () => useContext(DonationContext);

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donations, setDonations] = useState<Donation[]>(mockDonations);
  const { user } = useAuth();
  const { toast } = useToast();

  // Filter donations for the current user
  const userDonations = user 
    ? donations.filter(donation => donation.donorId === user.id)
    : [];

  // Filter donations accepted by the current NGO
  const acceptedDonations = user && user.role === 'ngo'
    ? donations.filter(donation => 
        donation.acceptedBy?.id === user.id && 
        ['accepted', 'picked_up'].includes(donation.status)
      )
    : [];

  const addDonation = (donationData: Omit<Donation, 'id' | 'donorId' | 'donorName' | 'createdAt' | 'status'>) => {
    if (!user) return;

    const newDonation: Donation = {
      id: (donations.length + 1).toString(),
      donorId: user.id,
      donorName: user.name,
      ...donationData,
      createdAt: new Date(),
      status: 'pending',
    };

    setDonations(prev => [newDonation, ...prev]);
    
    toast({
      title: "Donation added",
      description: "Your donation has been successfully listed",
    });
  };

  const updateDonationStatus = (id: string, status: Donation['status'], acceptedById?: string, acceptedByName?: string) => {
    setDonations(prev => prev.map(donation => {
      if (donation.id === id) {
        const updatedDonation = { 
          ...donation, 
          status,
        };
        
        if (status === 'accepted' && acceptedById && acceptedByName) {
          updatedDonation.acceptedBy = {
            id: acceptedById,
            name: acceptedByName
          };
        }
        
        return updatedDonation;
      }
      return donation;
    }));

    let toastMessage = '';
    switch (status) {
      case 'accepted':
        toastMessage = 'Donation has been accepted';
        break;
      case 'picked_up':
        toastMessage = 'Donation has been marked as picked up';
        break;
      case 'cancelled':
        toastMessage = 'Donation has been cancelled';
        break;
      default:
        toastMessage = 'Donation status updated';
    }

    toast({
      title: "Status updated",
      description: toastMessage,
    });
  };

  const getDonationById = (id: string) => {
    return donations.find(donation => donation.id === id);
  };

  return (
    <DonationContext.Provider value={{ 
      donations, 
      userDonations, 
      acceptedDonations,
      addDonation, 
      updateDonationStatus,
      getDonationById
    }}>
      {children}
    </DonationContext.Provider>
  );
};
