// src/pages/ReadingPage.jsx
import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import { useTimer } from '../hooks/useTimer'
import { addLog, addReadingTime, getShelves, getBooksByShelf } from '../utils/firestore'
import '../styles/ReadingPage.css'

const formatSeconds = (s) => {
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
}

const formatTotal = (s) => {
  if (!s) return '0분'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `총 ${h}시간 ${m}분 읽음`
  return `총 ${m}분 읽음`
}

const ReadingPage = () => {
  const { settings, activeBook, setActiveBook } = useApp()
  const { seconds, running, start, pause, reset, format } = useTimer()
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [allBooks, setAllBooks] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const shelves = await getShelves()
        const bookArrays = await Promise.all(shelves.map(s => getBooksByShelf(s.id)))
        const books = bookArrays.flat().map((b, i) => ({
          ...b,
          shelfName: shelves[Math.floor(i / 20)]?.name || '서재',
        }))
        // rebuild with correct shelf mapping
        const result = []
        shelves.forEach(shelf => {
          bookArrays.forEach((books, si) => {
            if (si < shelves.length) {
              books.forEach(bk => {
                if (bk.shelfId === shelf.id) {
                  result.push({ ...bk, shelfName: shelf.name })
                }
              })
            }
          })
        })
        setAllBooks(result.length > 0 ? result : bookArrays.flat())
      } catch (e) {
        console.error(e)
      }
    }
    loadBooks()
  }, [])

  const handleSave = async () => {
    if (!activeBook || seconds === 0) return
    setSaving(true)
    try {
      await addReadingTime(activeBook.id, seconds)
      await addLog({
        bookId: activeBook.id,
        bookTitle: activeBook.title,
        bookAuthor: activeBook.author || '',
        duration: seconds,
      })
      reset();
      setActiveBook(null);
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleReset=()=>{
    reset();
    setActiveBook(null)
  }

  const bgStyle = {
    backgroundImage: `url(/images/${settings.bgImage})`,
  }

  return (
    <div className="page reading-page">
      <div className="reading-page__bg" style={bgStyle} />
      {/* <div className="reading-page__overlay" /> */}

      <div className="timer-card fade-in">
        {!activeBook ? (
          <div className="timer-card__no-book">
            <p>읽을 책을 선택해주세요</p>
            {/* <button className="button-primary" onClick={() => setSelectorOpen(true)}>
              책 선택하기
            </button> */}
          </div>
        ) : (
          <div className="timer-card__book-player">
            <div className='timer-card__timer-info-wrap'>
              <div className='timer-card__book-img'>{activeBook.coverUrl && <img src={activeBook.coverUrl} alt={activeBook.title} />}</div>
              <div className='timer-card__info'>
                {/* book info */}
                <div className="timer-card__book-meta">
                  <div className="timer-card__title">{activeBook.title}</div>
                </div>
                {/* time info */}
                <div className={`timer-card__clock ${running ? 'running' : ''}`}>
                  {format(seconds)}
                </div>                 
              </div>              
            </div>

            {/* timer control */}
            <div className="timer-card__controls">
              <button
                className="btn-timer"
                onClick={handleReset}
              >책 덮기</button>

              <button
                className="btn-timer primary"
                onClick={running ? pause : start}
              >
                {running ? '⏸' : '▶'}
              </button>
                    
              <button className="btn-timer" onClick={handleSave} disabled={seconds === 0 || saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>                           
          </div>
        )}
      </div>

      {/* Book Selector */}
      {!activeBook &&
      (<div className="book-selector">
        <button
          className="book-selector__toggle"
          onClick={() => setSelectorOpen(o => !o)}
        >
          <span>
            {activeBook ? activeBook.title : '책 선택'}
          </span>
          <span className='book-selector__icon'>
            {selectorOpen ? 
              (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z"/></svg>) 
              : 
              (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>) }
          </span>
        </button>

        {selectorOpen && (
          <div className="list book-selector__dropdown">
            {allBooks.length === 0 && (
              <div style={{ padding: '1rem', color: 'var(--gray-500)', fontSize: '0.8rem', textAlign: 'center' }}>
                서재에 책이 없습니다
              </div>
            )}
            {allBooks.map(book => (
              <div
                key={book.id}
                className={`list-item ${activeBook?.id === book.id ? 'selected' : ''}`}
                onClick={() => {
                  setActiveBook(book)
                  setSelectorOpen(false)
                  reset()
                }}
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="" className="list-item__thumb" />
                ) : (
                  <div className="list-item__thumb" style={{ display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>📖</div>
                )}
                <div className="list-item__info">
                  <div className="list-item__title">{book.title}</div>
                  <div className="list-item__description">{book.shelfName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>)
      }
    </div>
  )
}

export default ReadingPage
