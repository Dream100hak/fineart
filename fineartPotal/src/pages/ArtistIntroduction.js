// ArtistIntroduction.js
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { ArtistContext } from '../ArtistContext';
import { useNavigate } from 'react-router-dom';
import '../css/ArtistIntroduction.css';
import CommentBoard from './CommentBoard';

// 이미지 파일을 import 합니다.
import ranking1 from '../front_visual/ranking01.png';
import ranking2 from '../front_visual/ranking02.png';
import ranking3 from '../front_visual/ranking03.png';

const ArtistIntroduction = () => {
  const { artists, setArtists, setTotalArtists } = useContext(ArtistContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await axios.get('/api/artists');
      const data = response.data;
      console.log(data);
      setArtists(data.artists);
      setTotalArtists(data.total);
    } catch (error) {
      console.error('작가 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // 작가 필터링
  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 각 그룹에 따른 작가 목록
  const groups = {
    "고전작가": [],
    "역대작가": [],
    "현대작가": [],
    "수상작가": [],
    "MZ작가":   [],
    "화제작가": [],
    "스타작가": [],
  };

  // 작가들을 그룹에 따라 분류
  filteredArtists.forEach(artist => {

    const currentYear = new Date().getFullYear();

    // 고전 작가: 1950년 이전에 태어난 작가
    if (artist.status === 'deceased' ) {
      groups["고전작가"].push(artist);
    }
    // 역대 작가: 1950년 이후에 태어난 작가 중 사망한 작가
    else if (artist.status === 'deceased' && artist.birth > 1950) {
      groups["역대작가"].push(artist);
    }
    // 현대 작가: 살아있는 작가
    else if (artist.status === 'alive') {
      groups["현대작가"].push(artist);
    }

    
    if (artist.wins > 0) {
      groups["수상작가"].push(artist);
    }

    // MZ 작가: 현재 연도에서 20대와 30대 작가
    if (currentYear - artist.birth >= 20 && currentYear - artist.birth <= 39) {
      groups["MZ작가"].push(artist);
    }

    // 화제 작가: score가 있는 작가
    if (artist.score >= 1 && artist.score <= 100) {
      groups["화제작가"].push(artist);
    }

    // 스타 작가: star가 있는 작가
    if (artist.star >= 1 && artist.star <= 100) {
      groups["스타작가"].push(artist);
    }
  });

  const goToArtistDetail = (artistId) => {
    navigate(`/artist/${artistId}`);
  };

  const maxRows = Math.max(
    groups["고전작가"].length,
    groups["역대작가"].length,
    groups["현대작가"].length,
    groups["수상작가"].length,
    groups["MZ작가"].length,
    groups["화제작가"].length,
    groups["스타작가"].length
  );

  const maxRowsArray = Array.from({ length: maxRows });

  return (
    <div className="artist-page-container">
      <div className="artist-introduction">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="작가 이름 검색"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-bar"
          />
        </div>

        <div className="artist-table">
          {/* 헤더 행 */}
          <div className="artist-table-row artist-table-header">
            <div className="artist-table-cell">랭킹</div>
            <div className="artist-table-cell">고전작가</div>
            <div className="artist-table-cell">역대작가</div>
            <div className="artist-table-cell">현대작가</div>
            <div className="artist-table-cell">수상작가</div>
            <div className="artist-table-cell">MZ작가</div>
            <div className="artist-table-cell">화제작가</div>
            <div className="artist-table-cell">스타작가</div>
          </div>
          {/* 데이터 행 */}
          {maxRowsArray.map((_, index) => (
            <div className="artist-table-row" key={index}>
              <div className="artist-table-cell ranking-cell">
                {index === 0 ? (
                  <img src={ranking1} alt="Ranking 1" className="ranking-image" />
                ) : index === 1 ? (
                  <img src={ranking2} alt="Ranking 2" className="ranking-image" />
                ) : index === 2 ? (
                  <img src={ranking3} alt="Ranking 3" className="ranking-image" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {Object.keys(groups).map((group) => (
                <div className="artist-table-cell" key={group}>
                  {groups[group][index] ? (
                    <button
                      className="artist-name-button"
                      onClick={() => goToArtistDetail(groups[group][index].id)}
                    >
                      {groups[group][index].name}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <CommentBoard /> {/* 코멘트 게시판을 오른쪽에 배치 */}
    </div>
  );
};

export default ArtistIntroduction;