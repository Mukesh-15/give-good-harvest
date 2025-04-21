
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDonation } from '@/context/DonationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const DonateForm = () => {
  const { addDonation } = useDonation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    description: '',
    expiryTime: '',
    image: '',
    address: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.foodName || !formData.quantity || !formData.expiryTime || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate expiry time from the input (which is in format "YYYY-MM-DDThh:mm")
      const expiryTime = new Date(formData.expiryTime);
      
      // Add donation
      addDonation({
        foodName: formData.foodName,
        quantity: formData.quantity,
        description: formData.description,
        expiryTime,
        image: formData.image || undefined,
        location: {
          address: formData.address,
          coordinates: {
            // In a real app, we would use geocoding to get coordinates from the address
            lat: 37.7749 + (Math.random() * 0.02 - 0.01), // Random variation for demo
            lng: -122.4194 + (Math.random() * 0.02 - 0.01),
          },
        },
      });
      
      // Navigate to My Donations page
      navigate('/my-donations');
    } catch (error) {
      console.error('Error adding donation:', error);
      toast({
        title: "Error",
        description: "Failed to add donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate minimum expiry time (current time)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  
  return (
    <div className="page-container max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Food Donation</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Donation Details</CardTitle>
          <CardDescription>
            Please provide details about the food you'd like to donate
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="foodName">Food Name *</Label>
              <Input
                id="foodName"
                name="foodName"
                placeholder="e.g., Vegetable Soup, Bread, Pastries"
                value={formData.foodName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                placeholder="e.g., 5 gallons, 10 loaves, 20 servings"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide more details about the food, ingredients, allergens, etc."
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryTime">Expiry Time *</Label>
              <Input
                id="expiryTime"
                name="expiryTime"
                type="datetime-local"
                min={minDateTime}
                value={formData.expiryTime}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                When will this food no longer be good to eat?
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                Provide a URL to an image of the food (optional)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Pickup Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter the address where the food can be picked up"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/my-donations')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding donation..." : "Add Donation"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DonateForm;
