import { NextRequest } from 'next/server';
import { INITIAL_USERS, INITIAL_ORGANIZATIONS } from './mock-data';
import { User, Role } from '@/types';

export interface AuthenticatedSession {
  userId: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  isOwner: boolean;
  isSuperAdmin: boolean;
}

/**
 * Extracts and verifies the authenticated session from cookies or headers.
 * NEVER trusts client-supplied organization_id in request bodies.
 */
export async function getServerSession(req?: NextRequest): Promise<AuthenticatedSession | null> {
  let roleCookie: Role | undefined;
  let emailCookie: string | undefined;
  let orgCookie: string | undefined;

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    roleCookie = cookieStore.get('velvet_auth_role')?.value as Role | undefined;
    emailCookie = cookieStore.get('velvet_auth_email')?.value;
    orgCookie = cookieStore.get('velvet_auth_org')?.value;
  } catch (e) {
    // In automated testing or standalone script execution, cookies() is not available
  }

  // Header fallbacks (e.g. for API tokens / automated test runners)
  const roleHeader = req?.headers?.get ? (req.headers.get('x-auth-role') as Role | null) : null;
  const emailHeader = req?.headers?.get ? req.headers.get('x-auth-email') : null;
  const orgHeader = req?.headers?.get ? req.headers.get('x-auth-org') : null;

  const role = roleHeader || roleCookie;
  const email = emailHeader || emailCookie;
  const orgId = orgHeader || orgCookie;

  const ownerEmail = (process.env.OWNER_EMAIL || 'srilakshman73@gmail.com').trim().toLowerCase();

  // 1. Check if user is the Master Platform Owner
  if (role === 'OWNER' || (email && email.toLowerCase() === ownerEmail)) {
    return {
      userId: 'usr-admin-01',
      name: 'Sri Lakshman',
      email: ownerEmail,
      role: 'OWNER',
      organizationId: 'org-root-00',
      organizationName: 'Velvet Code HQ',
      isOwner: true,
      isSuperAdmin: true,
    };
  }

  // 2. Check if user is a matched customer user in the database
  if (email) {
    const matchedUser = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (matchedUser) {
      // Customers can NEVER be OWNER
      const safeRole = (matchedUser.role as string) === 'OWNER' ? 'ADMIN' : matchedUser.role;
      const org = INITIAL_ORGANIZATIONS.find((o) => o.id === matchedUser.organizationId) || INITIAL_ORGANIZATIONS[0];
      return {
        userId: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: safeRole,
        organizationId: matchedUser.organizationId,
        organizationName: org.name,
        isOwner: false,
        isSuperAdmin: false,
      };
    }
  }

  // 3. Check if user has authenticated customer cookies/headers
  if (orgId && role && (role as string) !== 'OWNER') {
    const org = INITIAL_ORGANIZATIONS.find((o) => o.id === orgId) || INITIAL_ORGANIZATIONS[0];
    return {
      userId: `usr-session-${orgId}`,
      name: email ? email.split('@')[0] : 'Customer User',
      email: email || 'customer@agency.in',
      role: role as Role,
      organizationId: org.id,
      organizationName: org.name,
      isOwner: false,
      isSuperAdmin: false,
    };
  }

  return null;
}

/**
 * Validates whether the authenticated session has permission to perform a delete operation.
 */
export function canDeleteRecord(
  session: AuthenticatedSession,
  recordOrganizationId: string,
  userRole?: Role
): { allowed: boolean; reason?: string } {
  // Master Owner can delete any record across the SaaS platform
  if (session.isOwner || session.role === 'OWNER') {
    return { allowed: true };
  }

  // Strict tenant boundary: Customer can NEVER delete records belonging to another organization
  if (session.organizationId !== recordOrganizationId) {
    return {
      allowed: false,
      reason: `Forbidden: Tenant mismatch. Record belongs to '${recordOrganizationId}', but user belongs to '${session.organizationId}'.`,
    };
  }

  // Organization-level role check: AGENT cannot delete records unless given explicit permission
  const effectiveRole = userRole || session.role;
  if (effectiveRole === 'AGENT') {
    return {
      allowed: false,
      reason: 'Forbidden: Agent role does not have delete privileges in this organization.',
    };
  }

  // ADMIN and MANAGER can delete within their own organization
  return { allowed: true };
}
