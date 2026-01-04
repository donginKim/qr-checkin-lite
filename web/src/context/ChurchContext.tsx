import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getChurchName } from '../api/settings'

type ChurchContextType = {
  churchName: string
  loading: boolean
  refresh: () => void
}

const ChurchContext = createContext<ChurchContextType>({
  churchName: '성당',
  loading: true,
  refresh: () => {},
})

export function ChurchProvider({ children }: { children: ReactNode }) {
  const [churchName, setChurchName] = useState('성당')
  const [loading, setLoading] = useState(true)

  async function loadChurchName() {
    setLoading(true)
    try {
      const name = await getChurchName()
      setChurchName(name)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChurchName()
  }, [])

  return (
    <ChurchContext.Provider value={{ churchName, loading, refresh: loadChurchName }}>
      {children}
    </ChurchContext.Provider>
  )
}

export function useChurch() {
  return useContext(ChurchContext)
}

