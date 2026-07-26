'use client';

import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceActionsProps {
  data: InvoiceFormValues;
}

export default function InvoiceActions({ data }: InvoiceActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${data.invoiceNo}-${data.toName}-${data.issueDate}.pdf`;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='fixed bottom-0 right-0 flex justify-end w-full p-5 lg:p-10'>
      <Button
        className='rounded-full'
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? (
          <>
            Generating
            <LoaderCircle data-icon='inline-end' className='animate-spin' />
          </>
        ) : (
          <>
            Download PDF
            <Download data-icon='inline-end' />
          </>
        )}
      </Button>
    </div>
  );
}
