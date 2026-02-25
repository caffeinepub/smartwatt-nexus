import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DayWiseUsagePage from './pages/DayWiseUsagePage';
import ReportsPage from './pages/ReportsPage';
import EstimatedBillPage from './pages/EstimatedBillPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';

// Root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// Protected layout route
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: DashboardPage,
});

const dayWiseRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/day-wise-usage',
  component: DayWiseUsagePage,
});

const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports',
  component: ReportsPage,
});

const billRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/estimated-bill',
  component: EstimatedBillPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/profile',
  component: ProfilePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/about',
  component: AboutPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    dayWiseRoute,
    reportsRoute,
    billRoute,
    profileRoute,
    aboutRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
