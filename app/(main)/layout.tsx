import { AppSidebar } from "@/components/app-sidebar"
import { MainHeader } from "@/components/main-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

/**
 * Main application layout that wraps all routes within the (main) group.
 * Provides the sidebar navigation and consistent header across different tools.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    /* SidebarProvider manages the state and context for the navigation sidebar */
    <SidebarProvider>
      {/* AppSidebar: The main navigation component on the left */}
      <AppSidebar />
      
      {/* SidebarInset: Container for the main content that shifts when sidebar is toggled */}
      <SidebarInset>
        {/* MainHeader: Top navigation/branding bar */}
        <MainHeader />
        
        {/* Main content area where individual tool pages are rendered */}
        <div className="flex flex-1 flex-col p-2 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
