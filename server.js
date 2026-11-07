require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Invoice } = require('./db');

const app = express();
app.use(express.json());
app.use(express.static('public')); 

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to verify JWT token for protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user; // Attach decoded user data to request
    next();
  });
}

//  Register API Route
app.post('/api/register', async (req, res) => {
  try {
    const { username, fathername, contact, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({ username, fathername, contact, email, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login API Route (Issues JWT Token)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    // A stateless JWT token containing userId
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful!', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Invoice Creation API Route
app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { invoice_number, amount } = req.body;
    
    const newInvoice = new Invoice({
      userId: req.user.userId, // Linked automatically from JWT token
      invoice_number,
      amount
    });
    
    await newInvoice.save();
    res.status(201).json({ message: 'Invoice created successfully!', invoice: newInvoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));