import mongoose from 'mongoose';

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGO_URI || process.env.NEXT_PUBLIC_MONGODB_URI;

  if (!MONGO_URI) throw new Error('MongoDB bağlantı dizgesi bulunamadı. Lütfen .env.local içine `MONGO_URI` veya `MONGODB_URI` ekleyin.');

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI);
  }
  cached.conn = await cached.promise;
  // keep cached on global so HMR doesn't create new connections
  try { global.mongoose = cached; } catch (e) {}
  return cached.conn;
}