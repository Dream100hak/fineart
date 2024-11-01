import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArtistDetails.css';
import ArtistRegistration from './ArtistRegistration';
import { getCanvasSizes } from 'Common'; // 캔버스 사이즈 데이터를 가져오기 위해 추가

const ArtistDetails = ({ artistId, onBack, onArtistUpdate, onArtistDelete }) => {
  const [artistDetails, setArtistDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [canvasSizes, setCanvasSizes] = useState({ F: {}, P: {}, M: {} });

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const artistResponse = await axios.get(`/api/artists/${artistId}`);
        setArtistDetails(artistResponse.data);
      } catch (error) {
        console.error('작가 상세 정보를 가져오는 중 오류 발생:', error);
      }
    };

    fetchArtistDetails();
  }, [artistId]);

  useEffect(() => {
    const fetchCanvasSizes = async () => {
      const sizes = await getCanvasSizes();
      setCanvasSizes(sizes);
    };

    fetchCanvasSizes();
  }, []);

  // 수정 모달 열기
  const handleEditArtist = () => {
    setIsEditModalOpen(true);
  };

  // 수정 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  // 작가 삭제 기능
  const handleDeleteArtist = async () => {
    const confirmDelete = window.confirm('정말로 이 작가를 삭제하시겠습니까?');
    if (confirmDelete) {
      try {
        await axios.delete(`/api/artists/${artistId}`);
        alert('작가가 삭제되었습니다.');
        // 상위 컴포넌트에 삭제된 작가 ID 전달
        if (onArtistDelete) {
          onArtistDelete(artistId);
        }
        // 목록으로 돌아가기
        onBack();
      } catch (error) {
        console.error('작가 삭제 중 오류 발생:', error);
        alert('작가 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 작가 정보 업데이트 후 처리
  const handleUpdateArtist = (updatedArtist) => {
    setArtistDetails(updatedArtist);
    setIsEditModalOpen(false);
    // 상위 컴포넌트에 업데이트된 작가 정보 전달
    if (onArtistUpdate) {
      onArtistUpdate(updatedArtist);
    }
  };

  if (!artistDetails) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="artist-details">
      <button className="back-btn" onClick={onBack}>
        &larr; 뒤로가기
      </button>

      {/* 수정 및 삭제 버튼 추가 */}
      <div className="artist-action-buttons">
        <button className="edit-btn" onClick={handleEditArtist}>수정</button>
        <button className="delete-btn" onClick={handleDeleteArtist}>삭제</button>
      </div>

      {/* 작가 정보 표시 */}
      <div className="artist-info">
        <h2>{artistDetails.name}</h2>
        <p className="artist-description">{artistDetails.description}</p>
        <p>국적: {artistDetails.nationality}</p>
        <p>평가: {artistDetails.score}</p>
        <p>스타성: {artistDetails.star}</p>
        <p>수상횟수: {artistDetails.wins}</p>
        <p>상태: {artistDetails.status === 'alive' ? '현대' : '고전'}</p>
      </div>

      <hr className="divider" />

      {/* 작품 목록 표시 */}
      <h3>작품 목록</h3>
      {artistDetails.artworks && artistDetails.artworks.length > 0 ? (
        <div className="artwork-grid">
          {artistDetails.artworks.map((artwork) => (
            <div key={artwork.id} className="artwork-card">
              {artwork.image_url ? (
                <img
                  src={`${artwork.image_url}`}
                  alt={artwork.name}
                  className="artwork-image"
                />
              ) : (
                <div className="no-image">이미지 없음</div>
              )}
              <h4>{artwork.name}</h4>
              <p>{artwork.category}</p>
              <p>가격: {artwork.price ? `₩${artwork.price.toLocaleString()}` : '미판매'}</p>
              <p>
                사이즈: {artwork.canvas_type}
                {artwork.canvas_size}호 (
                {canvasSizes[artwork.canvas_type] &&
                  canvasSizes[artwork.canvas_type][artwork.canvas_size]
                  ? `${canvasSizes[artwork.canvas_type][artwork.canvas_size]} cm`
                  : '크기 정보 없음'})
              </p>
              <p>렌탈 가능 여부: {artwork.is_rentable ? '가능' : '불가능'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>등록된 작품이 없습니다.</p>
      )}

      {/* 수정 모달 */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <ArtistRegistration
              artist={artistDetails}
              onClose={handleCloseEditModal}
              onUpdate={handleUpdateArtist}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDetails;
