import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Kanban,
  Sparkles,
  CalendarDays,
  Megaphone,
  Target,
  UserPlus,
  BarChart3,
  Wallet,
  Lock,
  ChevronRight,
  ChevronDown,
  UserCog,
  GraduationCap,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTeamMembers } from '../../hooks/useTeamMembers'
import { Avatar } from '../ui/Avatar'
import { USER_ROLE_LABEL } from '../../types/user'

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/tarefas', label: 'Tarefas', icon: CheckSquare },
  { to: '/kanban', label: 'Kanban', icon: Kanban },
  { to: '/social-media', label: 'Social Media', icon: Sparkles },
  { to: '/calendario', label: 'Calendário', icon: CalendarDays },
]

const futureNav = [
  { label: 'Google Ads', icon: Target },
  { label: 'Meta Ads', icon: Megaphone },
  { label: 'Leads', icon: UserPlus },
  { label: 'Relatórios', icon: BarChart3 },
  { label: 'Financeiro', icon: Wallet },
]

const FUTURE_NAV_OPEN_KEY = 'sidebar:futureNavOpen'

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const { profile } = useAuth()
  const { data: teamMembers } = useTeamMembers()
  const canSeeUniversity = profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'employee'
  const myProfileCargo = teamMembers.find((m) => m.userId === profile?.id)?.jobTitle
  const [futureNavOpen, setFutureNavOpen] = useState(() => localStorage.getItem(FUTURE_NAV_OPEN_KEY) === 'true')

  const toggleFutureNav = () => {
    setFutureNavOpen((open) => {
      const next = !open
      localStorage.setItem(FUTURE_NAV_OPEN_KEY, String(next))
      return next
    })
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-navy-950 transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-4 py-5">
          <img src="/favicon.png" alt="" className="h-8 w-8 rounded-md" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold leading-tight text-white">Arrow Shot</p>
            <p className="text-[11px] leading-tight text-white/60">Marketing CRM</p>
          </div>
          <button onClick={onCloseMobile} className="rounded-md p-1 text-slate-400 hover:text-white md:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
          {mainNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out ${
                  isActive ? 'bg-brand-700 text-white' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {canSeeUniversity && (
            <NavLink
              to="/universidade"
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out ${
                  isActive ? 'bg-brand-700 text-white' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <GraduationCap size={18} />
              Universidade
            </NavLink>
          )}

          {profile?.role === 'admin' && (
            <NavLink
              to="/equipe"
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out ${
                  isActive ? 'bg-brand-700 text-white' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <UserCog size={18} />
              Equipe
            </NavLink>
          )}

          <div className="mt-5 mb-1 border-t border-navy-800 pt-4">
            <button
              onClick={toggleFutureNav}
              className="flex w-full items-center gap-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-300"
            >
              {futureNavOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Em breve
            </button>
          </div>
          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
              futureNavOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div
              className={`flex flex-col gap-0.5 overflow-hidden transition-opacity duration-200 ${
                futureNavOpen ? 'opacity-50' : 'opacity-0'
              }`}
            >
              {futureNav.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  title="Módulo em preparação"
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-500"
                >
                  <Icon size={18} />
                  {label}
                  <Lock size={11} className="ml-auto opacity-70" />
                </div>
              ))}
            </div>
          </div>
        </nav>

        {profile && (
          <div className="flex items-center gap-2.5 border-t border-navy-800 px-4 py-3">
            <Avatar name={profile.name} photoURL={profile.photoURL} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{profile.name}</p>
              <p className="truncate text-[11px] text-slate-400">{myProfileCargo ?? USER_ROLE_LABEL[profile.role]}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
