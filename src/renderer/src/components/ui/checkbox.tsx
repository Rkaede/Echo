import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
);

const checkIconVariants = cva('flex items-center justify-center text-current', {
  variants: {
    size: {
      sm: 'h-3 w-3',
      default: 'h-4 w-4',
      lg: 'h-5 w-5'
    }
  },
  defaultVariants: {
    size: 'default'
  }
});

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

export const Checkbox = forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, size, ...props }, ref) => (
    <CheckboxPrimitive.Root ref={ref} className={checkboxVariants({ size, className })} {...props}>
      <CheckboxPrimitive.Indicator className={checkIconVariants({ size })}>
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-2.5 w-2.5"
        >
          <path
            d="M8.5 1L3.5 6L1.5 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
