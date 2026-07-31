import { parseDate } from '@/utils/parseDate';

export default function MicroTheme({
  items,
  logo,
  totals,
  values
}: InvoiceThemeProps) {
  return (
    <>
      <div className='area-logo'>
        {logo && (
          <div className='logo max-w-1/2'>
            <img src={logo} alt='Logo' />
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

      <div className='area-info'>
        <div>Invoice {values?.invoiceNo && values?.invoiceNo}</div>
        {values?.issueDate && <div>Issued {parseDate(values.issueDate)}</div>}
        {values?.dueDate && <div>Due {parseDate(values.dueDate)}</div>}
      </div>

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
          {items &&
            items.map((item, index) => {
              return (
                <div key={index} className='template-items-row'>
                  <div className='template-items-item'>
                    {item?.description ? item.description : 'Description'}
                  </div>
                  <div className='template-items-price'>
                    <div>{item.qty}</div>
                    <div>{item.amount}</div>
                    <div>{item.price}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className='area-notes'>{values?.notes}</div>

      <div className='area-totals'>
        <div className='template-totals-line'>
          <div>Subtotal</div>
          <div>{totals.subtotal}</div>
        </div>
        <div className='template-totals-line'>
          <div>Tax</div>
          <div>{totals.tax}</div>
        </div>
        <div className='template-totals-line'>
          <div>Total</div>
          <div>{totals.total}</div>
        </div>
      </div>
    </>
  );
}
