// client/src/components/Login.js
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLoginModal } from '../hooks/useLoginModal';
import { useRegisterModal } from '../hooks/useRegisterModal';
import './Login.css';

function Login() {
  

  // 로그인 모달 훅
  const {
    showLoginModal,
    username,
    password,
    error,
    setUsername,
    setPassword,
    handleLoginSubmit,
    handleCloseLoginModal,
    openLoginModal,
  } = useLoginModal();

  // 회원가입 모달 훅
  const{
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
  } = useRegisterModal();
  

  const { user, loading, logout } = useAuth(); //  register 추가

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

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="login-container">
      {user ? (
        // 로그인된 상태
        <div className="user-info">
          <span className="welcome-text">환영합니다, {user.username}님!</span>
          <button className="logout-btn" onClick={logout}>
            로그아웃
          </button>
        </div>

        
      ) : (
        // 로그인 안된 상태
        <button className="login-btn" onClick={() => openLoginModal()}>
          로그인
        </button>
      )}

      {/* ========== 로그인 모달 ========== */}
      {showLoginModal && (
        <div className="modal-overlay" >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>로그인</h3>
              <button className="close-btn" onClick={handleCloseLoginModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label>사용자 이름</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="submit-btn">
                로그인하기
              </button>

              <div className="modal-footer">
                <button className="forgot-password">비밀번호를 잊으셨나요?</button>
                <button className="signup-link" onClick={(e) => {
                    e.preventDefault(); switchToRegister();
                  }}
                >
                  회원가입
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== 회원가입 모달 ========== */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-h2">회원가입</h2>
              <button className="close-btn" onClick={handleCloseRegisterModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="login-form">
              <div className="form-group">
                <label>사용자 이름</label>
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>비밀번호</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요 (최소 6자)"
                  required
                />
              </div>

              <div className="form-group">
                <label>비밀번호 확인</label>
                <input
                  type="password"
                  value={registerPasswordConfirm}
                  onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </div>

              {registerError && <p className="error-message">{registerError}</p>}

              <button type="submit" className="submit-btn">
                회원가입하기
              </button>

              <div className="modal-footer">
                <span className="login-prompt">이미 계정이 있으신가요?</span>
                <button className="signup-link" onClick={(e) => {
                  e.preventDefault(); switchToLogin();
                }}
                >
                  로그인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;