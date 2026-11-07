const mongoose = require('mongoose');

// Connect to MongoDB Atlas using environment variables
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema with required fields
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  fathername: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Define Invoice Schema linked to a specific User via foreign key (userId)
const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoice_number: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Pending' }
});

const User = mongoose.model('User', userSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = { User, Invoice };