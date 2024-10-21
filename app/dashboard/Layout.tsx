"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { Home, Calendar, Users, Settings, AlertCircle, CheckCircle, Clock, Menu, X, BarChart, Club, BookUserIcon, Navigation } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

interface AdminStatus {
  status: number;
  message: string;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Club, label: 'Club Page', href: '/dashboard/clubpage' },
    { icon: Navigation, label: 'Venue Reservation', href: '/dashboard/venue' },
    { icon: Calendar, label: 'Events', href: '/dashboard/events' },
    // { icon: BookUserIcon, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: BarChart, label: 'Analytics', href: '/dashboard/analytics' },
    // { icon: BarChart, label: 'Attendance', href: '/dashboard/attendance' },
    { icon: Users, label: 'Users', href: '/dashboard/users' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
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

  const Sidebar = () => (
    <aside className={`bg-white shadow-md flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64`}>
      <div className="p-4 flex flex-col items-center">
        <h1 className="text-2xl font-thin border-[1px] border-purple-500 bg-purple-200 px-1 rounded-xl">Atomi<span className='font-semibold'>City</span></h1>
        {renderAdminStatusBadge()}
      </div>
      <nav className="mt-6 flex-grow">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 mt-2 text-gray-600 hover:bg-gray-200 transition-colors duration-200 ${
                isActive ? 'bg-purple-100 text-purple-700 font-medium' : ''
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className={`w-5 h-5 mr-2 ${isActive ? 'text-purple-700' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <UserButton/>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <h1 className="text-2xl font-thin border-[1px] border-purple-500 bg-purple-200 px-1 rounded-xl">Atomi<span className='font-semibold'>City</span></h1>
          <UserButton/>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}