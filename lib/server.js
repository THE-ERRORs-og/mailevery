// This file handles server-side initialization logic

import { initEmailWorker, closeEmailWorker } from './queue/initEmailWorker';
import mongoose from 'mongoose';

let isWorkerInitialized = false;

export async function initServer() {
  // Only run in server environment
  if (typeof window !== 'undefined') return;
  
  console.log('Initializing server components...');
  
  // Check if we should run the worker in-process
  if (process.env.NEXT_PUBLIC_RUN_WORKER_IN_PROCESS === 'true') {
    if (!isWorkerInitialized) {
      console.log('Starting email worker in-process');
      try {
        initEmailWorker();
        isWorkerInitialized = true;
        console.log('Email worker initialized successfully');
      } catch (error) {
        console.error('Failed to initialize email worker:', error);
      }
    }
  }
  
  // Set up cleanup handlers
  setupCleanupHandlers();
}

function setupCleanupHandlers() {
  // Skip in non-Node.js environments
  if (typeof process === 'undefined') return;
  
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, cleaning up...');
    await cleanup();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('SIGINT received, cleaning up...');
    await cleanup();
    process.exit(0);
  });
}

async function cleanup() {
  console.log('Running cleanup tasks...');
  
  if (isWorkerInitialized) {
    await closeEmailWorker();
    console.log('Email worker closed');
  }
  
  // Close database connections
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log('Mongoose disconnected');
  }
}