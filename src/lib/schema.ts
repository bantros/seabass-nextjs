import * as z from 'zod';

export const formSchema = z.object({
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
