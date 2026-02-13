// client/src/hooks/useLoginModal.js
import {useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useLoginModal = () => {
    // 로그인 상태
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login} = useAuth();

  //  로그인 제출
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      setShowLoginModal(false);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.');
    }
    }

  // //  로그인 모달 닫기
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setError('');
    setUsername('');
    setPassword('');
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  }

  return {
    showLoginModal,
    username,
    password,
    error,

    setUsername,
    setPassword,

    handleLoginSubmit,
    handleCloseLoginModal,
    openLoginModal,
  }
};