"use client"

import * as React from "react"
import {
  Globe,
  Calendar,
  Key,
  Timer,
  QrCode,
  Clock,
  Hourglass,
  Gamepad2,
  Hash,
  ShieldCheck,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Logo } from "@/components/logo"
import { AuthModal } from "@/components/auth-modal"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { LogIn } from "lucide-react"

// Tool Navigation Data
const data = {
  navMain: [
    {
      title: "Timezones",
      url: "/timezones",
      icon: Globe,
    },
    {
      title: "Daily Planner",
      url: "/daily-planner",
      icon: Calendar,
    },
    {
      title: "Password Generator",
      url: "/password-generator",
      icon: Key,
    },
    {
      title: "Pomodoro",
      url: "/pomodoro",
      icon: Clock,
    },
    {
      title: "Timer",
      url: "/timer",
      icon: Hourglass,
    },
    {
      title: "QR Code",
      url: "/qrcode",
      icon: QrCode,
    },
    {
      title: "Rock Paper Scissors",
      url: "/rock-paper-scissors",
      icon: Gamepad2,
    },
    {
      title: "Tic Tac Toe",
      url: "/tic-tac-toe",
      icon: Hash,
    },
    {
      title: "Stopwatch",
      url: "/stopwatch",
      icon: Timer,
    },
    {
      title: "JWT Tool",
      url: "/jwt",
      icon: ShieldCheck,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 flex items-start justify-center px-3">
        <Logo iconSize={24} textSize="1.1rem" className="transition-all duration-300" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {session?.user ? (
          <NavUser user={{
            name: session.user.name,
            email: session.user.email,
            avatar: session.user.image || ""
          }} />
        ) : (
          <Button 
            id="signin-trigger"
            variant="ghost" 
            className="w-full justify-start gap-4 px-4 h-12 text-muted-foreground hover:text-foreground hover:bg-accent transition-all group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center"
            onClick={() => setIsAuthModalOpen(true)}
          >
            <LogIn className="h-4 w-4 shrink-0" />
            <span className="truncate font-medium group-data-[collapsible=icon]:hidden">Sign In</span>
          </Button>
        )}
      </SidebarFooter>
      <SidebarRail />
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </Sidebar>
  )
}
