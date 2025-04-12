import mongoose from 'mongoose';

const contactGroupSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  emails: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Add index for faster queries
contactGroupSchema.index({ user: 1, name: 1 }, { unique: true });

const ContactGroup = mongoose.models.ContactGroup || mongoose.model('ContactGroup', contactGroupSchema);

export default ContactGroup; 