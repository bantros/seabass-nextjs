import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-between text-xl whitespace-nowrap border border-transparent rounded-none bg-clip-padding transition-all outline-none select-none cursor-pointer focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'text-secondary-foreground bg-secondary hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]  aria-expanded:text-secondary-foreground aria-expanded:bg-secondary',
        outline:
          'bg-transparent border-border hover:text-foreground hover:bg-muted aria-expanded:text-foreground aria-expanded:bg-muted dark:hover:bg-input/30',
        ghost:
          'hover:text-foreground hover:bg-muted aria-expanded:text-foreground aria-expanded:bg-muted dark:hover:bg-muted/50',
        destructive:
          'text-destructive bg-destructive/10 hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline underline-offset-4 hover:underline'
      },
      size: {
        default:
          'min-w-80 h-15 gap-10 px-7 has-data-[icon=inline-start]:pl-5 has-data-[icon=inline-end]:pr-5',
        sm: 'h-9 gap-1 px-4 has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3',
        lg: 'h-11 gap-1.5 px-8 has-data-[icon=inline-start]:pl-5 has-data-[icon=inline-end]:pr-5'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
