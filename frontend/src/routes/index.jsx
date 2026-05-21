import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, PublicRoute } from './guards'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'
import LoadingPage from '../components/ui/LoadingPage'

// Lazy load pages for code splitting
const Login        = lazy(() => import('../pages/Login'))
const Dashboard    = lazy(() => import('../pages/Dashboard'))
const Transactions = lazy(() => import('../pages/Transactions'))
const Categories   = lazy(() => import('../pages/Categories'))
const Reports      = lazy(() => import('../pages/Reports'))
const NotFound     = lazy(() => import('../pages/NotFound'))

const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
        ],
      },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/',             element: <Dashboard /> },
          { path: '/dashboard',    element: <Dashboard /> },
          { path: '/transactions', element: <Transactions /> },
          { path: '/categories',   element: <Categories /> },
          { path: '/reports',      element: <Reports /> },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFound /> },
])

const AppRouter = () => (
  <Suspense fallback={<LoadingPage />}>
    <RouterProvider router={router} />
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </Suspense>
)

export default AppRouter
