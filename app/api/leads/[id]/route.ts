import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const VALID_STATUSES = new Set(['new', 'contacted', 'trial', 'converted', 'lost']);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const { status } = await req.json();

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 422 });
  }

  const { data, error } = await supabaseAdmin
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 });

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const { error } = await supabaseAdmin.from('leads').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
