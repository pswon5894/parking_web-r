// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt')
require('dotenv').config();

const userRoutes = require('./routes/user'); // user 라우터 import

const app = express();
const port = 5000;

config = {
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
};

// MongoDB Atlas URI 생성
const username = encodeURIComponent(config.DB_USERNAME);
const password = encodeURIComponent(config.DB_PASSWORD);
const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.wlgwwbm.mongodb.net/?appName=Cluster0`;

// MongoDB 연결
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB에 연결되었습니다.'))
  .catch(err => {
    console.error('❌ MongoDB 연결 오류:', err);
    process.exit(1);
  });

// // User 모델 import (반드시 mongoose 연결 후)
// const User = require('./models/User');

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3000', // React 앱 주소
  credentials: true // 쿠키 허용
}));

// 미들웨어 설정, POST 요청의 body를 파싱하기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션 미들웨어 설정
app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ 
    // store: MongoStore.create({ 
      mongoUrl: MONGODB_URI,
      touchAfter: 24 * 3600
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24시간
    }
}));

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, '/')));

// '/api/auth' 경로로 오는 모든 요청을 userRoutes로 전달
app.use('/api/auth', userRoutes);

// 에러 핸들링 미들웨어 (옵션)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: '서버 내부 오류가 발생했습니다.' });
});

// 로그인 페이지 (루트)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});