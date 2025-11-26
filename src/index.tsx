#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './components/App';
import dotenv from 'dotenv';
import './i18n/config';
import i18n from './i18n/config';

// Load environment variables
dotenv.config();

// Clear console for clean output
console.clear();

// Parse command line arguments
const args = process.argv.slice(2);
const useFreeModels = args.includes('--free');

if (useFreeModels) {
  console.log('💰 FREE mode: using free models\n');
}

// Check for required API keys
if (!process.env.FAL_API_KEY) {
  console.error('❌ Error: FAL_API_KEY not set in .env file');
  process.exit(1);
}

if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ Error: OPENROUTER_API_KEY not set in .env file');
  process.exit(1);
}

// Render application
const { waitUntilExit } = render(
  <App
    useFreeModels={useFreeModels}
    onExit={() => {
      process.exit(0);
    }}
  />
);

// Handle exit
waitUntilExit().then(() => {
  console.log(`\n👋 ${i18n.t('input.exit_message')}\n`);
});
