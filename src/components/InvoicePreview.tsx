'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import InvoiceTemplate from '@/components/InvoiceTemplate';
import { useWindowSize } from '@/hooks/useWindowSize';

interface InvoicePreviewProps {
  bleed?: boolean;
  color: InvoiceColorType;
  currency: InvoiceCurrency;
  defaultValues: InvoiceFormValues;
  subscribe?: any;
  theme: any;
}

export default function InvoicePreview(props: InvoicePreviewProps) {
  const templateRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [values, setValues] = useState<InvoiceFormValues>(props.defaultValues);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(() =>
    typeof values?.logo === 'string' ? values.logo : undefined
  );

  const { width, height } = useWindowSize();

  useEffect(() => {
    setScale(() => calculateTemplateScale());
  }, [props.bleed, width, height]);

  useEffect(() => {
    if (values.logo instanceof File) {
      const url = URL.createObjectURL(values.logo);
      setLogoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLogoUrl(typeof values.logo === 'string' ? values.logo : undefined);
  }, [values.logo]);

  function calculateTemplateScale() {
    if (!templateRef.current) return 1;
    return templateRef.current.offsetWidth / 850;
  }

  useEffect(() => {
    if (!props.subscribe) return;
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
    <div
      ref={templateRef}
      className={clsx('template-preview', !props.bleed && 'shadow-xl')}
    >
      <div
        className={clsx('render', !scale && 'hidden')}
        style={{ transform: `scale(${scale})` }}
      >
        <InvoiceTemplate
          color={props.color}
          currency={props.currency}
          logo={logoUrl}
          values={values}
          theme={props.theme}
        />
      </div>
    </div>
  );
}
