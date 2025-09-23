const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing in .env');
  await mongoose.connect(uri, { dbName: 'ecommerce' });
  console.log('MongoDB connected');
};
