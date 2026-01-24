# Express, MongoDB, React를 이용한 로그인 기능 구현 가이드

이 문서는 Node.js의 Express 프레임워크와 MongoDB를 사용하여 로그인 API 서버를 구축하고, React 프론트엔드에서 로그인 상태를 관리하는 전체 과정을 안내합니다.

**주요 기술 스택:**
- **Backend**: Node.js, Express, MongoDB (Mongoose), express-session, connect-mongo
- **Frontend**: React, React Context API
- **기타**: bcrypt (비밀번호 암호화), cors (CORS 이슈 해결), axios (HTTP 클라이언트)

* 프로젝트 구조
   * 백엔드 (Express & MongoDB) 설정
       * 필요한 라이브러리 설치
       * 서버 및 데이터베이스 연결 설정
       * 사용자 모델(Schema) 정의
       * 회원가입, 로그인, 로그아웃, 세션 확인을 위한 API 라우트 구현 (비밀번호 암호화
         포함)
   * 프론트엔드 (React & Redux) 설정
       * 필요한 라이브러리 설치
       * Redux Toolkit을 이용한 상태 관리 설정 (Store, Slice 생성)
       * 로그인 컴포넌트 및 UI 구현
       * 로그인 상태에 따른 조건부 렌더링 및 로그아웃 기능 구현
---

## 목차
1.  [프로젝트 구조](#1-프로젝트-구조)
2.  [백엔드 구현 (Express & MongoDB)](#2-백엔드-구조-express--mongodb)
    1.  [필요한 패키지 설치](#21-필요한-패키지-설치)
    2.  [MongoDB 모델 생성](#22-mongodb-모델-생성)
    3.  [Express 서버 및 세션 설정](#23-express-서버-및-세션-설정)
    4.  [인증 라우트(API) 구현](#24-인증-라우트api-구현)
3.  [프론트엔드 구현 (React & Context API)](#3-프론트엔드-구현-react--context-api)
    1.  [필요한 패키지 설치](#31-필요한-패키지-설치)
    2.  [AuthContext 생성 (상태 관리)](#32-authcontext-생성-상태-관리)
    3.  [App 컴포넌트에 AuthProvider 적용](#33-app-컴포넌트에-authprovider-적용)
    4.  [로그인 컴포넌트 구현](#34-로그인-컴포넌트-구현)
4.  [대안: Redux를 사용한 상태 관리](#4-대안-redux를-사용한-상태-관리)

---

## 1. 프로젝트 구조

아래는 추천하는 프로젝트 폴더 구조입니다.

```
/parking_web-r
├── /client           # React 프론트엔드
│   ├── /src
│   │   ├── /components
│   │   │   └── Login.js
│   │   ├── /context
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── /server           # Express 백엔드
    ├── /models
    │   └── User.js
    ├── /routes
    │   └── auth.js
    ├── server.js
    └── package.json
```

---

## 2. 백엔드 구현 (Express & MongoDB)

### 2.1. 필요한 패키지 설치

먼저 `server` 디렉토리로 이동하여 다음 패키지들을 설치합니다.

```bash
cd server
npm install express mongoose express-session connect-mongo bcrypt cors
```
- `express`: 웹 서버 프레임워크
- `mongoose`: MongoDB ORM
- `express-session`: 세션 관리를 위한 미들웨어
- `connect-mongo`: 세션을 MongoDB에 저장
- `bcrypt`: 비밀번호 암호화를 위한 라이브러리
- `cors`: 다른 포트의 프론트엔드 요청을 허용하기 위함

### 2.2. MongoDB 모델 생성

`server/models/User.js` 파일을 생성하여 사용자 정보를 저장할 스키마를 정의합니다.

```javascript
// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
```

### 2.3. Express 서버 및 세션 설정

`server/server.js` 파일을 다음과 같이 작성합니다.

```javascript
// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/parking_db'; // 여러분의 MongoDB URI

// MongoDB 연결
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000', // React 앱의 주소
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 설정
app.use(session({
  secret: 'your-secret-key', // 중요: 실제 프로덕션에서는 복잡한 키를 사용하세요.
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1일
  }
}));

// 라우트 설정
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 2.4. 인증 라우트(API) 구현

`server/routes/auth.js` 파일을 생성하여 로그인, 로그아웃, 상태 확인, 회원가입 API를 구현합니다.

```javascript
// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

const SALT_ROUNDS = 10;

// 회원가입 API
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: '회원가입 성공!' });
  } catch (error) {
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});


// 로그인 API
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '사용자가 존재하지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 세션에 사용자 정보 저장
    req.session.user = { id: user._id, username: user.username };
    res.status(200).json({ id: user._id, username: user.username });

  } catch (error) {
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 로그아웃 API
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: '로그아웃에 실패했습니다.' });
    }
    res.clearCookie('connect.sid'); // 세션 쿠키 삭제
    res.status(200).json({ message: '로그아웃 성공' });
  });
});

// 로그인 상태 확인 API
router.get('/status', (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ message: '로그인 상태가 아닙니다.' });
  }
});

module.exports = router;
```

---

## 3. 프론트엔드 구현 (React & Context API)

### 3.1. 필요한 패키지 설치

`client` 디렉토리로 이동하여 `axios`를 설치합니다.

```bash
cd client
npm install axios
```

### 3.2. AuthContext 생성 (상태 관리)

`client/src/context/AuthContext.js` 파일을 생성하여 로그인 상태와 관련 함수들을 전역적으로 관리합니다.

```javascript
// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Axios 인스턴스 설정 (CORS 쿠키 전송을 위함)
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await api.get('/auth/status');
        setUser(res.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      setUser(res.data);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};
```

### 3.3. App 컴포넌트에 AuthProvider 적용

`client/src/index.js` 또는 `client/src/App.js`에서 최상위 컴포넌트를 `AuthProvider`로 감싸줍니다.

```javascript
// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### 3.4. 로그인 컴포넌트 구현

`client/src/components/Login.js` 파일을 생성하고, `useAuth` 훅을 사용하여 로그인 폼과 상태 표시 로직을 작성합니다.

```javascript
// client/src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, loading, login, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.');
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (user) {
    return (
      <div>
        <h2>환영합니다, {user.username}님!</h2>
        <button onClick={logout}>로그아웃</button>
      </div>
    );
  }

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>사용자 이름:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>비밀번호:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}

export default Login;
```
이제 `App.js`에서 이 `Login` 컴포넌트를 불러와 사용하면 됩니다.

---

## 4. 대안: Redux를 사용한 상태 관리

만약 프로젝트 규모가 커서 Redux를 사용하고자 한다면, `Redux Toolkit`을 사용하는 것이 표준적인 방법입니다.

1.  **패키지 설치**: `npm install @reduxjs/toolkit react-redux`
2.  **Slice 생성**: 인증 상태(`user`, `loading`, `error`)와 리듀서를 포함하는 `authSlice.js` 파일을 만듭니다.
3.  **비동기 로직**: `createAsyncThunk`를 사용하여 `login`, `logout`, `checkStatus` 같은 비동기 API 요청을 처리하는 액션을 정의합니다.
4.  **Store 설정**: 생성한 slice를 Redux store에 추가합니다.
5.  **컴포넌트 연결**: React 컴포넌트에서 `useSelector`로 상태를 조회하고, `useDispatch`로 액션을 발생시켜 상태를 변경합니다.

Context API 방식에 비해 초기 설정이 복잡하지만, Redux DevTools를 통한 상태 추적, 미들웨어를 이용한 고급 로직 처리 등 복잡한 애플리케이션에서 장점을 가집니다. 로그인 기능만 구현할 경우에는 Context API가 더 빠르고 간단한 선택이 될 수 있습니다.
