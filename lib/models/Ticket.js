import mongoose from 'mongoose';
const s = new mongoose.Schema({
  userId: Number, username: String, displayName: String,
  reason: String, desc: String,
  status: { type: String, default: 'pending' }, messages: { type: Array, default: [] }
}, { timestamps: true });
export default mongoose.models.Ticket || mongoose.model('Ticket', s);