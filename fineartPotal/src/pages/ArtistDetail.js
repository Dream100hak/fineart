import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArtistContext } from '../ArtistContext';
import '../css/ArtistDetail.css';
import axios from 'axios';
import { getCanvasSizes } from 'Common';

const ArtistDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { artistGroups } = useContext(ArtistContext);
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canvasSizes, setCanvasSizes] = useState({});

  // 현재 그룹 정보
  const currentGroup = location.state?.group;
  const currentGroupArtists = artistGroups[currentGroup] || [];
  const currentIndex = currentGroupArtists.findIndex((artist) => artist.id === Number(id));

  useEffect(() => {
    fetchCanvasSizes();
    fetchArtistDetails();
  }, [id]);

  const fetchCanvasSizes = async () => {
    const sizes = await getCanvasSizes();
    setCanvasSizes(sizes);
  };

  const fetchArtistDetails = async () => {
    try {
      const response = await axios.get(`/api/artists/${id}`);
      setArtist(response.data);
      setArtworks(response.data.artworks);
    } catch (error) {
      console.error('작가 정보를 불러오는 중 오류가 발생했습니다:', error);
    }
  };

  const handlePreviousArtist = () => {
    if (currentIndex > 0) {
      const previousArtistId = currentGroupArtists[currentIndex - 1].id;
      navigate(`/artist/${previousArtistId}`, { state: { group: currentGroup } });
    }
  };

  const handleNextArtist = () => {
    if (currentIndex < currentGroupArtists.length - 1) {
      const nextArtistId = currentGroupArtists[currentIndex + 1].id;
      navigate(`/artist/${nextArtistId}`, { state: { group: currentGroup } });
    }
  };

  const hasPreviousArtist = currentIndex > 0;
  const hasNextArtist = currentIndex < currentGroupArtists.length - 1;

  const handleBackToList = () => {
    navigate('/artistIntroduction');
  };

  const handleArtworkClick = (index) => {
    setSelectedArtworkIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArtworkIndex(null);
  };

  const handlePrevArtwork = () => {
    setSelectedArtworkIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const handleNextArtwork = () => {
    setSelectedArtworkIndex((prevIndex) => (prevIndex < artworks.length - 1 ? prevIndex + 1 : prevIndex));
  };

  if (!artist) return <p>Loading...</p>;

  return (
    <div className="artist-detail-container">
      <div className="button-container">
        <button className="button" onClick={handleBackToList}>
          <i className="fas fa-list"></i>
        </button>
        <button className="button" onClick={handlePreviousArtist} disabled={!hasPreviousArtist}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <button className="button" onClick={handleNextArtist} disabled={!hasNextArtist}>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>

      <h1 className="artist-title">{artist.name}</h1>
      <div className="artist-profile">
        <img src={`${process.env.REACT_APP_API_URL}${artist.image_url}`} alt={artist.name} />
        <div className="artist-info">
          <p>{artist.description}</p>
        </div>
      </div>

      {isModalOpen && selectedArtworkIndex !== null && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseModal}>
              &times;
            </button>
            <img
              src={`${process.env.REACT_APP_API_URL}${artworks[selectedArtworkIndex].image_url}`}
              alt={artworks[selectedArtworkIndex].title}
              className="modal-image"
            />
          </div>
          <div className="modal-navigation" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-nav-button"
              onClick={handlePrevArtwork}
              disabled={selectedArtworkIndex === 0}
            >
              &#8592;
            </button>
            <button
              className="modal-nav-button"
              onClick={handleNextArtwork}
              disabled={selectedArtworkIndex === artworks.length - 1}
            >
              &#8594;
            </button>
          </div>
        </div>
      )}

      {artworks.length > 0 ? (
        <div className="artwork-grid">
          {artworks.map((artwork, index) => (
            <div
              key={artwork.id}
              className="artwork-item"
              onClick={() => handleArtworkClick(index)}
            >
              <img
                src={`${process.env.REACT_APP_API_URL}${artwork.image_url}`}
                alt={artwork.title}
                className="artwork-image"
              />
              <p>{
                `${artwork.canvas_type ? artwork.canvas_type : 'Unknown type'}형 ${artwork.canvas_size ? artwork.canvas_size : 'Unknown size'}호 (${artwork.canvas_type && artwork.canvas_size && canvasSizes[artwork.canvas_type]?.[artwork.canvas_size] ? canvasSizes[artwork.canvas_type][artwork.canvas_size] : 'Unknown size'
                }) - ${artwork.title}`
              }</p>
            </div>
          ))}
        </div>
      ) : (
        <p>작품이 없습니다.</p>
      )}
    </div>
  );
};

export default ArtistDetail;