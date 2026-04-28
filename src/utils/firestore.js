// src/utils/firestore.js
import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, orderBy, limit,
  serverTimestamp, setDoc, where
} from 'firebase/firestore'
import { db } from '../firebase'

// 유저별 컬렉션 경로 헬퍼
const userCol = (uid, col) => collection(db, 'users', uid, col)
const userDoc = (uid, col, id) => doc(db, 'users', uid, col, id)

// ─── SHELVES ─────────────────────────────────────────
export const getShelves = async (uid) => {
  const q = query(userCol(uid, 'shelves'), orderBy('createdAt', 'asc'), limit(10))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addShelf = async (uid, name) => {
  return addDoc(userCol(uid, 'shelves'), {
    name,
    createdAt: serverTimestamp(),
  })
}

export const updateShelf = async (uid, id, data) => {
  return updateDoc(userDoc(uid, 'shelves', id), data)
}

export const deleteShelf = async (uid, id) => {
  return deleteDoc(userDoc(uid, 'shelves', id))
}

export const ensureDefaultShelf = async (uid) => {
  const snap = await getDocs(userCol(uid, 'shelves'))
  if (snap.empty) {
    await addDoc(userCol(uid, 'shelves'), {
      name: '내 서재',
      createdAt: serverTimestamp(),
    })
  }
}

// ─── BOOKS ───────────────────────────────────────────
export const getBooksByShelf = async (uid, shelfId) => {
  const q = query(
    userCol(uid, 'books'),
    where('shelfId', '==', shelfId),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
}

export const addBook = async (uid, bookData) => {
  return addDoc(userCol(uid, 'books'), {
    ...bookData,
    totalReadSeconds: 0,
    createdAt: serverTimestamp(),
  })
}

export const updateBook = async (uid, id, data) => {
  return updateDoc(userDoc(uid, 'books', id), data)
}

export const deleteBook = async (uid, id) => {
  return deleteDoc(userDoc(uid, 'books', id))
}

export const addReadingTime = async (uid, bookId, seconds) => {
  const ref = userDoc(uid, 'books', bookId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const current = snap.data().totalReadSeconds || 0
    await updateDoc(ref, { totalReadSeconds: current + seconds })
  }
}

// ─── LOGS ────────────────────────────────────────────
export const addLog = async (uid, logData) => {
  return addDoc(userCol(uid, 'logs'), {
    ...logData,
    createdAt: serverTimestamp(),
  })
}

export const getLogs = async (uid) => {
  const q = query(userCol(uid, 'logs'), orderBy('createdAt', 'desc'), limit(100))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── USER SETTINGS ───────────────────────────────────
export const getUserSettings = async (uid) => {
  const ref = doc(db, 'users', uid, 'settings', 'profile')
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : { bgImage: 'bg1.jpg', username: '독서가' }
}

export const saveUserSettings = async (uid, data) => {
  return setDoc(doc(db, 'users', uid, 'settings', 'profile'), data, { merge: true })
}