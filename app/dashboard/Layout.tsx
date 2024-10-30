"use client"

import React, { useEffect, useState, Suspense, lazy } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { Home, Calendar, Users, Settings, AlertCircle, CheckCircle, Clock, Menu, X, BarChart, Club, BookUserIcon, Navigation, ChevronLeft, ArrowLeftCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Lazy load page components
const DashboardPage = lazy(() => import('@/app/dashboard/page'));
const ClubPage = lazy(() => import('@/app/dashboard/clubpage/page'));
const VenuePage = lazy(() => import('@/app/dashboard/venue/page'));
const EventsPage = lazy(() => import('@/app/dashboard/events/page'));
const AnalyticsPage = lazy(() => import('@/app/dashboard/analytics/page'));
const UsersPage = lazy(() => import('@/app/dashboard/users/page'));
const SettingsPage = lazy(() => import('@/app/dashboard/settings/page'));

interface LayoutProps {
  children: React.ReactNode;
}

interface AdminStatus {
  status: number;
  message: string;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', component: DashboardPage },
    { icon: Club, label: 'Club Page', href: '/dashboard/clubpage', component: ClubPage },
    { icon: Navigation, label: 'Venue Reservation', href: '/dashboard/venue', component: VenuePage },
    { icon: Calendar, label: 'Events', href: '/dashboard/events', component: EventsPage },
    { icon: BarChart, label: 'Analytics', href: '/dashboard/analytics', component: AnalyticsPage },
    { icon: Users, label: 'Members', href: '/dashboard/users', component: UsersPage },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings', component: SettingsPage },
  ];

  useEffect(() => {
    const fetchAdminStatus = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/getadminstatus/${user.id}`);
          const data = await response.json();
          if (data.success) {
            setAdminStatus({ status: data.status, message: data.message });
          }
        } catch (error) {
          console.error('Failed to fetch admin status:', error);
        }
      }
    };

    fetchAdminStatus();
  }, [user]);

  const renderAdminStatusBadge = () => {
    if (!adminStatus) return null;

    let icon, variant;
    switch (adminStatus.status) {
      case 1:
        icon = <AlertCircle className="h-4 w-4 mr-1" />;
        variant = "secondary";
        break;
      case 2:
        icon = <Clock className="h-4 w-4 mr-1" />;
        variant = "warning";
        break;
      case 3:
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        variant = "success";
        break;
      default:
        return null;
    }

    return (
      <Badge variant="outline" className="flex items-center mt-2 px-2 py-1">
        {icon}
        <span className="text-xs">{adminStatus.message}</span>
      </Badge>
    );
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!isSidebarCollapsed);

  const Sidebar = () => (
    <aside 
      className={`bg-white shadow-md flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarCollapsed ? 'w-16 md:w-16' : 'w-64'}
        md:relative md:translate-x-0`}
    >
      <div className="p-4 flex flex-col items-center relative">
        {!isSidebarCollapsed && (
          <h1 className="text-2xl font-thin border-[1px] border-purple-500 bg-purple-200 px-1 rounded-xl">
            Atomi<span className='font-semibold'>City</span>
          </h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-4"
          onClick={toggleSidebarCollapse}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </Button>
        {!isSidebarCollapsed && renderAdminStatusBadge()}
      </div>
      <nav className="mt-6 flex-grow">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
                         (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 mt-2 text-gray-600 hover:bg-gray-200 transition-colors duration-200 
                ${isActive ? 'bg-purple-100 text-purple-700 font-medium' : ''}
                ${isSidebarCollapsed ? 'justify-center' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-700' : ''} ${!isSidebarCollapsed ? 'mr-2' : ''}`} />
              {!isSidebarCollapsed && item.label}
            </Link>
          );
        })}
      </nav>
      <div className={`p-4 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
        <UserButton/>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
          </div>
          <div className="md:hidden">
            <h1 className="text-2xl font-thin border-[1px] border-purple-500 bg-purple-200 px-1 rounded-xl">
              Atomi<span className='font-semibold'>City</span>
            </h1>
          </div>
          <div className="md:hidden">
            <UserButton/>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}