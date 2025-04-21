
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Building, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully",
    });
  };
  
  if (!user) {
    return (
      <div className="page-container">
        <div className="text-center py-16 bg-muted/40 rounded-lg">
          <p className="text-muted-foreground mb-4">Please log in to view your profile</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge className="capitalize">{user.role}</Badge>
                  {user.verified && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Check className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Name
                </Label>
                <Input id="name" defaultValue={user.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input id="email" type="email" defaultValue={user.email} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </Label>
                <Input id="phone" defaultValue={user.phone || ''} placeholder="Add your phone number" />
              </div>
              
              {user.role === 'donor' || user.role === 'ngo' ? (
                <div className="space-y-2">
                  <Label htmlFor="organization" className="flex items-center gap-2">
                    <Building className="h-4 w-4" /> Organization Name
                  </Label>
                  <Input id="organization" defaultValue={user.organization || ''} placeholder="Add your organization name" />
                </div>
              ) : null}
              
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Address
                </Label>
                <Textarea 
                  id="address" 
                  defaultValue={user.address || ''} 
                  placeholder="Add your address"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </Card>
        </form>
        
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => 
                toast({
                  title: "Not implemented",
                  description: "Password change would be available in the full version.",
                })
              }
            >
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
