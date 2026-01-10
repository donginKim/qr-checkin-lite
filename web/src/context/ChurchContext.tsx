import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getChurchName, getAllSettings } from '../api/settings'

type ChurchContextType = {
  churchName: string
  logoUrl: string
  loading: boolean
  refresh: () => void
}

const ChurchContext = createContext<ChurchContextType>({
  churchName: '구역',
  logoUrl: '',
  loading: true,
  refresh: () => {},
})

export function ChurchProvider({ children }: { children: ReactNode }) {
  const [churchName, setChurchName] = useState('구역')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadSettings() {
    setLoading(true)
    try {
      const settings = await getAllSettings()
      setChurchName(settings.church_name || '구역')
      setLogoUrl(settings.logo_url || '')
    } catch {
      // fallback
      const name = await getChurchName()
      setChurchName(name)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <ChurchContext.Provider value={{ churchName, logoUrl, loading, refresh: loadSettings }}>
      {children}
    </ChurchContext.Provider>
  )
}

export function useChurch() {
  return useContext(ChurchContext)
}

