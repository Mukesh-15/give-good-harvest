
const express = require('express');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

const router = express.Router();

// Create donation (donor only)
router.post('/', auth(['donor']), async (req, res) => {
  try {
    const { foodName, quantity, description, expiryTime, image, location } = req.body;
    const donorId = req.user.id;
    const newDonation = new Donation({
      donorId,
      donorName: req.user.name,
      foodName,
      quantity,
      description,
      expiryTime,
      image,
      location
    });
    await newDonation.save();
    res.status(201).json(newDonation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all donations (open to NGOs, donors get their own)
router.get('/', auth(), async (req, res) => {
  try {
    let donations;
    if (req.user.role === 'ngo')
      donations = await Donation.find({ status: 'pending' });
    else
      donations = await Donation.find({ donorId: req.user.id });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept donation (NGO only)
router.post('/:id/accept', auth(['ngo']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'pending')
      return res.status(400).json({ message: 'Donation not available' });

    donation.status = 'accepted';
    donation.acceptedBy = { id: req.user.id, name: req.user.name };
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as picked up (NGO only)
router.post('/:id/pickup', auth(['ngo']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    // Only NGO who accepted can pick up
    if (
      donation.status !== 'accepted' ||
      (donation.acceptedBy && String(donation.acceptedBy.id) !== req.user.id)
    ) {
      return res.status(400).json({ message: 'Not authorized' });
    }
    donation.status = 'picked_up';
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
