
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
      const res = await fetch(`${API_BASE}/api/donations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch donations");
      const data = await res.json();
      // Map backend objects to the expected structure
      setDonations(
        data.map((d: any) => ({
          ...d,
          id: d._id || d.id,
        }))
      );
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Could not load donations",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line
  }, [token]);

  // Donations by current user
  const userDonations = user
    ? donations.filter((d) => d.donorId === user.id || d.donorId === user._id)
    : [];

  // Donations accepted by current NGO
  const acceptedDonations =
    user && user.role === "ngo"
      ? donations.filter(
          (donation) =>
            donation.acceptedBy?.id === user.id &&
            ["accepted", "picked_up"].includes(donation.status)
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
      const res = await fetch(`${API_BASE}/api/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(donationData),
      });
      if (!res.ok) throw new Error("Failed to add donation");
      toast({
        title: "Donation added",
        description: "Your donation has been successfully listed",
      });
      await fetchDonations();
    } catch (e: any) {
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
    let endpoint = `${API_BASE}/api/donations/${id}`;
    let method = "POST";
    let fetchUrl = "";
    if (status === "accepted") {
      fetchUrl = `${endpoint}/accept`;
    } else if (status === "picked_up") {
      fetchUrl = `${endpoint}/pickup`;
    } else {
      // For now, don't support cancelling in backend API
      toast({
        title: "Not supported on backend",
        description: "Only accepting and picking up donations are supported",
        variant: "default",
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
      });
      if (!res.ok) throw new Error("Failed to update donation status");
      const toastMessage =
        status === "accepted"
          ? "Donation has been accepted"
          : "Donation has been marked as picked up";
      toast({
        title: "Status updated",
        description: toastMessage,
      });
      await fetchDonations();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update status",
        variant: "destructive",
      });
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
