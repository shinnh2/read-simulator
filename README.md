# 📖 READER — 그레이스케일 독서 앱

Black & White 테마의 미니멀 독서 기록 앱. React + Vite + Firebase(Firestore) + gh-pages.

---

## 프로젝트 구조

```
reading-app/
├── public/
│   ├── favicon.svg
│   └── images/          ← 배경 이미지 직접 넣는 폴더
│       ├── bg1.jpg
│       ├── bg2.jpg
│       └── ...
├── src/
│   ├── components/
│   │   └── Nav.jsx
│   ├── hooks/
│   │   └── useTimer.js
│   ├── pages/
│   │   ├── ReadingPage.jsx
│   │   ├── LibraryPage.jsx
│   │   └── MyPage.jsx
│   ├── styles/
│   │   ├── global.css
│   │   ├── Nav.css
│   │   ├── ReadingPage.css
│   │   ├── LibraryPage.css
│   │   └── MyPage.css
│   ├── utils/
│   │   └── firestore.js
│   ├── AppContext.jsx
│   ├── App.jsx
│   ├── firebase.js
│   └── main.jsx
├── .env.local           ← Firebase 키 (git 제외)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 1단계 — 로컬 세팅

### 의존성 설치
```bash
npm install
```

### Firebase 설정

1. [Firebase Console](https://console.firebase.google.com) → 프로젝트 선택
2. **프로젝트 설정 > 일반 > 내 앱** 에서 웹 앱 추가 후 config 복사
3. `.env.local` 파일에 값 입력:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

4. Firebase Console → **Firestore Database** → 데이터베이스 만들기 (테스트 모드로 시작)

### Firestore 보안 규칙 (개발용)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> 프로덕션 배포 시 인증 기반 규칙으로 교체 필요

### 배경 이미지 넣기
```
public/images/bg1.jpg
public/images/bg2.jpg
public/images/bg3.jpg
public/images/bg4.jpg
public/images/bg5.jpg
```
- 권장 사이즈: 1920×1080 이상
- `src/pages/MyPage.jsx`의 `BG_IMAGES` 배열에서 파일명 수정 가능

### 로컬 실행
```bash
npm run dev
# → http://localhost:5173 에서 확인
```

---

## 2단계 — GitHub Pages 배포

### 준비
```bash
# GitHub에 레포지토리 생성 후 (예: reading-app)
git init
git remote add origin https://github.com/<USERNAME>/<REPO_NAME>.git
```

### vite.config.js 수정
```js
export default defineConfig({
  plugins: [react()],
  base: '/<REPO_NAME>/',  // 실제 레포 이름으로 교체
})
```

### package.json homepage 수정
```json
"homepage": "https://<USERNAME>.github.io/<REPO_NAME>"
```

### Firebase 환경변수 — GitHub Secrets 설정

> `.env.local`은 git에 올라가지 않으므로 GitHub Actions에 Secrets로 등록

1. GitHub 레포 → **Settings > Secrets and variables > Actions**
2. 아래 항목 각각 추가:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### GitHub Actions 워크플로우 생성
`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 수동 배포 (Actions 없이)
```bash
# 빌드 + gh-pages 브랜치로 직접 배포
npm run deploy
```
> `gh-pages` 패키지가 `dist/`를 자동으로 `gh-pages` 브랜치에 push

### GitHub Pages 활성화
1. 레포 → **Settings > Pages**
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` / `/(root)`
4. Save

### Firebase Authorized Domains 추가
1. Firebase Console → **Authentication > Settings > Authorized domains**
2. `<USERNAME>.github.io` 추가

---

## 3단계 — SPA 라우팅 처리 (중요!)

gh-pages에서 React Router 새로고침 시 404가 발생합니다.  
`public/404.html`을 만들어 해결:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.host + l.pathname.split('/').slice(0, 1 + 1).join('/') +
      '/?/' + l.pathname.slice(1) + l.search + l.hash
    );
  </script>
</head>
</html>
```

그리고 `index.html`의 `<head>`에 아래 스크립트 추가:

```html
<script>
  (function(l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&')
      }).join('?')
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

---

## Firestore 데이터 구조

```
shelves/
  {shelfId}/
    name: string
    createdAt: timestamp

books/
  {bookId}/
    shelfId: string
    title: string
    author: string
    coverUrl: string
    totalReadSeconds: number
    createdAt: timestamp

logs/
  {logId}/
    bookId: string
    bookTitle: string
    bookAuthor: string
    duration: number  (seconds)
    createdAt: timestamp

settings/
  user/
    username: string
    bgImage: string
```

---

## 커스터마이징 포인트

| 항목 | 위치 |
|------|------|
| 배경 이미지 목록 | `src/pages/MyPage.jsx` → `BG_IMAGES` |
| 색상 테마 | `src/styles/global.css` → `:root` |
| 폰트 | `src/styles/global.css` → Google Fonts import |
| 책장 최대 개수 | `src/utils/firestore.js` → `limit(10)` |
| 책 최대 개수 | `src/utils/firestore.js` → `limit(20)` |
