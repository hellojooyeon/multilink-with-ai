"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
    }

    const isDark = resolvedTheme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`
        relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 focus-visible:outline-none 
        ${isDark ? "bg-zinc-950 border border-zinc-800" : "bg-zinc-100 border border-zinc-200 shadow-inner"}
      `}
            aria-label="Toggle theme"
        >
            {/* Sun Icon (Visible in Light Mode on the Left) */}
            <span className={`absolute left-2 text-yellow-500 transition-opacity duration-300 ${!isDark ? 'opacity-100' : 'opacity-0'}`}>
                <Sun size={16} fill="currentColor" />
            </span>

            {/* Moon Icon (Visible in Dark Mode on the Right) */}
            <span className={`absolute right-2 text-zinc-400 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
                <Moon size={16} fill="currentColor" />
            </span>

            {/* Knob */}
            <span
                className={`
          absolute top-1 left-1 h-6 w-6 rounded-full shadow-md transition-transform duration-300 transform
          ${isDark
                        ? "translate-x-0 bg-white"  // Dark Mode: Knob Left, White
                        : "translate-x-8 bg-zinc-900" // Light Mode: Knob Right (w-16 - w-6 - left-1 - right-1 approx 8?), Dark
                    }
        `}
            />
        </button>
    )
}
