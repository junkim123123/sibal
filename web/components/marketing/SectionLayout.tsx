// Reusable section layout component for consistent structure
import { ReactNode } from 'react';

interface SectionLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}

export function SectionLayout({
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
  titleClassName = '',
}: SectionLayoutProps) {
  return (
    <section className={className || 'py-10 md:py-16'}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {eyebrow && (
          <p className="text-xs md:text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2 text-center">
            {eyebrow}
          </p>
        )}
        <h2 className={`${titleClassName || 'text-2xl md:text-3xl lg:text-4xl font-bold'} text-neutral-900 ${titleClassName ? 'mb-3 md:mb-4' : 'mb-4 md:mb-6'} text-center`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-sm md:text-base text-neutral-600 ${titleClassName ? 'mb-6 md:mb-8' : 'mb-8 md:mb-12'} text-center max-w-2xl mx-auto`}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

