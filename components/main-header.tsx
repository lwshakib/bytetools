"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Github, Clock } from "lucide-react"
import { format } from "date-fns"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/theme-toggle"

const routeMap: Record<string, string> = {
  "/timezones": "Timezones",
  "/daily-planner": "Daily Planner",
  "/password-generator": "Password Generator",
  "/pomodoro": "Pomodoro",
  "/qrcode": "QR Code",
  "/stopwatch": "Stopwatch",
  "/account": "Account Settings",
}

export function MainHeader() {
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [is24Hour, setIs24Hour] = useState(false)

  const pageTitle = routeMap[pathname] || "Dashboard"

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const timeFormat = is24Hour ? "HH:mm:ss" : "hh:mm:ss a"

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4 bg-border"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-semibold tracking-tight">
                {pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-baseline tabular-nums">
            <span className="text-sm font-semibold text-foreground min-w-[75px] text-right">
              {currentTime ? format(currentTime, timeFormat) : '--:--:--'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIs24Hour(!is24Hour)}
            className="h-7 px-2 text-[9px] font-black uppercase tracking-tighter text-muted-foreground hover:text-foreground hover:bg-accent border border-border/50 transition-all active:scale-95 shrink-0"
          >
            {is24Hour ? "24H" : "12H"}
          </Button>
        </div>

        <Separator orientation="vertical" className="h-4 bg-border hidden xs:block" />

        <div className="flex items-center gap-1.5">
          <a
            href="https://github.com/lwshakib/bytetools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-all hover:rotate-12 active:scale-90 p-2"
            title="View Source on GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
