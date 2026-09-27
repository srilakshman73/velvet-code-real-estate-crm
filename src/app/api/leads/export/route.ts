import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function GET(request: NextRequest) {
  return handleExport(request);
}

export async function POST(request: NextRequest) {
  return handleExport(request);
}

async function handleExport(request: NextRequest) {
  let tempJsonPath: string | null = null;
  let tempXlsxPath: string | null = null;

  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to export leads' },
        { status: 401 }
      );
    }

    // Determine target organization
    const effectiveOrgId = session.organizationId;
    const orgRecord = serverDB.getOrganizations().find((o) => o.id === effectiveOrgId) || {
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
    const allOrgLeads = serverDB.getLeads().filter((l) => l.organizationId === effectiveOrgId);

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

    // Write temp payload file
    const randomSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const tempDir = os.tmpdir();
    tempJsonPath = path.join(tempDir, `leads_payload_${randomSuffix}.json`);
    tempXlsxPath = path.join(tempDir, `leads_export_${randomSuffix}.xlsx`);

    fs.writeFileSync(tempJsonPath, JSON.stringify(exportPayload, null, 2), 'utf8');

    // Execute Python openpyxl generator script
    const pythonScriptPath = path.resolve(process.cwd(), 'scripts', 'generate_leads_excel.py');

    await new Promise<void>((resolve, reject) => {
      const pythonProcess = spawn('python', [pythonScriptPath, tempJsonPath!, tempXlsxPath!]);

      let stderrOutput = '';
      pythonProcess.stderr.on('data', (data) => {
        stderrOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0 && fs.existsSync(tempXlsxPath!)) {
          resolve();
        } else {
          reject(new Error(`Python openpyxl generation failed with code ${code}: ${stderrOutput}`));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(err);
      });
    });

    // Read the generated binary Excel workbook
    const xlsxBuffer = fs.readFileSync(tempXlsxPath);

    // Safe filename
    const safeOrgName = (orgRecord.name || 'VelvetCode')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const dateStamp = now.toISOString().split('T')[0];
    const filename = `Velvet_Code_Leads_${safeOrgName}_${dateStamp}.xlsx`;

    return new NextResponse(xlsxBuffer, {
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
  } finally {
    // Cleanup temporary files
    try {
      if (tempJsonPath && fs.existsSync(tempJsonPath)) {
        fs.unlinkSync(tempJsonPath);
      }
      if (tempXlsxPath && fs.existsSync(tempXlsxPath)) {
        fs.unlinkSync(tempXlsxPath);
      }
    } catch {
      // ignore cleanup errors
    }
  }
}
