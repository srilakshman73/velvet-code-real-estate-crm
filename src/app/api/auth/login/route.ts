import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { getOwnerEmail, verifyPassword } from '@/lib/auth-server';
import { verifyCustomerAccess } from '@/lib/subscription-gate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const ownerEmail = getOwnerEmail();
    const ownerPassword = process.env.OWNER_PASSWORD || 'Velvetcode@123';

    // 1. Check if user is the master SaaS OWNER (Sri Lakshman)
    if (trimmedEmail === ownerEmail) {
      // Timing safe password comparison
      const isOwnerPasswordCorrect = verifyPassword(password, ownerPassword);
      if (!isOwnerPasswordCorrect) {
        return NextResponse.json(
          { error: 'Invalid credentials. Access restricted.' },
          { status: 401 }
        );
      }

      const ownerOrg = (await serverDB.getOrganizationById('org-root-00')) || {
        id: 'org-root-00',
        name: 'Velvet Code HQ',
        slug: 'velvet-code-hq',
        businessType: 'AGENCY' as const,
        country: 'India',
        createdAt: new Date().toISOString(),
      };

      const ownerUser = {
        id: 'usr-admin-01',
        name: 'Sri Lakshman',
        email: ownerEmail,
        phone: '+91 63833 95915',
        role: 'OWNER' as const,
        organizationId: ownerOrg.id,
        organizationName: ownerOrg.name,
        isSuperAdmin: true,
      };

      const response = NextResponse.json({
        success: true,
        user: ownerUser,
        organization: ownerOrg,
        redirectTo: '/admin/dashboard',
        message: 'Owner authenticated successfully',
      });

      // Set secure HTTP-only session cookies
      response.cookies.set('velvet_auth_role', 'OWNER', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('velvet_auth_email', ownerEmail, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('velvet_auth_org', ownerOrg.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 2. Customer Authentication from persistent database
    const dbUser = await serverDB.getUserByEmail(trimmedEmail);

    if (dbUser) {
      // Validate password if user has passwordHash
      if (dbUser.passwordHash) {
        const isMatch = verifyPassword(password, dbUser.passwordHash);
        if (!isMatch) {
          return NextResponse.json(
            { error: 'Invalid email or password.' },
            { status: 401 }
          );
        }
      } else if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 401 }
        );
      }

      const org = (await serverDB.getOrganizationById(dbUser.organizationId)) || {
        id: dbUser.organizationId,
        name: 'Agency Workspace',
        slug: 'agency-workspace',
        businessType: 'AGENCY' as const,
        country: 'India',
        createdAt: new Date().toISOString(),
      };

      // Strict role sanitization: customer can NEVER possess role 'OWNER'
      const customerRole = dbUser.role === 'OWNER' ? ('ADMIN' as const) : dbUser.role;
      const customerUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: customerRole,
        organizationId: org.id,
        isSuperAdmin: false,
        organizationName: org.name,
      };

      // Server-side Subscription & 7-Day Trial Gate check
      const access = await verifyCustomerAccess({
        userId: customerUser.id,
        name: customerUser.name,
        email: customerUser.email,
        role: customerRole,
        organizationId: org.id,
        organizationName: org.name,
        isOwner: false,
        isSuperAdmin: false,
      });

      const redirectTo = access.allowed
        ? '/app/dashboard'
        : (access.redirectUrl || '/app/billing?reason=trial_expired');

      const response = NextResponse.json({
        success: true,
        user: customerUser,
        organization: org,
        redirectTo,
        subscriptionStatus: access.status,
        trialDaysRemaining: access.daysRemaining,
        message: 'Customer authenticated successfully',
      });

      response.cookies.set('velvet_auth_role', customerRole, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('velvet_auth_email', customerUser.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('velvet_auth_org', org.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid email or password. Please check your credentials or register a new workspace.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Authentication service encountered an internal error' },
      { status: 500 }
    );
  }
}
