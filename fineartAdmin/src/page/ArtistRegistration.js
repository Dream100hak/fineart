// ArtistRegistration.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ArtistRegistration.css';
import axios from 'axios';
import { getCanvasSizes } from 'Common';
import ArtworkModal from './ArtworkModal';

const ArtistRegistration = ({ artist, onClose, onUpdate }) => {

  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const isEditMode = !!artist;

  const [artistName, setArtistName] = useState('');
  const [artistDescription, setArtistDescription] = useState('');
  const [artistBirth, setArtistBirth] = useState(2024);
  const [artistScore, setArtistScore] = useState(0);
  const [artistStar, setArtistStar] = useState(0);
  const [artistWins, setArtistWins] = useState(0);
  const [artistStatus, setArtistStatus] = useState('alive');
  const [artistNationality, setArtistNationality] = useState('대한민국');
  const [artworks, setArtworks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingArtworkIndex, setEditingArtworkIndex] = useState(null);

  const [canvasSizes, setCanvasSizes] = useState({ F: {}, P: {}, M: {} });

  useEffect(() => {
    if (isEditMode && artist) {
      setArtistName(artist.name || '');
      setArtistDescription(artist.description || '');
      setArtistBirth(artist.birth || 2024);
      setArtistScore(artist.score || 0);
      setArtistStar(artist.star || 0);
      setArtistWins(artist.wins || 0);
      setArtistStatus(artist.status || 'alive');
      setArtistNationality(artist.nationality || '대한민국');

      const fetchedArtworks = artist.artworks || [];

      const processedArtworks = fetchedArtworks.map((artwork) => ({
        id: artwork.id,
        name: artwork.name,
        price: artwork.price,
        isRentable: artwork.is_rentable,
        image: artwork.image_url ? artwork.image_url : null,
        image_url: artwork.image_url,
        category: artwork.category,
        description: artwork.description,
        canvasType: artwork.canvas_type,
        canvasSize: artwork.canvas_size,
        rotationAngle: artwork.rotation_angle || 0,
      }));

      setArtworks(processedArtworks);
    }
  }, [isEditMode, artist]);

  useEffect(() => {
    const fetchCanvasSizes = async () => {
      const sizes = await getCanvasSizes();
      setCanvasSizes(sizes);
    };

    fetchCanvasSizes();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
    setEditingArtworkIndex(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingArtworkIndex(null);
  };

  // 작품 저장
  const handleSaveArtwork = (artwork, index) => {
    if (index !== null) {
      const updatedArtworks = [...artworks];
      updatedArtworks[index] = {
        ...updatedArtworks[index],
        ...artwork,
      };
      setArtworks(updatedArtworks);
    } else {
      setArtworks([...artworks, artwork]);
    }
    handleCloseModal();
  };

  // 작품 삭제
  const handleDeleteArtwork = (index) => {
    const updatedArtworks = artworks.filter((_, i) => i !== index);
    setArtworks(updatedArtworks);
  };

  const handleUploadImage = async (file, rotationAngle) => {
    try {
      const rotatedBlob = await handleUploadRotatedImage(file, rotationAngle);
      const formData = new FormData();
      formData.append('image', rotatedBlob, 'rotated_image.jpg');

      const response = await axios.post(
        `/api/artworks/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      throw new Error('이미지 업로드 실패');
    }
  };

  const handleUploadRotatedImage = async (file, rotationAngle) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // 캔버스 크기 설정
        if (rotationAngle === 90 || rotationAngle === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((rotationAngle * Math.PI) / 180);
        context.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('캔버스에서 Blob으로 변환 중 오류가 발생했습니다.'));
            }
          },
          'image/jpeg'
        );
      };
      img.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {


    const artistData = {
      name: artistName,
      description: artistDescription,
      birth: artistBirth,
      score: parseInt(artistScore, 10),
      star: parseInt(artistStar, 10),
      wins: parseInt(artistWins, 10),
      status: artistStatus,
      nationality: artistNationality,
      artworks: artworks.map((artwork) => ({
        id: artwork.id || null,
        name: artwork.name || null,
        price: artwork.price !== undefined ? parseFloat(artwork.price) : null,
        is_rentable:
          artwork.isRentable !== undefined ? artwork.isRentable : null,
        image_url: artwork.image_url || artwork.image || null,
        category: artwork.category || null,
        description: artwork.description || null,
        canvas_type: artwork.canvasType || null,
        canvas_size: artwork.canvasSize || null,
      })),
    };

    try {
      if (isEditMode) {
        // 수정 모드일 때
        // 이미지 업로드 처리
        for (const artwork of artistData.artworks) {
          if (artwork.image_url && typeof artwork.image_url !== 'string') {
            try {
              const uploadedImageUrl = await handleUploadImage(artwork.image_url, artwork.rotation_angle);
              artwork.image_url = uploadedImageUrl;
            } catch (uploadError) {
              alert('이미지 업로드 중 오류가 발생했습니다.');
              console.error('이미지 업로드 실패:', uploadError);
              return;
            }
          }
        }
        // 작가 정보 업데이트 요청
        const updatedArtistResponse = await axios.put(
          `/api/artists/${artist.id}`,
          artistData
        );
        const updatedArtistData = updatedArtistResponse.data;

        if (onUpdate) {
          onUpdate(updatedArtistData);
        }
        alert('작가 정보가 업데이트되었습니다.');
      } else {
        // 새로운 작가 등록 로직
        // 이미지 업로드 처리
        for (const artwork of artistData.artworks) {
          if (artwork.image_url && typeof artwork.image_url !== 'string') {
            try {
              const uploadedImageUrl = await handleUploadImage(artwork.image_url, artwork.rotation_angle);
              artwork.image_url = uploadedImageUrl;
            } catch (uploadError) {
              alert('이미지 업로드 중 오류가 발생했습니다.');
              console.error('이미지 업로드 실패:', uploadError);
              return;
            }
          }
        }
        // 새로운 작가 등록 요청
        const artistResponse = await axios.post(`/api/artists`, {
          name: artistData.name,
          description: artistData.description,
          birth: artistData.birth,
          score: artistData.score,
          star: artistData.star,
          wins: artistData.wins,
          status: artistData.status,
          nationality: artistData.nationality,
        });

        const artistId = artistResponse.data.artistId;

        // 작품 등록
        for (const artwork of artistData.artworks) {
          try {
            const newArtwork = {
              artist_id: artistId,
              name: artwork.name,
              price: parseFloat(artwork.price),
              is_rentable: artwork.is_rentable,
              image_url: artwork.image_url,
              category: artwork.category,
              description: artwork.description,
              canvas_type: artwork.canvas_type,
              canvas_size: artwork.canvas_size,
              rotation_angle: artwork.rotation_angle || 0,
            };

            await axios.post(`/api/artworks`, newArtwork);
          } catch (artworkError) {
            alert('작품 등록 중 오류가 발생했습니다.');
            console.error('작품 등록 실패:', artworkError);
            return;
          }
        }

        alert(`작가와 작품들이 등록되었습니다. 작가 ID: ${artistId}`);
      }

      if (onClose) {
        onClose();
      }

      navigate('/artist-management');

    } catch (error) {
      alert('작가 정보 저장 중 오류가 발생했습니다.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="artist-registration-container">
      <header className="artist-registration-header">
        <h2>{isEditMode ? '작가 수정' : '작가 등록'}</h2>
      </header>
      <div className="artist-registration-form">
        <div className="form-row">
          <label>이름 (필수):</label>
          <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} />
        </div>

        <hr className="divider" />

        <div className="form-row">
          <label>작가 설명:</label>
          <textarea
            value={artistDescription}
            onChange={(e) => {
              setArtistDescription(e.target.value);
              e.target.style.height = 'auto'; // 높이를 초기화해서 다시 계산
              e.target.style.height = `${e.target.scrollHeight}px`; // 내용을 기준으로 높이를 설정
            }}
            placeholder="작가에 대한 설명을 입력하세요."
            rows="4"
          />
        </div>

        <div className="form-row">
          <label>출생 연도:</label>
          <select
            className="birth-year-select"
            value={artistBirth || 2024}
            onChange={(e) => setArtistBirth(e.target.value)}
          >
            {Array.from({ length: 150 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        <hr className="divider" />
        <div className="form-row">
          <label>국적:</label>
          <input type="text" value={artistNationality} onChange={(e) => setArtistNationality(e.target.value)} />
        </div>

        <hr className="divider" />
        <div className="form-row">
          <label>평가 (0-100):</label>
          <input
            type="range"
            min="0"
            max="100"
            value={artistScore}
            onChange={(e) => setArtistScore(e.target.value)}
          />
          <span className="range-value">{artistScore}</span>
        </div>

        <hr className="divider" />

        <div className="form-row">
          <label>스타성 (0-100):</label>
          <input
            type="range"
            min="0"
            max="100"
            value={artistStar}
            onChange={(e) => setArtistStar(e.target.value)}
          />
          <span className="range-value">{artistStar}</span>
        </div>

        <hr className="divider" />

        <div className="form-row">
          <label>수상 횟수 :</label>
          <input
            type="number"
            value={artistWins}
            onChange={(e) => setArtistWins(e.target.value)}
          />
        </div>

        <hr className="divider" />

        <div className="form-row">
          <label>상태:</label>
          <div className="radio-container">
            <label className="radio-label">
              <input
                type="radio"
                value="alive"
                checked={artistStatus === 'alive'}
                onChange={(e) => setArtistStatus(e.target.value)}
              />
              현대
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="deceased"
                checked={artistStatus === 'deceased'}
                onChange={(e) => setArtistStatus(e.target.value)}
              />
              고전
            </label>
          </div>
        </div>
        <hr className="divider" />

        {/* 작품 추가 버튼 */}
        <div className="form-row">
          <label>작품 등록:</label>
          <button className="edit-artwork-btn" onClick={handleOpenModal}>
            작품 등록 추가하기
          </button>
        </div>

        {/* 등록된 작품 목록 표시 */}
        {artworks.length > 0 && (
          <div className="artwork-list">
            {artworks.map((artwork, index) => (
              <div key={index} className="artwork-item">
                {artwork.image ? (
                  <img
                    src={
                      typeof artwork.image === 'string'
                        ? artwork.image.startsWith('http')
                          ? artwork.image
                          : `${artwork.image}`
                        : URL.createObjectURL(artwork.image)
                    }
                    alt="작품 이미지"
                    className="artwork-image"
                  />
                ) : (
                  <div className="no-image">이미지 없음</div>
                )}
                <div className="artwork-info">
                  <h4>{artwork.name}</h4>
                  <p>{artwork.category}</p>
                  <button
                    className="edit-artwork-btn"
                    onClick={() => {
                      setEditingArtworkIndex(index);
                      setShowModal(true);
                    }}
                  >
                    수정
                  </button>
                  <button className="delete-artwork-btn" onClick={() => handleDeleteArtwork(index)}>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 작품 등록 모달 */}
        {showModal && (
          <ArtworkModal
            canvasSizes={canvasSizes}
            newArtwork={editingArtworkIndex !== null ? artworks[editingArtworkIndex] : null}
            onSave={handleSaveArtwork}
            onClose={handleCloseModal}
            editingIndex={editingArtworkIndex}
          />
        )}
      </div>

      <button className="submit-btn" onClick={handleSubmit}>
        {isEditMode ? '작가 수정하기' : '작가 등록하기'}
      </button>

      {onClose && (
        <button className="delete-artwork-btn" onClick={onClose}>
          취소
        </button>
      )}
    </div>
  );
};

export default ArtistRegistration;
