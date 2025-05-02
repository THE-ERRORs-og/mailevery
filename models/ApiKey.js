import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    default: `API Key ${new Date().toLocaleDateString()}`,
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

// Static method to find an API key and its associated user
apiKeySchema.statics.findByKey = async function(apiKey) {
  if (!apiKey) return null;
  
  const keyDoc = await this.findOne({ key: apiKey, active: true });
  if (!keyDoc) return null;
  
  await keyDoc.populate('user');
  return keyDoc;
};

export default mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);