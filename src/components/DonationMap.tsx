
import React from 'react';
import { Donation } from '@/types';
import { MapPin } from 'lucide-react';

interface DonationMapProps {
  donations: Donation[];
  className?: string;
}

const DonationMap: React.FC<DonationMapProps> = ({ donations, className = "h-80" }) => {
  // In a real app, this would be an actual map component with markers
  // For this prototype, we'll just show a placeholder with donation markers
  
  return (
    <div className={`relative bg-muted rounded-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-muted-foreground">Map view would be shown here</p>
      </div>
      
      {/* Donation markers */}
      <div className="absolute inset-0 p-4">
        {donations.map((donation, index) => (
          <div 
            key={donation.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${20 + (index * 10)}%`, 
              top: `${30 + ((index % 3) * 20)}%`,
            }}
          >
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-md mb-1">
                <p className="text-xs font-medium">{donation.foodName}</p>
              </div>
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationMap;
