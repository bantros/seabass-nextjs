import Link from 'next/link';

export default function Home() {
  return (
    <div className='grid gap-1 p-1'>
      <section className='grid md:grid-cols-2 gap-1'>
        <div className='aspect-square flex flex-col justify-between p-4 lg:p-6 bg-theme-secondary rounded-sm'>
          <h1 className='text-6xl text-balance'>
            Create a professional invoice in seconds.
          </h1>
          <p className='text-base lg:text-xl'>
            Sharable as links or export as a PDF.
            <br />
            For you to use as you see fit.
          </p>
        </div>
        <div className='aspect-square flex rounded-sm overflow-hidden'>
          <div className='aspect-auto object-cover object-center size-full bg-theme-tertiary'></div>
        </div>
      </section>

      <section className='p-4 lg:p-6 bg-theme-primary rounded-sm'>
        <h2 className='text-2xl text-tuna'>Select a template</h2>
      </section>

      <section className='grid md:grid-cols-2 lg:grid-cols-3 gap-1 p-4 lg:p-6 bg-theme-secondary rounded-sm'>
        <div className='aspect-square'>
          <Link className='underline' href='/edit/'>Default template</Link>
        </div>
      </section>
    </div>
  );
}
