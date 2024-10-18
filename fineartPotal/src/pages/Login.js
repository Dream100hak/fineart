import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';  // Firebase v9 방식으로 auth 메서드 가져오기
import { auth } from '../firebase/firebaseConfig';  // Firebase 초기화 파일
import '../css/Auth.css';  // 동일한 스타일 불러오기

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // 페이지 이동을 위한 네비게이트 훅

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Firebase로 로그인 요청
      await signInWithEmailAndPassword(auth, email, password);
      // 로그인 성공 시 메인 페이지로 이동
      navigate('/');
    } catch (error) {
      // 로그인 실패 시 에러 메시지 설정
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="auth-container">
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>

      {/* 에러 메시지 출력 */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;
