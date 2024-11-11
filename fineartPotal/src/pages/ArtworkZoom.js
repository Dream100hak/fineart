import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ArtworkZoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(`/api/artworks/${id}`);
        if (response.status !== 200) throw new Error('작품 정보를 불러오지 못했습니다.');
        setArtwork(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtwork();
  }, [id]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!artwork) {
    return <div>작품 정보를 찾을 수 없습니다.</div>;
  }

  // 마우스 휠을 사용하여 확대/축소하는 기능
  const handleWheel = (event) => {
    if (event.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.1, 3)); // 최대 3배 확대
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.1, 1)); // 최소 1배
    }
  };

  // 줌 레벨에 따라 프로그레스 바 너비 설정
  const progressBarWidth = `${((zoomLevel - 1) / 2) * 100}%`;

  return (
    <div className="zoom-page-container" onWheel={handleWheel}>
      <div className="fixed-header">
        <button className="close-button" onClick={() => navigate(-1)}>X</button>
        <div className="zoom-progress">
          <div className="progress-bar" style={{ width: progressBarWidth }}></div>
        </div>
      </div>
      <img
        src={artwork.image_url}
        alt={artwork.title}
        style={{ transform: `scale(${zoomLevel})` }}
      />
    </div>
  );
}

export default ArtworkZoom;
