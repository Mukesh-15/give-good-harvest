
// Main Express server setup
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// Routes
app.get('/', (req, res) => res.send('Food Donation API is running!'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));

// 404 Handler
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server started on port ${PORT}`));
