// src/AppContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { getUserSettings, saveUserSettings, ensureDefaultShelf } from './utils/firestore'
import { useTimer } from './hooks/useTimer'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState({ bgImage: 'bg1.png', username: '독서가' })
  const [activeBook, setActiveBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const timer = useTimer()

  useEffect(() => {
    // 5초 안에 Firebase 응답 없으면 강제로 로딩 해제
    const timeout = setTimeout(() => setLoading(false), 5000)

    const init = async () => {
      try {
        await ensureDefaultShelf()
        const s = await getUserSettings()
        setSettings(s)
      } catch (e) {
        console.error('Firebase 초기화 오류:', e)
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    init()

    return () => clearTimeout(timeout)
  }, [])

  const updateSettings = async (data) => {
    const next = { ...settings, ...data }
    setSettings(next)
    await saveUserSettings(next)
  }

  return (
    <AppContext.Provider value={{ settings, updateSettings, activeBook, setActiveBook, loading, timer }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)