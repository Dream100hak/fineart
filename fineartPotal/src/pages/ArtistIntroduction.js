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
  const { setArtists, setTotalArtists, setArtistGroups, artistGroups } = useContext(ArtistContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await axios.get('/api/artists');
      const data = response.data.artists;

      // 그룹별로 나눠서 artistGroups로 저장
      const groups = {
        "고전작가": [],
        "역대작가": [],
        "현대작가": [],
        "수상작가": [],
        "MZ작가": [],
        "화제작가": [],
        "스타작가": [],
      };

      const currentYear = new Date().getFullYear();

      data.forEach(artist => {
        // 고전 작가: 1950년 이전에 태어난 작가
        if (artist.status === 'deceased' && artist.birth <= 1950) {
          groups["고전작가"].push(artist);
        } else if (artist.status === 'deceased' && artist.birth > 1950) {
          groups["역대작가"].push(artist);
        } else if (artist.status === 'alive') {
          groups["현대작가"].push(artist);
        }
        if (artist.wins > 0) {
          groups["수상작가"].push(artist);
        }
        if (currentYear - artist.birth >= 20 && currentYear - artist.birth <= 39) {
          groups["MZ작가"].push(artist);
        }
        if (artist.score >= 1 && artist.score <= 100) {
          groups["화제작가"].push(artist);
        }
        if (artist.star >= 1 && artist.star <= 100) {
          groups["스타작가"].push(artist);
        }
      });

      setArtists(data); // 전체 artist 목록 저장
      setTotalArtists(data.length); // 전체 artist 수 저장
      setArtistGroups(groups); // 그룹별 artist 목록 저장
    } catch (error) {
      console.error('작가 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // 그룹별 필터링된 작가 목록
  const filteredGroups = Object.keys(artistGroups).reduce((acc, group) => {
    acc[group] = artistGroups[group].filter(artist =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return acc;
  }, {});

  // 각 그룹에서 최대 행 수 계산
  const maxRows = Math.max(
    ...Object.values(filteredGroups).map((group) => group.length)
  );

  const maxRowsArray = Array.from({ length: maxRows });

  const goToArtistDetail = (artistId, groupName) => {
    navigate(`/artist/${artistId}`, { state: { group: groupName } });
  };

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
              {Object.keys(filteredGroups).map((group) => (
                <div className="artist-table-cell" key={group}>
                  {filteredGroups[group][index] ? (
                    <button
                      className="artist-name-button"
                      onClick={() => goToArtistDetail(filteredGroups[group][index].id, group)}
                    >
                      {filteredGroups[group][index].name}
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
