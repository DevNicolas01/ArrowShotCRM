import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Building2, Camera } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateClient } from '../../services/clientService'
import { compressImageToDataUrl } from '../../utils/imageToDataUrl'
import type { Client } from '../../types/client'

export function ClientLogoUpload({ client }: { client: Client }) {
  const { profile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (file: File | null) => {
    if (!file || !profile) return
    setUploading(true)
    try {
      const dataUrl = await compressImageToDataUrl(file, 320, 0.85)
      await updateClient(client.id, { logoUrl: dataUrl }, profile.id, profile.name)
      toast.success('Logo atualizada')
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar logo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      title="Trocar logo"
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-brand-500"
    >
      {client.logoUrl ? (
        <img src={client.logoUrl} alt={client.companyName} className="h-full w-full object-cover" />
      ) : (
        <Building2 size={18} />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <Camera size={15} className="text-white" />
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleChange(e.target.files?.[0] ?? null)}
      />
    </button>
  )
}
