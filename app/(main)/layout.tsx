import { AppSidebar } from "@/components/app-sidebar"
import { MainHeader } from "@/components/main-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MainHeader />
        <div className="flex flex-1 flex-col p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
