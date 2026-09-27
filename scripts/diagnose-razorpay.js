/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const dotenv = require('dotenv');

console.log('--- RAZORPAY ENVIRONMENT & AUTH DIAGNOSTIC ---');

const envLocalExists = fs.existsSync('.env.local');
const envExists = fs.existsSync('.env');
console.log('.env.local file exists:', envLocalExists);
console.log('.env file exists:', envExists);

let envLocalConfig = {};
if (envLocalExists) {
  const content = fs.readFileSync('.env.local', 'utf8');
  envLocalConfig = dotenv.parse(content);
}

let envConfig = {};
if (envExists) {
  const content = fs.readFileSync('.env', 'utf8');
  envConfig = dotenv.parse(content);
}

const keyId = envLocalConfig['RAZORPAY_KEY_ID'] || envLocalConfig['NEXT_PUBLIC_RAZORPAY_KEY_ID'];
const keySecret = envLocalConfig['RAZORPAY_KEY_SECRET'];

console.log('Key ID present:', !!keyId);
console.log('Key ID starts with rzp_test_:', (keyId || '').startsWith('rzp_test_'));
console.log('Key ID prefix:', (keyId || '').substring(0, 12));
console.log('Key Secret present:', !!keySecret);
console.log('Key Secret length:', (keySecret || '').length);

// Clean keys
const cleanKeyId = (keyId || '').trim();
const cleanKeySecret = (keySecret || '').trim();

async function testAuth() {
  if (!cleanKeyId || !cleanKeySecret) {
    console.error('ERROR: Key ID or Secret missing');
    return;
  }

  const auth = Buffer.from(`${cleanKeyId}:${cleanKeySecret}`).toString('base64');
  try {
    const res = await fetch('https://api.razorpay.com/v1/plans', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('HTTP Status:', res.status, res.statusText);
    const body = await res.text();
    console.log('Response Body:', body);
  } catch (err) {
    console.error('Network Fetch Error:', err.message);
  }
}

testAuth();
