'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { getInvoiceTotals } from '@/utils/getInvoiceTotals';
import { parseDate } from '@/utils/parseDate';
import { parseNumericValue } from '@/utils/parseNumericValue';

interface InvoicePreviewProps {
  currency: 'GBP' | 'USD';
  defaultValues: InvoiceFormValues;
  subscribe: any;
  theme: any;
}

export default function InvoicePreview(props: InvoicePreviewProps) {
  const [values, setValues] = useState<InvoiceFormValues | null>(
    props.defaultValues
  );

  useEffect(() => {
    const callback = props.subscribe({
      formState: {
        values: true,
        defaultValues: true
      },
      callback: ({ values }: { values: InvoiceFormValues }) => setValues(values)
    });
    return () => callback();
  }, [props.subscribe]);

  const { subtotal, tax, total } = getInvoiceTotals(values);

  return (
    <div id={props.theme} className='template bg-theme-tertiary/25'>
      <div className='area-logo'>
        {values?.logo && (
          <div className='logo max-w-1/2'>
            <img src={values.logo} alt='Logo' />
          </div>
        )}
      </div>

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
                      <div>
                        {formatCurrency(amount, props.currency, 'decimal')}
                      </div>
                      <div>
                        {formatCurrency(price, props.currency, 'decimal')}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className='area-totals'>
          <div className='template-totals-line'>
            <div>Subtotal</div>
            <div>{formatCurrency(subtotal, props.currency, 'decimal')}</div>
          </div>
          <div className='template-totals-line'>
            <div>Tax</div>
            <div>{tax.toFixed(2)}</div>
          </div>
          <div className='template-totals-line'>
            <div>Total</div>
            <div>{formatCurrency(total, props.currency, 'currency')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
