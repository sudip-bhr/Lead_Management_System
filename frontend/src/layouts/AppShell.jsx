import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Kanban, BookOpen, UserCog, Bot, MessageSquare, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChatWidget } from '../components/chat/ChatWidget';

export default function AppShell() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const role = user?.role;

  // Role-aware navigation items
  const allNavItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'counselor', 'receptionist'] },
    { name: 'Pipeline', href: '/pipeline', icon: Kanban, roles: ['admin', 'manager', 'counselor'] },
    { name: 'Leads', href: '/leads', icon: Users, roles: ['admin', 'manager', 'counselor', 'receptionist'] },
    { name: 'Bootcamps', href: '/bootcamps', icon: Calendar, roles: ['admin', 'manager', 'counselor', 'receptionist'] },
    { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen, roles: ['admin', 'manager'] },
    { name: 'Chat Sessions', href: '/chat-sessions', icon: MessageSquare, roles: ['admin', 'manager'] },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, roles: ['admin', 'manager'] },
    { name: 'Team', href: '/users', icon: UserCog, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'manager'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const getPageTitle = () => {
    const match = allNavItems.find(i => 
      i.href === location.pathname || 
      (i.href !== '/' && location.pathname.startsWith(i.href))
    );
    return match?.name || 'Dursikshya LMS';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-white md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Bot className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-bold text-blue-600">Dursikshya LMS</span>
        </div>

        {/* User info chip */}
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
          <p className="text-xs capitalize text-gray-400">{role}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b bg-white px-6 shadow-sm">
          <h1 className="text-base font-semibold text-gray-900">{getPageTitle()}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Floating Chat Widget (visible to all staff) */}
      <ChatWidget />
    </div>
  );
}
