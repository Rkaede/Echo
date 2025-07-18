import { cva, type VariantProps } from 'class-variance-authority';

const textVariants = cva('text-gray-900', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl'
    },
    variant: {
      default: 'text-gray-900',
      muted: 'text-gray-600',
      subtle: 'text-gray-500',
      success: 'text-green-700',
      warning: 'text-yellow-700',
      error: 'text-red-700',
      primary: 'text-blue-600'
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    },
    leading: {
      none: 'leading-none',
      tight: 'leading-tight',
      snug: 'leading-snug',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose'
    }
  },
  defaultVariants: {
    size: 'base',
    variant: 'default',
    weight: 'normal',
    leading: 'normal'
  }
});

export interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'label';
}

export function Text({ className, size, variant, weight, leading, as, ...props }: TextProps) {
  const Component = as || 'p';

  return <Component className={textVariants({ size, variant, weight, leading, className })} {...props} />;
}
