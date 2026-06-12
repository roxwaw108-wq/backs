import mongoose from 'mongoose';
const s = new mongoose.Schema({
  userId: Number, username: String, category: String, catId: String,
  itemName: String, itemImg: String, amount: Number,
  status: { type: String, default: 'ready' }, accent: String, chatMessages: { type: Array, default: [] }
}, { timestamps: true });
export default mongoose.models.Claim || mongoose.model('Claim', s);