# parking_web-r

주차 위치 공유 웹 (리액터)

# 웹 배포

웹 페이지 vercel 배포
https://parking-web-r.vercel.app/

서버 render 배포
https://parking-web-r.onrender.com

서버 railway 배포
https://parkingweb-r-production.up.railway.app

## 개발 동기
어머니와 이모가 차를 공유하는데, 주차 위치를 기억 못하거나 설명을 못해서

주차 위치를 기록하고 공유하는 앱을 만들게 되었다

## UI/UX
주차 위치가 마커로 표시된 지도 화면

로그인 버튼, 위치 갱신 버튼, 위치 저장 버튼

## 프로젝트 구조

```
parking_web-r/
├── client/           # React 프론트엔드
│   ├── public/
│   └── src/
│       ├── components/ # 지도, 로그인 등 UI 컴포넌트
│       ├── context/    # React Context API (인증 상태 관리)
│       ├── App.js      # 메인 애플리케이션 컴포넌트
│       └── index.js    # 프론트엔드 시작점
│
└── server/           # Node.js/Express 백엔드
    ├── models/       # MongoDB 데이터 스키마 (Mongoose)
    │   └── User.js
    ├── routes/       # API 엔드포인트 정의
    │   └── user.js
    └── server.js     # 백엔드 서버 시작점
```

---
```
parking_web-r/
├── client/
│   └── src/
│       ├── components/
│       │   ├── Login.js                #로그인 폼과 관련된 UI 및 기능
│       │   ├── MapComponent.js         #지도를 표시하고 상호작용
│       │   ├── SaveButton.js
│       │   └── useParkingMarkers.js
│       ├── context/
│       │   └── AuthContext.js
│       └── theme/
│           ├── themeStore.js
│           └── ThemeToggle.js
│
└── server/
    ├── models/
    │   └── User.js
    ├── routes/
    │   └── user.js
    └── server.js

```

##  백엔드 (Server)

백엔드는 Express 프레임워크를 사용하여 API 서버를 구축합니다.

### `server.js`

-   **역할:** 백엔드 서버의 메인 진입점입니다.
-   **주요 기능:**
    -   Express 앱을 생성하고 포트(`5000`)를 설정합니다.
    -   `mongoose`를 사용하여 MongoDB Atlas 데이터베이스에 연결합니다.
    -   `cors` 미들웨어를 설정하여 `localhost:3000` (React 앱)에서의 요청을 허용합니다.
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
    -   `POST /api/auth/update-location`: 사용자의 현재 위치를 데이터베이스에 업데이트합니다.
    -   `POST /api/auth/save-parking-location`: 사용자의 주차 위치를 저장합니다.

### `models/User.js`

-   **역할:** MongoDB의 `users` 컬렉션에 저장될 데이터의 구조(Schema)를 정의합니다.
-   **스키마 구조:**
    -   `username`: 사용자 아이디 (문자열, 고유값)
    -   `password`: 사용자 비밀번호 (문자열)
    -   `location`: 사용자의 마지막 위치 (`{lat, lng}`)
    -   `parktime`: 주차 시간 (날짜)
    -   `imageBase64`: 주차 시 촬영한 사진 (Base64 인코딩된 문자열)
-   **추가 기능:**
    -   `pre('save')` 미들웨어를 사용하여 사용자가 저장되기 전 비밀번호를 `bcrypt`로 암호화합니다.
    -   `comparePassword` 메서드를 추가하여 로그인 시 입력된 비밀번호와 암호화된 비밀번호를 비교합니다.

---

## 프론트엔드 (Client)

### `App.js`

-   **역할:** 애플리케이션의 최상위 컴포넌트입니다.
-   **주요 기능:**
    -   애플리케이션의 전반적인 레이아웃을 구성합니다.
    -   `MapComponent`, `Login`, `ThemeToggle` 등 주요 컴포넌트들을 렌더링합니다.
    -   `useState`, `useCallback` 훅을 사용하여 지도 중심 좌표(`currentLatLng`), 마커 목록(`markers`) 등 상태를 관리합니다.
    -   주차 위치 저장 로직(`handleSaveLocation`)을 포함하며, 이 과정에서 좌표를 주소로 변환하고 구글 맵 링크를 클립보드에 복사하는 기능을 수행합니다.

### `components/MapComponent.js`

-   **역할:** 지도 표시와 관련된 모든 기능을 담당하는 핵심 컴포넌트입니다.
-   **주요 기능:**
    -   `useEffect` 훅 안에서 [Leaflet](https://leafletjs.com/) 라이브러리를 사용하여 지도를 초기화합니다.
    -   브라우저의 Geolocation API를 사용하여 사용자의 현재 위치를 탐색하고 지도에 표시합니다 (`locationfound` 이벤트).
    -   `App.js`로부터 전달받은 `markers` 배열을 기반으로 사용자가 저장한 주차 위치들을 지도에 마커로 표시합니다.
    -   마커 클릭 시 정보(사진, 시간, 구글 맵 링크)가 담긴 팝업을 보여줍니다.
    -   `useAuth` 컨텍스트를 사용해 로그인된 사용자 정보를 가져와 위치 업데이트 API를 호출합니다.

### `components/Login.js`

-   **역할:** 사용자 로그인 및 회원가입 UI와 로직을 처리합니다.
-   **주요 기능:**
    -   사용자로부터 아이디와 비밀번호를 입력받습니다.
    -   '로그인' 또는 '회원가입' 버튼 클릭 시 `fetch`를 사용하여 백엔드의 해당 API(`/api/auth/login`, `/api/auth/register`)를 호출합니다.
    -   API 응답에 따라 로그인 상태를 `AuthContext`에 업데이트하고 사용자에게 피드백을 제공합니다.

### 상태 관리 (`context/AuthContext.js`, `store/authStore.js`)

-   **`AuthContext`:** React의 Context API를 사용하여 애플리케이션 전역에 로그인된 사용자 정보(`user`)와 로딩 상태(`loading`)를 제공합니다.
-   **`authStore` (Zustand):** `isLoggedIn`과 같은 간단한 상태를 관리하며, Context API와 함께 사용되어 상태 관리 로직을 보완합니다.

---

##  핵심 동작 흐름 (사용자 로그인)

1.  **사용자 입력:** 사용자가 `Login.js` 컴포넌트의 폼에 아이디와 비밀번호를 입력하고 '로그인' 버튼을 클릭합니다.
2.  **API 호출 (Client → Server):** `Login.js`는 `fetch`를 사용하여 `POST /api/auth/login` 엔드포인트로 사용자가 입력한 정보를 전송합니다.
3.  **요청 처리 (Server):**
    -   `server.js`는 이 요청을 `routes/user.js`로 전달합니다.
    -   라우터는 요청 `body`에서 `username`과 `password`를 받습니다.
    -   `User.findOne()`을 사용해 데이터베이스에서 해당 `username`을 가진 사용자를 찾습니다.
    -   찾은 사용자의 `comparePassword` 메서드를 호출하여 입력된 비밀번호와 데이터베이스의 암호화된 비밀번호를 비교합니다.
4.  **인증 및 세션 생성 (Server):**
    -   비밀번호가 일치하면, `req.session.userId`와 `req.session.username`에 사용자 정보를 저장합니다. `connect-mongo`에 의해 이 세션 정보는 MongoDB에 저장됩니다.
    -   성공 응답 (`{ success: true, user: ... }`)을 클라이언트에 보냅니다.
5.  **상태 업데이트 (Client):**
    -   `Login.js`는 성공 응답을 받고, `AuthContext`의 로그인 함수를 호출합니다.
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

MongoDB는 유연한 스키마와 빠른 개발 속도 때문에 스타트업이나 프로토타입에 적합하지만, 주차 관리처럼 관계형 데이터가 많거나 트랜잭션 안정성이 중요한 경우에는 PostgreSQL 같은 RDBMS가 더 나은 선택




✦ 프로젝트 구조 설명

  ---
  parking_web-r/
  이 디렉토리는 전체 프로젝트의 최상위 루트입니다. 클라이언트(프론트엔드)와 서버(백엔드) 애플리케이션을 모두 포함하며, 하나의 통합된 프로젝트로 관리됩니다.

  --
  client/
  React 기반의 프론트엔드 애플리케이션을 담당하는 디렉토리입니다. 사용자 인터페이스(UI)를 렌더링하고, 사용자 입력을 처리하며, 백엔드 API와 통신하여 데이터를        
  주고받는 역할을 합니다.


   * `public/`:
       * 웹팩(Webpack)과 같은 번들러에 의해 처리되지 않고, 빌드 시 그대로 복사되는 정적 파일들을 담는 디렉토리입니다. index.html 파일이 여기에 위치하며, 웹
         애플리케이션의 진입점 역할을 합니다. 파비콘, 로고 이미지, 매니페스트 파일 등도 포함될 수 있습니다.

   * `src/`:
       * React 애플리케이션의 실제 소스 코드가 위치하는 핵심 디렉토리입니다.


       * `components/`:
           * 재사용 가능한 UI 컴포넌트들을 모아둔 디렉토리입니다. 예를 들어 MapComponent.js는 지도를 표시하고 상호작용하는 로직을, Login.js는 로그인 폼과 관련된 UI 
             및 기능을, SaveButton.js는 주차 위치 저장 버튼을, ImageModal.js는 이미지 모달을 담당하는 식입니다. 각 컴포넌트는 자체적인 상태와 로직을 가질 수        
             있습니다.


       * `context/`:
           * React의 Context API를 사용하여 전역 상태를 관리하는 데 사용됩니다. AuthContext.js는 사용자 인증 상태(로그인 여부, 사용자 정보 등)를 애플리케이션 전반에
             걸쳐 효율적으로 공유하고 접근할 수 있도록 하는 역할을 합니다.


       * `store/`:
           * zustand와 같은 상태 관리 라이브러리를 사용하여 전역 상태를 관리하는 디렉토리입니다. authStore.js는 인증 관련 상태를 zustand 스토어로 관리하며,
             themeStore.js는 애플리케이션 테마와 관련된 상태를 관리합니다. context/와 함께 복잡한 상태 관리 요구사항을 처리하는 데 사용됩니다.


       * `App.js`:
           * 메인 애플리케이션 컴포넌트입니다. 일반적으로 라우팅(React Router 등 사용), 전역적인 레이아웃 구성, 그리고 다른 주요 컴포넌트들을 조합하여
             애플리케이션의 전반적인 구조를 정의합니다.


       * `index.js`:
           * React 애플리케이션의 시작점입니다. public/index.html 파일에 React 컴포넌트를 마운트(렌더링)하는 역할을 합니다. 여기에서 App.js 컴포넌트를 불러와       
             렌더링합니다.

  ---


  server/
  Node.js와 Express.js 프레임워크를 사용하여 구축된 백엔드 애플리케이션을 담당하는 디렉토리입니다. 클라이언트의 요청을 받아 데이터를 처리하고, 데이터베이스와       
  상호작용하며, 클라이언트에 응답을 반환합니다.


   * `models/`:
       * MongoDB 데이터베이스의 스키마(데이터 구조)를 정의하는 디렉토리입니다. Mongoose ODM(Object Data Modeling) 라이브러리를 사용하여 User.js와 같이 사용자       
         데이터의 구조, 유효성 검사, 관계 등을 정의합니다. 이는 데이터베이스와의 상호작용을 추상화하고 코드를 구조화하는 데 도움을 줍니다.


   * `routes/`:
       * 클라이언트가 접근할 수 있는 API 엔드포인트들을 정의하는 디렉토리입니다. 예를 들어 user.js는 사용자 등록, 로그인, 프로필 정보 조회, 주차 위치 저장 등 사용자
         관련 요청을 처리하는 라우트 핸들러들을 포함합니다. 각 라우트는 특정 HTTP 메소드(GET, POST 등)와 URL 경로에 매핑됩니다.


   * `server.js`:
       * 백엔드 서버의 시작점입니다. Express 애플리케이션을 초기화하고, 미들웨어를 설정하며(예: CORS, body-parser), 데이터베이스 연결을 설정하고, 정의된 라우트들을 
         로드하여 특정 포트에서 서버를 시작하는 역할을 합니다.

  ---


  전체적인 흐름:


   1. 사용자는 웹 브라우저를 통해 client/ 디렉토리의 React 애플리케이션에 접근합니다.
   2. React 애플리케이션은 사용자 인터페이스를 렌더링하고, 사용자 입력을 받습니다.
   3. 데이터가 필요하거나 어떤 작업을 수행해야 할 때, React 애플리케이션은 server/ 디렉토리의 백엔드 API로 HTTP 요청을 보냅니다.
   4. 백엔드 서버(server.js)는 요청을 받아 해당 라우트(routes/)로 전달합니다.
   5. 라우트는 필요한 경우 models/를 통해 데이터베이스와 상호작용(데이터 조회, 저장, 수정, 삭제)합니다.
   6. 백엔드는 처리 결과를 클라이언트에 HTTP 응답으로 반환합니다.
   7. 클라이언트는 이 응답을 받아 UI를 업데이트하거나 다음 작업을 수행합니다.


  이러한 분리된 구조는 각 부분이 독립적으로 개발되고 관리될 수 있게 하여, 프로젝트의 확장성과 유지보수성을 높이는 장점이 있습니다.