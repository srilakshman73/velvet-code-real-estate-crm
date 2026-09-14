import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, canDeleteRecord } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/properties/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const allProps = serverDB.getProperties();
    const property = allProps.find((p) => p.id === id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Tenant isolation check
    if (!session.isOwner && session.role !== 'OWNER' && property.organizationId !== session.organizationId) {
      return NextResponse.json(
        {
          error: 'Forbidden: You do not have access to properties belonging to another organization',
          code: 'TENANT_MISMATCH',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]
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

    const allProps = serverDB.getProperties();
    const property = allProps.find((p) => p.id === id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Security check: Delete permissions & Tenant boundary validation
    const authCheck = canDeleteRecord(session, property.organizationId);
    if (!authCheck.allowed) {
      return NextResponse.json(
        {
          error: authCheck.reason || 'Forbidden: You do not have permission to delete this record.',
          code: 'FORBIDDEN_DELETE',
        },
        { status: 403 }
      );
    }

    // Execute deletion
    const deleted = serverDB.deleteProperty(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete property record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Property '${property.title}' (${property.id}) successfully deleted.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
