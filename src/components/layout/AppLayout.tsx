import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useTaskDueDateSweep } from '../../hooks/useTaskDueDateSweep'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useTaskDueDateSweep()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
