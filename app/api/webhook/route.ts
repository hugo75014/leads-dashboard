import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const VALID_SOURCES = new Set(['instagram', 'facebook', 'tiktok', 'linkedin', 'manychat', 'zapier', 'direct']);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const source = VALID_SOURCES.has(body.source?.toLowerCase())
    ? body.source.toLowerCase()
    : 'direct';

  const email = body.email?.trim() || null;
  const phone = body.phone?.trim() || null;

  // Soft deduplication
  if (email || phone) {
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id')
      .neq('status', 'lost')
      .or(
        [email ? `email.eq.${email}` : null, phone ? `phone.eq.${phone}` : null]
          .filter(Boolean)
          .join(',')
      )
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ id: existing.id, deduplicated: true }, { status: 200 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert({
      source,
      platform_username: body.platform_username?.trim() || null,
      full_name: body.full_name?.trim() || null,
      phone,
      email,
      notes: body.notes?.trim() || null,
      status: 'new',
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, deduplicated: false }, { status: 201 });
}
