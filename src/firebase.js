// src/firebase.js
// Firebase 프로젝트 콘솔에서 발급받은 config 값으로 교체하세요.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

if (!projectId || projectId === 'your_project_id') {
  console.warn(
    '⚠️  Firebase 설정이 없습니다. .env.local 파일에 실제 Firebase 프로젝트 값을 입력해주세요.\n' +
    '앱은 오프라인 모드로 실행됩니다 (데이터 저장 불가).'
  )
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: projectId || 'demo-placeholder',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 환경변수 로딩 확인 (개발 시 콘솔에서 확인)
if (import.meta.env.DEV) {
  console.log('[Firebase] projectId:', import.meta.env.VITE_FIREBASE_PROJECT_ID || '⚠️ 없음 — .env.local 확인 필요')
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const isFirebaseConfigured =
  !!projectId && projectId !== 'your_project_id'