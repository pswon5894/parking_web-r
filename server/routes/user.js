// server/routes/user.js
const express = require('express');
const router = require('express').Router();
const User = require('../models/User');
// const mongoose = require('mongoose');
// const objectId = new mongoose.Types.ObjectId(userId);


// 회원가입
router.post('/register', async (req, res) => {
  try {
    console.log('회원가입 요청:', req.body);
    
    const { username, password } = req.body;

    // 입력 검증
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: '아이디와 비밀번호를 모두 입력해주세요.' 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        error: '아이디는 최소 3자 이상이어야 합니다.' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: '비밀번호는 최소 6자 이상이어야 합니다.' 
      });
    }

    // 중복 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: '이미 존재하는 아이디입니다.' 
      });
    }

    // 사용자 생성
    const user = new User({ username, password });
    await user.save();

    // 세션에 저장
    req.session.userId = user._id;
    req.session.username = user.username;

    console.log('회원가입 성공:', username);

    // 성공 응답
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '회원가입 중 오류가 발생했습니다.' 
    });
  }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 로그인 요청:', req.body);
        
        const { username, password } = req.body;

        // 입력 검증
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: '아이디와 비밀번호를 모두 입력해주세요.'
            });
        }

        // 사용자 찾기
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 비밀번호 확인
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 세션에 저장
        req.session.userId = user._id;
        req.session.username = user.username;

        console.log('✅ 로그인 성공:', username);

        // 성공 응답
        res.json({
            success: true,
            message: '로그인이 완료되었습니다.',
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('❌ 로그인 오류:', error);
        res.status(500).json({
            success: false,
            error: '로그인 중 오류가 발생했습니다.'
        });
    }
});

// 현재 사용자 확인 (자동 로그인용)
router.get('/me', (req, res) => {
    if (req.session.userId) {
        res.json({
            success: true,
            user: {
                id: req.session.userId,
                username: req.session.username
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: '로그인이 필요합니다.'
        });
    }
});

// 로그아웃 처리
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/welcome');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// ✅ 현재 위치 업데이트
router.post('/update-location', async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ success: false, error: 'userId와 location이 필요합니다.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { location },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '위치가 업데이트되었습니다.', user });
  } catch (error) {
    res.status(500).json({ success: false, error: '위치 업데이트 중 오류 발생' });
  }
});

// ✅ 주차 위치 저장
router.post('/save-parking-location', async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ success: false, error: 'userId와 location이 필요합니다.' });
    }

    // ✅ 문자열을 ObjectId로 변환
    // const objectId = new ObjectId(userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
    }

    // user.locations = user.locations || [];
    // user.locations.push({
    //   lat: location.lat,
    //   lng: location.lng,
    // });

    user.location = {lat: location.lat, lng: location.lng }
    user.parktime = new Date();

    await user.save();

    res.json({ success: true, message: '주차 위치가 저장되었습니다.', user });
  } catch (error) {
    res.status(500).json({ success: false, error: '주차 위치 저장 중 오류 발생' });
  }
});

module.exports = router;