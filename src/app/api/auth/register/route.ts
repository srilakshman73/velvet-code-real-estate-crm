import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { getOwnerEmail, hashPassword } from '@/lib/auth-server';
import { getTrialConfiguration } from '@/lib/subscription-gate';
import { SubscriptionStatus } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, agencyName, city, phone, password } = body;

    if (!fullName || !email || !agencyName || !password) {
      return NextResponse.json(
        { error: 'Full name, email, agency name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Security rule: Customers cannot register using the owner email or claim role OWNER
    const ownerEmail = getOwnerEmail();
    if (trimmedEmail === ownerEmail) {
      return NextResponse.json(
        { error: 'This email is reserved for system administration. Please sign in directly.' },
        { status: 400 }
      );
    }

    // Check if email already registered in database
    const existingUser = await serverDB.getUserByEmail(trimmedEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered. Please sign in or reset your password.' },
        { status: 409 }
      );
    }

    const newOrgId = `org-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newUserId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Create isolated customer organization
    const newOrg = {
      id: newOrgId,
      name: agencyName.trim(),
      slug: agencyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') || `org-${Date.now()}`,
      businessType: 'AGENCY' as const,
      phone: phone ? phone.trim() : '+91 63833 95915',
      email: trimmedEmail,
      city: city ? city.trim() : 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      createdAt: new Date().toISOString(),
    };

    // Hash password securely with PBKDF2
    const passwordHash = hashPassword(password);

    // Create customer admin user (cannot be OWNER)
    const newUser = {
      id: newUserId,
      name: fullName.trim(),
      email: trimmedEmail,
      phone: phone ? phone.trim() : '+91 63833 95915',
      role: 'ADMIN' as const,
      organizationId: newOrgId,
      isSuperAdmin: false,
      passwordHash,
    };

    // Determine 7-day trial policy from server configuration
    const trialConfig = getTrialConfiguration();
    const now = Date.now();
    const status: SubscriptionStatus = trialConfig.enabled ? 'TRIALING' : 'UNPAID';
    const periodEnd = trialConfig.enabled
      ? new Date(now + trialConfig.trialDays * 24 * 60 * 60 * 1000).toISOString()
      : new Date(now).toISOString();

    // Commit organization, user, and subscription to persistent database
    await serverDB.addOrganization(newOrg);
    await serverDB.addUser(newUser);
    await serverDB.upsertSubscription({
      id: `sub-${newOrgId}`,
      organizationId: newOrgId,
      userId: newUserId,
      tier: 'STARTER',
      status,
      priceMonthlyINR: 1999,
      billingCycle: 'monthly',
      currentPeriodStart: new Date(now).toISOString(),
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      usage: {
        usersCount: 1,
        leadsCount: 0,
        propertiesCount: 0,
        aiRequestsUsed: 0,
      },
    });

    const redirectTo = trialConfig.enabled ? '/app/dashboard' : '/app/billing?reason=payment_required';

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        organizationId: newUser.organizationId,
        isSuperAdmin: false,
      },
      organization: newOrg,
      redirectTo,
      trialDays: trialConfig.enabled ? trialConfig.trialDays : 0,
      message: trialConfig.enabled
        ? `Account registered successfully with ${trialConfig.trialDays}-day free trial.`
        : 'Account registered. Please select a plan to activate your CRM workspace.',
    });

    response.cookies.set('velvet_auth_role', 'ADMIN', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('velvet_auth_email', trimmedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('velvet_auth_org', newOrgId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Registration service encountered an internal error' },
      { status: 500 }
    );
  }
}
