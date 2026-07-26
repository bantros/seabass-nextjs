'use client';

import { useEffect, useState } from 'react';
import InvoiceTemplate from '@/components/InvoiceTemplate';

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

  if (!values) return null;

  return (
    <InvoiceTemplate
      currency={props.currency}
      values={values}
      theme={props.theme}
    />
  );
}
