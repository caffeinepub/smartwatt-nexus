import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { User, Save, Loader2, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    consumerNumber: '',
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        consumerNumber: userProfile.consumerNumber,
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile.mutateAsync(form);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-energy" />
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account details</p>
      </div>

      {/* Principal ID */}
      {identity && (
        <div className="rounded-xl border border-border p-4" style={{ background: 'var(--card)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-energy" />
            <p className="text-sm font-semibold text-foreground">Internet Identity</p>
          </div>
          <p className="text-xs font-mono text-energy break-all">
            {identity.getPrincipal().toString()}
          </p>
        </div>
      )}

      {/* Profile form */}
      <div className="rounded-xl border border-border p-5" style={{ background: 'var(--card)' }}>
        <h2 className="font-display font-semibold text-foreground mb-5">Account Details</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full bg-muted/30" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="bg-muted/30 border-border focus:border-energy"
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
                  placeholder="+91 9876543210"
                  className="bg-muted/30 border-border focus:border-energy"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="consumerNumber" className="text-xs text-muted-foreground">Consumer Number</Label>
                <Input
                  id="consumerNumber"
                  name="consumerNumber"
                  value={form.consumerNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1234567890"
                  className="bg-muted/30 border-border focus:border-energy"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saveProfile.isPending}
              className="bg-energy text-primary-foreground font-semibold hover:bg-energy/90 transition-all"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
