import { NextResponse } from 'next/server';
import { INITIAL_USERS, INITIAL_ORGANIZATIONS } from '@/lib/mock-data';

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

    // Owner credentials from secure environment variable or fallback
    const ownerEmail = (process.env.OWNER_EMAIL || 'srilakshman73@gmail.com').trim().toLowerCase();
    const ownerPassword = process.env.OWNER_PASSWORD || 'Velvetcode@123';

    // 1. Check if user is the master SaaS OWNER
    if (trimmedEmail === ownerEmail) {
      if (password !== ownerPassword) {
        return NextResponse.json(
          { error: 'Invalid owner credentials' },
          { status: 401 }
        );
      }

      const ownerUser = {
        id: 'usr-admin-01',
        name: 'Velvet Code',
        email: 'srilakshman73@gmail.com',
        phone: '+91 94436 47190',
        role: 'OWNER',
        organizationId: 'org-root-00',
        organizationName: 'Velvet Code HQ',
        isSuperAdmin: true,
      };

      const response = NextResponse.json({
        success: true,
        user: ownerUser,
        redirectTo: '/admin/dashboard',
        message: 'Owner authenticated successfully',
      });

      // Set secure HTTP-only session cookie
      response.cookies.set('velvet_auth_role', 'OWNER', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      response.cookies.set('velvet_auth_email', 'srilakshman73@gmail.com', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 2. Check if user is a normal customer/tenant user
    const matchedCustomer = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );

    if (matchedCustomer) {
      // In production, compare with hashed password. For demo, check password length >= 6
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 401 }
        );
      }

      // Ensure customer can NEVER have role OWNER
      const customerRole = matchedCustomer.role === 'OWNER' ? 'ADMIN' : matchedCustomer.role;
      const org = INITIAL_ORGANIZATIONS.find((o) => o.id === matchedCustomer.organizationId) || INITIAL_ORGANIZATIONS[0];

      const customerUser = {
        ...matchedCustomer,
        role: customerRole,
        isSuperAdmin: false,
        organizationName: org.name,
      };

      const response = NextResponse.json({
        success: true,
        user: customerUser,
        redirectTo: '/app/dashboard',
        message: 'Customer authenticated successfully',
      });

      response.cookies.set('velvet_auth_role', customerRole, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('velvet_auth_org', matchedCustomer.organizationId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // Fallback: Dynamic demo customer login for any valid email
    if (trimmedEmail.includes('@') && password.length >= 6) {
      const defaultOrg = INITIAL_ORGANIZATIONS[0];
      const customerUser = {
        id: `usr-cust-${Date.now()}`,
        name: trimmedEmail.split('@')[0],
        email: trimmedEmail,
        role: 'ADMIN',
        organizationId: defaultOrg.id,
        organizationName: defaultOrg.name,
        isSuperAdmin: false,
      };

      const response = NextResponse.json({
        success: true,
        user: customerUser,
        redirectTo: '/app/dashboard',
        message: 'Customer authenticated successfully',
      });

      response.cookies.set('velvet_auth_role', 'ADMIN', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('velvet_auth_org', defaultOrg.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials. Please check your email and password.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication service encountered an internal error' },
      { status: 500 }
    );
  }
}
