import React from 'react';
import './page/AdminPage.css';
import ArtistRegistration from './page/ArtistRegistration';
import ArtistList from './page/ArtistList';
import BoardList from './page/BoardList';
import BoardDetails from './page/BoardDetails';
import { BrowserRouter as Router, Route, Routes, useLocation, Link } from 'react-router-dom';

// Sidebar 컴포넌트 추가
const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      {location.pathname.includes('/artist') && (
        <>
          <Link to="/artist-management" className={location.pathname === '/artist-management' ? 'active' : ''}>
            작가 조회
          </Link>
          <Link to="/artist-registration" className={location.pathname === '/artist-registration' ? 'active' : ''}>
            작가 추가
          </Link>
        </>
      )}
      {location.pathname.includes('/customer') && (
        <>
          <Link to="/customer-management" className={location.pathname === '/customer-management' ? 'active' : ''}>
            유저 조회
          </Link>
          <Link to="#" className={location.pathname === '/customer-deleted' ? 'active' : ''}>
            탈퇴 유저 조회
          </Link>
        </>
      )}
      {location.pathname.includes('/board') && (
        <>
          <Link to="/board/free_board" className={location.pathname === '/board/free_board' ? 'active' : ''}>
            자유 게시판
          </Link>
          <Link to="/board/qna_board" className={location.pathname === '/board/qna_board' ? 'active' : ''}>
            질문 게시판
          </Link>
          <Link to="/board/job_board" className={location.pathname === '/board/job_board' ? 'active' : ''}>
            구인 구직
          </Link>
        </>
      )}
    </aside>
  );
};

// App 컴포넌트
const App = () => {
  return (
    <Router>
      <div className="admin-container">
        <header className="admin-header">
          <div className="logo">Fine Art</div>
          <nav className="admin-nav">
            <NavLink to="/customer" label="고객 관리" />
            <NavLink to="/artist" label="작가 관리" />
            <NavLink to="/board" label="게시판 관리" />
            <NavLink to="/revenue" label="수익 관리" />
          </nav>
          <div className="admin-user-info">
            <span>로그인한 이메일</span>
            <button className="logout-btn">Logout</button>
          </div>
        </header>
        <div className="admin-body">
          <Sidebar />
          <main className="admin-main-content">
            <Routes>
              <Route path="/" element={<div>메인 화면</div>} />
              <Route path="/artist-registration" element={<ArtistRegistration />} />
              <Route path="/customer-management" element={<div>고객 관리 페이지</div>} />
              <Route path="/artist-management" element={<ArtistList />} />
              <Route path="/board/:boardType" element={<BoardList />} />
              <Route path="/board/:boardType/:articleId" element={<BoardDetails enableEdit={true} />} />
            </Routes>
          </main>
        </div>
        <footer className="admin-footer">Footer</footer>
      </div>
    </Router>
  );
};

// NavLink 컴포넌트
const NavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname.includes(to);

  return (
    <Link to={to} className={`top-menu-button ${isActive ? 'active' : ''}`}> {label}</Link>
  );
};

export default App;
