import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
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
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      default: null,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContactGroup",
      default: null,
    },
    type: {
      type: String,
      enum: ["static", "dynamic"],
      default: "static",
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema); 