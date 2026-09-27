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

// PUT /api/properties/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
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

    if (!session.isOwner && session.role !== 'OWNER' && property.organizationId !== session.organizationId) {
      return NextResponse.json(
        {
          error: 'Forbidden: You do not have access to properties belonging to another organization',
          code: 'TENANT_MISMATCH',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updatedProp = {
      ...property,
      title: body.title !== undefined ? String(body.title).trim() : property.title,
      description: body.description !== undefined ? body.description : property.description,
      propertyType: body.propertyType || property.propertyType,
      status: body.status || property.status,
      priceINR: body.priceINR !== undefined ? Number(body.priceINR) : property.priceINR,
      areaSqFt: body.areaSqFt !== undefined ? Number(body.areaSqFt) : property.areaSqFt,
      bedrooms: body.bedrooms !== undefined ? Number(body.bedrooms) : property.bedrooms,
      bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : property.bathrooms,
      furnishing: body.furnishing !== undefined ? body.furnishing : property.furnishing,
      facing: body.facing !== undefined ? body.facing : property.facing,
      address: body.address !== undefined ? body.address : property.address,
      locality: body.locality !== undefined ? body.locality : property.locality,
      city: body.city !== undefined ? body.city : property.city,
      state: body.state !== undefined ? body.state : property.state,
      pincode: body.pincode !== undefined ? body.pincode : property.pincode,
      ownerName: body.ownerName !== undefined ? body.ownerName : property.ownerName,
      ownerPhone: body.ownerPhone !== undefined ? body.ownerPhone : property.ownerPhone,
      amenities: body.amenities !== undefined ? body.amenities : property.amenities,
      featuredImageUrl: body.featuredImageUrl !== undefined ? body.featuredImageUrl : property.featuredImageUrl,
      images: Array.isArray(body.images) ? body.images : property.images,
      assignedAgentId: body.assignedAgentId !== undefined ? body.assignedAgentId : property.assignedAgentId,
      assignedAgentName: body.assignedAgentName !== undefined ? body.assignedAgentName : property.assignedAgentName,
      updatedAt: new Date().toISOString(),
    };

    const index = allProps.findIndex((p) => p.id === id);
    if (index >= 0) {
      allProps[index] = updatedProp;
    }

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProp,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}
