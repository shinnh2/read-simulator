# 📖 READ SIMULATOR — 독서 기록 앱

소개
READ SIMULATOR는 책을 검색하여 나만의 가상 책장을 채워넣고, 타이머로 책을 읽을 수 있게 해주는 독서 기록 앱입니다. 

## 읽기 - 원하는 독서 공간을 배경으로 책을 읽고, 시간을 기록하세요.
원하는 감성의 독서 공간을 배경으로 두고, 원하는 책을 고르세요.
책을 고르면 시작 버튼을 눌러 책을 읽는 동안의 시간을 기록할 수 있습니다.
저장을 누르면 내가 어떤 책을 얼마나 읽었는지 기록으로 남겨둘 수 있고,
책 덮기를 클릭하면 다른 책을 가져와서 읽을 수 있습니다.

## 서재 - 내가 원하는 책으로 나만의 책장을 채워보세요.
최대 10개의 책장을 만들고 한 책장에 20개의 책으로 채울 수 있습니다.
원하는 책을 편하게 검색해서 책장에 등록해보세요.
어떤 책이 있는지 검색해보는 재미도 있고, 나만의 서재를 만들어가는 재미도 느낄 수 있습니다.

## 내 정보 - 저장된 기록을 보고 원하는대로 설정해보세요.
내가 책을 얼마나 읽고 몇 권을 읽었는지 한 눈에 볼 수 있습니다.
독서 기록을 통해 저장된 내용들을 볼 수도 있어요.
또한 책을 읽을 때의 배경을 내가 원하는 느낌의 장소로 바꿔보세요.

---

## 개발 정보

### 주요 기능
독서 타이머
도서 검색
독서 기록 통계
배경 변경

### 기술 스택
- Framework: React 18 + Vite
- Database: Firebase Firestore
- 도서 검색: 카카오 도서 검색 API
- 배포: GitHub Pages + GitHub Actions 활용하여 main에 커밋시 배포 자동화
- 코드 생성 및 수정: Claude
- 이미지 생성: Nano Banana 2

### 프로젝트 구조

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

### Firestore 보안 규칙 
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

### 커스터마이징 포인트

| 항목 | 위치 |
|------|------|
| 배경 이미지 목록 | `src/pages/MyPage.jsx` → `BG_IMAGES` |
| 책장 최대 개수 | `src/utils/firestore.js` → `limit(10)` |
| 책 최대 개수 | `src/utils/firestore.js` → `limit(20)` |

- 이미지 경로(권장 사이즈: 1920×1080 이상)
```
public/images/bg1.jpg
public/images/bg2.jpg
public/images/bg3.jpg
public/images/bg4.jpg
public/images/bg5.jpg
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

