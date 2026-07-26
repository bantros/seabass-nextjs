import { notFound } from 'next/navigation';
import { createServiceClient } from '@/utils/supabase/server';
import InvoiceTemplate from '@/components/InvoiceTemplate';
import InvoiceActions from '@/components/InvoiceActions';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata() {
  return {
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const { data: row, error } = await createServiceClient()
    .from('invoices')
    .select('data')
    .eq('id', id)
    .single();

  if (error || !row) notFound();

  return (
    <div className='flex flex-col items-center justify-center min-h-dvh p-5 lg:p-10 bg-theme-primary'>
      <div className='w-full max-w-212.5'>
        <InvoiceTemplate currency='GBP' theme='theme-1' values={row.data} />
      </div>
      <InvoiceActions data={row.data} />
    </div>
  );
}
