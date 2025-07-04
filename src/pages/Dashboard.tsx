import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDonation } from '@/context/DonationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import DonationCard from '@/components/DonationCard';
import DonationMap from '@/components/DonationMap';
import { ListChecks, Plus, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { donations, userDonations, acceptedDonations } = useDonation();
  
  // Filter recent donations (excluding the user's own donations if they're a donor)
  const recentDonations = user?.role === 'donor'
    ? donations.filter(d => d.donorId !== user.id && d.status === 'pending').slice(0, 3)
    : donations.filter(d => d.status === 'pending').slice(0, 3);
  
  const pendingCount = donations.filter(d => d.status === 'pending').length;
  const acceptedCount = donations.filter(d => d.status === 'accepted').length;
  const pickedUpCount = donations.filter(d => d.status === 'picked_up').length;
  
  // For donor dashboard
  const userPendingCount = userDonations.filter(d => d.status === 'pending').length;
  const userAcceptedCount = userDonations.filter(d => d.status === 'accepted').length;
  const userPickedUpCount = userDonations.filter(d => d.status === 'picked_up').length;
  
  // For NGO dashboard
  const ngoAcceptedCount = acceptedDonations.filter(d => d.status === 'accepted').length;
  const ngoPickedUpCount = acceptedDonations.filter(d => d.status === 'picked_up').length;
  
  // Welcome message based on user role
  const welcomeMessage = () => {
    if (!user) return "Welcome to Meal Bridge";
    
    switch (user.role) {
      case 'donor':
        return `Welcome ${user.name}, thank you for donating!`;
      case 'ngo':
        return `Welcome ${user.name}, ready to collect donations?`;
      case 'admin':
        return `Welcome Admin ${user.name}`;
      default:
        return `Welcome ${user.name}`;
    }
  };
  
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold mb-6">{welcomeMessage()}</h1>
      
      {!user ? (
        <NotLoggedInDashboard />
      ) : user.role === 'donor' ? (
        <DonorDashboard 
          pendingCount={userPendingCount} 
          acceptedCount={userAcceptedCount} 
          pickedUpCount={userPickedUpCount}
          donations={userDonations.slice(0, 3)}
          allDonations={recentDonations}
        />
      ) : (
        <NgoDashboard 
          pendingCount={pendingCount}
          acceptedCount={ngoAcceptedCount}
          pickedUpCount={ngoPickedUpCount}
          donations={recentDonations}
          acceptedDonations={acceptedDonations.slice(0, 3)}
        />
      )}
    </div>
  );
};

const NotLoggedInDashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Food Donation Made Simple</CardTitle>
          <CardDescription>
            Connect excess food with those who need it most
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Meal Bridge connects restaurants, hotels, and households with excess food
            to NGOs and food distribution centers, reducing waste and helping those in need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button className="w-full">Register Now</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full">Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> For Donors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>List excess food for donation</li>
            <li>Track your donation history</li>
            <li>Get connected with local NGOs</li>
            <li>Reduce food waste</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" /> For NGOs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Find available food donations</li>
            <li>Accept and track pickups</li>
            <li>Connect with local food donors</li>
            <li>Help distribute food to those in need</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);

interface DonorDashboardProps {
  pendingCount: number;
  acceptedCount: number;
  pickedUpCount: number;
  donations: Array<any>;
  allDonations: Array<any>;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ 
  pendingCount, acceptedCount, pickedUpCount, donations, allDonations 
}) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{pendingCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Accepted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{acceptedCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Picked Up</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{pickedUpCount}</p>
        </CardContent>
      </Card>
    </div>
    
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="col-span-1 md:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="section-title">Your Recent Donations</h2>
          <Link to="/donate">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Donation
            </Button>
          </Link>
        </div>
        
        {donations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {donations.map(donation => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't made any donations yet</p>
              <Link to="/donate">
                <Button>Add Your First Donation</Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {donations.length > 0 && (
          <div className="text-center">
            <Link to="/my-donations">
              <Button variant="outline">View All Your Donations</Button>
            </Link>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <h2 className="section-title">Other Recent Donations</h2>
        {allDonations.length > 0 ? (
          <div className="space-y-4">
            {allDonations.map(donation => (
              <DonationCard key={donation.id} donation={donation} showActions={false} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">No other donations available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  </div>
);

interface NgoDashboardProps {
  pendingCount: number;
  acceptedCount: number;
  pickedUpCount: number;
  donations: Array<any>;
  acceptedDonations: Array<any>;
}

const NgoDashboard: React.FC<NgoDashboardProps> = ({ 
  pendingCount, acceptedCount, pickedUpCount, donations, acceptedDonations 
}) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{pendingCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Accepted by You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{acceptedCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Picked Up</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{pickedUpCount}</p>
        </CardContent>
      </Card>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Nearby Available Donations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DonationMap donations={donations} />
      </CardContent>
    </Card>
    
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="col-span-1 md:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="section-title">Available Donations</h2>
          <Link to="/browse">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        
        {donations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {donations.map(donation => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No donations available at the moment</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="space-y-4">
        <h2 className="section-title">Your Accepted Donations</h2>
        {acceptedDonations.length > 0 ? (
          <div className="space-y-4">
            {acceptedDonations.map(donation => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
            <div className="text-center">
              <Link to="/accepted">
                <Button variant="outline" size="sm">View All Accepted</Button>
              </Link>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-4">You haven't accepted any donations yet</p>
              <Link to="/browse">
                <Button>Browse Donations</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;
