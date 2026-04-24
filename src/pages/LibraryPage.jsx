// src/pages/LibraryPage.jsx
import { useState, useEffect, useRef } from 'react'
import {
  getShelves, addShelf, updateShelf, deleteShelf,
  getBooksByShelf, addBook, deleteBook
} from '../utils/firestore'
import '../styles/LibraryPage.css'

const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY

const formatTime = (s) => {
  if (!s) return '0분'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}분`
}

// ─── 카카오 도서 검색 모달 ────────────────────────────
const BookSearchModal = ({ shelfId, onClose, onAdded }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(null) // 추가 중인 bookId
  const [added, setAdded] = useState(new Set()) // 이미 추가된 항목
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [isEnd, setIsEnd] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const searchBooks = async (searchQuery, pageNum = 1) => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError('')
    try {
      const res = await fetch(
        `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(searchQuery)}&size=10&page=${pageNum}`,
        { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } }
      )
      if (!res.ok) throw new Error(`API 오류: ${res.status}`)
      const data = await res.json()
      if (pageNum === 1) {
        setResults(data.documents || [])
      } else {
        setResults(prev => [...prev, ...(data.documents || [])])
      }
      setIsEnd(data.meta?.is_end ?? true)
      setPage(pageNum)
    } catch (e) {
      console.error(e)
      setError('검색 중 오류가 발생했습니다. API 키를 확인해주세요.')
    } finally {
      setSearching(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    setResults([])
    searchBooks(query, 1)
  }

  const handleAddBook = async (book) => {
    const bookId = book.isbn
    setAdding(bookId)
    try {
      await addBook({
        shelfId,
        title: book.title,
        author: book.authors?.join(', ') || '',
        publisher: book.publisher || '',
        isbn: book.isbn || '',
        coverUrl: book.thumbnail || '',
        description: book.contents || '',
        datetime: book.datetime || '',
        url:book.url || '',
      })
      setAdded(prev => new Set([...prev, bookId]))
      onAdded()
    } catch (e) {
      console.error(e)
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--search" onClick={e => e.stopPropagation()}>
        <div className="modal__handle" />
        <div className="modal__title">도서 검색</div>

        {/* 검색창 */}
        <div className="search-bar">
          <input
            ref={inputRef}
            type='text'
            id="bookSearch"
            placeholder="제목, 저자, ISBN 검색"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="button-primary"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
          >
            {searching ? '…' : '검색'}
          </button>
        </div>

        {error && <div className="search-error">{error}</div>}

        {/* 결과 */}
        <div className="search-results">
          {results.length === 0 && !searching && (
            <div className="empty-state">
              {query ? '검색 결과가 없습니다' : '책 제목이나 저자를 검색하세요'}
            </div>
          )}

          {results.map(book => {
            const bookId = book.isbn
            const isAdded = added.has(bookId)
            const isAdding = adding === bookId
            return (
              <div key={bookId} className="search-result-item">
                <div className="search-result-item__cover-wrap">
                  {book.thumbnail
                    ? <img src={book.thumbnail} alt={book.title} className="search-result-item__cover" />
                    : <div className="search-result-item__cover-placeholder">📖</div>
                  }
                </div>
                <div className="search-result-item__info">
                  <div className="search-result-item__title">{book.title}</div>
                  <div className="search-result-item__author">
                    {book.authors?.join(', ')}
                    {book.publisher && <span> · {book.publisher}</span>}
                  </div>
                  {book.contents && (
                    <div className="search-result-item__desc">{book.contents.slice(0, 60)}…</div>
                  )}
                </div>
                <button
                  className={`btn-add-book ${isAdded ? 'added' : ''}`}
                  onClick={() => !isAdded && handleAddBook(book)}
                  disabled={isAdding || isAdded}
                >
                  {isAdding ? 
                  (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M249.23-420q-24.75 0-42.37-17.63-17.63-17.62-17.63-42.37 0-24.75 17.63-42.37Q224.48-540 249.23-540q24.75 0 42.38 17.63 17.62 17.62 17.62 42.37 0 24.75-17.62 42.37Q273.98-420 249.23-420ZM480-420q-24.75 0-42.37-17.63Q420-455.25 420-480q0-24.75 17.63-42.37Q455.25-540 480-540q24.75 0 42.37 17.63Q540-504.75 540-480q0 24.75-17.63 42.37Q504.75-420 480-420Zm230.77 0q-24.75 0-42.38-17.63-17.62-17.62-17.62-42.37 0-24.75 17.62-42.37Q686.02-540 710.77-540q24.75 0 42.37 17.63 17.63 17.62 17.63 42.37 0 24.75-17.63 42.37Q735.52-420 710.77-420Z"/></svg>) 
                  : ( 
                      isAdded ? 
                        (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-253.85 168.62-467.23 211.38-510 382-339.38 748.62-706l42.76 42.77L382-253.85Z"/></svg>) 
                        : (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M450-450H220v-60h230v-230h60v230h230v60H510v230h-60v-230Z"/></svg>) 
                    )}
                </button>
              </div>
            )
          })}

          {/* 더 보기 */}
          {results.length > 0 && !isEnd && (
            <button
              className="btn-load-more"
              onClick={() => searchBooks(query, page + 1)}
              disabled={searching}
            >
              {searching ? '불러오는 중…' : '더 보기'}
            </button>
          )}
        </div>

        <button className="btn-modal-close" onClick={onClose} title="닫기">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z"/></svg>
        </button>
      </div>
    </div>
  )
}

// ─── Book Detail Modal ────────────────────────────────
const BookDetailModal = ({ book, onClose, onDelete }) => {
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="book-detail">
          <div className="book-detail__cover">
            {book.coverUrl
              ? <img src={book.coverUrl} alt={book.title}/>
              : <span>No image</span>
            }
          </div>
          <div className="book-detail__info">
            <div className="book-detail__title">{book.title}</div>
            <div className="book-detail__author">{book.author}</div>
            <div className="book-detail__stat">{book.publisher}</div>
            <div className="book-detail__url"><a href={book.url} target="_blank" title="새 창 열림">더보기</a></div>
          </div>
        </div>
        <div className="book-detail__time">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M367.69-850v-60h224.62v60H367.69ZM450-407.69h60v-224.62h-60v224.62ZM348-126.77q-61.85-26.77-108.15-73.08-46.31-46.3-73.08-108.15Q140-369.85 140-440t26.77-132q26.77-61.85 73.08-108.15 46.3-46.31 108.15-73.08Q409.85-780 480-780q60.08 0 115.73 20.39 55.65 20.38 103.35 58.38l49.84-49.84 42.15 42.15-49.84 49.84q38 47.7 58.38 103.35Q820-500.08 820-440q0 70.15-26.77 132-26.77 61.85-73.08 108.15-46.3 46.31-108.15 73.08Q550.15-100 480-100t-132-26.77ZM678-242q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82ZM480-440Z"/></svg>
          <span>누적 독서 시간: {formatTime(book.totalReadSeconds)}</span>
        </div>        
        {book.description && (
          <div className="book-detail__desc">{book.description}...</div>
        )}
        <div className="book-detail__actions">
          {!confirm
            ? <button className="button-primary" onClick={() => setConfirm(true)}>도서 삭제</button>
            : (<>
              <button className="button-primary danger" onClick={() => { onDelete(book.id); onClose() }}>정말 삭제하시려면 다시 클릭하세요</button>
              <button className="button-primary" onClick={() => { setConfirm(false) }}>취소</button>            
            </>)
          }
        </div>
        <button className="btn-modal-close" onClick={onClose} title="닫기">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z"/></svg>
        </button>        
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────
const LibraryPage = () => {
  const [shelves, setShelves] = useState([])
  const [selectedShelf, setSelectedShelf] = useState(null)
  const [books, setBooks] = useState([])
  const [newShelfName, setNewShelfName] = useState('')
  const [editingShelfId, setEditingShelfId] = useState(null)
  const [editingShelfName, setEditingShelfName] = useState('')
  const [showAddBook, setShowAddBook] = useState(false)
  const [detailBook, setDetailBook] = useState(null)
  const [shelfCounts, setShelfCounts] = useState({})
  const [loading, setLoading] = useState(true)

  const loadShelves = async () => {
    setLoading(true)
    try {
      const data = await getShelves()
      setShelves(data)
      const counts = {}
      await Promise.all(data.map(async (s) => {
        const bks = await getBooksByShelf(s.id)
        counts[s.id] = bks.length
      }))
      setShelfCounts(counts)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadBooks = async (shelf) => {
    try {
      const data = await getBooksByShelf(shelf.id)
      setBooks(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { loadShelves() }, [])

  const handleSelectShelf = (shelf) => {
    setSelectedShelf(shelf)
    loadBooks(shelf)
  }

  const handleAddShelf = async () => {
    if (!newShelfName.trim() || shelves.length >= 10) return
    await addShelf(newShelfName.trim())
    setNewShelfName('')
    loadShelves()
  }

  const handleRenameShelf = async (id) => {
    if (!editingShelfName.trim()) return
    await updateShelf(id, { name: editingShelfName.trim() })
    setEditingShelfId(null)
    loadShelves()
  }  

  const handleDeleteShelf = async (id) => {
    await deleteShelf(id)
    loadShelves()
  }

  const handleDeleteBook = async (id) => {
    await deleteBook(id)
    if (selectedShelf) loadBooks(selectedShelf)
  }

  const handleBooksRefresh = () => {
    if (selectedShelf) loadBooks(selectedShelf)
    loadShelves()
  }

  return (
    <div className="page library-page fade-in">
      {/* header */}
      <div className="header">
        <div>
          <div className="page__title">서재</div>
           <div className="page__description">책장은 최대 10개, 책장 1개당 책은 최대 20권까지 보관할 수 있습니다.</div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span
          className={`breadcrumb__item ${!selectedShelf ? 'active' : ''}`}
          onClick={() => setSelectedShelf(null)}
        >책장</span>
        {selectedShelf && (
          <>
            <span className="breadcrumb__sep">›</span>
            <span className="breadcrumb__item active">{selectedShelf.name}</span>
          </>
        )}
      </div>

      {/* Main Content */}
      <main className='container'>
        {!selectedShelf ? (
          // 책장 목록 페이지
          <>
            {/* 책장 리스트 */}
            {loading ? (
              <div className="empty-state">불러오는 중...</div>
            ) : (
              <div className="shelf-list list">
                {shelves.map(shelf => (
                  <div key={shelf.id} className="list-item" onClick={() => handleSelectShelf(shelf)}>
                    {/* 책장 아이콘 */}
                    <div className="list-item__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M140-58.08v-843.46h60v81.93h560v-81.93h60v843.46h-60V-140H200v81.92h-60ZM200-520h92.31v-155.38h215.38V-520H760v-239.62H200V-520Zm0 320h252.31v-155.38h215.38V-200H760v-260H200v260Zm152.31-320h95.38v-95.39h-95.38V-520Zm160 320h95.38v-95.39h-95.38V-200Zm-160-320h95.38-95.38Zm160 320h95.38-95.38Z"/></svg>
                    </div>
                    {/* 책 정보 */}
                    <div className="list-item__info">
                      {editingShelfId === shelf.id ? (
                        <input
                          className="shelf-name-input"
                          value={editingShelfName}
                          onChange={e => setEditingShelfName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenameShelf(shelf.id)
                            if (e.key === 'Escape') setEditingShelfId(null)
                          }}
                          onClick={e => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span className="shelf-item__name">{shelf.name}</span>
                      )}
                      <span className="list-item__description">{shelfCounts[shelf.id] ?? 0}권</span>
                    </div>
                    {/* 수정 버튼 */}
                    {editingShelfId === shelf.id ? (
                      <button
                        className="btn-shelf"
                        onClick={e => { e.stopPropagation(); handleRenameShelf(shelf.id) }}
                        title="책장 이름 수정 완료"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M382-253.85 168.62-467.23 211.38-510 382-339.38 748.62-706l42.76 42.77L382-253.85Z"/></svg>
                      </button>
                    ) : (
                      <button
                        className="btn-shelf"
                        onClick={e => {
                          e.stopPropagation()
                          setEditingShelfId(shelf.id)
                          setEditingShelfName(shelf.name)
                        }}
                        title="책장 이름 수정"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M200-200h50.46l409.46-409.46-50.46-50.46L200-250.46V-200Zm-60 60v-135.38l527.62-527.39q9.07-8.24 20.03-12.73 10.97-4.5 23-4.5t23.3 4.27q11.28 4.27 19.97 13.58l48.85 49.46q9.31 8.69 13.27 20 3.96 11.31 3.96 22.62 0 12.07-4.12 23.03-4.12 10.97-13.11 20.04L275.38-140H140Zm620.38-570.15-50.23-50.23 50.23 50.23Zm-126.13 75.9-24.79-25.67 50.46 50.46-25.67-24.79Z"/></svg>
                      </button>
                    )}                    
                    {/* 삭제 버튼 */}
                    <button
                      className="btn-shelf"
                      onClick={e => { e.stopPropagation(); handleDeleteShelf(shelf.id) }}
                      title="삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M292.31-140q-29.92 0-51.12-21.19Q220-182.39 220-212.31V-720h-40v-60h180v-35.38h240V-780h180v60h-40v507.69Q740-182 719-161q-21 21-51.31 21H292.31ZM680-720H280v507.69q0 5.39 3.46 8.85t8.85 3.46h375.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46V-720ZM376.16-280h59.99v-360h-59.99v360Zm147.69 0h59.99v-360h-59.99v360ZM280-720v520-520Z"/></svg>
                    </button>     
                    {/* 책장 바로가기 아이콘 */}
                    <div className="arrow-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M665.08-450H180v-60h485.08L437.23-737.85 480-780l300 300-300 300-42.77-42.15L665.08-450Z"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* 책장 추가 */}
            <div className='input-set-box add-shelf-form-box'>
              <label htmlFor='newShelf' className='input-label'>책장 추가</label>
              <div className="input-wrap">
                <input
                  type='text'
                  id="newShelf"
                  name="newShelf"
                  placeholder="새 책장 이름 (최대 10개)"
                  value={newShelfName}
                  onChange={e => setNewShelfName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddShelf()}
                  disabled={shelves.length >= 10}
                  className="input"
                />
                <button className="button-primary" onClick={handleAddShelf}>추가</button>
              </div>    
            </div>            
          </>
        ) : (
          // 책장 상세 페이지
          <>
            <div className="page__sub-title">{selectedShelf.name}</div>
            <div className="library-page__description">{books.length}/20&nbsp;권</div>
            {books.length < 20 && (
              <button className="add-book-btn" title="책 추가" onClick={() => setShowAddBook(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M520-410h60v-120h120v-60H580v-120h-60v120H400v60h120v120ZM322.31-260Q292-260 271-281q-21-21-21-51.31v-455.38Q250-818 271-839q21-21 51.31-21h455.38Q808-860 829-839q21 21 21 51.31v455.38Q850-302 829-281q-21 21-51.31 21H322.31Zm0-60h455.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H322.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v455.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85Zm-140 200Q152-120 131-141q-21-21-21-51.31v-515.38h60v515.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h515.38v60H182.31ZM310-800v480-480Z"/></svg>
              </button>
            )}
            {books.length === 0 ? (
              <div className="empty-state">
                책장에 책이 없습니다.<br />우측 하단 도서 검색으로 추가해보세요. (최대 20권)
              </div>
            ) : (
              <div className="book-grid">
                {books.map(book => (
                  <div key={book.id} className="book-card" onClick={() => setDetailBook(book)}>
                    <div className="book-card__cover-wrap">
                      {book.coverUrl
                        ? <img src={book.coverUrl} alt={book.title} className="book-card__cover" />
                        : <div className="book-card__cover-placeholder">No Image</div>
                      }
                      {book.totalReadSeconds > 0 && (
                        <div className="book-card__read-badge">{formatTime(book.totalReadSeconds)}</div>
                      )}
                    </div>
                    <div className="book-card__title">{book.title}</div>
                    <div className="book-card__author">{book.author}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showAddBook && selectedShelf && (
        <BookSearchModal
          shelfId={selectedShelf.id}
          onClose={() => setShowAddBook(false)}
          onAdded={handleBooksRefresh}
        />
      )}
      {detailBook && (
        <BookDetailModal
          book={detailBook}
          onClose={() => setDetailBook(null)}
          onDelete={handleDeleteBook}
        />
      )}
    </div>
  )
}

export default LibraryPage