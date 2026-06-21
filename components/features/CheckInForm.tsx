'use client';

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Utensils, Zap, ShoppingBag, Trash2, ChevronRight, ChevronLeft, Leaf } from 'lucide-react';
import type { CheckInAnswers, TransportMode, MealType, ElectricityUsage, ShoppingLevel, WasteHandling } from '@/types';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

// ─── Option Config ────────────────────────────────────────────────

interface Option<T> {
  value: T;
  label: string;
  emoji: string;
  description: string;
}

const TRANSPORT_OPTIONS: Option<TransportMode>[] = [
  { value: 'walk',   label: 'Walk',   emoji: '🚶', description: '0 kg CO₂' },
  { value: 'cycle',  label: 'Cycle',  emoji: '🚲', description: '0 kg CO₂' },
  { value: 'bus',    label: 'Bus',    emoji: '🚌', description: '1.5 kg CO₂' },
  { value: 'metro',  label: 'Metro',  emoji: '🚇', description: '0.8 kg CO₂' },
  { value: 'car',    label: 'Car',    emoji: '🚗', description: '4.6 kg CO₂' },
  { value: 'bike',   label: 'Motorbike', emoji: '🏍️', description: '0.1 kg CO₂' },
];

const MEAL_OPTIONS: Option<MealType>[] = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗', description: '1.5 kg CO₂' },
  { value: 'mixed',      label: 'Mixed',      emoji: '🍽️', description: '3.0 kg CO₂' },
  { value: 'chicken',    label: 'Chicken',    emoji: '🍗', description: '4.5 kg CO₂' },
  { value: 'beef',       label: 'Beef',       emoji: '🥩', description: '9.0 kg CO₂' },
];

const ELECTRICITY_OPTIONS: Option<ElectricityUsage>[] = [
  { value: 'low',    label: 'Low',    emoji: '💡', description: '0.5 kg CO₂' },
  { value: 'medium', label: 'Medium', emoji: '⚡', description: '1.5 kg CO₂' },
  { value: 'high',   label: 'High',   emoji: '🔋', description: '3.0 kg CO₂' },
];

const SHOPPING_OPTIONS: Option<ShoppingLevel>[] = [
  { value: 'none',    label: 'None',        emoji: '✅', description: '0 kg CO₂' },
  { value: 'one',     label: 'One item',    emoji: '🛍️', description: '3.0 kg CO₂' },
  { value: 'several', label: 'Several',     emoji: '📦', description: '7.0 kg CO₂' },
];

const WASTE_OPTIONS: Option<WasteHandling>[] = [
  { value: 'recycled', label: 'Fully recycled', emoji: '♻️', description: '0.2 kg CO₂' },
  { value: 'mixed',    label: 'Mixed',           emoji: '🗑️', description: '0.8 kg CO₂' },
  { value: 'none',     label: 'No recycling',    emoji: '❌', description: '1.5 kg CO₂' },
];

// ─── Step Config ──────────────────────────────────────────────────

interface Step {
  key:     keyof CheckInAnswers;
  title:   string;
  prompt:  string;
  icon:    React.ReactNode;
  options: Option<string>[];
}

const STEPS: Step[] = [
  { key: 'transport',   title: 'Transport',   prompt: 'How did you get around today?',     icon: <Car   className="w-5 h-5" />, options: TRANSPORT_OPTIONS   as Option<string>[] },
  { key: 'meal',        title: 'Food',        prompt: 'What best describes your meals?',   icon: <Utensils className="w-5 h-5" />, options: MEAL_OPTIONS     as Option<string>[] },
  { key: 'electricity', title: 'Electricity', prompt: 'How was your energy use at home?',  icon: <Zap   className="w-5 h-5" />, options: ELECTRICITY_OPTIONS as Option<string>[] },
  { key: 'shopping',    title: 'Shopping',    prompt: 'Did you make any purchases today?', icon: <ShoppingBag className="w-5 h-5" />, options: SHOPPING_OPTIONS as Option<string>[] },
  { key: 'waste',       title: 'Waste',       prompt: 'How did you handle your waste?',    icon: <Trash2 className="w-5 h-5" />, options: WASTE_OPTIONS    as Option<string>[] },
];

// ─── Option Button ─────────────────────────────────────────────────

interface OptionButtonProps<T extends string> {
  option:     Option<T>;
  selected:   boolean;
  onSelect:   (value: T) => void;
}

const OptionButton = memo(function OptionButton<T extends string>({
  option, selected, onSelect,
}: OptionButtonProps<T>) {
  return (
    <button
      onClick={() => onSelect(option.value)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        selected
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-gray-900'
      }`}
      aria-pressed={selected}
    >
      <span className="text-2xl" aria-hidden="true">{option.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${selected ? 'text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-gray-100'}`}>
          {option.label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{option.description}</p>
      </div>
      {selected && <Leaf className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />}
    </button>
  );
}) as <T extends string>(props: OptionButtonProps<T>) => React.ReactElement;

// ─── Main Component ────────────────────────────────────────────────

interface CheckInFormProps {
  onComplete: (answers: CheckInAnswers) => void;
  isSubmitting: boolean;
}

const DEFAULT_ANSWERS: CheckInAnswers = {
  transport:   'walk',
  meal:        'vegetarian',
  electricity: 'medium',
  shopping:    'none',
  waste:       'recycled',
};

/**
 * Multi-step daily check-in form.
 * Each step presents radio-style option cards for one category.
 */
export default memo(function CheckInForm({ onComplete, isSubmitting }: CheckInFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<CheckInAnswers>(DEFAULT_ANSWERS);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleSelect = useCallback(
    (value: string) => {
      setAnswers(prev => ({ ...prev, [step.key]: value }));
    },
    [step.key]
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(answers);
    } else {
      setCurrentStep(p => p + 1);
    }
  }, [isLast, onComplete, answers]);

  const handleBack = useCallback(() => {
    setCurrentStep(p => Math.max(0, p - 1));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="flex gap-1.5" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= currentStep ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0  }}
          exit={{    opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent>
              {/* Step header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Step {currentStep + 1} of {STEPS.length}
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {step.prompt}
                  </h2>
                </div>
              </div>

              {/* Options */}
              <fieldset>
                <legend className="sr-only">{step.prompt}</legend>
                <div className="flex flex-col gap-3">
                  {step.options.map(opt => (
                    <OptionButton
                      key={opt.value}
                      option={opt}
                      selected={answers[step.key] === opt.value}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </fieldset>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 0 && (
          <Button
            variant="secondary"
            onClick={handleBack}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          isLoading={isLast && isSubmitting}
          rightIcon={!isLast ? <ChevronRight className="w-4 h-4" /> : undefined}
          className="flex-1"
        >
          {isLast ? 'Analyse My Footprint' : 'Next'}
        </Button>
      </div>
    </div>
  );
});
