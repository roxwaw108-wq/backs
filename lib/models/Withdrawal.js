import mongoose from 'mongoose';
const s = new mongoose.Schema({
  userId: Number, username: String, amount: Number,
  account: String, status: { type: String, default: 'pending' }
}, { timestamps: true });
export default mongoose.models.Withdrawal || mongoose.model('Withdrawal', s);