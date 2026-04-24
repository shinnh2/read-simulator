// src/pages/MyPage.jsx
import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import { getLogs } from '../utils/firestore'
// import '../styles/MyPage.css'

// 로컬 /public/images/ 폴더에 있는 배경 이미지 목록
// 실제 파일명에 맞게 수정하세요
const BG_IMAGES = [
  { file: 'bg1.png', label: '한낮의 식물 도서관' },
  { file: 'bg2.png', label: '모던 북카페' },
  { file: 'bg3.png', label: '한옥 북카페' },
  { file: 'bg4.png', label: '인더스트리얼 카페' },
  { file: 'bg7.png', label: '유럽 감성 서점' },
]

const formatDuration = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}분 ${sec}초`
  return `${sec}초`
}

const formatDate = (ts) => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const MyPage = () => {
  const { settings, updateSettings } = useApp()
  const [logs, setLogs] = useState([])
  const [username, setUsername] = useState(settings.username || '독서가')
  const [editingName, setEditingName] = useState(false)

  const currentBg = BG_IMAGES.find(bg => bg.file === settings.bgImage)

  useEffect(() => {
    getLogs().then(setLogs).catch(console.error)
    
  }, [])

  useEffect(() => {
    setUsername(settings.username || '독서가')
  }, [settings.username])

  const totalSeconds = logs.reduce((sum, l) => sum + (l.duration || 0), 0)
  const uniqueBooks = new Set(logs.map(l => l.bookId)).size

  const handleSaveName = async () => {
    if (username.trim()) {
      await updateSettings({ username: username.trim() })
      setEditingName(false)
    }
  }

  const handleBgChange = async (file) => {
    await updateSettings({ bgImage: file })
  }

  const baseUrl = import.meta.env.BASE_URL || '/'

  return (
    <div className="page my-page fade-in">
      {/* Profile Header */}
      <div className="header">
        <div className="profile-header__content">
          <div className="profile-header__avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M381.04-533.35Q340-574.38 340-632.31q0-57.92 41.04-98.96 41.04-41.04 98.96-41.04 57.92 0 98.96 41.04Q620-690.23 620-632.31q0 57.93-41.04 98.96-41.04 41.04-98.96 41.04-57.92 0-98.96-41.04ZM180-187.69v-88.93q0-29.38 15.96-54.42 15.96-25.04 42.66-38.5 59.3-29.07 119.65-43.61 60.35-14.54 121.73-14.54t121.73 14.54q60.35 14.54 119.65 43.61 26.7 13.46 42.66 38.5Q780-306 780-276.62v88.93H180Zm60-60h480v-28.93q0-12.15-7.04-22.5-7.04-10.34-19.11-16.88-51.7-25.46-105.42-38.58Q534.7-367.69 480-367.69q-54.7 0-108.43 13.11-53.72 13.12-105.42 38.58-12.07 6.54-19.11 16.88-7.04 10.35-7.04 22.5v28.93Zm296.5-328.12q23.5-23.5 23.5-56.5t-23.5-56.5q-23.5-23.5-56.5-23.5t-56.5 23.5q-23.5 23.5-23.5 56.5t23.5 56.5q23.5 23.5 56.5 23.5t56.5-23.5Zm-56.5-56.5Zm0 384.62Z"/></svg>
          </div>
          <div className="page__title">{settings.username || '독서가'}</div>
          <div className="page__description">READ SIMULATOR</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-cell">
          <div className="stat-cell__value">{logs.length}</div>
          <div className="stat-cell__label">기록</div>
        </div>
        <div className="stat-cell">
          <div className="stat-cell__value">{uniqueBooks}</div>
          <div className="stat-cell__label">읽은 책</div>
        </div>
        <div className="stat-cell">
          <div className="stat-cell__value">
            {Math.floor(totalSeconds / 3600) > 0
              ? `${Math.floor(totalSeconds / 3600)}h`
              : `${Math.floor(totalSeconds / 60)}m`
            }
          </div>
          <div className="stat-cell__label">총 시간</div>
        </div>
      </div>

      {/* Username */}
      <div className="my-page__section">
        <div className="my-page__section-title">이름 변경</div>
        <div className="username-form">
          {editingName ? (
            <>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                autoFocus
              />
              <button className="btn-name-action" title="저장" onClick={handleSaveName}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-253.85 168.62-467.23 211.38-510 382-339.38 748.62-706l42.76 42.77L382-253.85Z"/></svg>
              </button>
              <button className="btn-name-action" title="취소" onClick={() => setEditingName(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z"/></svg>
              </button>
            </>
          ) : (
            <>
              <button className="btn-name-action" title="수정" onClick={() => setEditingName(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M200-200h50.46l409.46-409.46-50.46-50.46L200-250.46V-200Zm-60 60v-135.38l527.62-527.39q9.07-8.24 20.03-12.73 10.97-4.5 23-4.5t23.3 4.27q11.28 4.27 19.97 13.58l48.85 49.46q9.31 8.69 13.27 20 3.96 11.31 3.96 22.62 0 12.07-4.12 23.03-4.12 10.97-13.11 20.04L275.38-140H140Zm620.38-570.15-50.23-50.23 50.23 50.23Zm-126.13 75.9-24.79-25.67 50.46 50.46-25.67-24.79Z"/></svg>              
              </button>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>
                {settings.username || '독서가'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* BG Image Picker */}
      <div className="my-page__section">
        <div className="my-page__section-title">배경 이미지 선택</div>
        <div className="my-page__section-description">현재 선택된 배경: <span>{currentBg?.label ?? settings.bgImage}</span></div>
        <div className="bg-image-grid">
          {BG_IMAGES.map(bg => (
            <div
              key={bg.file}
              className={`bg-thumb ${settings.bgImage === bg.file ? 'selected' : ''}`}
              style={{ backgroundImage: `url(${baseUrl}images/${bg.file})` }}
              onClick={() => handleBgChange(bg.file)}
            >
              <div className="bg-thumb__label">{bg.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Log */}
      <div className="my-page__section">
        <div className="my-page__section-title">독서 기록</div>
        {logs.length === 0 ? (
          <div className="empty-state">아직 독서 기록이 없습니다</div>
        ) : (
          <div className="log-list">
            {logs.map(log => (
              <div key={log.id} className="log-item">
                <div className="log-item__dot" />
                <div className="log-item__content">
                  <div className="log-item__title">{log.bookTitle}</div>
                  <div className="log-item__duration">{formatDuration(log.duration)}</div>
                </div>
                <div className="log-item__time">{formatDate(log.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPage
