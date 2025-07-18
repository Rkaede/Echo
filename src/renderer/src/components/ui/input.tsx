import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const inputVariants = cva(
  'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-blue-500',
        error: 'border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:ring-green-500'
      },
      size: {
        sm: 'h-8 px-2 py-1 text-xs',
        default: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, variant, size, type, ...props }, ref) => {
  return <input type={type} className={inputVariants({ variant, size, className })} ref={ref} {...props} />;
});

Input.displayName = 'Input';
