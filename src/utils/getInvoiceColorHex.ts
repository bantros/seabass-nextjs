import { InvoiceColorHex } from '@/types/invoiceColorHex';

export const getInvoiceColorHex = (color: InvoiceColorType) => {
  switch (color) {
    case 'red':
      return InvoiceColorHex.red;
    case 'green':
      return InvoiceColorHex.green;
    case 'blue':
      return InvoiceColorHex.blue;
    case 'yellow':
      return InvoiceColorHex.yellow;
    case 'orange':
      return InvoiceColorHex.orange;
    case 'pink':
      return InvoiceColorHex.pink;
    case 'white':
      return InvoiceColorHex.pink;
    default:
      return InvoiceColorHex.green;
  }
};
