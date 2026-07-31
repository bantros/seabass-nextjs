declare global {
  type InvoiceItem = {
    description: string;
    qty: number;
    amount: string;
    price?: string;
  };

  type InvoiceFormValues = {
    fromName: string;
    fromEmail: string;
    fromAddress: string;
    fromCity: string;
    fromPostcode: string;
    fromCountry: string;
    fromPhone: string;
    toName: string;
    toEmail: string;
    toAddress: string;
    toCity: string;
    toPostcode: string;
    toCountry: string;
    toPhone: string;
    logo: File | string;
    invoiceNo: string;
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
    tax: string;
    notes: string;
  };

  type InvoiceCurrency = 'GBP' | 'USD';

  type InvoiceTotals = {
    subtotal: string;
    tax: string;
    total: string;
  };

  type InvoiceThemeProps = {
    items: InvoiceItem[];
    logo: string | undefined;
    totals: InvoiceTotals;
    values: InvoiceFormValues;
  };

  type InvoiceColorType =
    | 'white'
    | 'red'
    | 'green'
    | 'blue'
    | 'yellow'
    | 'orange'
    | 'pink'
    | 'muted'
    | null;
}

export default global;
