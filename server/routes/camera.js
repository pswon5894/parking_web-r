// server/routes/camera.js
const express = require('express');
const router = require('express').Router();
const User = require('../models/User');


// 위치 등록
router.post('/register', async (req, res) => {
  try {
    console.log('회원가입 요청:', req.body);
    
    const { username } = req.body;

    // 중복 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: '이미 존재하는 카메라입니다.' 
      });
    }

    console.log('등록 성공:', username);

    // 성공 응답
    res.status(201).json({
      success: true,
      message: '카메라 등록이 완료되었습니다.',
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('카메라 등록 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '등록 중 오류가 발생했습니다.' 
    });
  }
});

//  등록 위치 저장
router.post('/update-location', async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ success: false, error: 'userId와 location이 필요합니다.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
    }

    // 주차 위치 좌표 저장
    user.location = {lat: location.lat, lng: location.lng }
    user.parktime = new Date();
    await user.save();

    res.json({ success: true, message: '주차 위치가 저장되었습니다.', user });
  } catch (error) {
    res.status(500).json({ success: false, error: '주차 위치 저장 중 오류 발생' });
  }
});

//마지막 주차 위치 조회
router.get('/last-parking-location/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || !user.location) {
      return res.status(404).json({ 
        success: false, 
        message: '저장된 주차 위치가 없습니다.' 
      });
    }

    res.json({
      success: true,
      data: {
        lat: user.location.lat,
        lng: user.location.lng,
        timestamp: user.parktime
      }
    });
  } catch (error) {
    console.error('❌ 주차 위치 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 에러' 
    });
  }
});

module.exports = router;