import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: 'Unauthorized: No active session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
