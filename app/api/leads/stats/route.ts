import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { count: total } = await supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: thisWeek } = await supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo);

  const { count: converted } = await supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'converted');

  const { count: inProgress } = await supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .in('status', ['contacted', 'trial']);

  const { data: bySourceRaw } = await supabaseAdmin
    .from('leads')
    .select('source');

  const { data: byStatusRaw } = await supabaseAdmin
    .from('leads')
    .select('status');

  const bySource: Record<string, number> = {};
  for (const row of bySourceRaw ?? []) {
    bySource[row.source] = (bySource[row.source] ?? 0) + 1;
  }

  const byStatus: Record<string, number> = {};
  for (const row of byStatusRaw ?? []) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
  }

  const t = total ?? 0;
  const conversionRate = t > 0 ? Math.round(((converted ?? 0) / t) * 1000) / 10 : 0;

  return NextResponse.json({
    total: t,
    this_week: thisWeek ?? 0,
    converted: converted ?? 0,
    in_progress: inProgress ?? 0,
    conversion_rate: conversionRate,
    by_source: bySource,
    by_status: byStatus,
  });
}
