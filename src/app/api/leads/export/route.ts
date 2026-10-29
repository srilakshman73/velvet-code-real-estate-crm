import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { generateLeadsWorkbookBuffer } from '@/lib/excel-service';

export async function GET(request: NextRequest) {
  return handleExport(request);
}

export async function POST(request: NextRequest) {
  return handleExport(request);
}

async function handleExport(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to export leads' },
        { status: 401 }
      );
    }

    // Determine target organization strictly from authenticated session
    const effectiveOrgId = session.organizationId;
    const orgRecord = (await serverDB.getOrganizations()).find((o) => o.id === effectiveOrgId) || {
      name: session.organizationName || 'Velvet Code Real Estate CRM',
    };

    // Parse requested lead IDs if any
    let requestedIds: string[] | null = null;

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        if (Array.isArray(body.leadIds) && body.leadIds.length > 0) {
          requestedIds = body.leadIds.map((id: any) => String(id));
        }
      } catch {
        // Body might be empty, proceed with all leads
      }
    } else {
      const searchParams = request.nextUrl.searchParams;
      const idsParam = searchParams.get('ids');
      if (idsParam) {
        requestedIds = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
      }
    }

    // Fetch tenant-isolated leads strictly
    const allOrgLeads = await serverDB.getLeads(effectiveOrgId);

    // Apply ID filtering if specific leads were selected
    const finalLeads = requestedIds
      ? allOrgLeads.filter((l) => requestedIds.includes(l.id))
      : allOrgLeads;

    // Prepare payload
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const exportPayload = {
      organizationName: orgRecord.name,
      organizationId: effectiveOrgId,
      generatedAt: `${dateFormatted} ${timeFormatted}`,
      totalCount: finalLeads.length,
      leads: finalLeads,
    };

    // Generate native Excel workbook buffer in-memory
    const xlsxBuffer = await generateLeadsWorkbookBuffer(exportPayload);

    const filename = `Velvet_Code_Real_Estate_Leads.xlsx`;

    return new NextResponse(new Uint8Array(xlsxBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(xlsxBuffer.length),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Lead Excel Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel export workbook', details: error.message },
      { status: 500 }
    );
  }
}
