"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full border border-[#22352B] bg-[#0E1A14] flex items-center justify-center opacity-60">
        <span className="h-4 w-4" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Toggle theme"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#22352B] bg-[#0E1A14] text-slate-200 hover:bg-[#121E18] hover:text-white transition-all cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#c45b37] focus-visible:ring-0"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-emerald-400" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 rounded-2xl border border-[#22352B] bg-[#0E1A14] text-slate-100 shadow-2xl p-1.5"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between text-xs font-semibold cursor-pointer rounded-xl px-2.5 py-1.5 hover:bg-emerald-500/10 text-slate-200 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light</span>
          </span>
          {theme === "light" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between text-xs font-semibold cursor-pointer rounded-xl px-2.5 py-1.5 hover:bg-emerald-500/10 text-slate-200 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Dark</span>
          </span>
          {theme === "dark" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between text-xs font-semibold cursor-pointer rounded-xl px-2.5 py-1.5 hover:bg-emerald-500/10 text-slate-200 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Laptop className="h-3.5 w-3.5 text-slate-400" />
            <span>System</span>
          </span>
          {theme === "system" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
