import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './AdminPage.css';

const AdminPage = () => {
  const location = useLocation();

  // 현재 경로에 맞게 탭을 강조
  const getActiveTab = () => {
    if (location.pathname.includes('/customer')) return 'customer';
    if (location.pathname.includes('/artist')) return 'artist';
    if (location.pathname.includes('/board')) return 'board';
    return '';
  };

  const selectedTab = getActiveTab();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Fine Art</h1>
        <div className="top-menu">
          <Link
            to="/customer"
            className={`top-menu-button ${selectedTab === 'customer' ? 'active' : ''}`}
          >
            고객 관리
          </Link>
          <Link
            to="/artist"
            className={`top-menu-button ${selectedTab === 'artist' ? 'active' : ''}`}
          >
            작가 관리
          </Link>
          <Link
            to="/board"
            className={`top-menu-button ${selectedTab === 'board' ? 'active' : ''}`}
          >
            게시판 관리
          </Link>
        </div>
      </header>

      <aside className="admin-sidebar">
        {selectedTab === 'customer' && (
          <ul>
            <li className="sidebar-item active">유저 조회</li>
            <li className="sidebar-item">탈퇴 유저 조회</li>
          </ul>
        )}
        {selectedTab === 'artist' && (
          <ul>
            <li className="sidebar-item active">작가 조회</li>
            <li className="sidebar-item ">작가 추가</li>
          </ul>
        )}
        {selectedTab === 'board' && (
          <ul>
            <li className="sidebar-item active">자유 게시판</li>
            <li className="sidebar-item">질문 게시판</li>
            <li className="sidebar-item">구인 구직</li>
          </ul>
        )}
      </aside>

      <footer className="admin-footer">Footer</footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/customer" element={<AdminPage />} />
        <Route path="/artist" element={<AdminPage />} />
        <Route path="/board" element={<AdminPage />} />
      </Routes>
    </Router>
  );
};

export default App;
