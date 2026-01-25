
//주차 정보 저장
// router.post('/run', async (req, res) => {
//     try{
//         const {}
//     }
// })

// 데이터 준비

// MongoDB에 결과 저장

// server/routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// ===== 사용자 관련 라우트 =====

// 사용자 정보 조회
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 사용자 정보 업데이트
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, phone, profileImage } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, phone, profileImage },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== 주차 위치 관련 라우트 =====

// 모든 주차 위치 조회
router.get('/parking-locations', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.getParkingLocations());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 특정 주차 위치 조회
router.get('/parking-locations/:locationId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const location = user.parkingLocations.id(req.params.locationId);
    
    if (!location) {
      return res.status(404).json({ message: '주차 위치를 찾을 수 없습니다' });
    }
    
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 새 주차 위치 추가
router.post('/parking-locations', authMiddleware, async (req, res) => {
  try {
    const { name, latitude, longitude, address, description } = req.body;
    
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        message: 'name, latitude, longitude는 필수 입력값입니다' 
      });
    }
    
    const user = await User.findById(req.user.id);
    await user.addParkingLocation({
      name,
      latitude,
      longitude,
      address,
      description
    });
    
    res.status(201).json({
      message: '주차 위치가 추가되었습니다',
      parkingLocations: user.getParkingLocations()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 주차 위치 업데이트
router.patch('/parking-locations/:locationId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { name, latitude, longitude, address, description } = req.body;
    
    await user.updateParkingLocation(req.params.locationId, {
      name,
      latitude,
      longitude,
      address,
      description
    });
    
    res.json({
      message: '주차 위치가 업데이트되었습니다',
      parkingLocations: user.getParkingLocations()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 주차 위치 삭제
router.delete('/parking-locations/:locationId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    await user.removeParkingLocation(req.params.locationId);
    
    res.json({
      message: '주차 위치가 삭제되었습니다',
      parkingLocations: user.getParkingLocations()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 기본 주차 위치 설정
router.post('/parking-locations/:locationId/set-default', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    await user.setDefaultParkingLocation(req.params.locationId);
    
    res.json({
      message: '기본 주차 위치가 설정되었습니다',
      defaultLocation: user.getDefaultParkingLocation()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 기본 주차 위치 조회
router.get('/parking-locations/default', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const defaultLocation = user.getDefaultParkingLocation();
    
    if (!defaultLocation) {
      return res.status(404).json({ message: '설정된 기본 주차 위치가 없습니다' });
    }
    
    res.json(defaultLocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;