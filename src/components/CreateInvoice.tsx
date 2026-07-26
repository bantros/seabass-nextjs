'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import clsx from 'clsx';

import InvoicePreview from '@/components/InvoicePreview';
import InvoiceForm from '@/components/InvoiceForm';
import { useWindowSize } from '@/hooks/useWindowSize';

const formSchema = z.object({
  fromName: z.string().min(1, 'This field is required.'),
  fromEmail: z.email({ message: 'Enter a valid email.' }),
  fromAddress: z.string(),
  fromCity: z.string(),
  fromPostcode: z.string(),
  fromCountry: z.string(),
  fromPhone: z.string(),
  toName: z.string().min(1, 'This field is required.'),
  toEmail: z.email({ message: 'Enter a valid email.' }),
  toAddress: z.string(),
  toCity: z.string(),
  toPostcode: z.string(),
  toCountry: z.string(),
  toPhone: z.string(),
  logo: z.string(),
  invoiceNo: z.string(),
  issueDate: z.iso.date(),
  dueDate: z.iso.date(),
  items: z
    .array(
      z.object({
        qty: z.number(),
        description: z.string(),
        amount: z.string()
      })
    )
    .min(1, 'Add at least 1 item.'),
  tax: z.string(),
  notes: z.string()
});

const date = new Date();
const toDate = new Date(date);
toDate.setDate(toDate.getDate() + 7);

const defaultFromDate = date.toISOString().split('T')[0];
const defaultToDate = toDate.toISOString().split('T')[0];

const defaultValues = {
  fromName: '',
  fromEmail: '',
  fromAddress: '',
  fromCity: '',
  fromPostcode: '',
  fromCountry: '',
  fromPhone: '',
  toName: '',
  toEmail: '',
  toAddress: '',
  toCity: '',
  toPostcode: '',
  toCountry: '',
  toPhone: '',
  logo: '',
  invoiceNo: '#100',
  issueDate: defaultFromDate,
  dueDate: defaultToDate,
  items: [{ qty: 1, description: 'Item', amount: '1000' }],
  tax: '',
  notes: ''
};

export default function CreateInvoice() {
  const router = useRouter();
  const [bleed, setBleed] = useState<boolean>(false);
  const [scale, setScale] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  const { width, height } = useWindowSize();

  useEffect(() => {
    setScale(() => calculateTemplateScale());
  }, [bleed, width, height]);

  function calculateTemplateScale() {
    const preview = document.getElementById('preview');
    if (!preview) return 1;
    return preview.offsetWidth / 850;
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/share-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error ?? 'Failed to share invoice.');
      }

      const { id } = await response.json();
      const shareUrl = `${window.location.origin}/invoice/${id}`;
      router.push(shareUrl);
    } catch (err) {
      console.error('[onShare]', err);
    }
  }

  return (
    <div className='grid'>
      <div
        className={clsx(
          'grid gap-1 min-h-dvh',
          bleed ? 'grid-cols-1' : 'md:grid-cols-2 p-1'
        )}
      >
        <main
          className={clsx(
            'sticky top-0 flex flex-col justify-center bg-theme-primary',
            bleed
              ? 'h-full cursor-zoom-out'
              : 'h-[calc(100dvh-8px)] p-4 lg:p-6 rounded-sm cursor-zoom-in'
          )}
          onClick={() => setBleed(!bleed)}
        >
          <div className={clsx('template-edit', bleed && 'bleed')}>
            <div className='template-container'>
              <div className='template-view'>
                <div
                  className={clsx(
                    !bleed && 'flex flex-col justify-center size-full'
                  )}
                >
                  <div id='preview' className='template-preview'>
                    <div
                      className={clsx(
                        'render transition-transformmm',
                        !bleed && 'shadow',
                        !scale && 'hidden'
                      )}
                      style={{ transform: `scale(${scale})` }}
                    >
                      <InvoicePreview
                        currency='GBP'
                        defaultValues={defaultValues}
                        subscribe={form.subscribe}
                        theme='theme-1'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <aside
          className={clsx(bleed && 'hidden', 'relative p-5 lg:p-10 rounded-sm')}
        >
          <InvoiceForm form={form} onSubmit={onSubmit} />
        </aside>
      </div>
    </div>
  );
}
