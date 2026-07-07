import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { OfflineBanner } from './components/ui/OfflineBanner';

function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <BrowserRouter>
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
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
