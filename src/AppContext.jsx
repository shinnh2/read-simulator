// src/AppContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { getUserSettings, saveUserSettings, ensureDefaultShelf } from './utils/firestore'
import { useTimer } from './hooks/useTimer'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)             // Firebase Auth 유저
  const [settings, setSettings] = useState({ bgImage: 'bg1.jpg', username: '독서가' })
  const [activeBook, setActiveBook] = useState(null)
  const [loading, setLoading] = useState(true)       // Auth 확인 중
  const [authReady, setAuthReady] = useState(false)  // Auth 초기화 완료
  const timer = useTimer()

  // Auth 상태 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          await ensureDefaultShelf(firebaseUser.uid)
          const s = await getUserSettings(firebaseUser.uid)
          // Google displayName을 기본 username으로
          setSettings({
            bgImage: 'bg1.jpg',
            username: firebaseUser.displayName || '독서가',
            ...s,
          })
        } catch (e) {
          console.error('초기화 오류:', e)
        }
      } else {
        setUser(null)
        setSettings({ bgImage: 'bg1.jpg', username: '독서가' })
      }
      setLoading(false)
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      console.error('로그인 오류:', e)
    }
  }

  const logout = async () => {
    await signOut(auth)
    setActiveBook(null)
    timer.reset()
  }

  const updateSettings = async (data) => {
    if (!user) return
    const next = { ...settings, ...data }
    setSettings(next)
    await saveUserSettings(user.uid, next)
  }

  return (
    <AppContext.Provider value={{
      user,
      settings,
      updateSettings,
      activeBook,
      setActiveBook,
      loading,
      authReady,
      login,
      logout,
      timer,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)