'use client';

import { useState } from 'react';
import { Check, Copy, Download, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceActionsProps {
  data: InvoiceFormValues;
}

export default function InvoiceActions({ data }: InvoiceActionsProps) {
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleCopyClick() {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  }

  async function handleDownloadClick() {
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
    <div className='fixed bottom-0 right-0 flex justify-between gap-4 w-full p-5 lg:p-10'>
      <Button
        className='rounded-full'
        type='button'
        variant='secondary'
        disabled={linkCopied}
        onClick={handleCopyClick}
      >
        {linkCopied ? (
          <>
            Share link copied!
            <Check data-icon='inline-end' />
          </>
        ) : (
          <>
            Copy share link
            <Copy data-icon='inline-end' />
          </>
        )}
      </Button>

      <Button
        className='rounded-full'
        disabled={loading}
        onClick={handleDownloadClick}
      >
        {loading ? (
          <>
            Generating…
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
