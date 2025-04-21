
import { User, Donation } from '../types';

// Mock users data
export const users: User[] = [
  {
    id: '1',
    name: 'Green Garden Restaurant',
    email: 'info@greengarden.com',
    role: 'donor',
    organization: 'Green Garden Restaurant',
    address: '123 Main St, Anytown',
    phone: '555-123-4567',
    verified: true
  },
  {
    id: '2',
    name: 'Sunshine Bakery',
    email: 'contact@sunshinebakery.com',
    role: 'donor',
    organization: 'Sunshine Bakery',
    address: '456 Oak Ave, Anytown',
    phone: '555-987-6543',
    verified: true
  },
  {
    id: '3',
    name: 'Food For All',
    email: 'contact@foodforall.org',
    role: 'ngo',
    organization: 'Food For All NGO',
    address: '789 Pine St, Anytown',
    phone: '555-456-7890',
    verified: true
  },
  {
    id: '4',
    name: 'Community Helpers',
    email: 'info@communityhelpers.org',
    role: 'ngo',
    organization: 'Community Helpers',
    address: '101 Elm Blvd, Anytown',
    phone: '555-789-0123',
    verified: true
  }
];

// Mock donations data
export const donations: Donation[] = [
  {
    id: '1',
    donorId: '1',
    donorName: 'Green Garden Restaurant',
    foodName: 'Vegetable Soup',
    quantity: '5 gallons',
    description: 'Freshly made vegetable soup with carrots, celery, and potatoes.',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: {
      address: '123 Main St, Anytown',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      }
    },
    status: 'pending'
  },
  {
    id: '2',
    donorId: '2',
    donorName: 'Sunshine Bakery',
    foodName: 'Assorted Bread',
    quantity: '20 loaves',
    description: 'Variety of fresh bread including whole wheat, sourdough, and rye.',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: {
      address: '456 Oak Ave, Anytown',
      coordinates: {
        lat: 37.7739,
        lng: -122.4312
      }
    },
    status: 'pending'
  },
  {
    id: '3',
    donorId: '1',
    donorName: 'Green Garden Restaurant',
    foodName: 'Mixed Salad',
    quantity: '10 servings',
    description: 'Fresh garden salad with mixed greens, tomatoes, and cucumbers.',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 8), // 8 hours from now
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: {
      address: '123 Main St, Anytown',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      }
    },
    status: 'accepted',
    acceptedBy: {
      id: '3',
      name: 'Food For All'
    }
  },
  {
    id: '4',
    donorId: '2',
    donorName: 'Sunshine Bakery',
    foodName: 'Assorted Pastries',
    quantity: '30 pieces',
    description: 'Various pastries including croissants, danishes, and muffins.',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours from now
    createdAt: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    image: 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: {
      address: '456 Oak Ave, Anytown',
      coordinates: {
        lat: 37.7739,
        lng: -122.4312
      }
    },
    status: 'picked_up',
    acceptedBy: {
      id: '4',
      name: 'Community Helpers'
    }
  }
];
