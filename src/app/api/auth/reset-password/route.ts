import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { hashPassword } from '@/lib/auth-server';

declare global {
  var __velvetResetTokens: Map<string, { email: string; expiresAt: number }> | undefined;
}

function getResetTokenStore() {
  if (!global.__velvetResetTokens) {
    global.__velvetResetTokens = new Map();
  }
  return global.__velvetResetTokens;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const tokenStore = getResetTokenStore();
    const tokenData = tokenStore.get(token);

    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: 'Password reset link is invalid or has expired. Please request a new link.' },
        { status: 400 }
      );
    }

    const { email } = tokenData;

    // Securely hash the new password using PBKDF2
    const passwordHash = hashPassword(newPassword);

    // Update in database
    const updated = await serverDB.updateUserPassword(email, passwordHash);

    if (!updated) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    // Invalidate token
    tokenStore.delete(token);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
