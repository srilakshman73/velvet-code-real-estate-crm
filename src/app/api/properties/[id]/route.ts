import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, canDeleteRecord } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { cloudStorage } from '@/lib/storage-server';

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

    const allProps = await serverDB.getProperties(session.isOwner ? undefined : session.organizationId);
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

    const allProps = await serverDB.getProperties(session.isOwner ? undefined : session.organizationId);
    const property = allProps.find((p) => p.id === id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

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

    // Safely delete associated cloud storage assets for this property
    try {
      const assets = await serverDB.getStorageAssets(property.organizationId);
      const propAssets = assets.filter((a) => a.entityId === id || (property.featuredImageUrl && a.storageUrl === property.featuredImageUrl));
      for (const asset of propAssets) {
        await cloudStorage.deleteFile(asset.id, property.organizationId);
      }
    } catch (assetErr) {
      console.warn('Non-fatal cleanup of property assets:', assetErr);
    }

    const deleted = await serverDB.deleteProperty(id, session.isOwner ? undefined : session.organizationId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete property record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Property '${property.title}' successfully deleted.`,
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

    const allProps = await serverDB.getProperties(session.isOwner ? undefined : session.organizationId);
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
      title: body.title !== undefined ? body.title : property.title,
      priceINR: body.priceINR !== undefined ? Number(body.priceINR) : property.priceINR,
      status: body.status !== undefined ? body.status : property.status,
      propertyType: body.propertyType !== undefined ? body.propertyType : property.propertyType,
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
      featuredImageUrl: body.featuredImageUrl !== undefined ? body.featuredImageUrl : property.featuredImageUrl,
      images: Array.isArray(body.images) ? body.images : property.images,
      amenities: Array.isArray(body.amenities) ? body.amenities : property.amenities,
      updatedAt: new Date().toISOString(),
    };

    const saved = await serverDB.updateProperty(id, updatedProp, session.isOwner ? undefined : session.organizationId);

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully in database',
      data: saved || updatedProp,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}
