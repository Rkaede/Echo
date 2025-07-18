import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const headingVariants = cva('font-semibold text-gray-900', {
  variants: {
    level: {
      h1: 'font-bold text-4xl',
      h2: 'font-semibold text-3xl',
      h3: 'font-semibold text-2xl',
      h4: 'font-semibold text-xl',
      h5: 'font-medium text-lg',
      h6: 'font-medium text-base'
    },
    variant: {
      default: 'text-gray-900',
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      muted: 'text-gray-500'
    }
  },
  defaultVariants: {
    level: 'h2',
    variant: 'default'
  }
});

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, variant, as, ...props }, ref) => {
    const Component = level ?? as ?? 'h2';

    return <Component className={headingVariants({ level, variant, className })} ref={ref} {...props} />;
  }
);

Heading.displayName = 'Heading';
