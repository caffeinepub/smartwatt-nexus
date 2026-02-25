import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  useEffect(() => {
    if (isAuthenticated && isFetched) {
      if (userProfile === null) {
        navigate({ to: '/register' });
      } else {
        navigate({ to: '/' });
      }
    }
  }, [isAuthenticated, isFetched, userProfile, navigate]);

  const handleLogin = async () => {
    if (isAuthenticated) {
      await clear();
      setTimeout(() => login(), 300);
    } else {
      try {
        login();
      } catch (err: any) {
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-energy border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'oklch(0.72 0.18 195 / 0.05)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: 'oklch(0.62 0.16 210 / 0.05)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border p-8 shadow-card" style={{ background: 'var(--card)' }}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/assets/generated/logo.dim_512x180.png"
              alt="Smartwatt Nexus"
              className="h-20 w-auto object-contain mb-3"
            />
            <p className="text-muted-foreground text-sm mt-1">TS Electricity Consumption Monitor</p>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Welcome Back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to monitor your electricity consumption, track usage patterns, and get AI-powered predictions.
            </p>
          </div>

          {/* Login button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-12 bg-energy text-primary-foreground font-bold text-base hover:bg-energy/90 energy-glow transition-all"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 mr-2" />
                Login with Internet Identity
              </>
            )}
          </Button>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            New user?{' '}
            <button
              onClick={() => navigate({ to: '/register' })}
              className="text-energy hover:underline font-medium"
            >
              Register here
            </button>
          </p>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-border grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'ML Predictions', desc: 'LSTM, ANN, Regression' },
              { label: 'TS Tariff', desc: 'Accurate billing' },
              { label: 'Reports', desc: 'CSV export' },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <p className="text-xs font-semibold text-energy">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Smart Watt Nexus. Built with{' '}
          <span className="text-energy">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'smart-watt-nexus')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-energy hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
