// src/pages/SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';  
import { auth } from '../firebase/firebaseConfig';  
import '../css/Auth.css';  

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');  // 이름 추가
  const [isLoading, setIsLoading] = useState(false);  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setIsLoading(true);  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);  
      
      // MySQL에 사용자 정보 저장
      await saveUserToDatabase(userCredential.user.email, password, name);

      setIsLoading(false);  
      navigate('/signup-success');  
    } catch (error) {
      setIsLoading(false);  
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const saveUserToDatabase = async (email, password, name) => {
    try {
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),  // 이메일, 비밀번호, 이름을 전송
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 DB에 저장하는 데 실패했습니다.');
      }

      const result = await response.json();
      console.log('DB에 사용자 저장 성공:', result);
    } catch (error) {
      console.error('DB 저장 실패:', error);
      alert('사용자 정보를 저장하는 데 문제가 발생했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="이름"
          value={name} // 이름 필드 추가
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '회원가입 중...' : '회원가입'}
        </button>
      </form>

      {isLoading && <div className="spinner"></div>}
    </div>
  );
}

export default SignUp;
