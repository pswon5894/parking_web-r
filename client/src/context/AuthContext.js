// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext();

// API URL 설정
const API_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { login: setStoreLogin, logout: setStoreLogout } = useAuthStore();


  // 앱 시작 시 현재 사용자 확인
  useEffect(() => {
    checkAuth();
  }, []);

  // 현재 사용자 확인
  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include' // 쿠키 포함 (중요!)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setStoreLogin(data.user); // ✅ zustand에도 반영
        console.log('✅ 자동 로그인:', data.user.username);
      } else {
        console.log('ℹ️ 로그인 필요');
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const register = async (username, password) => {
    try {
      console.log('📝 회원가입 시도:', username);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ 회원가입 실패:', data.error);
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      console.log('✅ 회원가입 성공:', data.user.username);
      setUser(data.user);
      setStoreLogin(data.user); // ✅ zustand 업데이트
      return data.user;

    } catch (error) {
      console.error('회원가입 에러:', error);
      throw error;
    }
  };

  // 로그인
  const login = async (username, password) => {
    try {
      console.log('🔐 로그인 시도:', username);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      setUser({
        id: data.user.id,
        username: data.user.username,
        latitude: data.user.latitude,
        longitude: data.user.longitude
      })

      if (!response.ok) {
        console.error('❌ 로그인 실패:', data.error);
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      console.log('✅ 로그인 성공:', data.user.username);
      setUser(data.user);
      setStoreLogin(data.user); // ✅ zustand 업데이트
      return data.user;

    } catch (error) {
      console.error('로그인 에러:', error);
      throw error;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      console.log('👋 로그아웃 시도');

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        setStoreLogout(); //  zustand 업데이트
      } else {
        throw new Error('로그아웃 실패');
      }

    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 나도 로컬에서는 로그아웃 처리
      setUser(null);
      setStoreLogout(); //  zustand 업데이트
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  }
  return context;
}

export default AuthContext;