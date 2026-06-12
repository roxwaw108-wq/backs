import mongoose from 'mongoose';

const ShopItemSchema = new mongoose.Schema({
  category: { type: String, required: true },   // giftcard, adoptme, mm2
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  image: { type: String, required: true },       // png dosyasının adı (örn. "neon_dragon.png")
}, { timestamps: true });

export default mongoose.models.ShopItem || mongoose.model('ShopItem', ShopItemSchema);