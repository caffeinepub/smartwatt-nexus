import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Receipt,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/day-wise-usage', label: 'Day-wise Usage', icon: BarChart3 },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/estimated-bill', label: 'Estimated Bill', icon: Receipt },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/about', label: 'About', icon: Info },
];

export default function Layout() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    if (isAuthenticated && isFetched && userProfile === null) {
      navigate({ to: '/register' });
    }
  }, [isAuthenticated, isFetched, userProfile, navigate]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-energy border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300',
          'bg-sidebar border-r border-sidebar-border',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
          <img
            src="/assets/generated/logo.dim_512x180.png"
            alt="Smartwatt Nexus"
            className="h-10 w-auto object-contain"
            style={{ maxWidth: '180px' }}
          />
          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        {userProfile && (
          <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground truncate">{userProfile.name}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile.consumerNumber}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate({ to: item.path });
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-energy/15 text-energy border border-energy/30 energy-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-energy')} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-energy" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img
            src="/assets/generated/logo.dim_512x180.png"
            alt="Smartwatt Nexus"
            className="h-7 w-auto object-contain"
          />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Smart Watt Nexus. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}
