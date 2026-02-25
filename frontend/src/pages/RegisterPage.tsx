import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterUser, useAssignCallerUserRole } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { UserRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const { identity, login, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const { actor } = useActor();
  const registerUser = useRegisterUser();
  const assignRole = useAssignCallerUserRole();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    consumerNumber: '',
  });

  const isAuthenticated = !!identity;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login with Internet Identity first');
      return;
    }

    if (!form.name || !form.email || !form.phone || !form.consumerNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await registerUser.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        consumerNumber: form.consumerNumber,
      });

      if (identity && actor) {
        try {
          await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.user);
        } catch {
          // Role assignment may fail if already assigned, continue
        }
      }

      toast.success('Registration successful! Welcome to Smart Watt Nexus.');
      navigate({ to: '/' });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already registered')) {
        toast.error('You are already registered. Please login.');
        navigate({ to: '/login' });
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-energy border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: 'oklch(0.72 0.18 195 / 0.05)' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border p-8 shadow-card" style={{ background: 'var(--card)' }}>
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="/assets/generated/logo.dim_512x180.png"
              alt="Smartwatt Nexus"
              className="h-16 w-auto object-contain mb-3"
            />
            <h1 className="font-display text-xl font-bold text-foreground">Create Account</h1>
            <p className="text-xs text-muted-foreground mt-1">Smart Watt Nexus Registration</p>
          </div>

          {/* Auth status */}
          {!isAuthenticated ? (
            <div className="mb-6 p-4 rounded-lg bg-energy/10 border border-energy/30">
              <p className="text-sm text-energy font-medium mb-2">Step 1: Authenticate</p>
              <p className="text-xs text-muted-foreground mb-3">
                You need to login with Internet Identity before registering.
              </p>
              <Button
                onClick={login}
                size="sm"
                className="bg-energy text-primary-foreground font-semibold text-xs hover:bg-energy/90"
              >
                Login with Internet Identity
              </Button>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-xs text-green-400 font-medium">✓ Authenticated with Internet Identity</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="bg-muted/30 border-border focus:border-energy"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="bg-muted/30 border-border focus:border-energy"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="bg-muted/30 border-border focus:border-energy"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="consumerNumber" className="text-xs text-muted-foreground">Consumer Number</Label>
              <Input
                id="consumerNumber"
                name="consumerNumber"
                value={form.consumerNumber}
                onChange={handleChange}
                placeholder="TS electricity consumer number"
                className="bg-muted/30 border-border focus:border-energy"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={registerUser.isPending || !isAuthenticated}
              className="w-full h-11 bg-energy text-primary-foreground font-bold hover:bg-energy/90 energy-glow transition-all mt-2"
            >
              {registerUser.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already registered?{' '}
            <button
              onClick={() => navigate({ to: '/login' })}
              className="text-energy hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Login
            </button>
          </p>
        </div>

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
