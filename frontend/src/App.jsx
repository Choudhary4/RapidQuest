import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Updates } from './pages/Updates';
import { Competitors } from './pages/Competitors';
import { Alerts } from './pages/Alerts';
import { Insights } from './pages/Insights';
import { ComparisonMatrix } from './pages/ComparisonMatrix';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);

  // Check both Zustand state and localStorage to prevent race conditions
  const hasAuth = isAuthenticated && token;

  return hasAuth ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="updates" element={<Updates />} />
            <Route path="competitors" element={<Competitors />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="insights" element={<Insights />} />
            <Route path="comparison" element={<ComparisonMatrix />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
