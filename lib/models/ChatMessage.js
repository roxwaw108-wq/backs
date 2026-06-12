import mongoose from 'mongoose';
const s = new mongoose.Schema({ user: String, avatarId: Number, avatarUrl: String, text: String, time: String }, { timestamps: true });
export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', s);