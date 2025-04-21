
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: String,
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  description: String,
  expiryTime: { type: Date, required: true },
  image: String,
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'picked_up', 'expired', 'cancelled'], 
    default: 'pending' 
  },
  acceptedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
