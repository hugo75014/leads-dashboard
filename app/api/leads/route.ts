import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const VALID_SOURCES = new Set(['instagram', 'facebook', 'tiktok', 'linkedin', 'manychat', 'zapier', 'direct']);
const VALID_STATUSES = new Set(['new', 'contacted', 'trial', 'converted', 'lost']);

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') ?? '';
  const status = searchParams.get('status') ?? '';
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') ?? '20')));

  let query = supabaseAdmin.from('leads').select('*', { count: 'exact' });

  if (source && VALID_SOURCES.has(source)) query = query.eq('source', source);
  if (status && VALID_STATUSES.has(status)) query = query.eq('status', status);
  if (search) {
    const like = `%${search}%`;
    query = query.or(
      `full_name.ilike.${like},email.ilike.${like},platform_username.ilike.${like},phone.ilike.${like}`
    );
  }

  const from = (page - 1) * perPage;
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? 0;
  return NextResponse.json({
    items: data ?? [],
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    per_page: perPage,
  });
}
