import React from 'react';
import { Link } from 'react-router-dom';
import '../css/GlobalArtNews.css';
import '../css/Global/card.css';  // 카드 스타일 가져오기

// 이미지 파일 import
import news01 from '../main/news01.jpg';
import news02 from '../main/news02.jpg';
import news03 from '../main/news03.jpg';

const newsData = [
  { id: 1, title: '조수인 자칭 pd 논란...', date: '24.11.19', image: news01 },
  { id: 2, title: 'Top exhibitions and artists to watch...', date: '24.11.19', image: news02 },
  { id: 3, title: 'Everything you need to know about Art Basel...', date: '24.11.19', image: news03 },
  { id: 4, title: 'Key highlights from London Art Week 2024...', date: '24.11.19', image: news01 },
  { id: 5, title: 'Discover new talents at the Tokyo Art Festival...', date: '24.11.19', image: news02 },
  { id: 6, title: 'Upcoming exhibitions at the Paris Biennale...', date: '24.11.19', image: news03 },
];

function GlobalArtNews() {
  return (
    <div className="global-art-news">
      <h1>뉴스</h1>
      <p className="intro-text">Stay updated on the latest news from the global art world.</p>

      {/* 카드 섹션 */}
      <div className="card-container">
        {newsData.map((news) => (
          <Link 
            to={`/article/${news.id}`} 
            state={{ title: news.title, date: news.date, image: news.image }}
            key={news.id}
            className="card"
          >
            <div className="card-image">
              <img src={news.image} alt={news.title} />
            </div>
            <div className="card-text">
              <h2>{news.date}</h2>
              <p>{news.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination">
        <button className="prev-btn">Previous</button>
        <button className="page-num active">1</button>
        <button className="page-num">2</button>
        <button className="page-num">3</button>
        <button className="next-btn">Next</button>
      </div>
    </div>
  );
}

export default GlobalArtNews;
