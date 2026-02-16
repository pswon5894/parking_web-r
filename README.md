# parking_web-r

주차 위치 공유 웹 (리액터)

# 웹 배포

웹 페이지 vercel 배포
https://parking-web-r.vercel.app/

백엔드 render 배포
https://parking-web-r.onrender.com

## 개발 동기
어머니와 이모가 차를 공유하는데, 주차 위치를 기억 못하거나 설명을 못해서

주차 위치를 기록하고 공유하는 앱을 만들게 됨

## UI/UX
주차 위치가 마커로 표시된 지도 화면

로그인 버튼, 위치 갱신 버튼, 위치 저장 버튼

## 프로젝트 구조

```
parking_web-r/
├── client/                             # js, react, context api, zustand
│   └── src/
│       ├── components/
│       │   ├── Login.js                # 로그인 폼과 관련된 UI 및 기능
│       │   └── MapComponent.js         # 지도에 위치 마커 표시
│       │   
│       ├── hook/                       
│       │   ├── useMapInitialization.js # 지도 초기화, 지도 리사이즈
│       │   ├── useMapLastLocation.js   # 지도 마지막 위치 서버에서 가져오기
│       │   ├── useMapLocation.js       # 지도 위치 표시, 업데이트
│       │   ├── useMapMarkers.js        # 지도 마커 관리 
│       │   ├── useLoginModal.js        # 로그인 모달
│       │   ├── useRegisterModal.js     # 회원가입 모달
│       │   └── useModalSwitch          # 전한 관리 모달
│       │
│       ├── context/
│       │   └── AuthContext.js          # Context API (인증 상태 관리), 세션 로그인 방식
│       └── theme/
│           ├── themeStore.js           # zustand 다크 모드 상태 관리
│           └── ThemeToggle.js          # zustand 다크 모드 토글 버튼
│
└── server/                             # node.js, express 웹 프레임워크
    ├── models/
    │   └── User.js                     # db 모델, 차량 주차 위치, 시간 저장
    ├── routes/
    │   └── user.js                     # 주차 마지막 위치, 주차 위치 저장 api
    └── server.js                       # 아이디 로그인등 관련 api

    DB-mongoDB
```

전체적인 흐름:

   1. 사용자는 웹 브라우저를 통해 client/ 디렉토리의 React 애플리케이션에 접근
   2. React 애플리케이션은 사용자 인터페이스를 렌더링하고, 사용자 입력 받음
   3. 데이터가 필요하거나 어떤 작업을 수행해야 할 때, React 애플리케이션은 server/ 디렉토리의 백엔드 API로 HTTP 요청
   4. 백엔드 서버(server.js)는 요청을 받아 해당 라우트(routes/)로 전달
   5. 라우트는 필요한 경우 models/를 통해 데이터베이스와 상호작용(데이터 조회, 저장, 수정, 삭제)
   6. 백엔드는 처리 결과를 클라이언트에 HTTP 응답으로 반환
   7. 클라이언트는 이 응답을 받아 UI를 업데이트하거나 다음 작업을 수행


### `server.js`

-   **역할:** 백엔드 서버의 메인 진입점입니다.
-   **주요 기능:**
    -   Express 앱을 생성하고 포트를 설정합니다.
    -   `mongoose`를 사용하여 MongoDB Atlas 데이터베이스에 연결합니다.
    -   `cors` 미들웨어를 설정하여 (React 클라이언트)에서의 요청을 허용합니다.
    -   `express.json()`, `express.urlencoded()` 미들웨어를 사용하여 POST 요청의 `body`를 파싱합니다.
    -   `express-session`과 `connect-mongo`를 사용하여 사용자 로그인 세션을 관리하고, 세션 정보를 MongoDB에 저장합니다.
    -   `/api/auth` 경로의 요청을 `routes/user.js` 파일로 라우팅합니다.

### `routes/user.js`

-   **역할:** 사용자 관련 API 엔드포인트를 정의합니다.
-   **주요 엔드포인트:**
    -   `POST /api/auth/register`: 신규 사용자 회원가입을 처리합니다.
    -   `POST /api/auth/login`: 사용자 로그인을 처리하고 세션을 생성합니다.
    -   `GET /api/auth/me`: 현재 로그인된 사용자 정보를 확인합니다.
    -   `GET /api/auth/logout`: 사용자 로그아웃을 처리하고 세션을 삭제합니다.
    -   `POST /api/auth/update-location`: 사용자의 현재 위치를 데이터베이스에 업데이트
    -   `POST /api/auth/save-parking-location`: 사용자의 주차 위치를 저장

### `models/User.js`

-   **역할:** MongoDB의 `users` 컬렉션에 저장될 데이터의 구조(Schema)를 정의
-   **스키마 구조:**
    -   `username`: 사용자 아이디 (문자열, 고유값)
    -   `password`: 사용자 비밀번호 (문자열)
    -   `location`: 사용자의 마지막 위치 (`{lat, lng}`)
    -   `parktime`: 주차 시간 (날짜)
    -   `imageBase64`: 주차 시 촬영한 사진 (Base64 인코딩된 문자열)
-   **추가 기능:**
    -   `pre('save')` 미들웨어를 사용하여 사용자가 저장되기 전 비밀번호를 `bcrypt`로 암호화
    -   `comparePassword` 메서드를 추가하여 로그인 시 입력된 비밀번호와 암호화된 비밀번호를 비교합니다.
---

## 프론트엔드 (Client)

### `App.js`

-   **역할:** 애플리케이션의 최상위 컴포넌트
-   **주요 기능:**
    -   애플리케이션의 전반적인 레이아웃을 구성합니다.
    -   `MapComponent`, `Login`, `ThemeToggle` 등 주요 컴포넌트들을 렌더링합니다.
    -   `useState`, `useCallback` 훅을 사용하여 지도 중심 좌표(`currentLatLng`), 마커 목록(`markers`) 등 상태를 관리
    -   주차 위치 저장 로직(`handleSaveLocation`)을 포함하며, 이 과정에서 좌표를 주소로 변환하고 구글 맵 링크를 클립보드에 복사하는 기능을 수행

### `components/MapComponent.js`

-   **역할:** 지도 표시와 관련된 모든 기능을 담당하는 핵심 컴포넌트입니다.
-   **주요 기능:**
    -   `useEffect` 훅 안에서 [Leaflet](https://leafletjs.com/) 라이브러리를 사용하여 지도를 초기화합니다.
    -   브라우저의 Geolocation API를 사용하여 사용자의 현재 위치를 탐색하고 지도에 표시 (`locationfound` 이벤트).
    -   `App.js`로부터 전달받은 `markers` 배열을 기반으로 사용자가 저장한 주차 위치들을 지도에 마커로 표시
    -   마커 클릭 시 정보(사진, 시간, 구글 맵 링크)가 담긴 팝업을 보여줍니다.
    -   `useAuth` 컨텍스트를 사용해 로그인된 사용자 정보를 가져와 위치 업데이트 API를 호출

### `components/Login.js`

-   **역할:** 사용자 로그인 및 회원가입 UI와 로직을 처리
-   **주요 기능:**
    -   사용자로부터 아이디와 비밀번호를 입력받습니다.
    -   '로그인' 또는 '회원가입' 버튼 클릭 시 `fetch`를 사용하여 백엔드의 해당 API(`/api/auth/login`, `/api/auth/register`)를 호출
    -   API 응답에 따라 로그인 상태를 `AuthContext`에 업데이트하고 사용자에게 피드백을 제공합니다.

### 상태 관리 (`context/AuthContext.js`, `store/authStore.js`)

-   **`AuthContext`:** React의 Context API를 사용하여 애플리케이션 전역에 로그인된 사용자 정보(`user`)와 로딩 상태(`loading`)를 제공합니다.
-   **`authStore` (Zustand):** `isLoggedIn`과 같은 간단한 상태를 관리하며, Context API와 함께 사용되어 상태 관리 로직을 보완합니다.

---

##  핵심 동작 흐름 (사용자 로그인)

1.  **사용자 입력:** 사용자가 `Login.js` 컴포넌트의 폼에 아이디와 비밀번호를 입력하고 '로그인' 버튼을 클릭합니다.
2.  **API 호출 (Client → Server):** `Login.js`는 `fetch`를 사용하여 `POST /api/auth/login` 엔드포인트로 사용자가 입력한 정보를 전송
3.  **요청 처리 (Server):**
    -   `server.js`는 이 요청을 `routes/user.js`로 전달합니다.
    -   라우터는 요청 `body`에서 `username`과 `password`를 받습니다.
    -   `User.findOne()`을 사용해 데이터베이스에서 해당 `username`을 가진 사용자를 찾습니다.
    -   찾은 사용자의 `comparePassword` 메서드를 호출하여 입력된 비밀번호와 데이터베이스의 암호화된 비밀번호를 비교합니다.
4.  **인증 및 세션 생성 (Server):**
    -   비밀번호가 일치하면, `req.session.userId`와 `req.session.username`에 사용자 정보를 저장합니다. `connect-mongo`에 의해 이 세션 정보는 MongoDB에 저장
    -   성공 응답 (`{ success: true, user: ... }`)을 클라이언트에 보냅니다.
5.  **상태 업데이트 (Client):**
    -   `Login.js`는 성공 응답을 받고, `AuthContext`의 로그인 함수를 호출
    -   `AuthContext`는 `user` 상태를 업데이트하고, 이로 인해 `MapComponent` 등 다른 컴포넌트들이 로그인된 사용자에 맞게 다시 렌더링됩니다.

---

1. 현재 모델 구조 (User 모델에 주차 정보 포함)(반정규화)
- 장점
- 단순한 구조: 유저와 주차 정보가 한 문서에 들어있음.
- 빠른 구현 가능.

- 단점
- 유저당 여러 차량/주차 기록을 저장하기 어려움. (차량공유이기에 문제 가능성 낮음)
- 주차 정보가 많아지면 User 문서가 비대해짐.
- 차량 정보와 주차 기록을 따로 관리하기 힘듦.

2. User 모델 + Car 모델 분리
- 장점
- 유저와 차량/주차 기록을 독립적으로 관리 가능.
- 한 유저가 여러 차량을 등록할 수 있음.
- 주차 기록을 별도로 쌓을 수 있어 확장성 높음.
- 나중에 차량별 속성(차종, 색상, 번호판 등)을 추가하기 쉬움.

- 단점
- 구조가 조금 복잡해짐.
- 관계를 맺어야 하므로 쿼리 시 populate 등을 사용해야 함.

3. 추천 방향
- 단순히 유저당 1개의 주차 정보만 저장 → User 모델에 포함해도 충분.
- 유저당 여러 차량/주차 기록을 저장 → Car 모델을 분리하는 것이 훨씬 유연하고 확장성 있음.
- 장기적으로 서비스 확장 가능성 (예: 주차장 관리, 차량별 기록, 결제 등) → 분리하는 것이 안전한 선택.

  추가 고려 사항
  유저가 주변에 주차단속 카메라를 db에 저장할 수 있게 하고 주변 일정 거리에게 경고