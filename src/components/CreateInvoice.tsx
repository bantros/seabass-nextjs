'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import clsx from 'clsx';

import InvoicePreview from '@/components/InvoicePreview';
import InvoiceForm from '@/components/InvoiceForm';
import { formSchema } from '@/lib/schema';
import { getInvoiceColorHex } from '@/utils/getInvoiceColorHex';

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
  logo: z.union([
    z
      .file()
      .min(1)
      .max(1024 * 1024, { message: 'Image must be 1MB or less.' })
      .mime(['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml']),
    z.string()
  ]),
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
  const searchParams = useSearchParams();
  const [bleed, setBleed] = useState<boolean>(false);
  const [currency, setCurrency] = useState<InvoiceCurrency>('GBP');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const formData = new FormData();
    const payload = {
      ...data,
      color: searchParams.get('color') || 'white',
      currency
    };

    if (data.logo instanceof File) {
      formData.append('logo', data.logo, data.logo.name);

      try {
        const response = await fetch('/api/upload-logo', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error ?? 'Failed to upload image.');
        }

        const { logoUrl } = await response.json();
        payload.logo = logoUrl;
      } catch (err) {
        console.error('[onSubmit]', err);
      }
    }

    try {
      const response = await fetch('/api/share-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error ?? 'Failed to share invoice.');
      }

      const { id } = await response.json();
      const shareUrl = `${window.location.origin}/invoice/${id}`;
      router.push(shareUrl);
    } catch (err) {
      console.error('[onSubmit]', err);
    }
  }

  return (
    <div className='grid'>
      <div
        className={clsx(
          'grid gap-1 min-h-dvh bg-foreground',
          bleed ? 'grid-cols-1' : 'md:grid-cols-2 p-1'
        )}
      >
        <main
          className={clsx(
            'sticky top-0 flex flex-col justify-center',
            bleed
              ? 'h-full cursor-zoom-out'
              : 'h-[calc(100dvh-8px)] cursor-zoom-in'
          )}
          onClick={() => setBleed(!bleed)}
        >
          <div
            className={clsx(
              'template-edit transition-colors',
              bleed ? 'bleed' : 'p-4 lg:p-6 rounded-sm'
            )}
            style={{
              backgroundColor: `color-mix(in oklab, ${getInvoiceColorHex(searchParams.get('color') as InvoiceColorType)}, white 50%)`
            }}
          >
            <div className='template-container'>
              <div className='template-view'>
                <div
                  className={clsx(
                    !bleed && 'flex flex-col justify-center size-full'
                  )}
                >
                  <InvoicePreview
                    bleed={bleed}
                    color={searchParams.get('color') as InvoiceColorType}
                    currency={currency}
                    defaultValues={defaultValues}
                    subscribe={form.subscribe}
                    theme='theme-1'
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        <aside
          className={clsx(
            bleed && 'hidden',
            'relative p-10 xl:py-15 xl:px-20 bg-muted rounded-sm'
          )}
        >
          <InvoiceForm
            currency={currency}
            setCurrency={setCurrency}
            form={form}
            onSubmit={onSubmit}
          />
        </aside>
      </div>
    </div>
  );
}
