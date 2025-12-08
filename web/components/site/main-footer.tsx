import Link from 'next/link';

export function MainFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">About NexSupply</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              End-to-end sourcing platform combining AI intelligence with owned logistics infrastructure.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/how-it-works" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Use Cases
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Analyze a product
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">For Sellers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/use-cases#amazon-fba" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Amazon FBA
                </Link>
              </li>
              <li>
                <Link href="/use-cases#dtc-shopify" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  DTC / Shopify
                </Link>
              </li>
              <li>
                <Link href="/use-cases#retail-wholesale" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Retail / Wholesale
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Company</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link href="/contact" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/resources#about" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  About NexSupply
                </Link>
              </li>
              <li>
                <Link href="/resources#terms" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/resources#privacy" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/resources#faq" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@nexsupply.com" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Email us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Block */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">Reach Out to NexSupply</h3>
            <a
              href="mailto:sourcing@nexsupply.net"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              sourcing@nexsupply.net
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-200 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-neutral-600">
              © 2025 NexSupply. All rights reserved.
            </p>
            <p className="text-xs text-neutral-600 max-w-2xl">
              NexSupply is not a customs broker or legal advisor. Estimates are for directional planning only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

