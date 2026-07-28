import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const logo = formData.get('logo');
  const supabase = createClient();

  if (!logo || !(logo instanceof File)) {
    return NextResponse.json(
      { error: 'Logo is not a valid image.' },
      { status: 415 }
    );
  }

  const ext = logo.name.split('.').pop();
  const path = `/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('logos').upload(path, logo);

  if (error) {
    console.error('[POST /api/upload-logo]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      logoUrl: supabase.storage.from('logos').getPublicUrl(path).data.publicUrl
    },
    { status: 201 }
  );
}
