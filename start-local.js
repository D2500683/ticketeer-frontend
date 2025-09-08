#!/usr/bin/env node

/**
 * Local Development Startup Script
 * This script helps you start both frontend and backend for local development
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Ticketeer Local Development Environment...\n');

// Start backend
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'ticketeer-backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment then start frontend
setTimeout(() => {
  console.log('\n🎨 Starting frontend development server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  });

  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    backend.kill('SIGINT');
  });

  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    frontend.kill('SIGINT');
  });

}, 2000);

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});
