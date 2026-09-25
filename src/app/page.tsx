// import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight } from 'lucide-react';
import Hero from '@/components/Hero';
import Column from '@/components/Column';
import InvoicePreview from '@/components/InvoicePreview';
// import { getInvoiceColorHex } from '@/utils/getInvoiceColorHex';
import BokehCanvas from '@/components/BokehCanvas';

const date = new Date();
const toDate = new Date(date);
toDate.setDate(toDate.getDate() + 7);

const defaultFromDate = date.toISOString().split('T')[0];
const defaultToDate = toDate.toISOString().split('T')[0];

const defaultValues = {
  fromName: 'Jonathon Halliwell',
  fromEmail: 'jon@bantros.net',
  fromAddress: 'Flat 52 New Little Mill',
  fromCity: 'Manchester',
  fromPostcode: 'M4 6GH',
  fromCountry: '',
  fromPhone: '07799600808',
  toName: 'Seabass',
  toEmail: 'invoice@seabass.com',
  toAddress: '58 Park Road',
  toCity: 'London',
  toPostcode: 'E12 2YG',
  toCountry: '',
  toPhone: '',
  logo: '',
  invoiceNo: '#100',
  issueDate: defaultFromDate,
  dueDate: defaultToDate,
  items: [{ qty: 1, description: 'Item', amount: '1000' }],
  tax: '',
  notes: 'Thank you for your business'
};

export default function Home() {
  return (
    <div className='flex flex-col bg-theme-secondary'>
      <section className='relative h-dvh'>
        <BokehCanvas
          className='absolute inset-0 w-full h-full'
          bgColor='#cee9eb' // coral salmon base
          outputColor='#fef8dd' // warm gold tint
          vignetteColor='#13A7B2' // deep purple ring
          speed={0.75} // animation speed multiplier
          vignetteRadius={0.354} // ring inner edge
          vignetteSkew={0.54} // ellipse squish *
          waveFrequency={0.35} // ripple spatial freq *
          waveAmplitude={1.18} // ripple height
          shatterAmount={0.534} // Voronoi cell scale
          shatterAngle={119/360} // grid rotation (44°)
          shatterSkew={0.84} // cell elongation → slivers
          bokehRadius={0.754} // blur radius
          bokehTilt={0.5} // focus tilt shift
        />
      </section>

      <section className='relative h-dvh'>
        <div className='relative z-10 h-full'>
          <Hero />
        </div>

        {/* <div className='col-[1/7] row-[1/12] p-10 bg-theme-primary overflow-hidden'> */}
        {/* <h1 className='relative text-6xl lg:text-9xl font-bold tracking-widest uppercase text-theme-primary'>
            Seabass
          </h1> */}
        {/* </div> */}
        {/* <div className='relative col-[7/13] row-[1/12] flex flex-col justify-between bg-theme-tertiary'> */}
        {/* <div className='relative col-[7/13] row-[1/12] flex flex-col justify-between bg-theme-tertiary'> */}
        {/* <div className='absolute top-0 left-0 size-full bg-theme-tertiary overflow-hidden'> */}
        {/* <Image
              className='object-cover object-center size-full scale-150'
              src='/seabass-1.png'
              width={720}
              height={1440}
              alt=''
              priority
            /> */}
        {/* </div> */}
        {/* <h2 className='text-5xl lg:text-7xl lg:text-balance'>
            Create invoices worthy of your work.
          </h2>
          <p className='text-base lg:text-xl'>
            Sharable as links or download as a PDF.
            <br />
            For you to use as you see fit.
          </p> */}
        {/* </div> */}
      </section>

      <section className='relative z-20 bg-theme-primary'>
        <h3 className='flex items-center gap-x-4 p-10 text-3xl'>
          Pick a template
          <ArrowDownRight className='size-9' />
        </h3>
        <div className='grid md:grid-cols-12'>
          <Column className='col-span-6 flex flex-col' speedMultiplier={2}>
            <div
              className='aspect-auto p-20'
              // style={{
              //   backgroundColor: `color-mix(in oklab, ${getInvoiceColorHex('blue')}, white 50%)`
              // }}
            >
              <Link href='/edit/base/'>
                <InvoicePreview
                  color='white'
                  currency='GBP'
                  defaultValues={defaultValues}
                  theme='base'
                />
              </Link>
            </div>
          </Column>
          <Column className='col-span-6 flex flex-col' speedMultiplier={4}>
            <div className='aspect-auto p-20 my-40'>
              <Link href='/edit/micro/'>
                <InvoicePreview
                  color='white'
                  currency='GBP'
                  defaultValues={defaultValues}
                  theme='micro'
                />
              </Link>
            </div>
          </Column>
        </div>
      </section>
    </div>
  );
}
