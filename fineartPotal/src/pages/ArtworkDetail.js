import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/ArtworkDetail.css';
import { getCanvasSizes } from 'Common'; // 캔버스 크기 정보를 가져오는 함수

function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canvasSizes, setCanvasSizes] = useState({});

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

    const fetchCanvasSizes = async () => {
      const sizes = await getCanvasSizes();
      setCanvasSizes(sizes);
    };

    fetchArtwork();
    fetchCanvasSizes();
  }, [id]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!artwork) {
    return <div>작품 정보를 찾을 수 없습니다.</div>;
  }

  // 캔버스 크기 형식 설정
  const canvasSizeText = `${artwork.canvas_type}형 ${artwork.canvas_size}호 (${canvasSizes[artwork.canvas_type]?.[artwork.canvas_size]}cm)`;

  return (
    <div className="artwork-detail-container">
      <h1>{artwork.title}</h1>
      <img src={artwork.image_url} alt={artwork.title} />
      <p>작가 : {location.state?.artistName || artwork.artist || 'Unknown Artist'}</p>
      <p>카테고리: {artwork.category}</p>
      <p>캔버스 크기: {canvasSizeText}</p>
      <button className="zoom-button" onClick={() => navigate(`/artwork/${id}/zoom`)}>확대 보기</button>
      <a href="/gallery" className="back-button">뒤로 가기</a>
    </div>
  );
}

export default ArtworkDetail;
