// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt')

const app = express();
const port = 3000;
const MONGO_URI = 'mongodb://localhost:27017/parking_db'; // 여러분의 MongoDB URI

// 세션 미들웨어 설정
app.use(session({
    secret: 'your-secret-key', // 실제 프로덕션 환경에서는 보안을 위해 복잡하고 긴 키를 사용하세요.
    resave: false,
    saveUninitialized: true
}));

// POST 요청의 body를 파싱하기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, '/')));

// 로그인 페이지 (루트)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 로그인 처리
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 간단한 사용자 인증 (실제로는 데이터베이스와 연동해야 합니다)
    if (username === 'admin' && password === 'password') {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/welcome');
    } else {
        res.send('로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.');
    }
});

// 보호된 페이지 (로그인한 사용자만 접근 가능)
app.get('/welcome', (req, res) => {
    if (req.session.loggedin) {
        res.send(`<h1>환영합니다, ${req.session.username}!</h1><a href="/logout">로그아웃</a>`);
    } else {
        res.redirect('/');
    }
});

// 로그아웃 처리
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/welcome');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});


app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});



//app.use(express.json()); 
// 역할: 요청 본문이 JSON 형식일 때 이를 파싱합니다.
// 용도: 주로 API 클라이언트(예: React, Vue 같은 프론트엔드 애플리케이션, 모바일 앱)가 
// 서버로 데이터를 전송할 때 사용됩니다. JSON 문자열을 JavaScript 객체로 변환하여 
// req.body에 저장합니다. 
// app.use(express.urlencoded({ extended: true })); 
// 역할: 요청 본문이 URL-encoded 형식일 때 이를 파싱합니다.
// 용도: 주로 표준 HTML <form> 태그를 통해 데이터가 제출될 때 사용됩니다.
// extended: true 옵션은 중첩된 객체(nested objects) 구조를 
// 파싱할 수 있도록 설정합니다. false일 경우 Node.js 
// 내장 querystring 라이브러리를 사용하며, 
// true일 경우 더 강력한 qs 라이브러리를 사용합니다.
// 요약
// 이 두 줄의 코드를 추가함으로써, Express 앱은 다양한 형태의 요청 본문을 
// 자동으로 처리할 수 있게 됩니다. 이 미들웨어가 없으면 req.body 값은 undefined가 됩니다

// 미들웨어(Middleware)는 서버의 요청(Request) - 응답(Response) 과정에서
// 중간에 위치하여 특정 기능을 수행하는 함수라고 볼 수 있습니다