import mongoose from 'mongoose';

const smtpConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    required: true,
  },
  secure: {
    type: Boolean,
    default: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.SmtpConfig || mongoose.model('SmtpConfig', smtpConfigSchema); 