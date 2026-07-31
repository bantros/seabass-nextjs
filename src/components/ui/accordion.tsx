import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot='accordion'
      className={cn('flex w-full flex-col gap-y-1', className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot='accordion-item'
      className={cn('group/accordion-item grid gap-y-1', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className='flex'>
      <AccordionPrimitive.Trigger
        data-slot='accordion-trigger'
        className={cn(
          'group/accordion-trigger relative grid grid-cols-[3fr_6fr_0.5fr] gap-4 items-center w-full h-15 pl-6 pr-2 text-xl text-left text-muted-foreground bg-background rounded-4xl outline-none cursor-pointer transition-all data-panel-open:text-muted-foreground/50 data-panel-open:bg-background/75',
          className
        )}
        {...props}
      >
        {children}
        <div className='flex items-center justify-center size-11 text-muted-foreground bg-muted rounded-full outline-border transition-colors hover:text-foreground group-focus-visible/accordion-trigger:outline-2'>
          <Plus
            data-slot='accordion-trigger-icon'
            className='pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden'
          />
          <Minus
            data-slot='accordion-trigger-icon'
            className='pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline'
          />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot='accordion-content'
      className='overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up'
      {...props}
    >
      <div
        className={cn(
          'h-(--accordion-panel-height) pt-0 pb-10 data-ending-style:h-0 data-starting-style:h-0',
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
