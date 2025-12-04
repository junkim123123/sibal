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
    <section className={className}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2 text-center">
            {eyebrow}
          </p>
        )}
        <h2 className={`text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 text-center ${titleClassName}`}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-base text-neutral-600 mb-12 text-center max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

