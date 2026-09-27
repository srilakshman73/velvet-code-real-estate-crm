/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.error(JSON.stringify({
    success: false,
    authFailed: true,
    error: 'Razorpay Key ID or Key Secret is missing from environment variables'
  }));
  process.exit(1);
}

const plansToSetup = [
  {
    tier: 'STARTER',
    envKey: 'RAZORPAY_STARTER_PLAN_ID',
    name: 'Velvet Code Starter',
    description: 'Velvet Code Starter Monthly Subscription',
    period: 'monthly',
    interval: 1,
    amount: 199900,
    currency: 'INR'
  },
  {
    tier: 'PROFESSIONAL',
    envKey: 'RAZORPAY_PROFESSIONAL_PLAN_ID',
    name: 'Velvet Code Professional',
    description: 'Velvet Code Professional Monthly Subscription',
    period: 'monthly',
    interval: 1,
    amount: 599900,
    currency: 'INR'
  },
  {
    tier: 'BUSINESS',
    envKey: 'RAZORPAY_BUSINESS_PLAN_ID',
    name: 'Velvet Code Business',
    description: 'Velvet Code Business Monthly Subscription',
    period: 'monthly',
    interval: 1,
    amount: 999900,
    currency: 'INR'
  }
];

async function apiRequest(endpoint, method = 'GET', data = null) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(`https://api.razorpay.com/v1${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  });

  const statusCode = response.status;
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return { statusCode, json, rawText: text };
}

async function run() {
  console.log('[SETUP] Connecting to Razorpay API...');

  // Step 1: Fetch existing plans
  const fetchRes = await apiRequest('/plans?count=100', 'GET');

  if (fetchRes.statusCode === 401 || fetchRes.statusCode === 403) {
    console.error(JSON.stringify({
      success: false,
      authFailed: true,
      statusCode: fetchRes.statusCode,
      message: 'Razorpay TEST API authentication failed. Credentials need to be regenerated/configured.'
    }));
    process.exit(2);
  }

  if (fetchRes.statusCode !== 200) {
    console.error(JSON.stringify({
      success: false,
      authFailed: false,
      statusCode: fetchRes.statusCode,
      message: `Razorpay API error: ${fetchRes.rawText}`
    }));
    process.exit(1);
  }

  const existingPlans = (fetchRes.json && fetchRes.json.items) ? fetchRes.json.items : [];
  console.log(`[SETUP] Fetched ${existingPlans.length} existing plan(s) from Razorpay.`);

  const configuredPlans = {};

  for (const target of plansToSetup) {
    // Check if matching plan exists
    // Matching rules: name, amount, currency, period, interval
    const match = existingPlans.find(p => {
      const pItem = p.item || {};
      const nameMatch = (pItem.name === target.name) || (p.name === target.name);
      const amountMatch = (pItem.amount === target.amount) || (p.amount === target.amount);
      const currencyMatch = (pItem.currency === target.currency) || (p.currency === target.currency);
      const periodMatch = p.period === target.period;
      const intervalMatch = p.interval === target.interval;
      return nameMatch && amountMatch && currencyMatch && periodMatch && intervalMatch;
    });

    if (match) {
      console.log(`[SETUP] Found existing matching plan for ${target.name}: ${match.id}`);
      configuredPlans[target.tier] = {
        id: match.id,
        reused: true,
        envKey: target.envKey
      };
    } else {
      console.log(`[SETUP] Creating new plan for ${target.name}...`);
      const createRes = await apiRequest('/plans', 'POST', {
        period: target.period,
        interval: target.interval,
        item: {
          name: target.name,
          amount: target.amount,
          currency: target.currency,
          description: target.description
        },
        notes: {
          platform: 'Velvet Code CRM',
          tier: target.tier
        }
      });

      if (createRes.statusCode !== 200 && createRes.statusCode !== 201) {
        console.error(`[SETUP] Failed to create plan ${target.name}: ${createRes.rawText}`);
        process.exit(1);
      }

      console.log(`[SETUP] Created new plan for ${target.name}: ${createRes.json.id}`);
      configuredPlans[target.tier] = {
        id: createRes.json.id,
        reused: false,
        envKey: target.envKey
      };
    }
  }

  // Step 2: Update .env.local securely
  let envFileContent = fs.readFileSync(envPath, 'utf8');
  for (const tier of Object.keys(configuredPlans)) {
    const { id, envKey } = configuredPlans[tier];
    const regex = new RegExp(`^${envKey}=.*$`, 'm');
    if (regex.test(envFileContent)) {
      envFileContent = envFileContent.replace(regex, `${envKey}=${id}`);
    } else {
      envFileContent += `\n${envKey}=${id}`;
    }
  }

  fs.writeFileSync(envPath, envFileContent, 'utf8');
  console.log('[SETUP] Successfully updated .env.local with plan IDs.');

  // Step 3: Test subscription creation for each plan (Test Mode verification)
  const subResults = {};
  for (const tier of Object.keys(configuredPlans)) {
    const planId = configuredPlans[tier].id;
    console.log(`[SETUP] Verifying test subscription creation for ${tier} (${planId})...`);
    const subRes = await apiRequest('/subscriptions', 'POST', {
      plan_id: planId,
      total_count: 12,
      quantity: 1,
      customer_notify: 0,
      notes: {
        testModeVerification: true,
        tier
      }
    });

    if (subRes.statusCode === 200 || subRes.statusCode === 201) {
      console.log(`[SETUP] Successfully created Test Mode subscription: ${subRes.json.id}`);
      subResults[tier] = {
        testSubscriptionId: subRes.json.id,
        status: 'VERIFIED'
      };
    } else {
      console.warn(`[SETUP] Note on test subscription for ${tier}: ${subRes.rawText}`);
      subResults[tier] = {
        status: 'FAILED',
        error: subRes.rawText
      };
    }
  }

  console.log(JSON.stringify({
    success: true,
    starterPlanId: configuredPlans.STARTER?.id,
    professionalPlanId: configuredPlans.PROFESSIONAL?.id,
    businessPlanId: configuredPlans.BUSINESS?.id,
    plansStatus: configuredPlans,
    subscriptionVerification: subResults
  }, null, 2));
}

run().catch(err => {
  console.error(JSON.stringify({
    success: false,
    error: err.message
  }));
  process.exit(1);
});
