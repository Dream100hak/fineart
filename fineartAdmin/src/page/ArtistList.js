import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArtistList.css';
import ArtistDetails from './ArtistDetails';

const ArtistList = () => {
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState(null);

  // 작가 목록 가져오기 함수
  const fetchArtists = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/artists`);
      setArtists(response.data.artists);
      setFilteredArtists(response.data.artists);
    } catch (error) {
      console.error('작가 목록을 가져오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleArtistClick = (artistId) => {
    setSelectedArtistId(artistId);
  };

  const handleBackToList = () => {
    setSelectedArtistId(null);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = artists.filter((artist) =>
      artist.name.toLowerCase().includes(query)
    );
    setFilteredArtists(filtered);
  };

  // 작가 정보 업데이트 시 목록 상태 업데이트
  const handleArtistUpdate = async (updatedArtist) => {
    try {
      await fetchArtists(); // 목록 전체를 다시 불러와 최신 상태를 반영
    } catch (error) {
      console.error('작가 목록 갱신 중 오류 발생:', error);
    }
  };

  // 작가 삭제 시 목록 상태 업데이트
  const handleArtistDelete = (deletedArtistId) => {
    setArtists((prevArtists) =>
      prevArtists.filter((artist) => artist.id !== deletedArtistId)
    );
    setFilteredArtists((prevFilteredArtists) =>
      prevFilteredArtists.filter((artist) => artist.id !== deletedArtistId)
    );
  };

  return (
    <div className="artist-list-container">
      {!selectedArtistId ? (
        <>
          <h2>작가 목록</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="작가 이름으로 검색하세요"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="artist-grid">
            {filteredArtists.map((artist) => (
              <div
                key={artist.id}
                className="artist-card"
                onClick={() => handleArtistClick(artist.id)}
              >
                {artist.representative_image ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}${artist.representative_image}`}
                    alt={`${artist.name} 대표 이미지`}
                    className="artist-representative-image"
                  />
                ) : (
                  <div className="no-image">이미지 없음</div>
                )}
                <div className="artist-card-content">
                  <span className="artist-name">{artist.name}</span>
                  <span className="artwork-count">작품 수: {artist.artwork_count}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <ArtistDetails
          artistId={selectedArtistId}
          onBack={handleBackToList}
          onArtistUpdate={handleArtistUpdate} // 수정 시 호출될 콜백 함수 전달
          onArtistDelete={handleArtistDelete} // 삭제 시 호출될 콜백 함수 전달
        />
      )}
    </div>
  );
};

export default ArtistList;
