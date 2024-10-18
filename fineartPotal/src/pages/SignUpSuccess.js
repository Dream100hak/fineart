import React from 'react';
import { Link } from 'react-router-dom';
import '../css/SignUpSuccess.css';

function SignUpSuccess() {
  return (
    <div className="success-container">
      <h1>회원가입 성공!</h1>
      <p>회원가입이 성공적으로 완료되었습니다. 아래 버튼을 통해 메인 페이지로 이동할 수 있습니다.</p>
      
      <div className="button-group">
        <Link to="/" className="btn">메인 페이지로 이동</Link>
      </div>
    </div>
  );
}

export default SignUpSuccess;
