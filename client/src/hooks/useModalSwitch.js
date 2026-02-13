// // client/src/hooks/useModalSwitch.js
import {useEffect} from 'react';

export const useModalSwitch =(
    showLoginModal,
    showRegisterModal,
    handleCloseLoginModal, 
    handleCloseRegisterModal, 
    openRegisterModal, 
    openLoginModal,
) => {

  //  ESC 키로 모달 닫기
    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          if (showLoginModal) handleCloseLoginModal();
          if (showRegisterModal) handleCloseRegisterModal();
        }
      };
  
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [showLoginModal, showRegisterModal, handleCloseLoginModal, handleCloseRegisterModal]);

    //  로그인 ↔ 회원가입 전환
  const switchToRegister = () => {
    handleCloseLoginModal();
    openRegisterModal();
    // setError(''); // handleCloseLoginModal(); 안에있어
  };

  const switchToLogin = () => {
    handleCloseRegisterModal();
    openLoginModal();
    // setRegisterError(''); // handleCloseRegisterModal(); 안에있음
  };

  return {
    switchToRegister,
    switchToLogin,
  }
};