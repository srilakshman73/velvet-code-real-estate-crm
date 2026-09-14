import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { Property } from '@/types';

// GET /api/properties
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const allProps = serverDB.getProperties();

    // Master Owner can view all platform properties or filter by query param
    if (session.isOwner || session.role === 'OWNER') {
      const searchParams = request.nextUrl.searchParams;
      const orgFilter = searchParams.get('organization_id');
      const filtered = orgFilter
        ? allProps.filter((p) => p.organizationId === orgFilter)
        : allProps;
      return NextResponse.json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }

    // Customer: Strictly filter by authenticated session's organizationId
    const customerProps = allProps.filter(
      (p) => p.organizationId === session.organizationId
    );

    return NextResponse.json({
      success: true,
      count: customerProps.length,
      data: customerProps,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.priceINR) {
      return NextResponse.json(
        { error: 'Missing required property fields: title, priceINR' },
        { status: 400 }
      );
    }

    // CRITICAL MULTI-TENANT SECURITY:
    // For customers, ALWAYS derive organizationId from the authenticated session.
    // NEVER trust body.organization_id sent from the client.
    const effectiveOrgId = (session.isOwner && body.organizationId)
      ? body.organizationId
      : session.organizationId;

    const newProperty: Property = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: effectiveOrgId,
      title: body.title,
      propertyType: body.propertyType || 'APARTMENT',
      status: body.status || 'AVAILABLE',
      priceINR: Number(body.priceINR),
      areaSqFt: Number(body.areaSqFt || 1200),
      bedrooms: body.bedrooms ? Number(body.bedrooms) : 2,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : 2,
      furnishing: body.furnishing || 'Semi-Furnished',
      facing: body.facing || 'East',
      address: body.address || 'Chennai Central',
      locality: body.locality || 'Anna Nagar',
      city: body.city || 'Chennai',
      state: body.state || 'Tamil Nadu',
      pincode: body.pincode || '600040',
      featuredImageUrl: body.featuredImageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
      amenities: body.amenities || ['Power Backup', 'Security', 'Lift'],
      images: body.images || ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    serverDB.addProperty(newProperty);

    return NextResponse.json(
      {
        success: true,
        message: 'Property created successfully',
        data: newProperty,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
