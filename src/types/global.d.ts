declare global {
  type InvoiceItem = {
    qty: number;
    description: string;
    amount: string;
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
    logo: string;
    invoiceNo: string;
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
    tax: string;
    notes: string;
  };
}

export default global;
