// src/utils/firestore.js
import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, orderBy, limit,
  serverTimestamp, setDoc, where
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── SHELVES ─────────────────────────────────────────
export const getShelves = async () => {
  // orderBy 단독 사용 → 복합 인덱스 불필요
  const q = query(collection(db, 'shelves'), orderBy('createdAt', 'asc'), limit(10))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addShelf = async (name) => {
  return addDoc(collection(db, 'shelves'), {
    name,
    createdAt: serverTimestamp(),
  })
}

export const updateShelf = async (id, data) => {
  return updateDoc(doc(db, 'shelves', id), data)
}

export const deleteShelf = async (id) => {
  return deleteDoc(doc(db, 'shelves', id))
}

export const ensureDefaultShelf = async () => {
  const snap = await getDocs(collection(db, 'shelves'))
  if (snap.empty) {
    await addDoc(collection(db, 'shelves'), {
      name: '내 서재',
      createdAt: serverTimestamp(),
    })
  }
}

// ─── BOOKS ───────────────────────────────────────────
// where + orderBy 조합은 복합 인덱스가 필요하므로
// where만 사용 후 JS에서 정렬합니다
export const getBooksByShelf = async (shelfId) => {
  const q = query(
    collection(db, 'books'),
    where('shelfId', '==', shelfId),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
}

export const addBook = async (bookData) => {
  return addDoc(collection(db, 'books'), {
    ...bookData,
    totalReadSeconds: 0,
    createdAt: serverTimestamp(),
  })
}

export const updateBook = async (id, data) => {
  return updateDoc(doc(db, 'books', id), data)
}

export const deleteBook = async (id) => {
  return deleteDoc(doc(db, 'books', id))
}

export const addReadingTime = async (bookId, seconds) => {
  const ref = doc(db, 'books', bookId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const current = snap.data().totalReadSeconds || 0
    await updateDoc(ref, { totalReadSeconds: current + seconds })
  }
}

// ─── LOGS ────────────────────────────────────────────
export const addLog = async (logData) => {
  return addDoc(collection(db, 'logs'), {
    ...logData,
    createdAt: serverTimestamp(),
  })
}

export const getLogs = async () => {
  // orderBy 단독 → 인덱스 자동 생성됨
  const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(100))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── USER SETTINGS ───────────────────────────────────
export const getUserSettings = async () => {
  const ref = doc(db, 'settings', 'user')
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : { bgImage: 'bg1.jpg', username: '독서가' }
}

export const saveUserSettings = async (data) => {
  return setDoc(doc(db, 'settings', 'user'), data, { merge: true })
}