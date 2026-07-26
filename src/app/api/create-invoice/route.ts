import { type NextRequest, NextResponse } from 'next/server';

import { getInvoiceTotals } from '@/utils/getInvoiceTotals';
import { parseDate } from '@/utils/parseDate';
import { parseNumericValue } from '@/utils/parseNumericValue';

function generatePayload(data: InvoiceFormValues) {
  const { subtotal, tax, total } = getInvoiceTotals(data);

  const payload = Object.entries(data).reduce<Record<string, unknown>>(
    (payload, [key, value]) => {
      if (value === undefined || value === null) return payload;
      if (typeof value === 'string') {
        if (value.trim() === '') return payload;
      }
      payload[key] = value;
      return payload;
    },
    {}
  );

  payload.issueDate = parseDate(data.issueDate);
  payload.dueDate = parseDate(data.dueDate);

  if (data.items.length > 0) {
    const items = data.items.map((item) => {
      const amount = parseNumericValue(item?.amount);
      const qty = parseNumericValue(item?.qty) || 0;
      const price = amount * qty;
      return {
        amount: amount,
        decription: item.description,
        quantity: qty,
        price: price
      };
    });
    payload.items = items;
  }

  payload.subtotal = subtotal;
  payload.tax = tax;
  payload.total = total;

  return payload;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = generatePayload(body);

  const response = await fetch('https://pdf4.dev/api/v1/render', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PDF4_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_id: 'tmpl_GY4200YudbKa',
      data: payload,
      format: {
        preset: 'a4',
        margins: {
          top: '0', // 10mm
          bottom: '0', // 10mm
          left: '0', // 10mm
          right: '0' // 20mm
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.error.message },
      { status: response.status }
    );
  }

  const pdf = await response.arrayBuffer();

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${payload.invoiceNo}-${payload.toName}-${payload.issueDate}.pdf"`
    }
  });
}
