import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.organizationId;
    const planLimits = serverDB.getOrgPlanLimits(orgId);
    const storageUsage = await serverDB.getStorageUsage(orgId);

    const leadsCount = (await serverDB.getLeads(orgId)).length;
    const propertiesCount = (await serverDB.getProperties(orgId)).length;
    const usersCount = (await serverDB.getUsers(orgId)).length;
    const aiUsed = serverDB.getAIUsageCount(orgId);

    return NextResponse.json({
      success: true,
      data: {
        plan: {
          tier: planLimits.tier,
          name: planLimits.name,
        },
        storage: {
          usedBytes: storageUsage.usedBytes,
          limitBytes: storageUsage.limitBytes,
          availableBytes: storageUsage.availableBytes,
          usagePercent: storageUsage.usagePercent,
          fileCount: storageUsage.fileCount,
        },
        leads: {
          count: leadsCount,
          limit: planLimits.maxLeads,
          isUnlimited: planLimits.maxLeads === -1,
        },
        properties: {
          count: propertiesCount,
          limit: planLimits.maxProperties,
          isUnlimited: planLimits.maxProperties === -1,
        },
        users: {
          count: usersCount,
          limit: planLimits.maxUsers,
        },
        aiQueries: {
          used: aiUsed,
          limit: planLimits.monthlyAIQuota,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
