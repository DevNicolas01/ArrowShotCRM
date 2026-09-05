import { Modal } from '../ui/Modal'
import { Spinner } from '../ui/FullPageSpinner'
import { useMemberEmergency } from '../../hooks/useMemberHealth'

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 last:border-0">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className="text-sm text-slate-800">{value?.trim() ? value : '—'}</span>
    </div>
  )
}

export function EmergencyInfoModal({
  open,
  onClose,
  memberId,
  memberName,
}: {
  open: boolean
  onClose: () => void
  memberId: string | null
  memberName: string
}) {
  const { data, loading } = useMemberEmergency(open ? memberId : null)

  return (
    <Modal open={open} onClose={onClose} title={`Informações de emergência — ${memberName}`}>
      <p className="mb-3 text-xs text-slate-400">
        Apenas os dados essenciais para uma emergência. As demais informações médicas são confidenciais.
      </p>
      {loading ? (
        <Spinner />
      ) : !data ? (
        <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
          Nenhuma informação de emergência cadastrada para {memberName}.
        </p>
      ) : (
        <div className="flex flex-col">
          <Row label="Tipo sanguíneo" value={data.bloodType} />
          <Row label="Alergias" value={data.allergies} />
          <Row label="Contato de emergência" value={data.emergencyContactName} />
          <Row label="Parentesco" value={data.emergencyContactRelationship} />
          <Row label="WhatsApp do contato" value={data.emergencyContactWhatsapp} />
        </div>
      )}
    </Modal>
  )
}
