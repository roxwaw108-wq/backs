import mongoose from 'mongoose';

const AffiliateSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  userId: Number,
  username: String,
  clicks: { type: Number, default: 0 },
  signups: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  referrals: [{
    userId: Number,
    username: String,
    totalEarned: { type: Number, default: 0 },
    cut: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.models.Affiliate || mongoose.model('Affiliate', AffiliateSchema);