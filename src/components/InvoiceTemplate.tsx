import BaseTheme from '@/components/themes/BaseTheme';
import MicroTheme from '@/components/themes/MicroTheme';
import { formatCurrency } from '@/utils/formatCurrency';
import { getInvoiceColorHex } from '@/utils/getInvoiceColorHex';
import { getInvoiceTotals } from '@/utils/getInvoiceTotals';
import { parseNumericValue } from '@/utils/parseNumericValue';
import { InvoiceTheme } from '@/types/invoiceTheme';

interface InvoiceTemplateProps {
  color: InvoiceColorType;
  currency: InvoiceCurrency;
  logo: string | undefined;
  values: InvoiceFormValues;
  theme: string;
}

export default function InvoiceTemplate({
  color = 'white',
  currency,
  logo,
  theme,
  values
}: InvoiceTemplateProps) {
  const { subtotal, tax, total } = getInvoiceTotals(values);

  const items = (values: InvoiceFormValues): InvoiceItem[] => {
    if (!values?.items.length) return [];
    return values.items.map((item) => {
      const amount = parseNumericValue(item?.amount);
      const qty = parseNumericValue(item?.qty) || 0;
      const price = amount * qty;
      return {
        description: item?.description || '',
        qty,
        amount: formatCurrency(amount, currency, 'decimal'),
        price: formatCurrency(price, currency, 'decimal')
      };
    });
  };

  const totals: InvoiceTotals = {
    subtotal: formatCurrency(subtotal, currency, 'decimal'),
    tax: tax.toFixed(2),
    total: formatCurrency(total, currency, 'currency')
  };

  return (
    <div
      id={theme}
      className='template'
      style={{ backgroundColor: getInvoiceColorHex(color) }}
    >
      {theme === InvoiceTheme.Base && (
        <BaseTheme
          logo={logo}
          items={items(values)}
          totals={totals}
          values={values}
        />
      )}
      {theme === InvoiceTheme.Micro && (
        <MicroTheme
          logo={logo}
          items={items(values)}
          totals={totals}
          values={values}
        />
      )}
    </div>
  );
}
