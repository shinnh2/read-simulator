// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './AppContext'
import Nav from './components/Nav'
import ReadingPage from './pages/ReadingPage'
import LibraryPage from './pages/LibraryPage'
import MyPage from './pages/MyPage'
import LoginPage from './pages/LoginPage'
import './styles/global.css'

const LoadingScreen = () => (
  <div className="app-loading">
    <div className="app-loading__dot" />
    <div className="app-loading__dot" />
    <div className="app-loading__dot" />
  </div>
)

const AppContent = () => {
  const { loading, user } = useApp()

  // Auth 확인 중
  if (loading) return <LoadingScreen />

  // 로그인 안 된 상태
  if (!user) return <LoginPage />

  // 로그인 완료
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/read" replace />} />
        <Route path="/read" element={<ReadingPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/me" element={<MyPage />} />
      </Routes>
      <Nav />
    </>
  )
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App