import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId:           { type: Number, unique: true },
  username:         String,
  displayName:      String,
  avatarUrl:        String,
  balance:          { type: Number, default: 0 },
  tasksCompleted:   { type: Number, default: 0 },
  completedTaskIds: [String],
  affiliateCode:    String,
  referredBy:       String,
  redeemedCodes:    { type: [String], default: [] },
  createdAt:        { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
