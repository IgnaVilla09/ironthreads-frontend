"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { AuthUser } from '@/types/auth';

interface HeaderProps {
  user: AuthUser;
}

export function Header({ user }: HeaderProps) {
  const { toggleSidebar } = useUiStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-gray-500">@{user.username}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
