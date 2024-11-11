import './css/App.css';
import './css/Homepage.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './firebase/firebaseConfig';  // Firebase 초기화 파일 추가
import HomePage from './pages/HomePage';
import EducationPage from './pages/EducationPage';
import RankingPage from './pages/RankingPage';
import ArtSupplies from './pages/ArtSupplies.js';
import GlobalArtNewsPage from './pages/GlobalArtNews.js';
import Article from './pages/Article.js';

import { ArtistProvider } from './ArtistContext'; 
import ArtistDetail from './pages/ArtistDetail.js';
import ArtistIntroduction from './pages/ArtistIntroduction.js';

import Gallery from './pages/Gallery.js';
import ArtworkDetail from './pages/ArtworkDetail.js'; 
import ArtworkZoom from './pages/ArtworkZoom';

import FreeBoard from './pages/FreeBoard.js';
import QnABoard from './pages/QnABoard.js';
import JobBoard from './pages/JobBoard.js';
import BoardWrite from './pages/BoardWrite.js';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import SignUpSuccess from './pages/SignUpSuccess.js';

import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import SwiperBanner from './components/SwiperBanner';

function App() {
  const [user, setUser] = useState(null);           // Firebase 유저 상태 관리
  const [userName, setUserName] = useState('');     // DB에서 가져올 사용자 이름 관리
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    // Firebase 인증 상태 변경 감지
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);  // Firebase 유저 설정

        // Firebase 인증 완료 후, 사용자 이름을 DB에서 가져오기
        try {
          const response = await fetch(`/api/users/user/${firebaseUser.email}`);
          if (!response.ok) {
            throw new Error('사용자 이름을 가져오는 데 실패했습니다.');
          }
          const data = await response.json();
          setUserName(data.name);  // 사용자 이름 설정
        } catch (error) {
          console.error('이름 조회 실패:', error);
        }
      } else {
        setUser(null);   // 로그인 상태가 아니면 user를 null로
        setUserName(''); // 이름 초기화
      }
      setIsLoading(false);  // 모든 데이터 로딩 후 로딩 상태 false로 설정
    });

    return () => unsubscribe();  // 컴포넌트가 언마운트될 때 구독 해제
  }, []);

  if (isLoading) {
    return <div>로딩 중...</div>;  // 로딩 중일 때는 이 컴포넌트가 표시됨
  }

  return (
    <ArtistProvider> {/* ArtistProvider 추가 */}
      <Router>
        <Routes>
          {/* 확대 보기 페이지 - 메인 레이아웃 없이 간단한 레이아웃만 사용 */}
          <Route path="/artwork/:id/zoom" element={<ArtworkZoom />} />
          
          {/* 메인 레이아웃이 포함된 경로들 */}
          <Route path="*" element={
            <div className="section gnb_sec">
              <header>
                <div className="inside">
                  <div className="inner">
                    <a id="homePageSubTitle" href="/" tabIndex="1">
                      FINEART.co.kr
                    </a>
                    <NavigationBar />
                    <div id="authWrap">
                      <ul className="auth-links">
                        {user ? (
                          <>
                            <li><span>환영합니다, {userName || user.email} 님!</span></li>
                            <li>
                              <button className="logout-btn" onClick={() => auth.signOut()}>
                                Logout
                              </button>
                            </li>
                          </>
                        ) : (
                          <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/signup">Sign Up</Link></li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </header>

              <SwiperBanner />

              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/education" element={<EducationPage />} />
                  <Route path="/ranking" element={<RankingPage />} />
                  <Route path="/artSupplies" element={<ArtSupplies />} />
                  <Route path="/news" element={<GlobalArtNewsPage />} />
                  <Route path="/:board/article/:id" element={<Article />} />
                  <Route path="/:board/boardWrite" element={<BoardWrite />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/artwork/:id" element={<ArtworkDetail />} />
                  <Route path="/artistIntroduction" element={<ArtistIntroduction />} />
                  <Route path="/artist/:id" element={<ArtistDetail />} />
                  <Route path="/free_board" element={<FreeBoard />} />
                  <Route path="/qna_board" element={<QnABoard />} />
                  <Route path="/job_board" element={<JobBoard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/signup-success" element={<SignUpSuccess />} />
                </Routes>
              </main>

              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </ArtistProvider> // ArtistProvider 종료
  );
}

export default App;
