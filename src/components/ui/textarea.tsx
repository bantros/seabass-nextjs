import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'flex field-sizing-content w-full min-h-15 py-3 px-0 text-xl bg-transparent border border-transparent rounded-none outline-none resize-none transition-[color,border-color] placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
