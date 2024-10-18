import React from 'react';

function HomePage() {
  return (
    <div className="home-layout">
      {/* 왼쪽 사이드바 */}
      <div className="sidebar">
        <ul>
          <li><a href="/free_board">자유게시판</a></li>     
          <li><a href="/qna_board">묻고 답하기</a></li>
          <li><a href="/job_board">구인 구직</a></li>
          <li><a href="/gallery">갤러리</a></li>
        </ul>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="content">
        {/* 뉴스 섹션 */}
        <h1>뉴스</h1>
        <div className="card-container">
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news01.jpg')} alt="Educational Content" />
            </div>
            <div className="card-text">
              <h2>Educational Content</h2>
              <p>Explore a variety of art education materials.</p>
            </div>
          </a>
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news02.jpg')} alt="Artist Rankings" />
            </div>
            <div className="card-text">
              <h2>Artist Rankings</h2>
              <p>Discover top artists from around the world.</p>
            </div>
          </a>
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news02.jpg')} alt="Artist Rankings" />
            </div>
            <div className="card-text">
              <h2>Artist Rankings</h2>
              <p>Discover top artists from around the world.</p>
            </div>
          </a>
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news02.jpg')} alt="Artist Rankings" />
            </div>
            <div className="card-text">
              <h2>Artist Rankings</h2>
              <p>Discover top artists from around the world.</p>
            </div>
          </a>
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news02.jpg')} alt="Artist Rankings" />
            </div>
            <div className="card-text">
              <h2>Artist Rankings</h2>
              <p>Discover top artists from around the world.</p>
            </div>
          </a>
        </div>

        {/* 공모전 섹션 */}
        <h1>공모전</h1>
        <div className="card-container">
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news01.jpg')} alt="Contest 1" />
            </div>
            <div className="card-text">
              <h2>International Art Contest</h2>
              <p>Participate in global art competitions.</p>
            </div>
          </a>
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news01.jpg')} alt="Contest 2" />
            </div>
            <div className="card-text">
              <h2>Local Art Contest</h2>
              <p>Showcase your art in local contests.</p>
            </div>
          </a>
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news01.jpg')} alt="Contest 2" />
            </div>
            <div className="card-text">
              <h2>Local Art Contest</h2>
              <p>Showcase your art in local contests.</p>
            </div>
          </a>
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news01.jpg')} alt="Contest 2" />
            </div>
            <div className="card-text">
              <h2>Local Art Contest</h2>
              <p>Showcase your art in local contests.</p>
            </div>
          </a>
          <a href="/article" className="card">
            <div className="card-image">
              <img src={require('../main/news01.jpg')} alt="Contest 2" />
            </div>
            <div className="card-text">
              <h2>Local Art Contest</h2>
              <p>Showcase your art in local contests.</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
