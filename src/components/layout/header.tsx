"use client";

import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Header() {
  const { toggleSidebar } = useUiStore();

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
    </header>
  );
}
