
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
dotenv.config();

const router = express.Router();

// Define admin emails - replace with your actual email
const ADMIN_EMAILS = [
  'admin@givegoodharvest.com',  // Replace with your email
  'your-email@example.com'      // Add your actual email here
];

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if trying to register as admin with unauthorized email
    if (role === 'admin' && !ADMIN_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({ message: 'Admin registration not allowed for this email' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      organization,
      verified: role === 'admin' || ADMIN_EMAILS.includes(email.toLowerCase())
    });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ 
      user: { id: user._id, name, email, role, organization, verified: user.verified },
      token 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Additional check: if user role is admin but email is not in allowed list
    if (user.role === 'admin' && !ADMIN_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({ message: 'Admin access not authorized for this account' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization, verified: user.verified },
      token 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
