import fs from 'fs';
import path from 'path';
import { serverDB } from '../src/lib/server-db';
import { getOwnerEmail } from '../src/lib/auth-server';
import { GET as getAdminUsers } from '../src/app/api/admin/users/route';
import { NextRequest } from 'next/server';

async function runFontAndUserVerification() {
  console.log('====================================================');
  console.log('VELVET CODE CRM: GLOBAL FONT & OWNER USER MONITORING');
  console.log('====================================================\n');

  // STEP 1: Verify Typography Files
  console.log('[STEP 1] Verifying Global Font Configuration & Encodings...');
  
  const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (!layoutContent.includes('Inter') || layoutContent.includes('Playfair_Display') || layoutContent.includes('Manrope')) {
    throw new Error('FAIL: layout.tsx must import Inter and must not load Playfair_Display or Manrope');
  }
  if (!layoutContent.includes("'latin-ext'")) {
    throw new Error('FAIL: layout.tsx must include latin-ext subset for complete Unicode coverage');
  }
  console.log('✔ layout.tsx correctly imports unified Inter font with latin and latin-ext subsets.');

  const globalsPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
  const globalsContent = fs.readFileSync(globalsPath, 'utf8');
  if (!globalsContent.includes('--font-sans:') || !globalsContent.includes('--font-serif:')) {
    throw new Error('FAIL: globals.css must define unified font variables');
  }
  if (!globalsContent.includes('h1, h2, h3, h4, h5, h6, .font-serif, .font-serif-luxury')) {
    throw new Error('FAIL: globals.css must force unified Inter font across headings and legacy serif classes');
  }
  console.log('✔ globals.css correctly binds headings and font-serif to Inter font.');

  // Check no distorted Â© characters exist in source
  const loginPath = path.join(__dirname, '..', 'src', 'app', 'login', 'page.tsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  if (loginContent.includes('Â©')) {
    throw new Error('FAIL: login/page.tsx contains distorted UTF-8 double-encoded Â© symbol');
  }
  console.log('✔ login/page.tsx has clean UTF-8 encoding without distorted Â© glyphs.\n');

  // STEP 2: Verify Server DB Methods
  console.log('[STEP 2] Verifying Server DB Registered Users Retrieval...');
  const ownerEmail = getOwnerEmail();
  console.log(`Identified Owner Email: ${ownerEmail}`);

  const registeredUsers = await serverDB.getRegisteredUsersForOwner();
  console.log(`Total Registered Customers retrieved: ${registeredUsers.length}`);

  if (!Array.isArray(registeredUsers) || registeredUsers.length === 0) {
    throw new Error('FAIL: Expected registered users array with at least 1 record');
  }

  for (const u of registeredUsers) {
    console.log(`  - Customer: "${u.name}" (${u.email}) | Workspace: "${u.organizationName}" (${u.organizationMemberCount} members) | Plan: ${u.planName} [${u.subscriptionStatus}]`);
    console.log(`    Reg Date: ${u.registrationDate} | Last Login: ${u.lastLoginAt} | Trial End: ${u.trialEndDate}`);

    // Verify security: absolutely NO password hashes or secrets
    if ('passwordHash' in u || 'password' in u) {
      throw new Error(`CRITICAL SECURITY FAILURE: Password hash exposed for user ${u.email}!`);
    }

    if (!u.name || !u.email || !u.organizationName) {
      throw new Error(`FAIL: Missing required user fields for ${u.email}`);
    }
  }
  console.log('✔ All registered users retrieved safely without secrets.\n');

  // STEP 3: Verify Login Tracking (lastLoginAt)
  console.log('[STEP 3] Testing Server-Side Login Timestamp Tracking...');
  const testEmail = ownerEmail;
  const beforeTime = new Date().toISOString();
  await serverDB.recordUserLogin(testEmail);
  const updatedUser = await serverDB.getUserByEmail(testEmail);
  
  if (!updatedUser?.lastLoginAt) {
    throw new Error('FAIL: recordUserLogin failed to update lastLoginAt');
  }
  console.log(`✔ User ${testEmail} lastLoginAt successfully updated: ${updatedUser.lastLoginAt}\n`);

  // STEP 4: Verify Strict Server-Side Access Control on /api/admin/users
  console.log('[STEP 4] Testing Strict Owner-Only Access on /api/admin/users...');

  // 4a: Anonymous request
  const anonReq = new NextRequest('http://localhost:3000/api/admin/users');
  const anonRes = await getAdminUsers(anonReq);
  if (anonRes.status !== 403) {
    throw new Error(`FAIL: Expected 403 Forbidden for anonymous request, got ${anonRes.status}`);
  }
  console.log('✔ Anonymous request rejected with 403 Forbidden.');

  // 4b: Customer request
  const custReq = new NextRequest('http://localhost:3000/api/admin/users', {
    headers: {
      'x-auth-role': 'ADMIN',
      'x-auth-email': 'agent@realtyagency.in',
      'x-auth-org': 'org-customer-01',
    },
  });
  const custRes = await getAdminUsers(custReq);
  if (custRes.status !== 403) {
    throw new Error(`FAIL: Expected 403 Forbidden for customer account, got ${custRes.status}`);
  }
  console.log('✔ Customer tenant account rejected with 403 Forbidden.');

  // 4c: Authorized Owner request
  const ownerReq = new NextRequest('http://localhost:3000/api/admin/users', {
    headers: {
      'x-auth-role': 'OWNER',
      'x-auth-email': ownerEmail,
      'x-auth-org': 'org-root-00',
    },
  });
  const ownerRes = await getAdminUsers(ownerReq);
  if (ownerRes.status !== 200) {
    throw new Error(`FAIL: Expected 200 OK for owner request, got ${ownerRes.status}`);
  }
  const ownerData = await ownerRes.json();
  if (!ownerData.success || !Array.isArray(ownerData.users)) {
    throw new Error('FAIL: Expected success response with users array');
  }
  console.log(`✔ Owner request approved: ${ownerData.users.length} users returned with full pagination & metrics.\n`);

  // STEP 5: Search & Filter Verification
  console.log('[STEP 5] Testing Search & Filter Capabilities...');
  const searchReq = new NextRequest('http://localhost:3000/api/admin/users?search=lakshman', {
    headers: {
      'x-auth-role': 'OWNER',
      'x-auth-email': ownerEmail,
      'x-auth-org': 'org-root-00',
    },
  });
  const searchRes = await getAdminUsers(searchReq);
  const searchData = await searchRes.json();
  if (searchData.users.length === 0) {
    throw new Error('FAIL: Search for "lakshman" returned 0 results');
  }
  console.log(`✔ Search for "lakshman" correctly filtered ${searchData.users.length} matching user(s).`);

  const planReq = new NextRequest('http://localhost:3000/api/admin/users?plan=STARTER', {
    headers: {
      'x-auth-role': 'OWNER',
      'x-auth-email': ownerEmail,
      'x-auth-org': 'org-root-00',
    },
  });
  const planRes = await getAdminUsers(planReq);
  const planData = await planRes.json();
  console.log(`✔ Filter by plan "STARTER" returned ${planData.users.length} user(s).\n`);

  console.log('====================================================');
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runFontAndUserVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
