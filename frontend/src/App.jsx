import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from './layouts/ProtectedRoute';
import AppShell from './layouts/AppShell';
import Login from './pages/Login';

import Leads from './pages/Leads';
import LeadProfile from './pages/LeadProfile';
import Pipeline from './pages/Pipeline';
import UserManagement from './pages/UserManagement';
import KnowledgeBase from './pages/KnowledgeBase';
import ChatSessions from './pages/ChatSessions';
import Bootcamps from './pages/Bootcamps';
import BootcampDetail from './pages/BootcampDetail';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { useAuthStore } from './store/authStore';

/**
 * SilentRefresh: On every page load, attempt to restore the access token via
 * the httpOnly refresh cookie. If it fails, the user stays unauthenticated.
 * This replaces the old localStorage.getItem('token') bootstrap.
 */
function SilentRefreshProvider({ children }) {
  const { isInitialized, setToken, setInitialized, logout } = useAuthStore();

  useEffect(() => {
    if (isInitialized) return;

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    axios
      .post(`${apiBase}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        if (data.token) {
          setToken(data.token);
        } else {
          setInitialized();
        }
      })
      .catch(() => {
        // No valid refresh cookie — user must log in
        logout();
      });
  }, [isInitialized, setToken, setInitialized, logout]);

  // Show a minimal loader until we know auth state
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <BrowserRouter>
        <SilentRefreshProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/leads/:id" element={<LeadProfile />} />
                <Route path="/bootcamps" element={<Bootcamps />} />
                <Route path="/bootcamps/:id" element={<BootcampDetail />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/knowledge" element={<KnowledgeBase />} />
                <Route path="/chat-sessions" element={<ChatSessions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </SilentRefreshProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

