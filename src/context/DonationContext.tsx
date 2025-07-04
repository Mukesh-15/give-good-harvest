
import React, { createContext, useContext, useEffect, useState } from "react";
import { Donation } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";

interface DonationContextType {
  donations: Donation[];
  userDonations: Donation[];
  acceptedDonations: Donation[];
  addDonation: (donation: Omit<Donation, "id" | "donorId" | "donorName" | "createdAt" | "status">) => Promise<void>;
  updateDonationStatus: (id: string, status: Donation["status"], acceptedById?: string, acceptedByName?: string) => Promise<void>;
  getDonationById: (id: string) => Donation | undefined;
  isLoading: boolean;
  reload: () => Promise<void>;
}

export const DonationContext = createContext<DonationContextType>({
  donations: [],
  userDonations: [],
  acceptedDonations: [],
  addDonation: async () => {},
  updateDonationStatus: async () => {},
  getDonationById: () => undefined,
  isLoading: false,
  reload: async () => {},
});

export const useDonation = () => useContext(DonationContext);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();
  const { toast } = useToast();

  const fetchDonations = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      console.log('Fetching donations for user:', user?.role);
      const res = await fetch(`${API_BASE}/api/donations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch donations");
      }
      const data = await res.json();
      console.log('Fetched donations:', data.length);
      setDonations(
        data.map((d: any) => ({
          ...d,
          id: d._id || d.id,
        }))
      );
    } catch (e: any) {
      console.error('Error fetching donations:', e);
      toast({
        title: "Error",
        description: e.message || "Could not load donations",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, [token]);

  const userDonations = user
    ? donations.filter((d) => d.donorId === user.id)
    : [];

  // Fix: Include all statuses that represent accepted donations by this NGO
  const acceptedDonations =
    user && user.role === "ngo"
      ? donations.filter(
          (donation) =>
            donation.acceptedBy?.id === user.id &&
            ["accepted", "picked_up", "in_transit"].includes(donation.status)
        )
      : [];

  const addDonation = async (
    donationData: Omit<
      Donation,
      "id" | "donorId" | "donorName" | "createdAt" | "status"
    >
  ) => {
    if (!token || !user) return;
    try {
      console.log('Adding donation:', donationData);
      const res = await fetch(`${API_BASE}/api/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(donationData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add donation");
      }
      toast({
        title: "Donation added",
        description: "Your donation has been successfully listed",
      });
      await fetchDonations();
    } catch (e: any) {
      console.error('Error adding donation:', e);
      toast({
        title: "Error",
        description: e.message || "Failed to add donation",
        variant: "destructive",
      });
    }
  };

  const updateDonationStatus = async (
    id: string,
    status: Donation["status"],
    acceptedById?: string,
    acceptedByName?: string
  ) => {
    if (!token) return;
    
    console.log(`Updating donation ${id} to status ${status}`);
    
    let fetchUrl = "";
    let method = "POST";
    
    if (status === "accepted") {
      fetchUrl = `${API_BASE}/api/donations/${id}/accept`;
    } else if (status === "picked_up") {
      fetchUrl = `${API_BASE}/api/donations/${id}/pickup`;
    } else if (status === "in_transit") {
      fetchUrl = `${API_BASE}/api/donations/${id}/transit`;
    } else if (status === "cancelled") {
      fetchUrl = `${API_BASE}/api/donations/${id}/cancel`;
    } else if (status === "rejected") {
      fetchUrl = `${API_BASE}/api/donations/${id}/reject`;
    } else {
      toast({
        title: "Not supported",
        description: "This status update is not supported",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(fetchUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Status update failed:', errorData);
        throw new Error(errorData.message || "Failed to update donation status");
      }
      
      const updatedDonation = await res.json();
      console.log('Status updated successfully:', updatedDonation);
      
      const toastMessage = {
        accepted: "Donation has been accepted successfully",
        picked_up: "Donation has been marked as picked up",
        in_transit: "Donation is now in transit",
        cancelled: "Donation has been cancelled",
        rejected: "Donation has been rejected",
      }[status];

      toast({
        title: "Status updated",
        description: toastMessage,
      });
      
      // Refresh donations to get latest data
      await fetchDonations();
    } catch (e: any) {
      console.error('Error updating donation status:', e);
      toast({
        title: "Error",
        description: e.message || "Failed to update status",
        variant: "destructive",
      });
      throw e;
    }
  };

  const getDonationById = (id: string) => {
    return donations.find((donation) => donation.id === id);
  };

  return (
    <DonationContext.Provider
      value={{
        donations,
        userDonations,
        acceptedDonations,
        addDonation,
        updateDonationStatus,
        getDonationById,
        isLoading,
        reload: fetchDonations,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};
