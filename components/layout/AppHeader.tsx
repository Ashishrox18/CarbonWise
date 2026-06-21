'use client';

/**
 * @fileoverview Shared application header used on all pages.
 *
 * Renders the CarbonWise logo/home link and a configurable set of
 * secondary navigation links. Extracted from the three page components
 * to eliminate duplication.
 */

import { memo } from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

/** A single navigation link entry. */
export interface NavLink {
  href: string;
  label: string;
  /** Optional icon rendered before the label text. */
  icon?: React.ReactNode;
}

interface AppHeaderProps {
  /** Navigation links displayed on the right side of the header. */
  navLinks: NavLink[];
}

/**
 * Sticky top navigation bar with the CarbonWise brand and secondary nav links.
 *
 * @param navLinks - Links to display in the secondary navigation.
 */
const AppHeader = memo(({ navLinks }: AppHeaderProps) => (
  <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
    <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <Leaf className="w-5 h-5 text-brand-600" aria-hidden="true" />
        CarbonWise
      </Link>

      <nav aria-label="Secondary navigation" className="flex gap-1">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors flex items-center gap-1"
          >
            {link.icon && <span aria-hidden="true">{link.icon}</span>}
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </header>
));
AppHeader.displayName = 'AppHeader';

export default AppHeader;
