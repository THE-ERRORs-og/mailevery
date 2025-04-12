import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  usageToday: {
    type: Number,
    default: 0,
  },
  lastUsed: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Method to check if API key is valid
apiKeySchema.methods.isValid = function() {
  return this.active;
};

// Method to increment usage
apiKeySchema.methods.incrementUsage = async function() {
  this.usageToday += 1;
  this.lastUsed = new Date();
  await this.save();
};

export default mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema); 