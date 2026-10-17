import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { verifyCustomerAccess } from '@/lib/subscription-gate';
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

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to access properties.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
    }

    if (session.isOwner || session.role === 'OWNER') {
      const searchParams = request.nextUrl.searchParams;
      const orgFilter = searchParams.get('organization_id');
      const properties = await serverDB.getProperties(orgFilter || undefined);
      return NextResponse.json({
        success: true,
        count: properties.length,
        data: properties,
      });
    }

    const customerProps = await serverDB.getProperties(session.organizationId);

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

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to add properties.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.priceINR) {
      return NextResponse.json(
        { error: 'Missing required property fields: title, priceINR' },
        { status: 400 }
      );
    }

    const effectiveOrgId = (session.isOwner && body.organizationId)
      ? body.organizationId
      : session.organizationId;

    if (!session.isOwner) {
      const planLimits = serverDB.getOrgPlanLimits(effectiveOrgId);
      const currentProperties = await serverDB.getProperties(effectiveOrgId);
      if (planLimits.maxProperties !== -1 && currentProperties.length >= planLimits.maxProperties) {
        return NextResponse.json(
          {
            error: `Property inventory limit reached for your ${planLimits.name} plan (${planLimits.maxProperties} properties). Please upgrade to Professional or Business for unlimited property listings.`,
            code: 'PLAN_LIMIT_EXCEEDED',
            currentCount: currentProperties.length,
            limit: planLimits.maxProperties,
          },
          { status: 403 }
        );
      }
    }

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
      featuredImageUrl: body.featuredImageUrl || (Array.isArray(body.images) && body.images.length > 0 ? body.images[0] : undefined),
      amenities: body.amenities || ['Power Backup', 'Security', 'Lift'],
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : (body.featuredImageUrl ? [body.featuredImageUrl] : []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await serverDB.addProperty(newProperty);

    return NextResponse.json(
      {
        success: true,
        message: 'Property created successfully and persisted to database',
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
