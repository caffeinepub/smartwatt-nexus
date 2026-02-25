import { Zap, BarChart3, Brain, Shield, Cpu, Bolt, ArrowRight, Layers, Activity, FileText } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Dashboard & Analytics',
    description: 'Real-time overview of your electricity consumption with interactive charts, daily stats, and trend indicators.',
  },
  {
    icon: Brain,
    title: 'ML-Powered Predictions',
    description: 'Forecast future consumption using three models: Linear Regression, Artificial Neural Network (ANN), and LSTM-like time-series analysis.',
  },
  {
    icon: Activity,
    title: 'Day-wise Usage',
    description: 'Visualize your monthly consumption as a bar chart with a detailed daily breakdown grid for granular insights.',
  },
  {
    icon: FileText,
    title: 'Reports & Export',
    description: 'Download your consumption history as CSV for offline analysis, record-keeping, or sharing with your electricity provider.',
  },
  {
    icon: Zap,
    title: 'Estimated Bill',
    description: 'Accurate bill estimation using Telangana TSSPDCL tariff slabs, including BPL (Below Poverty Line) eligibility support.',
  },
  {
    icon: Shield,
    title: 'Secure Identity',
    description: 'Powered by Internet Identity — a decentralized, password-free authentication system built on the Internet Computer.',
  },
];

const techStack = [
  { label: 'Blockchain', value: 'Internet Computer (ICP)' },
  { label: 'Authentication', value: 'Internet Identity' },
  { label: 'Tariff Standard', value: 'Telangana TSSPDCL Slabs' },
  { label: 'ML Models', value: 'Linear Regression, ANN, LSTM-like' },
  { label: 'Frontend', value: 'React + TypeScript + Tailwind CSS' },
  { label: 'Backend', value: 'Motoko Smart Contracts' },
];

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-energy/20 bg-card card-gradient p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-energy/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <img
            src="/assets/generated/logo.dim_512x180.png"
            alt="Smart Watt Nexus"
            className="h-14 w-auto object-contain"
          />
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mt-2">
              Smart Watt Nexus
            </h1>
            <p className="text-energy text-sm font-medium tracking-widest uppercase mt-1">
              Intelligent Electricity Monitor
            </p>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Smart Watt Nexus is a decentralized electricity consumption monitoring platform built on the
            Internet Computer. It empowers Telangana households to track, analyze, and forecast their
            electricity usage — all secured by blockchain-grade identity.
          </p>
        </div>
      </div>

      {/* Features */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-energy" />
          Key Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-energy/30 transition-colors duration-200"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-energy/10 border border-energy/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-energy" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technology */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-energy" />
          Technology Stack
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {techStack.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-5 py-3 text-sm ${
                i < techStack.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-foreground font-medium text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hardware Integration */}
      <section>
        <div className="rounded-xl border border-forecast/30 bg-forecast/5 p-5 flex gap-4">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-forecast/15 border border-forecast/30 flex items-center justify-center">
            <Bolt className="w-5 h-5 text-forecast" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm mb-1">
              Planned: Arduino Hardware Integration
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A future version of Smart Watt Nexus will support automatic data ingestion via an Arduino-based
              energy meter. The hardware module will read real-time watt-hour data and push it directly to
              the on-chain canister, eliminating manual entry entirely.
            </p>
          </div>
        </div>
      </section>

      {/* Tariff Info */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-energy" />
          Tariff Structure (TSSPDCL)
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {[
            { slab: '0 – 50 units', rate: '₹1.45 / unit', note: 'Free for BPL households' },
            { slab: '51 – 100 units', rate: '₹2.60 / unit', note: '' },
            { slab: '101 – 200 units', rate: '₹3.50 / unit', note: '' },
            { slab: '201 – 300 units', rate: '₹5.00 / unit', note: '' },
            { slab: 'Above 300 units', rate: '₹8.50 / unit', note: 'High consumption tier' },
          ].map((row, i, arr) => (
            <div
              key={row.slab}
              className={`flex items-center justify-between px-5 py-3 text-sm ${
                i < arr.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div>
                <span className="text-foreground font-medium">{row.slab}</span>
                {row.note && (
                  <span className="ml-2 text-xs text-energy">({row.note})</span>
                )}
              </div>
              <span className="text-muted-foreground font-mono">{row.rate}</span>
            </div>
          ))}
          <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fixed Charges</span>
            <span className="text-foreground font-mono font-medium">₹50 / month</span>
          </div>
        </div>
      </section>

      {/* Version */}
      <div className="text-center text-xs text-muted-foreground pb-4">
        Smart Watt Nexus v1.0 · Built on the Internet Computer · © {new Date().getFullYear()}
      </div>
    </div>
  );
}
