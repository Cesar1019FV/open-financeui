import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Drawer } from '@/shared/ui/Drawer'
import { Topbar } from '@/widgets/topbar'
import { SidebarNavigation } from '@/widgets/sidebar-navigation'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-line bg-surface min-h-screen sticky top-0 h-screen overflow-y-auto">
          <div className="flex items-center gap-2 px-5 h-16 border-b border-line">
            <span className="font-display text-lg font-semibold text-brand-700">Finance</span>
          </div>
          <SidebarNavigation />
        </aside>

        <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} side="left" width="w-64" title="Finance">
          <SidebarNavigation onNavigate={() => setSidebarOpen(false)} />
        </Drawer>

        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main id="main-content" className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}