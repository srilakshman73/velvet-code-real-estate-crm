import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { serverDB } from '@/lib/server-db';

// In-memory / ephemeral store for password reset tokens
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await serverDB.getUserByEmail(cleanEmail);

    if (!user) {
      // Return safe message even if not found to prevent user enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email address, a password recovery link has been generated.',
      });
    }

    // Generate cryptographically secure random token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000;

    getResetTokenStore().set(token, { email: cleanEmail, expiresAt });

    const resetUrl = `/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: 'Password recovery instructions dispatched successfully.',
      resetUrl,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password recovery request' },
      { status: 500 }
    );
  }
}
