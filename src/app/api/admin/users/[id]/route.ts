import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// DELETE /api/admin/users/[id] (Master Platform Owner ONLY)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // STRICT OWNER CHECK
    if (!session.isOwner && session.role !== 'OWNER') {
      return NextResponse.json(
        {
          error: 'Forbidden: Only the Velvet Code Platform Owner can delete user accounts.',
          code: 'OWNER_PRIVILEGE_REQUIRED',
        },
        { status: 403 }
      );
    }

    const allUsers = serverDB.getUsers();
    const targetUser = allUsers.find((u) => u.id === id);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent Owner from deleting self
    if (targetUser.role === 'OWNER' || targetUser.email.toLowerCase() === 'srilakshman73@gmail.com') {
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete master platform owner account.' },
        { status: 400 }
      );
    }

    const deleted = serverDB.deleteUser(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User '${targetUser.name}' (${targetUser.email}) successfully removed from platform.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
