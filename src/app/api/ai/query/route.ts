import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.organizationId;
    const planLimits = serverDB.getOrgPlanLimits(orgId);
    const currentAIUsed = serverDB.getAIUsageCount(orgId);

    // Enforce server-side AI quota
    if (planLimits.monthlyAIQuota !== -1 && currentAIUsed >= planLimits.monthlyAIQuota) {
      return NextResponse.json(
        {
          error: `Monthly AI query quota (${planLimits.monthlyAIQuota}) reached for your ${planLimits.name} plan. Upgrade your plan to increase your AI query allowance.`,
          code: 'AI_QUOTA_EXCEEDED',
          used: currentAIUsed,
          limit: planLimits.monthlyAIQuota,
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const tokens = body.tokens || 50;
    const newCount = serverDB.recordAIUsage(orgId, tokens);

    return NextResponse.json({
      success: true,
      used: newCount,
      limit: planLimits.monthlyAIQuota,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
