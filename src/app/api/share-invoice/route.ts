import { type NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  const data: InvoiceFormValues = await request.json();
  const supabase = createServiceClient();

  const { data: row, error } = await supabase
    .from('invoices')
    .insert({ data })
    .select('id')
    .single();

  if (error) {
    console.error('[POST /api/share-invoice]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: row.id }, { status: 201 });
}
