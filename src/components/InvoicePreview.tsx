'use client';

import { useEffect, useState } from 'react';
import * as z from 'zod';

interface InvoicePreviewProps {
  currency: 'GBP' | 'USD';
  subscribe: any;
  theme: any;
}

export default function InvoicePreview(props: InvoicePreviewProps) {
  const [values, setValues] = useState<InvoiceFormValues | null>(null);

  useEffect(() => {
    const callback = props.subscribe({
      formState: {
        values: true
      },
      callback: ({ values }: { values: InvoiceFormValues }) => setValues(values)
    });
    return () => callback();
  }, [props.subscribe]);

  const parseDate = (date: string) => {
    if (!z.date().safeParse(date)) return;
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const parseNumericValue = (value: string | number | undefined | null) => {
    const numeric =
      typeof value === 'number'
        ? value
        : Number.parseFloat(String(value ?? ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const formatCurrency = (amount: number, style: 'currency' | 'decimal') => {
    const formattedAmount = new Intl.NumberFormat('en-GB', {
      style: style,
      currency: props.currency,
      minimumFractionDigits: 2
    }).format(amount);
    return formattedAmount;
  };

  const getInvoiceTotals = (data: InvoiceFormValues | null) => {
    const subtotal = (data?.items ?? []).reduce((sum, item) => {
      const amount = parseNumericValue(item?.amount);
      const qty = parseNumericValue(item?.qty);
      return sum + amount * qty;
    }, 0);

    const taxRate = parseNumericValue(data?.tax) / 100;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total
    };
  };

  const { subtotal, tax, total } = getInvoiceTotals(values);

  return (
    <div id={props.theme} className='template bg-theme-tertiary/25'>
      <div className='area-from'>
        {values?.fromName && <div>{values.fromName}</div>}
        {values?.fromEmail && <div>{values.fromEmail}</div>}
        {values?.fromAddress && <div>{values.fromAddress}</div>}
        {values?.fromCity && <div>{values.fromCity}</div>}
        {values?.fromPostcode && <div>{values.fromPostcode}</div>}
        {values?.fromCountry && <div>{values.fromCountry}</div>}
        {values?.fromPhone && <div>{values.fromPhone}</div>}
      </div>

      <div className='area-to'>
        {values?.toName && <div>{values.toName}</div>}
        {values?.toEmail && <div>{values.toEmail}</div>}
        {values?.toAddress && <div>{values.toAddress}</div>}
        {values?.toPhone && <div>{values.toPhone}</div>}
      </div>

      <div className='area-notes'>{values?.notes}</div>

      <div className='area-info'>
        <div>Invoice {values?.invoiceNo && values?.invoiceNo}</div>
        {values?.issueDate && <div>Issued {parseDate(values.issueDate)}</div>}
        {values?.dueDate && <div>Due {parseDate(values.dueDate)}</div>}
      </div>

      <div className='area-footer'>
        <div className='area-items'>
          <div className='template-items'>
            <div className='template-items-row template-items-header'>
              <div className='template-items-item'>Item</div>
              <div className='template-items-price'>
                <div>Qty</div>
                <div>Rate</div>
                <div>Price</div>
              </div>
            </div>
            {values?.items &&
              values.items.map((item, index) => {
                const amount = parseNumericValue(item?.amount);
                const qty = parseNumericValue(item?.qty) || 0;
                const price = amount * qty;
                return (
                  <div key={index} className='template-items-row'>
                    <div className='template-items-item'>
                      {item?.description
                        ? item.description
                        : 'Item description'}
                    </div>
                    <div className='template-items-price'>
                      <div>{qty}</div>
                      <div>{formatCurrency(amount, 'decimal')}</div>
                      <div>{formatCurrency(price, 'decimal')}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className='area-totals'>
          <div className='template-totals-line'>
            <div>Subtotal</div>
            <div>{formatCurrency(subtotal, 'decimal')}</div>
          </div>
          <div className='template-totals-line'>
            <div>Tax</div>
            <div>{tax.toFixed(2)}</div>
          </div>
          <div className='template-totals-line'>
            <div>Total</div>
            <div>{formatCurrency(total, 'currency')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
