import { parseNumericValue } from './parseNumericValue';

export const getInvoiceTotals = (data: InvoiceFormValues | null) => {
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
