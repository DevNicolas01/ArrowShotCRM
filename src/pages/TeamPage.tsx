import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../hooks/useUsers'
import { updateUserRole, updateUserActive } from '../services/userService'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Field'
import { Spinner } from '../components/ui/FullPageSpinner'
import { USER_ROLE_LABEL } from '../types/user'
import type { UserRole } from '../types/common'

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-brand-100 text-brand-700',
  manager: 'bg-blue-100 text-blue-700',
  employee: 'bg-slate-100 text-slate-600',
  client: 'bg-amber-100 text-amber-700',
}

export function TeamPage() {
  const { profile } = useAuth()
  const { data: users, loading } = useUsers()

  const handleRoleChange = async (uid: string, role: UserRole) => {
    if (!profile) return
    try {
      await updateUserRole(uid, role, profile.id)
      toast.success('Papel atualizado')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao atualizar papel')
    }
  }

  const handleToggleActive = async (uid: string, active: boolean) => {
    if (!profile) return
    try {
      await updateUserActive(uid, active, profile.id)
      toast.success(active ? 'Usuário reativado' : 'Usuário desativado')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao atualizar status')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Equipe</h1>
        <p className="text-sm text-slate-400">Gerencie o papel de cada pessoa no CRM.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Pessoa</th>
                <th className="px-4 py-2.5 font-medium">Papel</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === profile?.id
                return (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} photoURL={u.photoURL} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-700">
                            {u.name} {isSelf && <span className="text-xs text-slate-400">(você)</span>}
                          </p>
                          <p className="truncate text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {isSelf ? (
                        <Badge className={ROLE_BADGE[u.role]}>{USER_ROLE_LABEL[u.role]}</Badge>
                      ) : (
                        <Select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="w-40"
                        >
                          {Object.entries(USER_ROLE_LABEL).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </Select>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {isSelf ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>
                      ) : (
                        <button
                          onClick={() => handleToggleActive(u.id, !u.active)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                            u.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {u.active ? 'Ativo' : 'Inativo'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
