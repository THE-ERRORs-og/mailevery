// This script runs the email worker process for Render deployment
require("dotenv").config();
const mongoose = require("mongoose");
const { Worker } = require("bullmq");
const nodemailer = require("nodemailer");

// Ensure environment variables
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

if (!process.env.REDIS_HOST) {
  console.error("REDIS_HOST environment variable is required");
  process.exit(1);
}

// Redis connection
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
};

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Define Models directly here to avoid ES module import issues
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  smtp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmtpConfig',
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

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

// Create models
const User = mongoose.model('User', userSchema);
const SmtpConfig = mongoose.model('SmtpConfig', smtpConfigSchema);
const EmailLog = mongoose.model('EmailLog', emailLogSchema);
const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
const ContactGroup = mongoose.model('ContactGroup', contactGroupSchema);

// Define sendEmail function directly here instead of importing
async function sendEmail(smtpConfig, emailDetails) {
  const { to, subject, html, from, attachments = [] } = emailDetails;

  // Create transporter with user's SMTP settings
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.username,
      pass: smtpConfig.password,
    },
  });

  // Set default sender if not provided
  const sender = from || smtpConfig.username;

  // Send email
  const info = await transporter.sendMail({
    from: sender,
    to,
    subject,
    html,
    attachments,
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}

// Set concurrency from environment or default to 1
const concurrency = parseInt(process.env.WORKER_CONCURRENCY || "1");
console.log(`Starting email worker with concurrency: ${concurrency}`);

// Create worker
const worker = new Worker(
  "email-queue",
  async (job) => {
    const { userId, to, subject, html,group=null, type = "direct" } = job.data;

    try {
      // Get the user and their SMTP config
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Get SMTP config
      const smtpConfig = await SmtpConfig.findById(user.smtp);
      if (!smtpConfig) {
        throw new Error(`SMTP configuration not found for user: ${userId}`);
      }

      // Send the email
      const result = await sendEmail(smtpConfig, {
        to,
        subject,
        html,
      });

      // Log successful email
      await EmailLog.create({
        user: userId,
        to,
        subject,
        body: html,
        type,
        group,
        status: "success",
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      // Log failed email
      await EmailLog.create({
        user: userId,
        to,
        subject,
        body: html,
        type,
        group,
        status: "failed",
        error: error.message || "Unknown error",
      });

      // Rethrow to trigger job failure
      throw error;
    }
  },
  {
    connection,
    concurrency: concurrency,
  }
);

// Handle job completion
worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

// Handle job failures
worker.on("failed", (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

console.log("Email worker started, processing jobs from email-queue...");

// Handle process termination
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker and connections...");
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing worker and connections...");
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
});
