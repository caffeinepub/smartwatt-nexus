import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Receipt,
  User,
  ChevronRight,
  ChevronLeft,
  Zap,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ONBOARDING_KEY = 'swn-onboarding-dismissed';

const steps = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description:
      'Your home base. See today\'s usage, daily averages, and peak consumption at a glance. Use the Manual Entry form to log your meter readings, or seed demo data to explore the app.',
    tip: 'Tip: Add a reading every day for the best ML predictions.',
  },
  {
    icon: BarChart3,
    title: 'Day-wise Usage',
    description:
      'Browse a monthly bar chart of your electricity consumption. Navigate between months and drill down into individual day totals to spot patterns and anomalies.',
    tip: 'Tip: Use the month navigator arrows to compare past months.',
  },
  {
    icon: FileText,
    title: 'Reports',
    description:
      'View a full table of all your consumption records sorted by date. Export your data as a CSV file for offline analysis, billing disputes, or sharing with your provider.',
    tip: 'Tip: Download CSV before the end of each month for your records.',
  },
  {
    icon: Receipt,
    title: 'Estimated Bill',
    description:
      'Enter your monthly units to get an accurate bill estimate using Telangana TSSPDCL tariff slabs. Toggle BPL eligibility for the subsidised rate. A full slab breakdown is shown.',
    tip: 'Tip: Enable BPL mode if your household qualifies for the free 50-unit subsidy.',
  },
  {
    icon: User,
    title: 'Profile',
    description:
      'Update your name, email, phone number, and consumer number. Your profile is stored securely on-chain and linked to your Internet Identity.',
    tip: 'Tip: Keep your consumer number handy — it helps cross-reference your official bill.',
  },
];

interface OnboardingGuideProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export function dismissOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

export function isOnboardingDismissed(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export default function OnboardingGuide({ isOpen, onDismiss }: OnboardingGuideProps) {
  const [step, setStep] = useState(0);

  const current = steps[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const handleDismiss = () => {
    dismissOnboarding();
    onDismiss();
  };

  const handleNext = () => {
    if (isLast) {
      handleDismiss();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="max-w-md bg-card border border-energy/20 shadow-2xl p-0 overflow-hidden">
        {/* Header bar */}
        <div className="bg-energy/10 border-b border-energy/20 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-energy/20 border border-energy/30 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-energy" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-sm font-semibold text-foreground">
              Welcome to Smart Watt Nexus
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Quick tour — {step + 1} of {steps.length}
            </DialogDescription>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step content */}
        <div className="px-6 py-6 space-y-4">
          {/* Step icon + title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-energy/10 border border-energy/25 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-energy" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">{current.title}</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>

          {/* Tip */}
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-2.5">
            <p className="text-xs text-energy font-medium">{current.tip}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  'rounded-full transition-all duration-200',
                  i === step
                    ? 'w-5 h-2 bg-energy'
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                )}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="border-border text-foreground hover:bg-muted/50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-energy text-primary-foreground hover:bg-energy/90 font-medium"
            >
              {isLast ? 'Get Started' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
