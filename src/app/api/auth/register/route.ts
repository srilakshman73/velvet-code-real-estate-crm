import { NextResponse } from 'next/server';

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

    const trimmedEmail = email.trim().toLowerCase();

    // Security rule: Customers cannot register using the owner email or claim role OWNER
    const ownerEmail = (process.env.OWNER_EMAIL || 'srilakshman73@gmail.com').trim().toLowerCase();
    if (trimmedEmail === ownerEmail) {
      return NextResponse.json(
        { error: 'This email is reserved for system administration. Please sign in directly.' },
        { status: 400 }
      );
    }

    const newOrgId = `org-${Date.now().toString(36)}`;
    const newUserId = `usr-${Date.now().toString(36)}`;

    // Create isolated customer organization
    const newOrg = {
      id: newOrgId,
      name: agencyName,
      slug: agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      businessType: 'AGENCY',
      phone: phone || '+91 94436 47190',
      email: trimmedEmail,
      city: city || 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      createdAt: new Date().toISOString(),
    };

    // Create customer admin user (cannot be OWNER)
    const newUser = {
      id: newUserId,
      name: fullName,
      email: trimmedEmail,
      phone: phone || '+91 94436 47190',
      role: 'ADMIN',
      organizationId: newOrgId,
      organizationName: agencyName,
      isSuperAdmin: false,
    };

    const response = NextResponse.json({
      success: true,
      user: newUser,
      organization: newOrg,
      redirectTo: '/app/dashboard',
      message: 'Account and organization registered successfully',
    });

    response.cookies.set('velvet_auth_role', 'ADMIN', {
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
    return NextResponse.json(
      { error: 'Failed to complete registration' },
      { status: 500 }
    );
  }
}
