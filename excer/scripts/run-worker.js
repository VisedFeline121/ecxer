#!/usr/bin/env node

const https = require('https');

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:3000/api/worker';
const WORKER_SECRET = process.env.WORKER_SECRET;

async function runWorker() {
  try {
    console.log(`Running worker at ${new Date().toISOString()}`);
    
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WORKER_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Worker completed successfully:', result);
    } else {
      console.error('Worker failed:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error running worker:', error);
  }
}

runWorker();
