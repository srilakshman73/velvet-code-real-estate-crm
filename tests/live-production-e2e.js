const PROD_URL = 'https://velvet-code-real-estate-crm.vercel.app';

async function testLiveProduction() {
  console.log('================================================================');
  console.log('  LIVE PRODUCTION VERIFICATION ON VERCEL DEPLOYED APPLICATION   ');
  console.log('  URL: ' + PROD_URL);
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testNum, title, details) {
    total++;
    if (condition) {
      passed++;
      console.log(`[TEST ${String(testNum).padStart(2, '0')}] ✅ PASS: ${title}`);
      console.log(`          Details: ${details}\n`);
    } else {
      console.error(`[TEST ${String(testNum).padStart(2, '0')}] ❌ FAIL: ${title}`);
      console.error(`          Details: ${details}\n`);
    }
  }

  // TEST 1: Check Production Homepage Availability
  const homeRes = await fetch(PROD_URL);
  assert(
    homeRes.status === 200,
    1,
    'Production Website Live & Responsive (HTTP 200)',
    `Status ${homeRes.status} received from ${PROD_URL}`
  );

  // TEST 2: Register a Brand New Customer on Live Production
  const uniqueId = Date.now().toString(36);
  const testEmail = `live_customer_${uniqueId}@velvetcode.audit`;
  const testPassword = 'ProdSecure@2026';
  const testAgency = `Royal Living Estates ${uniqueId.toUpperCase()}`;

  console.log(`--- Registering New User: ${testEmail} ---`);
  const regRes = await fetch(`${PROD_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Vikramaditya Roy',
      email: testEmail,
      agencyName: testAgency,
      city: 'Mumbai',
      phone: '+91 98200 12345',
      password: testPassword,
    }),
  });

  const regData = await regRes.json();
  const regCookies = regRes.headers.get('set-cookie') || '';

  assert(
    regRes.status === 200 && regData.success === true && regData.trialDays === 7,
    2,
    'New Customer Registration on Production with 7-Day Free Trial',
    `Status: ${regRes.status}, User ID: ${regData.user?.id}, Org: ${regData.organization?.name}, Trial: ${regData.trialDays} days`
  );

  // TEST 3: Duplicate Registration on Production Rejected with Exact Required Copy
  console.log('--- Testing Duplicate Registration on Production ---');
  const dupRes = await fetch(`${PROD_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Vikramaditya Roy Duplicate',
      email: testEmail,
      agencyName: testAgency,
      password: testPassword,
    }),
  });

  const dupData = await dupRes.json();
  assert(
    dupRes.status === 409 && dupData.error === 'This email is already registered. Please sign in or reset your password.',
    3,
    'Duplicate Registration Strictly Blocked with Exact Required Message',
    `HTTP ${dupRes.status}: "${dupData.error}"`
  );

  // Short delay to allow any multi-region lambda cold starts
  await new Promise(r => setTimeout(r, 1000));

  // TEST 4: Immediate Login using the SAME Email and Password
  console.log(`--- Logging In with Registered Account: ${testEmail} ---`);
  const loginRes1 = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });

  const loginData1 = await loginRes1.json();
  const loginCookies1 = loginRes1.headers.get('set-cookie') || '';

  assert(
    loginRes1.status === 200 && loginData1.success === true && loginData1.user?.email === testEmail,
    4,
    'First Subsequent Login Succeeds (Existing Account Restored)',
    `HTTP ${loginRes1.status}: Welcome ${loginData1.user?.name}, Org: ${loginData1.organization?.name}, Trial: ${loginData1.trialDaysRemaining} days remaining`
  );

  assert(
    loginData1.redirectTo === '/app/dashboard' && loginData1.user?.role === 'ADMIN',
    5,
    'Workspace Access & Correct Role Granted on Login',
    `Redirect: ${loginData1.redirectTo}, Role: ${loginData1.user?.role} (Sanitized, not OWNER)`
  );

  // TEST 6: Simulated Second Device / Browser Login (Separate Session)
  console.log('--- Simulating Second Device / Browser Session Login ---');
  const loginRes2 = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });

  const loginData2 = await loginRes2.json();
  assert(
    loginRes2.status === 200 && loginData2.success === true && loginData2.user?.id === regData.user?.id,
    6,
    'Repeat Login Across Separate Devices / Sessions Restores Same Workspace',
    `Verified matching User ID ${loginData2.user?.id} and Org ID ${loginData2.organization?.id}`
  );

  // TEST 7: Login with Incorrect Password Rejected
  console.log('--- Testing Incorrect Password Rejection ---');
  const badLoginRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'WrongPassword@999',
    }),
  });

  const badLoginData = await badLoginRes.json();
  assert(
    badLoginRes.status === 401 && badLoginData.error.includes('Invalid email or password'),
    7,
    'Incorrect Password Strictly Rejected (HTTP 401)',
    `HTTP ${badLoginRes.status}: "${badLoginData.error}"`
  );

  // TEST 8: Test Platform Owner Login on Live Production
  console.log('--- Testing Master Owner Authentication ---');
  const ownerRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'srilakshman73@gmail.com',
      password: process.env.OWNER_PASSWORD || 'Velvetcode@123',
    }),
  });

  const ownerData = await ownerRes.json();
  assert(
    ownerRes.status === 200 && ownerData.user?.role === 'OWNER' && ownerData.redirectTo === '/admin/dashboard',
    8,
    'Authoritative Master Owner Login & Admin Routing',
    `HTTP ${ownerRes.status}: Owner authenticated with role OWNER redirecting to /admin/dashboard`
  );

  // TEST 9: Email Normalization (Case & Whitespace Insensitivity)
  console.log('--- Testing Email Normalization on Login ---');
  const normalizedLoginRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `  ${testEmail.toUpperCase()}  `,
      password: testPassword,
    }),
  });

  const normalizedLoginData = await normalizedLoginRes.json();
  assert(
    normalizedLoginRes.status === 200 && normalizedLoginData.success === true,
    9,
    'Email Case and Whitespace Normalization on Login',
    `Login with uppercase and leading/trailing whitespace resolved to ${normalizedLoginData.user?.email}`
  );

  console.log('================================================================');
  console.log(`TOTAL LIVE PRODUCTION TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🏆 100% PRODUCTION E2E AUTHENTICATION VERIFIED ON LIVE VERCEL WEBSITE!');
  } else {
    process.exit(1);
  }
}

testLiveProduction().catch(err => {
  console.error('Production test failure:', err);
  process.exit(1);
});
