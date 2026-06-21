'use client';

/**
 * @fileoverview Landing page hero section.
 *
 * Extracted from `app/page.tsx` to keep the page component focused on
 * routing logic and keep this presentational section independently testable.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Leaf, TrendingDown, Shield, Zap, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

/** A single value proposition card displayed on the landing hero. */
interface ValueProp {
  icon: React.ReactNode;
  label: string;
  desc: string;
}

const VALUE_PROPS: ValueProp[] = [
  { icon: <Zap className="w-5 h-5 text-amber-500" />,      label: 'Under 3 minutes',      desc: 'Quick daily habit' },
  { icon: <TrendingDown className="w-5 h-5 text-brand-500" />, label: 'AI-powered insights', desc: 'Personalised for you' },
  { icon: <Shield className="w-5 h-5 text-blue-500" />,    label: '100% private',          desc: 'Stored locally only' },
];

interface LandingHeroProps {
  /** Called when the user clicks "Start Today's Check-In". */
  onStart: () => void;
}

/**
 * Full-page landing hero with headline, CTA, and value proposition cards.
 *
 * @param onStart - Callback to transition to the check-in form.
 */
const LandingHero = memo(({ onStart }: LandingHeroProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center text-center gap-8 py-16 px-4"
    aria-labelledby="hero-title"
  >
    {/* Brand logo */}
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg">
        <Leaf className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">CarbonWise</span>
    </div>

    {/* Headline */}
    <div className="max-w-xl">
      <h1
        id="hero-title"
        className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight"
      >
        Small daily actions.<br />
        <span className="text-brand-500">Big climate impact.</span>
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        Understand your carbon footprint in under 3 minutes and get AI-powered
        recommendations tailored to your lifestyle.
      </p>
    </div>

    <Button onClick={onStart} size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
      Start Today&apos;s Check-In
    </Button>

    {/* Value proposition cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl mt-4">
      {VALUE_PROPS.map(({ icon, label, desc }) => (
        <Card key={label}>
          <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              {icon}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </motion.section>
));
LandingHero.displayName = 'LandingHero';

export default LandingHero;
