import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'How it Works', href: '/how-it-works' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Get Started', href: '/chat' },
  ],
  company: [
    { label: 'About NexSupply', href: '/about' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
  support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Email us', href: 'mailto:sourcing@nexsupply.net' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Product</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-base text-neutral-600 hover:text-neutral-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-base text-neutral-600 hover:text-neutral-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Support</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('mailto:') ? (
                    <a href={link.href} className="text-base text-neutral-600 hover:text-neutral-900">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-base text-neutral-600 hover:text-neutral-900">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="text-sm text-neutral-500 mt-2">
                sourcing@nexsupply.net
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Legal</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-base text-neutral-600 hover:text-neutral-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-neutral-200 pt-8">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Secured by Stripe & Lemon Squeezy</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">100% Data Privacy</span>
            </div>
          </div>
          <p className="text-base text-neutral-600 text-center">
            &copy; {new Date().getFullYear()} NexSupply. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}