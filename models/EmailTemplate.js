import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['static', 'dynamic'],
    default: 'static',
  },
}, {
  timestamps: true,
});

export default mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema); 