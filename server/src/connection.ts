import dotenv from 'dotenv';
dotenv.config();               // ← add this
import mongoose from 'mongoose';

const mongoURI =
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/googlebooks';

console.log('⏳ Connecting to MongoDB at', mongoURI);

mongoose.connect(mongoURI)
  .catch(err => console.error('❌ Initial connection error:', err));

mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connected successfully');
});

export default mongoose.connection;
