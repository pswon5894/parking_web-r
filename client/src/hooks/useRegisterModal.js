// client/src/hooks/useRegisterModal.js
import {useState} from 'react';
import {useAuth} from '../context/AuthContext';

export const useRegisterModal = () => {
    // 회원가입 상태
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerError, setRegisterError] = useState('');

  const {register} = useAuth();

  //  회원가입 제출
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    // 비밀번호 확인 검증
    if (registerPassword !== registerPasswordConfirm) {
      setRegisterError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 검증
    if (registerPassword.length < 6) {
      setRegisterError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      await register(registerUsername, registerPassword);
      setShowRegisterModal(false);
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterPasswordConfirm('');
      alert('회원가입이 완료되었습니다!');
    } catch (err) {
      setRegisterError(err.message || '회원가입에 실패했습니다.');
    }
  };

  //  회원가입 모달 닫기
  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
    setRegisterError('');
    setRegisterUsername('');
    setRegisterPassword('');
    setRegisterPasswordConfirm('');
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };

  return {
    showRegisterModal,
    registerUsername,
    registerPassword,
    registerPasswordConfirm,
    registerError,

    setRegisterUsername,
    setRegisterPassword,
    setRegisterPasswordConfirm,

    handleRegisterSubmit,
    handleCloseRegisterModal,
    openRegisterModal,
  }
}

