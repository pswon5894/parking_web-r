const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

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